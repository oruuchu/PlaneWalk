//惑星名,(1億分の一での)距離,大きさ、解説、dialog、公転周期
const dist_data=[
  ["水星",580,5,
   "太陽に一番近い惑星。\nクレーターには、主に芸術家の名前がつけられており、日本人でいうと、ヤマダ(山田耕筰)や、リキュウ(千利休)といったクレーターがある。\n自転が非常にゆっくりで、1日の長さが176日。\n太陽からの重力の関係で、探査機が到達するのは非常に難しい。",
   false,88
  ],
  ["金星",1085,12,"",false,225],
  ["地球",1500,13,
   "太陽系の中で唯一、生物の確認がされている天体である。\nおよそ46億年前に誕生し、酸素や水などを蓄えている。\n自転周期は24時間、公転周期は365日で、地軸が傾いていることから、季節変化なども見られる。\n衛星として月を伴っていて、潮の満ち引きなどと関わっている。",
   false,365
  ],
  ["火星",2286,7,"",false,687],
  ["木星",7804,143,"",false,4330],
  ["土星",14332,120,
   "太陽系で2番目に大きな惑星で、最も、平均密度が低く、水よりも軽い。また、大きく美しい環を持つ。\n環は、大小の氷でできており、地球と土星の位置関係で、環の見え方が変わる。\nタイタンという窒素の大気を持つ衛星がある。",
   false,10752
  ],
  ["天王星",28828,51,
    'ギリシャ神話における天空神である"Uranus"（ウラヌス）から名付けられた。\n自転軸が約98°傾いており、横倒しの状態で公転している。青みががって見える理由として、天王星を覆っているガスの層に含まれるメタンが赤い光を吸収することが挙げられる。\n表面温度は-200°以下にもなり、昼夜の気温差はほとんどない。加えて、公転周期が約84年ということから、極点では昼と夜がそれぞれ約42年間続く。',
    false,30667
  ],
  ["海王星",45166,50,
   "太陽系の第八惑星で、1864年に発見された惑星である。太陽系の惑星の中では最も外側を約165年かけて公転しいる。\n現在発見されている衛星数は16個であり、有名な衛星にトリトンがある。\n海王星の表面はメタンの赤の光を吸収し、青の光を散乱させる性質によって青く光っているように見えている。\n惑星はここまでですが、太陽系の旅はまだ続きます！",
   false,60141
  ]
];

let scale= location.hash=="#simu"? 2:Number(location.hash.replace("#game-",""));

//マップタイルの定義
const Gmap=L.tileLayer('https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}', {
  attribution:"<a href='https://developers.google.com/maps/documentation' target='_blank'>Google Map</a>",
});
const chiriinn=L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
  attribution:"<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
});
const OSMtile = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank">©OpenStreetMap</a> contributors'
});
const ewi =L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
});
function setup(pos,sca=13){//マップのセットアップ(マップ作成・レイヤー設定)
  mymap = L.map('map');
  mymap.setView(pos, sca);
  const ctrl = L.control.layers({"GoogleMap":Gmap,"国土地理院":chiriinn,"OpenStreetMap": OSMtile,"航空写真":ewi}).addTo(mymap);
  mymap.addControl(new L.Control.Fullscreen());
  OSMtile.addTo(mymap); 

  L.easyButton('<span>&#x3f;</span>', function(btn, easyMap){
    document.getElementById("help").showModal();
  }).addTo(mymap);
  
  if(location.hash=="#simu"){
    const click=function(e) {
      scale=toNum(prompt("縮尺を何億分の1にするか入力してください。\n※〇億分の一、の形に変換し、〇の部分の数値を入力してください",scale));
      while(!scale){scale=toNum(prompt("無効な値です。もう一度、縮尺を何億分の1にするか入力してください。"));}
      mymap.remove();
      start=[
        e.latlng? e.latlng.lat:e.location.y,
        e.latlng? e.latlng.lng:e.location.x
      ];
      setup(start);
      
      L.marker(start,{icon:L.icon({iconUrl:"image/Sun.png",iconSize:[74,64],iconAnchor:[37,32]})}).addTo(mymap).bindPopup("太陽 直径"+14/scale+"m");
      
      for(dt of dist_data){
        let circle = L.circle(start, {radius: dt[1]/scale,fill:false,color:"black",weight:1}).addTo(mymap);
        let mark;
        if(dt[5]){
          let path=[...Array(dt[5]).keys()].map((c) => {return move(dt[1]/scale,c/dt[5]*360,start);});
          mark=L.Marker.movingMarker(path,1000*(dt[5]-1),{autostart:true,loop:true}).on("click",dt.onclick);
          switch(dt[0]){
            case "水星":
              mark.options.icon=L.icon({iconUrl:"image/Mercury.png",iconSize:[50,50],iconAnchor:[25,25]});break;
            case "金星":
              mark.options.icon=L.icon({iconUrl:"image/Venus.png",iconSize:[50,50],iconAnchor:[25,25]});break;
            case "地球":
              mark.options.icon=L.icon({iconUrl:"image/Earth.png",iconSize:[50,50],iconAnchor:[25,25]});break;
            case "火星":
              mark.options.icon=L.icon({iconUrl:"image/Mars.png",iconSize:[50,50],iconAnchor:[25,25]});break;
            case "木星":
              mark.options.icon=L.icon({iconUrl:"image/Jupyter.png",iconSize:[74,64],iconAnchor:[37,32]});break;
            case "土星":
              mark.options.icon=L.icon({iconUrl:"image/Saturn.png",iconSize:[74,64],iconAnchor:[37,32]});break;
            case "天王星":
              mark.options.icon=L.icon({iconUrl:"image/Uranus.png",iconSize:[74,64],iconAnchor:[37,32]});break;
            case "海王星":
              mark.options.icon=L.icon({iconUrl:"image/Neptune.png",iconSize:[37,32],iconAnchor:[18.5,16]});break;
          }
        }else{
          mark=L.marker(move(dt[1]/scale,0,start)).on("click",dt.onclick);
        }
        mark.addTo(mymap);
      }
    };

    const search = new GeoSearch.GeoSearchControl({
      provider: new GeoSearch.OpenStreetMapProvider(),
      style: 'bar',
      showMarker: false,
      searchLabel:"ここで検索orマップ上をクリックで中心地点指定"
    });
　  mymap.addControl(search);
    mymap.on('geosearch/showlocation', click);
    
    mymap.on('click', click);
  }else if(location.hash){
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
  heading=0-heading;
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
      
