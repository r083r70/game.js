import { indexToId } from "./types.js";

export class EmptyLayer {
    activate() { }
    deactivate() { }

    onMapClick() { }
    onProvinceEnter(index) { }
    onProvinceLeave(index) { }
    onProvinceClick(index) { }
}

export class DebugLayer {
    constructor(provinces, regions, info_card) {
        this.provinces = provinces;
        this.regions = regions;
        this.info_card = info_card;
    }

    activate() { }
    deactivate() { this.info_card.reset(); }

    onMapClick() { this.info_card.reset(); }

    onProvinceEnter(index) { this.#onProvinceHover(index, true); }
    onProvinceLeave(index) { this.#onProvinceHover(index, false); }

    onProvinceClick(index) {
        const p = this.provinces[index];
        this.info_card.setTitle(p.name);
        this.info_card.setText(p.toString() + " | " + this.regions[p.region_index].toString());
    }

    #onProvinceHover(index, value) {
        const p = this.provinces[index];

        var element = d3.select("#" + indexToId(p.index));
        element.classed("hovered", value);

        p.neighbors.forEach(neighbor => {
            var element = d3.select("#" + indexToId(neighbor));
            element.classed("highlighted", value);
        });
    }
}

export class SelectorLayer {
    constructor(provinces) {
        this.provinces = provinces;
    }

    activate() { }
    deactivate() { this.#cleanSelection(); }

    onMapClick() { this.#cleanSelection(); }

    onProvinceEnter(index) { }
    onProvinceLeave(index) { }

    onProvinceClick(index) {
        const p = this.provinces[index];

        const element = d3.select("#" + indexToId(p.index));
        const is_selected = element.classed("selected");
        element.classed("selected", !is_selected);
    }

    #cleanSelection() {
        this.provinces.forEach(p => {
            const element = d3.select("#" + indexToId(p.index));
            element.classed("selected", false);
        });
    }

    _forEachSelection(func) {
        this.provinces.forEach(p => {
            const element = d3.select("#" + indexToId(p.index));
            if (element.classed("selected")) {
                func(p);
            }
        });
    }
}

export class ProvinceToolLayer extends SelectorLayer {
    constructor(provinces, info_card, action_card) {
        super(provinces);
        this.info_card = info_card;
        this.action_card = action_card;
    }

    activate() {
        this.action_card.addAction("coastal", "coastal", () => this.#toogleCoastal());
        this.action_card.addAction("mountain-lvl", "mountain-lvl", () => this.#cycleMountainLevel());
        this.action_card.addAction("log", "log", () => this.#log());
        this.#updateClasses();
    }

    deactivate() {
        super.deactivate();
        this.info_card.reset();
        this.action_card.reset();
        this.#cleanClasses();
    }

    #toogleCoastal() {
        super._forEachSelection(p => {
            p.is_coastal = !p.is_coastal;
        });
        this.#updateClasses();
    }

    #cycleMountainLevel() {
        super._forEachSelection(p => {
            p.mountain_level += 1;
            p.mountain_level %= 4;
        });
        this.#updateClasses();
    }

    #log() {
        this.provinces.forEach(p => console.log({
            "name": p.name,
            "acronym": p.acronym,
            "mountain_level": p.mountain_level,
            "is_coastal": p.is_coastal
        }));
    }

    #updateClasses() {
        this.provinces.forEach(p => {
            const element = d3.select("#" + indexToId(p.index));
            element.classed("province-mnt-0", p.mountain_level == 0);
            element.classed("province-mnt-1", p.mountain_level == 1);
            element.classed("province-mnt-2", p.mountain_level == 2);
            element.classed("province-mnt-3", p.mountain_level == 3);
            element.classed("province-coastal", p.is_coastal);
        });
    }

    #cleanClasses() {
        this.provinces.forEach(p => {
            const element = d3.select("#" + indexToId(p.index));
            element.classed("province-mnt-0", false);
            element.classed("province-mnt-1", false);
            element.classed("province-mnt-3", false);
            element.classed("province-mnt-4", false);
            element.classed("province-coastal", false);
        });
    }
}