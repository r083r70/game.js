import { InfoCard, MapCard, MenuCard } from "./cards.js";
import { DebugLayer } from "./layers.js";
import { DecodeTopojsonData } from "./misc.js";

// Layer
var main_layer = undefined;

// Data
var provinces = [];
var regions = [];

// UI
const body = d3.select("body");
const map_size = { x: 520, y: 630 };
const menu_car = new MenuCard(body, map_size.y);
const map_card = new MapCard(body, map_size, () => main_layer.onMapClick());
const info_card = new InfoCard(body);

function loadData(data) {
    // Decode Data
    const provinces_data = topojson.feature(data, data.objects.provinces).features;
    const neighbors_data = topojson.neighbors(data.objects.provinces.geometries);
    [provinces, regions] = DecodeTopojsonData(provinces_data, neighbors_data);

    // Map
    const indexToId = (id) => ("prov-" + id);
    const idToIndex = (id) => parseInt(id.slice(5));
    
    const mouseEnter    = (event) => main_layer.onProvinceEnter(idToIndex(event.target.id));
    const mouseLeave    = (event) => main_layer.onProvinceLeave(idToIndex(event.target.id));
    const click         = (event) => {
        main_layer.onProvinceClick(idToIndex(event.target.id));
        event.stopPropagation();
    };

    map_card.setData(provinces_data, indexToId, mouseEnter, mouseLeave, click);
}

function postLoadData() {
    main_layer = new DebugLayer(provinces, regions, info_card);
}

// Main
const url = "thirdparties/geojson-italy/provinces.topo.json";
d3.json(url).then(data => {
    loadData(data);
    postLoadData();
});
