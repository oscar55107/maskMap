let data = [];
let filteredTown = [] || data;
let county = document.querySelector('.county');
let town = document.querySelector('.town');
let list = document.querySelector('.list');
let geoIcon = document.querySelector('.geoIcon');
const toggle = document.querySelector('.js_toggle');
const panel = document.querySelector('.panel');
toggle.onclick = function(e) {
    // e.preventDefault();
    panel.classList.toggle("panelClose");

};

county.addEventListener('change',filterCountyList)
town.addEventListener('change',filterTownList)


// town.addEventListener('change',geo)
//載入地圖
const map = L.map('map', { zoomControl: false }).setView([0, 0], 16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors:<a href="https://github.com/fred39392001">ABow_Chen</a>'
}).addTo(map);

const violetIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const marker = L.marker([0, 0] , {icon:violetIcon}).addTo(map);

//定位使用者位置
if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(position => {
    userLat = position.coords.latitude;
    userLng = position.coords.longitude;
    map.setView([userLat, userLng], 13);
    marker.setLatLng([userLat,userLng]).bindPopup(
        `<h6>你的位置</h6>`)
        .openPopup();
    });
} 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
const greenIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
const redIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
const greyIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// 取得 JSON 資料
function getData(){
    let xhr = new XMLHttpRequest();
    xhr.open("get","https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json");
    xhr.send();
    xhr.onload = function(){
        data = JSON.parse(xhr.responseText).features
        for(let i =0;data.length>i;i++){
            let iconColor;
            if(data[i].properties.mask_adult > 0 && data[i].properties.mask_child > 0){
                iconColor = greenIcon;
            }else if(data[i].properties.mask_adult === 0 && data[i].properties.mask_child > 0){
                iconColor = redIcon;
            } else{
                iconColor = greenIcon;
            }
        markers.addLayer(L.marker([data[i].geometry.coordinates[1],data[i].geometry.coordinates[0]], {icon: iconColor})
        .bindPopup(
            `
            <div class="poptitle">
                <h6>${data[i].properties.name}</h6>
                <span>${data[i].properties.phone}</span>
            </div>
            <p>成人口罩：${data[i].properties.mask_adult}</p>
            <p>兒童口罩：${data[i].properties.mask_child}</p>
            <span>更新時間: ${data[i].properties.updated}</span>
            
            `
        ));
        }
        map.addLayer(markers);
        addCountyList();
        updateList(data);
    }
}

getData();
let markers = new L.MarkerClusterGroup().addTo(map);;

// 加入城市 option
function addCountyList() {
    let countyName = new Set();
    let countyList = data.filter(item=> !countyName.has(item.properties.county)? countyName.add(item.properties.county): false);
    let countyStr = ''
    countyStr+=`  <option value="" disabled selected>-- 請選擇 --</option>`;
    countyList.forEach(item => {
        if(item.properties.county !== '') {
            countyStr += `
                <option value="${item.properties.county}">${item.properties.county}</option>
            `
        }
    })
    county.innerHTML = countyStr;
}

// 城市 change 加入城鄉
function filterCountyList(e){
    let countyVal = e.target.value;
    let allTown = [];
    data.forEach(item => {
        if(item.properties.county === countyVal){
            allTown.push(item);
        }
    })
    addTownList(allTown);
    updateList(allTown);
}
// 加入城鄉
function addTownList(allTown) {
    let townName = new Set();
    let townList = allTown.filter(item=> !townName.has(item.properties.town)? townName.add(item.properties.town): false);
    let townStr = ''
    townList.forEach(item => {
        townStr += `
                <option value="${item.properties.town}">${item.properties.town}</option>
            `
    })
    town.innerHTML = townStr;
}
// 顯示城鄉資料 
function filterTownList(e){
    let geoData = {}
    data.forEach(item => {
        if(item.properties.town === e.target.value) {
            filteredTown.push(item)
            geoData = item
        }
    })
    updateList(filteredTown)
    geo(geoData);
}
// 更新資料
function updateList(townList){
    let str = ''
    str+=`<h5 class='text-center mb-4'>取得口罩的藥局有${townList.length}家</h5>`
    townList.forEach(item => {
        str+= `
        <div class="card text-center mb-2 mx-2">
            <div class="card-header">
                ${item.properties.name}
            </div>
            <div class="card-body d-flex align-items-start flex-column">
                <div>
                    <i class="fas fa-map-marker-alt geoIcon text-danger marker_icon" data-locate="${[item.geometry.coordinates[1], item.geometry.coordinates[0]]}" data-name="${item.properties.name}"></i>
                    <span class="mb-2  ml-2">${item.properties.address}</span>
                </div>
                <div>
                    <i class="fas fa-phone  text-success"></i>
                    <span>${item.properties.phone}</span>
                </div>
            </div>
            <div class="card-footer text-muted d-flex justify-content-around">
                <div class="p-2 btn btn-secondary ">成人: ${item.properties.mask_adult}</div>
                <div class="p-2 btn btn-secondary">兒童: ${item.properties.mask_child}</div>
            </div>
        </div>
        `
    })
    list.innerHTML = str;
}
function geo(geoData){
    let name = geoData.properties.town;
    map.setView([geoData.geometry.coordinates[1], geoData.geometry.coordinates[0]], 11);
    L.marker([geoData.geometry.coordinates[1], geoData.geometry.coordinates[0]])
    .addTo(map)
    .bindPopup(name)
    .openPopup();
}
$(list).delegate(`.marker_icon`, `click`, function (e) {
    let tempdata = e.target.dataset.locate;
    let tempName = e.target.dataset.name;
    let str = tempdata.split(",");
    let numA = parseFloat(str[0]);
    let numB = parseFloat(str[1]);
    let location = [numA, numB];
    map.setView(location, 20);
        L.marker(location)
        .addTo(map)
        .bindPopup(tempName)
        .openPopup();
});


