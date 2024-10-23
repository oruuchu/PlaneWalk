const APP_NAME = "SolarSystemWalk";
const VERSION = "2.0.0"; // 普通に"v1"とかでもよい

// このサービスワーカーのキャッシュデータのキーとなる文字列
// バージョン番号を入れることで、ソースがアップデートされたときに
// キャッシュファイルの更新をする狙い
const CACHE_NAME = APP_NAME + "_" + VERSION;

// 静的ファイルの相対パスを指定し、インストール時にダウンロードしてキャッシュしておくファイル群
// ローカルではルートにアクセスしたときのためにパス"/"を解決してくれないらしいので登録しておく
// jsファイルやcssファイル、画像ファイルなどがあればそれもリストアップしておくと良い
const assets = [
  "/",
  "/index.html",
  "/favicon.ico",
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
