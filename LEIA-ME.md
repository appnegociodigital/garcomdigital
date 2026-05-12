// ─── SERVICE WORKER — Sistema Restaurante ────────────────────────────────────
const CACHE_NAME = 'restaurante-v2';
const KEEP_ALIVE_TAG = 'keep-alive-supabase';
const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

// Arquivos para cache offline
const CACHE_ASSETS = [
  '/login.html',
  '/mesa.html',
  '/painel.html',
  '/cozinha.html',
  '/config.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// ─── INSTALL: cacheia os assets ───────────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ─── ACTIVATE: limpa caches antigos ──────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => {
      self.clients.claim();
      agendarKeepAlive(); // agendar o primeiro keep-alive
    })
  );
});

// ─── FETCH: serve do cache, busca na rede se não tiver ───────────────────────
self.addEventListener('fetch', e => {
  // Requisições ao Supabase: sempre vai para a rede (não cacheia dados)
  if (e.request.url.includes('supabase.co')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        // Cacheia respostas ok de assets estáticos
        if (resp && resp.status === 200 && e.request.method === 'GET') {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return resp;
      }).catch(() => cached || new Response('Offline', { status: 503 }));
    })
  );
});

// ─── KEEP-ALIVE: Background Sync para manter Supabase ativo ──────────────────
// O Background Periodic Sync agenda pings automáticos mesmo com app fechado

// Registrar Periodic Sync (chamado da página principal)
self.addEventListener('message', e => {
  if (e.data?.tipo === 'registrar-keep-alive') {
    agendarKeepAlive();
  }
  if (e.data?.tipo === 'ping-manual') {
    fazerPing();
  }
});

async function agendarKeepAlive() {
  try {
    // Periodic Background Sync (Chrome/Android, requer HTTPS + permissão)
    if ('periodicSync' in self.registration) {
      await self.registration.periodicSync.register(KEEP_ALIVE_TAG, {
        minInterval: FIVE_DAYS_MS
      });
      console.log('[SW] Periodic Sync registrado: a cada 5 dias');
    }
  } catch (e) {
    console.log('[SW] Periodic Sync não disponível, usando fallback localStorage');
  }
}

// Periodic Sync event (dispara automaticamente a cada 5 dias no Android/Chrome)
self.addEventListener('periodicsync', e => {
  if (e.tag === KEEP_ALIVE_TAG) {
    e.waitUntil(fazerPing());
  }
});

// Background Sync fallback (dispara quando volta a ter conexão)
self.addEventListener('sync', e => {
  if (e.tag === KEEP_ALIVE_TAG) {
    e.waitUntil(fazerPing());
  }
});

async function fazerPing() {
  try {
    // Busca o config do localStorage via client
    const clients = await self.clients.matchAll();
    // Lê config salva pelo app
    const config = await lerConfig();
    if (!config?.url || !config?.key) return;

    const resp = await fetch(
      `${config.url}/rest/v1/keepalive?select=id&limit=1`,
      {
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${config.key}`
        }
      }
    );
    if (resp.ok) {
      console.log('[SW] Keep-alive ping enviado ao Supabase:', new Date().toISOString());
      await salvarUltimoPing();
    }
  } catch (err) {
    console.warn('[SW] Keep-alive falhou:', err.message);
  }
}

// Armazenar config no Cache Storage (único storage acessível no SW)
async function lerConfig() {
  try {
    const cache = await caches.open('restaurante-config');
    const resp = await cache.match('/sw-config');
    if (resp) return resp.json();
  } catch (e) {}
  return null;
}

async function salvarUltimoPing() {
  try {
    const cache = await caches.open('restaurante-config');
    await cache.put('/sw-ping', new Response(JSON.stringify({ ts: Date.now() })));
  } catch (e) {}
}

// ─── PUSH NOTIFICATIONS (para chamada de garçom) ─────────────────────────────
self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || '🔔 Restaurante', {
      body: data.body || 'Nova notificação',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      tag: data.tag || 'restaurante',
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: data.url || '/painel.html' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(cs => {
      const url = e.notification.data?.url || '/painel.html';
      const c = cs.find(x => x.url.includes(url));
      if (c) return c.focus();
      return clients.openWindow(url);
    })
  );
});
