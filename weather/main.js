var aElement = document.getElementById("area");
var bElement = document.getElementById("weatherCodes");
var cElement = document.getElementById("tempsMin");
var dElement = document.getElementById("tempsMax");

var eElement = document.getElementById("type");
var fElement = document.getElementById("quakearea");
var gElement = document.getElementById("magnitude");
var hElement = document.getElementById("time");
var iElement = document.getElementById("tsunami");
var jElement = document.getElementById("maxScale");

var kElement = document.getElementById("weather");
var lElement = document.getElementById("quake");
var mElement = document.getElementById("w_time");
var nElement = document.getElementById("eeq");

const music = new Audio('eqa.ogg');

var alert_num = 0;

var date1 = new Date('2023/08/01 22:07:00');
var hours = date1.getHours();
var minutes = date1.getMinutes();
var day = date1.getDate();

var num = 0;

var area;
var weatherCodes;
var tempsMin;
var tempsMax;

var quake_area;
var quake_area_name;
var quake_magnitude;
var quake_maxScale_name;
var quake_time;
var quake_tsunami;

var id;
var quaketitle;

var code = [100,101,102,103,104,105,106,107,108,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,130,131,132,140,160,170,181,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,228,229,230,231,240,250,260,270,281,300,301,302,303,304,306,308,309,311,313,314,315,316,317,320,321,322,323,324,325,326,327,328,329,340,350,361,371,400,401,402,403,405,406,407,409,411,413,414,420,421,422,423,425,426,427,450];
var img = ["100.svg","101.svg","102.svg","102.svg","104.svg","104.svg","102.svg","102.svg","102.svg","110.svg","110.svg","112.svg","112.svg","112.svg","115.svg","115.svg","115.svg","112.svg","112.svg","102.svg","102.svg","112.svg","100.svg","100.svg","112.svg","112.svg","112.svg","112.svg","100.svg","100.svg","101.svg","102.svg","104.svg","104.svg","115.svg","200.svg","201.svg","202.svg","202.svg","204.svg","204.svg","202.svg","202.svg","202.svg","200.svg","210.svg","210.svg","212.svg","212.svg","212.svg","215.svg","215.svg","215.svg","212.svg","212.svg","202.svg","202.svg","212.svg","201.svg","212.svg","212.svg","212.svg","215.svg","215.svg","215.svg","200.svg","202.svg","204.svg","204.svg","204.svg","215.svg","300.svg","301.svg","302.svg","303.svg","300.svg","300.svg","308.svg","303.svg","311.svg","313.svg","314.svg","314.svg","311.svg","313.svg","311.svg","313.svg","303.svg","311.svg","311.svg","311.svg","314.svg","314.svg","300.svg","300.svg","400.svg","300.svg","411.svg","413.svg","400.svg","401.svg","402.svg","403.svg","400.svg","406.svg","406.svg","403.svg","411.svg","413.svg","414.svg","411.svg","413.svg","414.svg","414.svg","400.svg","400.svg","400.svg","400.svg"];

var quakecode = [551,522,556];
var quakename = ["地震情報","津波予報","緊急地震速報"];
var maxScale = [10,20,30,40,45,46,50,55,60,70];
var maxScale_name = ["震度1","震度2","震度3","震度4","震度5弱","震度5弱","震度5強","震度6弱","震度6強","震度7"]

slideshow_timer();

function slideshow_timer(){
    main();
    pquake();
    if (num > 20){
        num = 0;
    } else {
        num ++;
    }

    if(alert_num == 0) {
        lElement.style.display = "none";
        kElement.style.display = "block";
    } else if(alert_num == 1){
        kElement.style.display = "none";
        lElement.style.display = "block";
    } else {
        kElement.style.display = "block";
        lElement.style.display = "block";
    }

    if(quake_area == "緊急地震速報") {
        music.currentTime = 0;
        music.play();
        nElement.innerText = "緊急地震速報です。強い揺れに警戒して下さい。\n落ち着いて、身の安全を図ってください。\n詳細について各Webサイト等でご確認ください。";
        nElement.style.display = "block";

        kElement.style.display = "none";
        lElement.style.display = "none";
    } else {
        nElement.innerHTML = "";
        nElement.style.display = "none";
    }

    if(quake_tsunami == "現在、津波警報が発表されています。") {
        iElement.style.backgroundColor = "red";
        iElement.style.color = "white";
    } else {
        iElement.style.backgroundColor = "white";
        iElement.style.color = "black";
    }

    aElement.innerHTML = area;
    bElement.innerHTML = weatherCodes;
    cElement.innerHTML = tempsMin;
    dElement.innerHTML = tempsMax;

    if(day == new Date(quake_time).getDate() && hours == new Date(quake_time).getHours() && minutes == new Date(quake_time).getMinutes()) {
        eElement.innerHTML = "=" + quake_area + "=";
        fElement.innerHTML = "震源地：" + quake_area_name;
        gElement.innerHTML = "マグニチュード：" + quake_magnitude;
        jElement.innerHTML = "最大深度：" + quake_maxScale_name;
        hElement.innerHTML = "発表時間：" + quake_time;
        iElement.innerHTML = "津波情報：" + quake_tsunami;
        alert_num = 1;
    } else {
        alert_num = 0;
    }

    document.getElementById("svg").src = "https://www.jma.go.jp/bosai/forecast/img/" + img[code.indexOf(Number(weatherCodes))];
    setTimeout("slideshow_timer()",5000);
}

async function main() {
    var i = num;
    var response = await fetch("https://www.jma.go.jp/bosai/forecast/data/forecast/010000.json", {method: "GET",cache: "no-store"});
    var users = await response.json();

    area = users[i].srf.timeSeries[2].areas.area.name;
    weatherCodes = users[i].srf.timeSeries[0].areas.weatherCodes[1];
    tempsMin = users[i].srf.timeSeries[2].areas.temps[0];
    tempsMax = users[i].srf.timeSeries[2].areas.temps[1];
    mElement.innerHTML = new Date(users[0].srf.timeSeries[2].timeDefines[1]).toLocaleDateString("ja-JP", {year: "numeric",month: "2-digit",day: "2-digit"});
}

async function pquake() {
    var response = await fetch("https://api.p2pquake.net/v2/history?codes=551&codes=552&codes=556", {method: "GET",cache: "no-store"});
    var users = await response.json();
    quake_area = quakename[quakecode.indexOf(Number(users[0].code))];
    quake_area_name = users[0].earthquake.hypocenter.name;
    quake_magnitude = users[0].earthquake.hypocenter.magnitude;
    quake_maxScale_name = maxScale_name[maxScale.indexOf(Number(users[0].earthquake.maxScale))]
    quake_time = users[0].earthquake.time;
    quake_tsunami = users[0].earthquake.domesticTsunami;
    id = users[0].id;

    if(quake_magnitude == -1) quake_magnitude = "--";
    if(maxScale.indexOf(Number(users[0].earthquake.maxScale) == -1)) quake_magnitude = "--";
    if(quake_tsunami == "Warning") {
        quake_tsunami = "現在、津波警報が発表されています。";
    } else {
        quake_tsunami = "この地震による津波の心配はありません。";
    }
}