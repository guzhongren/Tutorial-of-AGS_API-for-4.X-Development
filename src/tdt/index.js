require([
    "esri/Map",
    "esri/config",
    "esri/request",
    "esri/Color",
    "esri/views/MapView",
    "esri/widgets/LayerList",
    "esri/layers/BaseTileLayer",
    "esri/layers/MapImageLayer",
    "dojo/on",
    "dojo/domReady!"
], function (
    Map, esriConfig, esriRequest, Color,
    MapView, LayerList, BaseTileLayer, MapImageLayer, on
) {

        // *******************************************************
        // Custom tile layer class code
        // Create a subclass of BaseTileLayer
        // *******************************************************
        var typeObj = {
            VEC_BASE_GCS: "vec_c",
            VEC_ANNO_GCS: "cva_c",
            VEC_ANNO_GCS_EN: "eva_c",

            VEC_BASE_WEBMERCATOR: "vec_w",
            VEC_ANNO_WEBMERCATOR: "cva_w",
            VEC_ANNO_WEBMERCATOR_EN: "eva_w",

            IMG_BASE_GCS: "img_c",
            IMG_ANNO_GCS: "cia_c",
            IMG_ANNO_GCS_EN: "eia_c",

            IMG_BASE_WEBMERCATOR: "img_w",
            IMG_ANNO_WEBMERCATOR: "cia_w",
            IMG_ANNO_WEBMERCATOR_EN: "eia_w",

            TER_BASE_GCS: "ter_c",
            TER_ANNO_GCS: "cta_c",
            // TER_ANNO_GCS_EN: "eta_c",

            TER_BASE_WEBMERCATOR: "ter_w",
            TER_ANNO_WEBMERCATOR: "cta_w"
            // TER_ANNO_WEBMERCATOR_EN: "eta_w"
        };

        var TDTLayer = BaseTileLayer.createSubclass({
            properties: {
                type: ""
            },

            // 根据level、row和colum生成切片url
            getTileUrl: function (level, row, col) {
                // return "http://t0.tianditu.com/" + this.type + "/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=" + this.type.split("_")[0] + "&STYLE=default&TILEMATRIXSET=" + this.type.split("_")[1] + "&TILEMATRIX=" + level + "&TILEROW=" + row + "&TILECOL=" + col + "&FORMAT=tiles"
                
                return "http://t0.tianditu.com/" + "vec_w" + "/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=" + "vec" + "&STYLE=default&TILEMATRIXSET=" + "w" + "&TILEMATRIX=" + level + "&TILEROW=" + row + "&TILECOL=" + col + "&FORMAT=tiles"
                //   return this.urlTemplate.replace("{z}", level).replace("{x}",
                //     col).replace("{y}", row);
            },

            // 更具特定的level和大小获取切片
            // 并且将从server端获取的数据重新组合
            fetchTile: function (level, row, col) {
                //对于给定的级别，由LayerView提供的行和列,调用getTileUrl（）方法来构建图块的URL
                var url = this.getTileUrl(level, row, col);

                // 根据生成的网址请求瓦片
                // 将allowImageDataAccess设置为true以允许
                // 跨域访问以创建面向3D的WebGL纹理。
                return esriRequest(url, {
                    responseType: "image",
                    allowImageDataAccess: true
                })
                    .then(function (response) {
                        // 解析成功后对返回的数据进行处理
                        var image = response.data;
                        var width = 256;
                        var height = 256;

                        // 创建2d的canvas
                        var canvas = document.createElement("canvas");
                        var context = canvas.getContext("2d");
                        canvas.width = width;
                        canvas.height = height;

                        // Apply the tint color provided by
                        // by the application to the canvas
                        // if (this.tint) {
                        //     // Get a CSS color string in rgba form
                        //     // representing the tint Color instance.
                        //     // context.fillStyle = this.tint.toCss();
                        //     context.fillRect(0, 0, width, height);

                        //     // Applies "difference" blending operation between canvas
                        //     // and steman tiles. Difference blending operation subtracts
                        //     // the bottom layer (canvas) from the top layer (tiles) or the
                        //     // other way round to always get a positive value.
                        //     context.globalCompositeOperation = "difference";
                        // }

                        // Draw the blended image onto the canvas.
                        context.drawImage(image, 0, 0, width, height);

                        return canvas;
                    }.bind(this));
            }
        });

        // *******************************************************
        // Start of JavaScript application
        // *******************************************************
        // 用来支持跨域的url
        // 天地图服务器列表
        // "http://t0.tianditu.com/","http://t1.tianditu.com/","http://t2.tianditu.com/","http://t3.tianditu.com/","http://t4.tianditu.com/","http://t5.tianditu.com/","http://t6.tianditu.com/","http://t7.tianditu.com/"
        esriConfig.request.corsEnabledServers.push("http://t0.tianditu.com/");//

        // 创建天地图实例
        var tdtLayer = new TDTLayer({
            // type: "vec_w"
        });

        // 将自定义的切片图层添加到地图中
        var map = new Map({
            layers: [tdtLayer]
        });

        // 创建地图视图
        var view = new MapView({
            container: "viewDiv",
            map: map,
            center: [105, 36],
            zoom: 3
        });

        // 创建图层列表微件
        var layerList = new LayerList({
            view: view,
        });
        view.ui.add(layerList, "top-right");


        on(view, "click", (evt) => {
            console.log(evt.mapPoint);
        });
        let dynamicLyer = new MapImageLayer({
            url: "https://192.168.33.44:6443/arcgis/rest/services/geocon/gs_xzqh_city/MapServer",
            id: Math.random()
        });
        map.add(dynamicLyer);
    });