import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { connections } from '@/lib/sse-manager';
import { cache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// Connection pool management
const activeConnections = new Map<string, {
  controller: ReadableStreamDefaultController;
  userId: string;
  lastActivity: number;
}>();

// Cleanup stale connections every minute
setInterval(() => {
  const now = Date.now();
  const timeout = 5 * 60 * 1000; // 5 minutes
  
  for (const [id, conn] of activeConnections.entries()) {
    if (now - conn.lastActivity > timeout) {
      try {
        conn.controller.close();
      } catch (error) {
        // Already closed
      }
      activeConnections.delete(id);
    }
  }
}, 60000);

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(['student']);
    
    const stream = new ReadableStream({
      start(controller) {
        const connectionId = `${user.id}-${Date.now()}`;
        
        // Store connection with metadata
        activeConnections.set(connectionId, {
          controller,
          userId: user.id,
          lastActivity: Date.now(),
        });
        
        // Also keep in global connections for backward compatibility
        connections.set(connectionId, controller);
        
        // Send initial connection message
        const sendMessage = (data: any) => {
          try {
            const message = `data: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(new TextEncoder().encode(message));
            
            // Update last activity
            const conn = activeConnections.get(connectionId);
            if (conn) {
              conn.lastActivity = Date.now();
            }
          } catch (error) {
            console.error('Error sending SSE message:', error);
            cleanup();
          }
        };
        
        sendMessage({
          type: 'connected',
          message: 'Real-time attendance updates connected',
          userId: user.id,
        });
        
        // Optimized heartbeat - every 45 seconds
        const heartbeat = setInterval(() => {
          sendMessage({
            type: 'ping',
            timestamp: Date.now(),
          });
        }, 45000);
        
        // Cleanup function
        const cleanup = () => {
          clearInterval(heartbeat);
          activeConnections.delete(connectionId);
          connections.delete(connectionId);
          try {
            controller.close();
          } catch (error) {
            // Connection already closed
          }
        };
        
        // Listen for abort signal
        req.signal.addEventListener('abort', cleanup);
        
        // Periodically send cached stats to reduce load
        const statsInterval = setInterval(async () => {
          const statsKey = `stats:${user.id}`;
          const stats = cache.get(statsKey);
          if (stats) {
            sendMessage({
              type: 'stats_update',
              data: stats,
            });
          }
        }, 120000); // Every 2 minutes
        
        // Store reference to intervals for cleanup
        let cleanupCalled = false;
        const performCleanup = () => {
          if (!cleanupCalled) {
            cleanupCalled = true;
            clearInterval(statsInterval);
            cleanup();
          }
        };
        
        // Override cleanup
        req.signal.addEventListener('abort', performCleanup);
      },
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });
  } catch (error: any) {
    console.error('SSE connection error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'SSE connection failed' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
