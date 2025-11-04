// SSE Connection Manager
// Store for SSE connections
export const connections = new Map<string, ReadableStreamDefaultController>();

// Helper function to broadcast messages to all connected clients
export function broadcastToClients(message: any, filter?: (userId: string) => boolean) {
  connections.forEach((controller, connectionId) => {
    try {
      const userId = connectionId.split('-')[0];
      if (!filter || filter(userId)) {
        const data = `data: ${JSON.stringify(message)}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
      }
    } catch (error) {
      console.error('Failed to send SSE message:', error);
      connections.delete(connectionId);
    }
  });
}
