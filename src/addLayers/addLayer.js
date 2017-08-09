require([
    "esri/Map",
    "esri/views/MapView",
    "esri/views/SceneView",
    "esri/layers/MapImageLayer",
    "esri/core/watchUtils",
    "dojo/dom",
    "dojo/dom-attr",
    "dojo/on",
    "dojo/domReady!"
], function (Map, MapView, SceneView, MapImageLayer, watchUtils, dom, domAttr, on) {
    let map = new Map({
        basemap: "osm"
    });
    let view = new MapView({
        container: "viewDiv",  // Reference to the scene div created in step 5
        map: map,  // Reference to the map object created before the scene
        zoom: 4,  // Sets zoom level based on level of detail (LOD)
        // center: [15, 65]  // Sets center point of view using longitude,latitude
    });
    view.center = [103, 35];
    // 创建动态地图图层
    let sceenMap = new Map({
        basemap: "osm"
    });
    let sceenView = new SceneView({
        container: "sceenView",
        map: sceenMap,
        center: [103, 35]
    })

    // 给添加图层按钮添加监听
    $("#btnAddDynamicLayer").on("click", () => {
        $("#myModal").modal({
            keyboard: true
        });
        // domAttr.get(dom.byId("serviceUrl"), "value","");
    });
    // 点击添加图层
    on(dom.byId("btnAddLayerToMap"), "click", () => {
        let serviceValue = domAttr.get(dom.byId("serviceUrl"), "value");
        if (serviceValue) {
            let dynamicLyer = new MapImageLayer({
                url: serviceValue,
                id: Math.random()
            });
            let dynamicLyer1 = new MapImageLayer({
                url: serviceValue,
                id: Math.random()
            });
            sceenMap.add(dynamicLyer);
            map.add(dynamicLyer1);
            $("#myModal").modal("hide");
        }

    });
});