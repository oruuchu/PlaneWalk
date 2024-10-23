const APP_NAME = "SolarSystemWalk";
const VERSION = "1.9.2"; 
const CACHE_NAME = APP_NAME + "_" + VERSION;

const assets = [
  "/",
  "/index.html",
  "/192.png",
  "/512.png"/*,
  "https://unpkg.com/leaflet@1.3.1/dist/leaflet.js",
  'https://api.mapbox.com/mapbox.js/plugins/leaflet-fullscreen/v1.0.1/Leaflet.fullscreen.min.js',
  'https://api.mapbox.com/mapbox.js/plugins/leaflet-fullscreen/v1.0.1/leaflet.fullscreen.css',
  "https://cdn.jsdelivr.net/npm/leaflet-easybutton@2.4.0/src/easy-button.min.js",
  "https://cdn.jsdelivr.net/npm/leaflet-easybutton@2.4.0/src/easy-button.min.css"*/
];

/**
 * サービスワーカーのインストールイベント発生時の処理
 */
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 上記配列で指定したファイル群をダウンロードしてローカルにキャッシュしておく
      // これによりオフラインでも起動できるようになる
      return cache.addAll(assets);
    })
  );
});

/** 
 * サービスワーカーからサーバにアクセスするときの処理
 */
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      // キャッシュされているときは通信せずにローカルのファイルを参照する
      return response ? response : fetch(e.request);
    })
  );
});

/**
 * サービスワーカーが起動するときの処理
 */
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          // このファイル先頭で定義されているファイル名の配列になく、
          // キャッシュされていたらキャッシュ（＝ローカル）から削除しておく
          // バージョンアップ時にゴミが残らないようにする工夫
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});
