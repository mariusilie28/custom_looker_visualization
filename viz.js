looker.plugins.visualizations.add({
    id: "google-org-chart",
    label: "Google Organization Chart",
    options: {
        // You can add visualization options here if needed
    },
    create: function(element, config) {
        element.innerHTML = `
            <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
            <div id="chart_div"></div>`;
        google.charts.load('current', { packages: ["orgchart"] });
    },
    updateAsync: function(data, element, config, queryResponse, details, done) {
        // Transforms Looker data into Google Charts format
        var transformedData = [];
        data.forEach(row => {
            transformedData.push([
                { 'v': row['bamboohr_employees_displayname'].value, 'f': row['bamboohr_employees_displayname'].value },
                row['users__line_manager_name'].value,
                '' // Tooltip can be added if needed
            ]);
        });

        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {
            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn('string', 'Name');
            dataTable.addColumn('string', 'Manager');
            dataTable.addColumn('string', 'ToolTip');

            dataTable.addRows(transformedData);

            var chart = new google.visualization.OrgChart(document.getElementById('chart_div'));
            chart.draw(dataTable, { 'allowHtml': true });
        }

        done(); // This is called to finish the async event.
    }
});
