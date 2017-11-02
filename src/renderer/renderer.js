require(["esri/Map",
    "esri/views/MapView",
    "esri/layers/MapImageLayer",
    "esri/layers/FeatureLayer",
    "esri/symbols/SimpleFillSymbol",
    "esri/renderers/UniqueValueRenderer",
    "esri/renderers/ClassBreaksRenderer",
    "esri/renderers/SimpleRenderer",
    "esri/PopupTemplate",
    "esri/widgets/Legend",
    "dojo/_base/array",
    "dojo/on",
    "dojo/dom",
    "dojo/domReady!"], function (Map, MapView, MapImageLayer, FeatureLayer, SimpleFillSymbol, UniqueValueRenderer, ClassBreaksRenderer, SimpleRenderer,PopupTemplate, Legend, arrayUtil, on, dom) {
        let url = "https://192.168.33.44:6443/arcgis/rest/services/geocon/gs_xzqh_city_feature/FeatureServer/0";
        let cityLayer, legend, popupTemplate;
        var map = new Map({
            basemap: "dark-gray"
        });
        var view = new MapView({
            container: "viewDiv",
            map: map,
            zoom: 4,
            center: [103, 35]
        }).then(() => {
            _addDynamicLayer(map, url);
        });
        //混合渲染
        on(dom.byId("btnMulti"), "click", function (evt) {
            let classBreaksReander = new ClassBreaksRenderer({
                field: "objectid",
                defaultSymbol: new SimpleFillSymbol({
                    color: [51, 51, 204, 0.9],
                    outline: {
                        color: "white",
                        width: 1
                    }
                })
            });
            let classes = $("#classBreaks option:selected")[0].value;
            let part = Math.ceil(18 / classes);
            for (let i = 0; i < classes; i++) {
                classBreaksReander.addClassBreakInfo({
                    minValue: i == 0 ? 0 : 0.1 + i * part,
                    maxValue: 0 + (i + 1) * part,
                    symbol: new SimpleFillSymbol({
                        color: [255 * Math.random(), 255 * Math.random(), 255 * Math.random(), 0.8],
                        outline: {
                            color: "white",
                            width: 1
                        }
                    })
                });
            }
            classBreaksReander.visualVariables = [
                {
                    type: "opacity",
                    field: "shape_leng",
                    stops: [
                        { value: 10, opacity: 0.15 },
                        { value: 20, opacity: 0.40 },
                        { value: 30, opacity: 0.80 }
                    ]
                },
                {
                    type: "color",
                    field: "shape_leng",
                    stops: [
                        { value: 10, color: [255 * Math.random(), 255 * Math.random(), 255 * Math.random(), 0.8] },
                        { value: 20, color: [255 * Math.random(), 255 * Math.random(), 255 * Math.random(), 0.8]},
                        { value: 30, color: [255 * Math.random(), 255 * Math.random(), 255 * Math.random(), 0.8] }
                    ]
                }
            ];


            cityLayer.renderer = classBreaksReander;
        });

        // 分级渲染
        on(dom.byId("btnClass"), "click", function (evt) {
            let classBreaksReander = new ClassBreaksRenderer({
                field: "objectid",
                defaultSymbol: new SimpleFillSymbol({
                    color: [51, 51, 204, 0.9],
                    outline: {
                        color: "white",
                        width: 1
                    }
                })
            });
            let classes = $("#classBreaks option:selected")[0].value;
            let part = Math.ceil(18 / classes);
            for (let i = 0; i < classes; i++) {
                classBreaksReander.addClassBreakInfo({
                    minValue: i == 0 ? 0 : 0.1 + i * part,
                    maxValue: 0 + (i + 1) * part,
                    symbol: new SimpleFillSymbol({
                        color: [255 * Math.random(), 255 * Math.random(), 255 * Math.random(), 0.8],
                        outline: {
                            color: "white",
                            width: 1
                        }
                    })
                });
            }
            // legend = new Legend({
            //     view: view
            // });
            cityLayer.renderer = classBreaksReander;
        });

        // 唯一值渲染
        on(dom.byId("btnUnique"), "click", function (evt) {
            let uniqueValueRender = new UniqueValueRenderer({
                field: "gb",
                defaultSymbol: new SimpleFillSymbol({
                    color: [51, 51, 204, 0.9],
                    outline: {
                        color: "white",
                        width: 1
                    }
                })
            });
            for (let i = 0; i < 10; i++) {
                uniqueValueRender.addUniqueValueInfo((620000 + i * 100).toString(), new SimpleFillSymbol({
                    color: [255 * Math.random(), 255 * Math.random(), 255 * Math.random(), 0.8],
                    outline: {
                        color: "white",
                        width: 1
                    }
                }));
            }
            // legend = new Legend({
            //     view: view
            // });
            // let subLayer = cityLayer.sublayers.getItemAt(0); // 用于MapImageServer
            cityLayer.renderer = uniqueValueRender;
        })
        /**
        *  添加图层
        * 
        * @param {Map Object} map 地图对象
        * @param {string} url  MapServer地址
        */
        function _addDynamicLayer(map, url) {
            let uniqueValueRender = new UniqueValueRenderer({
                field: "gb",
                defaultSymbol: new SimpleFillSymbol({
                    // color: [255 * Math.random(), 255 * Math.random(), 255 * Math.random(), 0.8]
                    color: [51, 51, 204, 0.9],
                    outline: {
                        color: "white",
                        width: 1
                    }
                })
            });
            for (let i = 0; i < 10; i++) {
                uniqueValueRender.addUniqueValueInfo((620000 + i * 100).toString(), new SimpleFillSymbol({
                    color: [255 * Math.random(), 255 * Math.random(), 255 * Math.random(), 0.8],
                    outline: {
                        color: "white",
                        width: 1
                    }
                }));
            }
            let popupTemplate= new PopupTemplate({
                title:"{cname}",
                content:"{*}"
            });
            cityLayer = new FeatureLayer({
                url: url,
                outFields: ["*"],
                popupTemplate:popupTemplate,
                renderer: uniqueValueRender
            });
            map.add(cityLayer).then(() => {
                // 添加图例
                let legend = new Legend({
                    view: view
                });
                view.ui.add(legend, "bottom-left");
                console.log(legend);
            });

        }
    }
);