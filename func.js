//マップタイルの定義
const Gmap=L.tileLayer('https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}', {
  attribution:"<a href='https://developers.google.com/maps/documentation' target='_blank'>Google Map</a>",
});
const chiriinn=L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
  attribution:"<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
});
const OSMtile = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank">©OpenStreetMap</a> contributors'
}).addTo(mymap); 
const ewi =L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
});
const ctrl = L.control.layers({"GoogleMap":Gmap,"国土地理院":chiriinn,"OpenStreetMap": OSMtile,"航空写真":ewi}).addTo(mymap);
function setup(pos,sca=13){//マップのセットアップ(マップ作成・レイヤー設定)
  mymap = L.map('map');
  mymap.setView(pos, sca);
  mymap.addControl(new L.Control.Fullscreen());
  
  if(location.hash=="#simu"){mymap.on('dblclick', function(e) {
    scale=toNum(prompt("縮尺を何億分の1にするか入力してください。\n※〇億分の一、の形に変換し、〇の部分の数値を入力してください",scale));
    while(!scale){scale=toNum(prompt("無効な値です。もう一度、縮尺を何億分の1にするか入力してください。"));}
    mymap.remove();
    start=[e.latlng.lat,e.latlng.lng];
    setup(start);

    markers=[];
    for(dt of dist_data){
      let circle = L.circle(e.latlng, {radius: dt[1]/scale,fill:false,color:"black",weight:1}).addTo(mymap);
      markers.push([
        L.marker(move(dt[1]/scale,0,start)).addTo(mymap).bindPopup(dt[0]+" 直径"+dt[2]/scale+"cm"),
        0,
        dt[0]+" 直径"+dt[2]/scale+"cm",
        dt[5]? 360/dt[5]:0,
        dt[1]/scale
        ]);
      }
      L.marker(e.latlng).addTo(mymap).bindPopup("太陽 直径"+14/scale+"m");
      if(simu_st.open){simu_st.close();}
  });}else if(location.hash){
    navigator.serviceWorker.ready.then(e => {
      Notification.requestPermission();
      window.noti=e;
      window.noti.showNotification("太陽系散歩へようこそ!!現在地から、歩いてみてください。");
    });
  }
}

let previous;

function toNum(str) {
  // 全角英数字を半角に変換
  str = str.replace(/[０-９]/g, function(s) {return String.fromCharCode(s.charCodeAt(0) - 0xFEE0).trim();});
  str=str.replace("億","");
  str=str.replace("分の1","");
  str=str.replace("分の一","");
  
  let num=Number(str);
  return num<10000000? num:num/100000000;
} 

function distance([[lat1, lng1], [lat2, lng2]]) {
  lat1 *= Math.PI / 180;
  lng1 *= Math.PI / 180;
  lat2 *= Math.PI / 180;
  lng2 *= Math.PI / 180;
  return 6371 * Math.acos(Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1) + Math.sin(lat1) * Math.sin(lat2)) * 1000;
}

function move(distance, heading, currentPosition) {
  const [latitude, longitude] = currentPosition;
  distance/=1000;

  // 緯線上の移動距離
  const latitudeDistance = distance * Math.cos(heading * Math.PI / 180);

  // 1mあたりの緯度
  const earthCircle = 2 * Math.PI * 6371;
  const latitudePerMeter = 360 / earthCircle;

  // 緯度の変化量
  const latitudeDelta = latitudeDistance * latitudePerMeter;
  const newLatitude = latitude + latitudeDelta;

  // 経線上の移動距離
  const longitudeDistance = distance * Math.sin(heading * Math.PI / 180);
  
  // 1mあたりの経度
  const earthRadiusAtLongitude = 6371 * Math.cos(newLatitude * Math.PI / 180);
  const earthCircleAtLongitude = 2 * Math.PI * earthRadiusAtLongitude;
  const longitudePerMeter = 360 / earthCircleAtLongitude;

  // 経度の変化量
  const longitudeDelta = longitudeDistance * longitudePerMeter;
  
  return [newLatitude, longitude + longitudeDelta];
}
setInterval(function(){Object.keys(markers).forEach(function(key){
  pla=markers[key];
  pla[1]+=pla[3];
  mymap.removeLayer(pla[0]);
  pla[0]=L.marker(move(pla[4],pla[1],start)).addTo(mymap).bindPopup(pla[2]);
});},1000);
      
