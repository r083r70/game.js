import { ActionCard, InfoCard, MapCard, MenuCard } from "./cards.js";
import { DebugLayer, EmptyLayer, ProvinceToolLayer, SelectorLayer } from "./layers.js";
import { DecodeTopojsonData } from "./misc.js";
import { idToIndex, indexToId } from "./types.js";

// Layer
const layers_map = { };
var main_layer = undefined;

function setLayer(layer_name) {
    main_layer?.deactivate();
    main_layer = layers_map[layer_name];
    main_layer.activate();
}

// Data
var provinces = [];
var regions = [];

// UI
const body = d3.select("body");
const map_size = { x: 520, y: 630 };
const menu_car = new MenuCard(body, map_size.y);
const map_card = new MapCard(body, map_size, () => main_layer.onMapClick());

const activity_rgn = body.append("div").attr("id", "activity-rgn");
const info_rgn = activity_rgn.append("div").attr("id", "info-rgn");
const info_card = new InfoCard(info_rgn);
const action_rgn = activity_rgn.append("div").attr("id", "action-rgn");
const action_card = new ActionCard(action_rgn);

// Process Data
function processData(data) {
    // Decode Data
    const provinces_data = topojson.feature(data, data.objects.provinces).features;
    const neighbors_data = topojson.neighbors(data.objects.provinces.geometries);
    [provinces, regions] = DecodeTopojsonData(provinces_data, neighbors_data);

    // Inputs
    const mouseEnter = (event) => main_layer.onProvinceEnter(idToIndex(event.target.id));
    const mouseLeave = (event) => main_layer.onProvinceLeave(idToIndex(event.target.id));
    const click = (event) => {
        main_layer.onProvinceClick(idToIndex(event.target.id));
        event.stopPropagation();
    };

    // Setup
    map_card.setData(provinces_data, indexToId, mouseEnter, mouseLeave, click);
}

// Layers
function initLayers() {
    const addLayerButton = (id) => menu_car.addButton(id, id, () => setLayer(id));
    
    layers_map["empty"] = new EmptyLayer();
    layers_map["hover"] = new DebugLayer(provinces, regions, info_card);
    layers_map["select"] = new SelectorLayer(provinces);
    layers_map["province-tool"] = new ProvinceToolLayer(provinces, info_card, action_card);

    
    addLayerButton("hover");
    addLayerButton("select");
    menu_car.addSeparator();
    addLayerButton("province-tool");
    
    setLayer("empty");
}

// Main
const url = "thirdparties/geojson-italy/provinces.topo.json";
d3.json(url).then(data => {
    processData(data);
    initLayers();
});
