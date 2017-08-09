require(["esri/tasks/QueryTask", "esri/tasks/support/Query"], function (QueryTask, Query) {
    var citiesLayerUrl = " ... "; // Represents the REST endpoint for a layer of cities.
    var queryTask = new QueryTask({
        url: citiesLayerUrl
    });
    var query = new Query();
    query.returnGeometry = true;
    query.outFields = ["*"];
    query.where = "POP &gt; 1000000";  // Return all cities with a population greater than 1 million

    // When resolved, returns features and graphics that satisfy the query.
    queryTask.execute(query).then(function (results) {
        console.log(results.features);
    });

    // When resolved, returns a count of the features that satisfy the query.
    queryTask.executeForCount(query).then(function (results) {
        console.log(results);
    });

});