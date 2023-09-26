// imports
// El método importScripts() de la interfaz WorkerGlobalScope importa sincrónicamente uno o más scripts al
// scope del worker.
importScripts('js/sw-utils.js'); // Debemos agregarlo al App Shell.

const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v1';
const INMUTABLE_CACHE = 'inmutable-v1';

// Los APP_SHELL son los recursos minimos que la aplicación necesita.

const APP_SHELL = [
    // '/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/hulk.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js',
    'js/sw-utils.js',
];

// Inmutables porque nunca cambiarán ya que son desarrollados por terceros:
const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js',
];

// Guardaremos nuestro App Shell en el cache:
self.addEventListener('install', e => {

    const cacheStatic = caches.open(STATIC_CACHE).then(cache => cache.addAll(APP_SHELL));

    const cacheInmutable = caches.open(INMUTABLE_CACHE).then(cache => cache.addAll(APP_SHELL_INMUTABLE));

    // Para mas de una promesa se usa el Promise.all().
    e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));

});

// Esto se va a disparar cuando la instalacion termine y eliminará el cache antigüo:
self.addEventListener('activate', e => {

    // Para eliminar el cache antigüo:
    const respuesta = caches.keys().then(keys => {

        keys.forEach(key => {

            // Para eliminar solo el cache estatico antigüo:
            if (key !== STATIC_CACHE && key.includes('static')) {
                return caches.delete(key);
            }
        })
    })

    e.waitUntil(respuesta);

});

self.addEventListener('fetch', e => {
    
    // Cache only:
    const respuesta = caches.match(e.request).then(res => {

        if (res) {
            return res;
        } else {
            // fontawesome y google font internamente hacen llamadas a la web, por eso tambien debemos agregar
            // esos recursos al cache dinamico.
            // console.log(e.request.url);
            return fetch(e.request).then(newRes => {
                return actualizaCacheDinamico(DYNAMIC_CACHE, e.request, newRes);
            });
        }
    });


    e.respondWith(respuesta);
});