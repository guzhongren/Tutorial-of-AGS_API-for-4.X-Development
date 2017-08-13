require([
    "esri/config",
    "esri/views/SceneView", "esri/Map", "esri/layers/WebTileLayer",
    "dojo/domReady!"
], function (esriConfig,SceneView, Map, WebTileLayer) {

    // 代理天地图
    esriConfig.request.proxyUrl="https://localhost/devFolder/proxy/proxy.ashx";
    esriConfig.request.corsEnabledServers.push("http://t0.tianditu.com/","http://t1.tianditu.com/","http://t2.tianditu.com/","http://t3.tianditu.com/","http://t4.tianditu.com/","http://t5.tianditu.com/","http://t6.tianditu.com/","http://t7.tianditu.com/");
    // esriConfig.request.forceProxy= true;

    let map = new Map({
        // basemap: "osm"
    });
    let view = new SceneView({
        map: map,
        container: "viewDiv"
    });

    // 扩展天地图
    let basemapLayer = new WebTileLayer({
        urlTemplate: "http://{subDomain}.tianditu.com/" + "vec_w" + "/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=" + "vec" + "&STYLE=default&TILEMATRIXSET=" + "w" + "&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&FORMAT=tiles",
        subDomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"]
    });
    map.add(basemapLayer);
});