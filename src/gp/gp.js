require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/tasks/Geoprocessor",
    "esri/symbols/SimpleFillSymbol",
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
    "esri/geometry/Polygon",
    "esri/geometry/geometryEngine",
    "esri/tasks/support/FeatureSet",
    "dojo/dom",
    "dojo/on",
    "dojo/domReady!"
], function (Map, MapView, FeatureLayer, Geoprocessor, SimpleFillSymbol, GraphicsLayer, Graphic, Polygon, geometryEngine, FeatureSet, dom, on) {
    let inputFeature, clipFeature;

    let gpUrl = "https://192.168.33.44:6443/arcgis/rest/services/geocon/clipModal/GPServer/clipModal";
    let featureUrl = "https://192.168.33.44:6443/arcgis/rest/services/geocon/gs_xzqh_city_feature/FeatureServer/0";
    // 实例化GP
    let gp = new Geoprocessor(gpUrl);

    var map = new Map({
        basemap: "osm"
    });
    var view = new MapView({
        container: "viewDiv",  // Reference to the scene div created in step 5
        map: map,  // Reference to the map object created before the scene
        zoom: 6,  // Sets zoom level based on level of detail (LOD)
        center: [103, 35] // Sets center point of view using longitude,latitude
    });
    // 添加参考图层
    let featureLayer = new FeatureLayer({
        url: featureUrl
    });
    map.add(featureLayer);

    clipFeature = new FeatureSet({
        spatialReference: featureLayer.spatialReference.wkid
    });
    

    let graphicsLayer = new GraphicsLayer({
        id: "tempGraphicsLayer"
    });
    map.add(graphicsLayer);
    // on(dom.byId("draw-button"), 'click', (evt) => {
    //     // doGP();

    // });
    // 自定义区域工具
    var drawConfig = {
        drawingSymbol: new SimpleFillSymbol({
            color: [102, 0, 255, 0.15],
            outline: {
                color: "#6600FF",
                width: 2
            }
        }),
        finishedSymbol: new SimpleFillSymbol({
            color: [102, 0, 255, 0.45],
            outline: {
                color: "#6600FF",
                width: 2
            }
        }),
        activePolygon: null,
        isDrawActive: false
    };

    var drawButton, pointerDownListener, pointerMoveListener,
        doubleClickListener;

    view.then(function () {
        // display view instructions when the view is ready
        var instructionsElement = document.getElementById(
            "instructions");
        instructionsElement.style.visibility = "visible";

        // add click event listener to draw button when view is ready
        drawButton = document.getElementById("draw-button");
        drawButton.addEventListener("click", function () {
            graphicsLayer.graphics.removeAll();
            // Remove the instructions to click the button
            // after it is activated for the first time.

            if (instructionsElement) {
                view.container.removeChild(instructionsElement);
                instructionsElement = null;
            }

            if (!drawConfig.isDrawActive) {
                activateDraw();
            } else {
                deactivateDraw();
                clearPolygon();
                view.popup.close();
            }
        });
    });

    function activateDraw() {
        drawConfig.isDrawActive = true;
        drawButton.classList.toggle("esri-draw-button-selected");

        // remove the previous popup and polygon if they already exist
        clearPolygon();
        view.popup.close();

        pointerDownListener = view.on("pointer-down", function (event) {
            event.stopPropagation();
            var point = createPoint(event);
            addVertex(point);
        });
        pointerMoveListener = view.on("pointer-move", function (event) {
            if (drawConfig.activePolygon) {
                event.stopPropagation();

                var point = createPoint(event);
                updateFinalVertex(point);
            }
        });
        doubleClickListener = view.on("double-click", function (event) {
            event.stopPropagation();

            var searchArea = addVertex(event.mapPoint, true);

            // If an invalid search area is entered, then drawing
            // continues and the query is not executed
            if (!searchArea) {
                return null;
            }

            deactivateDraw();
            // 执行gp
            doGP();
        });
    }

    /**
     * Deactivates drawing on the view. Removes event listeners
     * and clears the polygon from memory
     */
    function deactivateDraw() {
        drawConfig.isDrawActive = false;
        drawButton.classList.toggle("esri-draw-button-selected");
        pointerDownListener.remove();
        pointerMoveListener.remove();
        doubleClickListener.remove();
        drawConfig.activePolygon = null;
    }

    // Converts screen coordinates returned
    // from an event to an instance of esri/geometry/Point
    function createPoint(event) {
        return view.toMap(event);
    }

    /**
     * Adds a vertex to the activePolygon. Fires each time
     * the view is clicked.
     * @param {esri/geometry/Point} point - Adds the given poing to the active
     *   polygon then resets the active polygon.
     * @return {esri/geometry/Polygon}
     */
    function addVertex(point, isFinal) {

        var polygon = drawConfig.activePolygon;
        var ringLength;

        if (!polygon) {
            polygon = new Polygon({
                spatialReference: {
                    wkid: 3857
                }
            });
            polygon.addRing([point, point]);
        } else {
            ringLength = polygon.rings[0].length;
            polygon.insertPoint(0, ringLength - 1, point);
        }

        drawConfig.activePolygon = polygon;
        // console.log(polygon)
        return redrawPolygon(polygon, isFinal);
    }

    /**
     * Clears polygon(s) from the view and adds the
     * given polygon to the view.
     */
    function redrawPolygon(polygon, finished) {

        // simplify the geometry so it can be drawn accross
        // the dateline and accepted as input to other services
        var geometry = finished ? geometryEngine.simplify(polygon) :
            polygon;

        if (!geometry && finished) {
            console.log(
                "Cannot finish polygon. It must be a triangle at minimum. Resume drawing..."
            );
            return null;
        }

        clearPolygon();

        var polygonGraphic = new Graphic({
            geometry: geometry,
            symbol: finished ? drawConfig.finishedSymbol : drawConfig.drawingSymbol
        });
        let features = [];
        features.push(polygonGraphic);
        clipFeature.features = features;
        view.graphics.add(polygonGraphic);
        return geometry;
    }

    /**
     * Executes on each pointer-move event. Updates the
     * final vertex of the activePolygon to the given
     * point.
     */
    function updateFinalVertex(point) {
        var polygon = drawConfig.activePolygon.clone();

        var ringLength = polygon.rings[0].length;
        polygon.insertPoint(0, ringLength - 1, point);
        redrawPolygon(polygon);
    }

    /**
     * Cleares the drawn polygon in the view. Only one
     * polygon may be drawn at a time.
     */
    function clearPolygon() {
        var polygonGraphic = view.graphics.find(function (graphic) {
            return graphic.geometry.type === "polygon";
        });

        if (polygonGraphic) {
            view.graphics.remove(polygonGraphic);
        }
    }
    // gp 参数构建
    $.getJSON("https://192.168.33.44:6443/arcgis/rest/services/geocon/gs_xzqh_city_feature/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson", function (data) {
        inputFeature = data;
    });
    // $.getJSON("https://192.168.33.44:6443/arcgis/rest/services/geocon/clipFeature/MapServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson", (data) => {
    //     clipFeature = data;
    //     console.log(clipFeature);
    // });

    function doGP() {
        gp.submitJob({
            "inputFeature": JSON.stringify(inputFeature),
            "clipFeature": JSON.stringify(clipFeature),
            "env:outSR": 4326
        }, {
                "method": "post"
            }).then((result) => {
                if (result.jobStatus == "job-succeeded") {
                    gp.getResultData(result.jobId, "result").then((data) => {
                        // console.log(data);
                        renderGPResult(data.value.features);
                    });
                }
            }).then((err) => {
                if (err) {
                    console.error(err);
                }
            })
    }
    let simpleFillSymbol = new SimpleFillSymbol({
        color: [102, 0, 255, 0.15],
        outline: {
            color: "#6600FF",
            width: 2
        }
    });
    function renderGPResult(features) {
        graphicsLayer.graphics.removeAll();
        clearPolygon();
        let graphics = [];
        features.map((feature) => {
            feature.symbol = simpleFillSymbol;
            // graphics.push(feature);
            graphicsLayer.graphics.add(feature);
        });
    }
});