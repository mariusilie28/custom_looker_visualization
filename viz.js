let googleChartsLoaded = false;

function loadGoogleCharts(callback) {
    if (typeof google === 'undefined' || typeof google.charts === 'undefined') {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://www.gstatic.com/charts/loader.js';
        script.onload = function() {
            google.charts.load('current', { packages: ["orgchart"] });
            google.charts.setOnLoadCallback(() => {
                googleChartsLoaded = true;
                callback();
            });
        };
        document.head.appendChild(script);
    } else {
        google.charts.load('current', { packages: ["orgchart"] });
        google.charts.setOnLoadCallback(() => {
            googleChartsLoaded = true;
            callback();
        });
    }
}

looker.plugins.visualizations.add({
    id: "google-org-chart",
    label: "Google Organization Chart",
    options: {},
    create: function(element, config) {
        element.innerHTML = '<div id="chart_div"></div>';
        loadGoogleCharts(() => {
            console.log("Google Charts is now loaded.");
        });
    },
    updateAsync: function(data, element, config, queryResponse, details, done) {
        var transformedData = [];
        
        if (queryResponse && queryResponse.fields && queryResponse.fields.dimensions && queryResponse.fields.dimensions.length >= 2) {
            var displayNameField = queryResponse.fields.dimensions[0].name;  // Get the first dimension name
            var managerNameField = queryResponse.fields.dimensions[1].name;  // Get the second dimension name
            var toolTipField = queryResponse.fields.dimensions[2]? queryResponse.fields.dimensions[2].name : "";  // Get the third dimension name
            console.log("queryResponse.fields.dimensions:", queryResponse.fields.dimensions);
            
            if(displayNameField && managerNameField) {
                data.forEach(row => {
                    let displayName = row[displayNameField] ? row[displayNameField].value : '';
                    let managerName = row[managerNameField] ? row[managerNameField].value : '';
                    let toolTip = row[toolTipField] ? row[toolTipField].value : '';
                    
                    transformedData.push([
                        { 'v': displayName, 'f': displayName + '<div style="color:red; font-style:italic">' + toolTip + "</div>" },
                        managerName,
                        toolTip
                    ]);
                });
            }
        } else {
            console.error("Could not access fields from queryResponse:", queryResponse);
            return;
        }
    
        function drawChart() {
            console.log("Drawing chart...");
            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn('string', 'Name');
            dataTable.addColumn('string', 'Manager');
            dataTable.addColumn('string', 'ToolTip');

            dataTable.addRows(transformedData);
    
            var chart = new google.visualization.OrgChart(document.getElementById('chart_div'));
            chart.draw(dataTable, {'allowHtml':true});
        }
    
        if (googleChartsLoaded) {
            drawChart();
        } else {
            loadGoogleCharts(drawChart);
        }
    
        done();
    }
    
});
