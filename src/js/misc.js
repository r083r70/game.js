import { Province, Region } from "./types.js";

export function CreateAlbersProjection(size) {
    return d3.geoAlbers()
        .parallels([36.0, 48.0]) // Bottom/Top Parallels
        .rotate([-12.75, 0.0]) // Central Meridian
        .center([0.0, 41.9]) // Central Parallel
        .translate([size.x / 2, size.y / 2]) // Offset
        .scale(3350); // Scale
}

export function DecodeTopojsonData(data, neighbors) {
    var provinces = [];
    var regions = [];

    data.forEach((d, index) => {
        // Get RegionIndex and Create it if needed
        var reg_index = regions.findIndex(elem => elem.name == d.properties.reg_name);
        if (reg_index < 0) {
            reg_index = regions.length;

            const region = new Region(reg_index, d.properties.reg_name);
            regions.push(region);
        }

        // Create Province
        const province = new Province(index, d.properties, reg_index, neighbors[index]);
        provinces.push(province);

        // Add Province to Region
        regions[reg_index].provinces.push(index);
    });

    return [provinces, regions];
}
