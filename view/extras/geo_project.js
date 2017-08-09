define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "esri/tasks/GeometryService",
    "esri/tasks/support/ProjectParameters",
    "esri/geometry/SpatialReference",
], function (declare, arrayUtil, GeometryService, ProjectParameters, SpatialReference) {
    return declare([], {
        geometryServiceUrl: null,
        wkid: null,
        geometries: null,
        // 
        geometryService: null,
        constructor: function (options) {
            this.geometryServiceUrl = options.url;
            this.wkid = options.wkid;
            this.geometries = options.geometries;
            this._init();

        },
        project: function () {
            this.geometryService.project(this.projectParameters).then((result) => {
                console.log("投影前：", this.projectParameters.geometries);
                console.log("投影后",result);
            }).then((err) => {
                if(err !== undefined){
                    console.error(err)
                }
                
            });
            // this.geometryService.project(this.projectParameters, (result)=>{
            //     console.log(result);
            // }, (err)=>{
            //     console.error(err);
            // });
        },
        _init: function () {
            this.projectParameters = new ProjectParameters();
            this.projectParameters.geometries = this.geometries;

            this.projectParameters.outSpatialReference = new SpatialReference({ wkid: this.wkid });
            this.geometryService = new GeometryService(this.geometryServiceUrl);
        }
    })
});