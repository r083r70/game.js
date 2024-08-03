
export class DebugLayer {
    constructor(provinces, regions, info_card) {
        this.provinces = provinces;
        this.regions = regions;
        this.info_card = info_card;
    }

    onMapClick() {
        this.info_card.reset();
    }

    onProvinceEnter(index) {
        this.#onProvinceHover(index, true);
    }

    onProvinceLeave(index) {
        this.#onProvinceHover(index, false);
    }

    onProvinceClick(index) {
        const p = this.provinces[index];
        this.info_card.setTitle(p.name);
        this.info_card.setText(p.toString() + " | " + this.regions[p.region_index].toString());
    }

    #onProvinceHover(index, value) {
        const p = this.provinces[index];
        const indexToId = (id) => ("#prov-" + id);

        var element = d3.select(indexToId(p.index));
        element.classed("hovered", value);

        p.neighbors.forEach(neighbor => {
            var element = d3.select(indexToId(neighbor));
            element.classed("hovered_neighbor", value);
        });
    }
}
