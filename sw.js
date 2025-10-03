// Define um nome e versão para o cache
const CACHE_NAME = 'simulados-itil-v1';

// Lista de arquivos essenciais para o funcionamento do app (o "App Shell")
const urlsToCache = [
  '/',
  'index.html',
  'menu_praticas.html',
  'quiz.html',
  'style.css',
  'quiz-engine.js',
  'icon-512x512.png'
  // Os arquivos de perguntas (.json) serão cacheados sob demanda (pela lógica abaixo)
];

// Evento de Instalação: Salva os arquivos do App Shell em cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto e arquivos do App Shell sendo salvos.');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de Fetch: Intercepta as requisições de rede
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se o recurso já estiver no cache, retorna-o imediatamente
        if (response) {
          return response;
        }

        // Se não estiver no cache, busca na rede
        return fetch(event.request).then(
          function(response) {
            // Verifica se a resposta da rede é válida
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona a resposta. A resposta é um "stream" e só pode ser consumida uma vez.
            // Precisamos de uma cópia para o navegador e outra para o cache.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                // Adiciona a nova resposta ao cache para acessos futuros
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});