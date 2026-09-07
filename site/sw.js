// Service worker de desativação. Ele existe apenas para substituir workers de
// versões antigas que ainda possam estar controlando o domínio. Depois de
// ativado, apaga os caches do SuplementaAI, remove a própria inscrição e recarrega
// as abas controladas uma única vez para que peguem o build atual da rede.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('suplementai-')).map((key) => caches.delete(key)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      try { await client.navigate(client.url); } catch { /* aba será atualizada normalmente pelo usuário */ }
    }
  })());
});
