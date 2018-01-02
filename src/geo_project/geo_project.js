require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/GraphicsLayer", 
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/geometry/SpatialReference",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/PopupTemplate",
    "extras/geo_project",
    "dojo/domReady!"
], function (Map, MapView,GraphicsLayer, Graphic, Point, SpatialReference,SimpleMarkerSymbol,PopupTemplate,Geo_project) {
    let url = "https://localhost:6443/arcgis/rest/services/Utilities/Geometry/GeometryServer";
    let outSRWkid = 4491; // CGCS2000_GK_Zone_13 投影坐标系

    var map = new Map({
        basemap: "osm"
    });
    var view = new MapView({
        container: "viewDiv",  // Reference to the scene div created in step 5
        map: map,  // Reference to the map object created before the scene
        zoom: 4,  // Sets zoom level based on level of detail (LOD)
        center: [103, 35]  // Sets center point of view using longitude,latitude
    });
     let graphicsLayer = new GraphicsLayer({
            id: "tempGraphicsLayer"
        });
        map.add(graphicsLayer);
    view.on("layerview-create",()=>{
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                let point = new Point({
                    spatialReference: new SpatialReference({wkid: 102100}),
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                let graphic = new Graphic({
                    geometry: point,
                    symbol: new SimpleMarkerSymbol({
                        style: "square",
                        color: "blue",
                        size: "8px",  // pixels
                        outline: {  // autocasts as esri/symbols/SimpleLineSymbol
                            color: [255, 255, 0],
                            width: 3  // points
                        }
                    }),
                    attributes: {
                        x: position.coords.latitude,
                        y: position.coords.longitude
                    },
                    popupTemplate: new PopupTemplate({
                        title: "定位",
                        content: "{*}"
                    })
                });
                graphicsLayer.graphics.add(graphic);
            }, (err)=>{
                console.log(err)
            });
        }
    });
    view.on("click", (evt) => {
        let geoProject = new Geo_project({
            url: url,
            geometries: [evt.mapPoint],
            wkid: outSRWkid,
        });
        geoProject.project();
        // let projectParameters = new ProjectParameters({
        //     geometries: [evt.mapPoint],
        //     outSpatialReference: new SpatialReference({ wkid: outSRWkid })
        // });
        // geometryService.project(projectParameters).then((result) => {
        //     console.log(result);
        // }).then((err) => {
        //     console.log(err);
        // });
    });
});