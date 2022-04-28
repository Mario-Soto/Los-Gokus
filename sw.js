const CacheEstatico = "st-1";
const CacheInmutable = "in-1";
const CacheDinamico = "din-1";

function LimpiarCache(cacheName, numeroItems) {
	caches.open(cacheName).then((cache) => {
		return cache.keys().then((keys) => {
			console.log(keys);
			if (keys.length > numeroItems)
				cache.delete(keys[0]).then(LimpiarCache(cacheName, numeroItems)); //Recursividad la funcion se llama a si misma
		});
	});
}

self.addEventListener("install", (e) => {
	const cacheProm = caches.open(CacheEstatico).then((cache) => {
		cache.addAll([
			"images/camara.png",
			"images/androide.webp",
			"images/goku_1.webp",
			"images/goku_2.jpg",
			"images/goku_3.webp",
			"images/goku_4.jpg",
			"images/goku_5.jpg",
			"images/goku_6.jfif",
			"images/vegeta_1.jfif",
			"images/vegeta_2.webp",
			"images/vegeta_3.webp",
			"images/vegeta_4.jpg",
			"images/krillin.jpg",
			"images/trunks.jpg",
			"images/piccolo_1.jpg",
			"images/piccolo_2.jpg",
			"images/piccolo_3.jfif",
			"images/piccolo_4.jpg",
			"images/dende.jpg",
			"images/boo_1.jpg",
			"images/boo_2.jpg",
			"images/boo_3.jpg",
			"images/boo_4.jpg",
			"images/black_1.jfif",
			"images/black_2.webp",
			"images/shin.webp",
			"/",
			"/index.html",
			"/css/style.css",
			"/js/app.js",
			"/js/script.js",
		]);
	});
	//cache inmutable no se modifica
	const cacheInm = caches.open(CacheInmutable).then((cache) => {
		cache.addAll([
			"/css/bootstrap.min.css",
			"/css/fontawesome.min.css",
			"/js/bootstrap.bundle.min.js",
			"/js/jquery.min.js",
			"/js/fontawesome.min.js",
			"/res/pages/404.html",
			"/res/404.png",
			"/images/favicons/favicon.png",
			"/manifest.json"
		]);
	});
	e.waitUntil(Promise.all([cacheProm, cacheInm]));
	self.skipWaiting();
});


self.addEventListener("fetch", (e) => {
	//Network with cache fallback
	const respuesta = fetch(e.request)
		.then((res) => {
			//la app solicita un recurso de internet
			if (!res)
				//si falla (false or null)
				return caches
					.match(e.request) //lo busca y lo regresa al cache
					.then((newRes) => {
						if (!newRes) {
							if (/\.(png|jpg|webp|jfif)$/.test(e.request.url)) {
								return caches.match("/res/404.png");
							}
							return caches.match("/res/pages/404.html");
						}
						return newRes;
					});
			
			caches.match(e.request).then((cacheRes) => {
				if (!cacheRes) {
					caches.open(CacheDinamico).then((cache) => {
						//abre el cache dinamico
						cache.add(e.request); //mete el recurso que no existia en el cache
						LimpiarCache(CacheDinamico, 100); // limpia hasta 100 elementos de cache
					});
				}
			});
			return res; //devuelve la respuesta
		})
		.catch((err) => {
			// en caso de que encuetre algun error devuleve el archivo de cache
			return caches
				.match(e.request) //lo busca y lo regresa al cache
				.then((newRes) => {
					if (!newRes) {
						if (/\.(png|jpg|webp|jfif)$/.test(e.request.url)) {
							console.log("Error de imagen: "+e.request.url);
							return caches.match("/res/404.png");
						}
						return caches.match("/res/pages/404.html");
					}
					return newRes;
				});
		});
	e.respondWith(respuesta);
});
