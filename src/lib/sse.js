if (!globalThis.__sseClients) {
  globalThis.__sseClients = new Set();
}

export function addClient(controller) {
  globalThis.__sseClients.add(controller);
  return () => globalThis.__sseClients.delete(controller);
}

export function broadcast(event = 'update', data = {}) {
  const msg = new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  for (const ctrl of globalThis.__sseClients) {
    try {
      ctrl.enqueue(msg);
    } catch {
      globalThis.__sseClients.delete(ctrl);
    }
  }
}
