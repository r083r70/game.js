import InfoPanel from "./infopanel.js" ;

var infoPanel = new InfoPanel();

const width = 520, height = 630;
const svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", (event) => {
        infoPanel.hide();
    });

const url = "thirdparties/geojson-italy/provinces.topo.json";
d3.json(url).then(data => {
    const albers = d3.geoAlbers()
        .parallels([36.0, 48.0]) // Bottom/Top Parallels
        .rotate([-12.75, 0.0]) // Central Meridian
        .center([0.0, 41.9]) // Central Parallel
        .translate([width / 2, height / 2]) // Offset
        .scale(3350); // Scale

    const geojson = topojson.feature(data, data.objects.provinces);
    svg.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", d3.geoPath().projection(albers))
        .attr("name", (d) => d.properties.prov_name)
        .on("click", (event) => {
            const windowX = event.clientX + window.scrollX;
            const windowY = event.clientY + window.scrollY;

            infoPanel.update(event.target);
            infoPanel.showAt(windowX, windowY);

            event.stopPropagation();
        });
});
