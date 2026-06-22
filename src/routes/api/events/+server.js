import { addClient } from '$lib/sse.js';

export function GET() {
  let remove;
  const stream = new ReadableStream({
    start(controller) {
      remove = addClient(controller);
      controller.enqueue(new TextEncoder().encode(': connected\n\n'));

      const ping = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': ping\n\n'));
        } catch {
          clearInterval(ping);
        }
      }, 25000);
    },
    cancel() {
      remove?.();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}
