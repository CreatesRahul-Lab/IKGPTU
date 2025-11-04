import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { connections } from '@/lib/sse-manager';

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(['student']);
    
    const stream = new ReadableStream({
      start(controller) {
        // Store connection
        const connectionId = `${user.id}-${Date.now()}`;
        connections.set(connectionId, controller);
        
        // Send initial connection message
        const initialMessage = `data: ${JSON.stringify({
          type: 'connected',
          message: 'SSE connection established',
        })}\n\n`;
        controller.enqueue(new TextEncoder().encode(initialMessage));
        
        // Set up heartbeat
        const heartbeat = setInterval(() => {
          try {
            const heartbeatMessage = `data: ${JSON.stringify({
              type: 'heartbeat',
              timestamp: Date.now(),
            })}\n\n`;
            controller.enqueue(new TextEncoder().encode(heartbeatMessage));
          } catch (error) {
            clearInterval(heartbeat);
            connections.delete(connectionId);
          }
        }, 30000); // Every 30 seconds
        
        // Cleanup on close
        req.signal.addEventListener('abort', () => {
          clearInterval(heartbeat);
          connections.delete(connectionId);
          try {
            controller.close();
          } catch (error) {
            // Connection already closed
          }
        });
      },
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'SSE connection failed' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
