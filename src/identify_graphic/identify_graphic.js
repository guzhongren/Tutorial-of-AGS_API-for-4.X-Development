require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/MapImageLayer",
    "esri/tasks/IdentifyTask",
    "esri/tasks/support/IdentifyParameters",
    "esri/symbols/SimpleFillSymbol",
    "esri/PopupTemplate",
    "esri/layers/GraphicsLayer",
     "esri/widgets/Legend",
    "dojo/_base/array",
    "dojo/dom",
    "dojo/domReady!"
], function (Map, MapView, MapImageLayer, IdentifyTask, IdentifyParameters, SimpleFillSymbol, PopupTemplate, GraphicsLayer,Legend, arrayUtils, dom) {
    let url = "https://localhost:6443/arcgis/rest/services/geocon/gs_xzqh_city/MapServer";
    var map = new Map({
        basemap: "osm"
    });
    var view = new MapView({
        container: "viewDiv",
        map: map,
        zoom: 4,
        center: [103, 35]
    });
    // identify初始化
    let identifyTask = new IdentifyTask(url);
    // 定义面状符号
    let simpleFillSymbol = new SimpleFillSymbol({
        color: [227, 139, 79, 0.8],
        outline: { // autocasts as new SimpleLineSymbol()
          color: [255, 255, 255],
          width: 1
        }
    });
    // 定义弹出框  -表格显示
    let poputTemplate = new PopupTemplate({
        title: "{CNAME}",
        content: [{
            type:"fields",
            fieldInfos:[
                {
                    fieldName:"CLASID"
                },
                {
                    fieldName:"GB"
                },
                {
                    fieldName:"Shape_Area"
                },
                {
                    fieldName:"Shape_Length"
                }
            ]
        }]
    });
    let tempGraphicsLayer = new GraphicsLayer({
        id: "tempGraphicsLayer"
    });

    // 事件
    view.on("layerview-create", _addDynamicLayer.apply(this, [map, url]));
    view.then(() => {
        view.on("click", _executIidentify);
        // 添加GraphicsLayer
        view.on("layerview-create", () => {
            map.add(tempGraphicsLayer);
        });
        let legend= new Legend({
            view: view
        });
        view.ui.add(legend, "bottom-left");
    });
    /**
     *  添加图层
     * 
     * @param {Map Object} map 地图对象
     * @param {string} url  MapServer地址
     */
    function _addDynamicLayer(map, url) {
        let dynamicLayer = new MapImageLayer({
            url: url
        });
        map.add(dynamicLayer);
    }
    /**
     * 识别功能并符号化显示
     * 
     * @param {any} evt 
     */
    function _executIidentify(evt) {
        let identifyParameters = new IdentifyParameters();
        identifyParameters.tolerance = 2;
        identifyParameters.geometry = evt.mapPoint;
        identifyParameters.mapExtent = view.extent;
        identifyParameters.returnGeometry = true;
        dom.byId("viewDiv").style.cursor = "wait";
        identifyTask.execute(identifyParameters).then((response) => {
            let results = response.results;
            return arrayUtils.map(results, (result) => {
                tempGraphicsLayer.graphics.removeAll();
                let feature = result.feature;
                feature.popupTemplate = poputTemplate;
                feature.symbol = simpleFillSymbol;
                tempGraphicsLayer.graphics.add(feature);
                // console.log(tempGraphicsLayer);
                return feature;
            });
        }).then((resp) => {
            if (resp.length > 0) {
                view.popup.open({
                    features: resp,
                    location: evt.mapPoint
                })
            }
            dom.byId("viewDiv").style.cursor = "auto";
        });
    }

});