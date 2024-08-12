import { Faction, indexToId } from "./types.js";

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
        element.classed("highlighted-1", value);

        p.neighbors.forEach(neighbor => {
            var element = d3.select("#" + indexToId(neighbor));
            element.classed("highlighted-2", value);
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

export class ProvinceToolLayer {
    constructor(provinces, action_card) {
        this.provinces = provinces;
        this.action_card = action_card;
        this.mode = "none";
    }

    activate() {
        const createMode = (name) => this.action_card.addAction(name, name, () => this.#changeMode(name));
        createMode("mountain");
        createMode("coastal");
        createMode("island");
        
        this.action_card.addAction("log", "log", () => this.#log());
        this.#changeMode("none");
    }

    deactivate() {
        this.action_card.reset();
        this.#cleanAllProvinces();
    }

    onMapClick() { }
    onProvinceEnter(index) { }
    onProvinceLeave(index) { }

    onProvinceClick(index) {
        const p = this.provinces[index];
        const element = d3.select("#" + indexToId(p.index));

        switch (this.mode) {
            case "mountain":
                p.mountain_level += 1;
                p.mountain_level %= 4;
                break;
            case "coastal":
                p.is_coastal = !p.is_coastal;
                break;
            case "island":
                p.is_island = !p.is_island;
        }

        this.#updateProvince(p);
    }

    #changeMode(mode) {
        this.mode = mode;
        this.action_card.setText("mode: " + this.mode);

        this.#cleanAllProvinces();
        this.#updateAllProvinces();
    }

    #log() {
        var province_attrs = {};
        this.provinces.forEach(p => {
            province_attrs[p.acronym] = {
                "mountain_level": p.mountain_level,
                "is_coastal": p.is_coastal,
                "is_island": p.is_island
            };
        });

        console.log(province_attrs);
    }

    #updateProvince(p) {
        const element = d3.select("#" + indexToId(p.index));
        switch (this.mode) {
            case "mountain":
                element.classed("prov-mnt-0", p.mountain_level == 0);
                element.classed("prov-mnt-1", p.mountain_level == 1);
                element.classed("prov-mnt-2", p.mountain_level == 2);
                element.classed("prov-mnt-3", p.mountain_level == 3);
                break;
            case "coastal":
                element.classed("prov-coastal", p.is_coastal);
                break;
            case "island":
                element.classed("prov-island", p.is_island);
                break;
        }
    }

    #updateAllProvinces() {
        this.provinces.forEach(p => this.#updateProvince(p));
    }

    #cleanAllProvinces() {
        this.provinces.forEach(p => {
            const element = d3.select("#" + indexToId(p.index));
            element.classed("prov-mnt-0", false);
            element.classed("prov-mnt-1", false);
            element.classed("prov-mnt-2", false);
            element.classed("prov-mnt-3", false);
            element.classed("prov-coastal", false);
            element.classed("prov-island", false);
        });
    }
}

export class FactionLayer {
    constructor(provinces, action_card) {
        this.provinces = provinces;
        this.action_card = action_card;
        this.max_factions = 2;
    }

    activate() {
        this.#updateInfoText();

        this.action_card.addAction("add-faction", "add-factions", () => {
            this.max_factions++;
            this.#updateInfoText();
        });

        this.action_card.addAction("remove-factions", "remove-factions", () => {
            this.max_factions = Math.max(this.max_factions - 1, 1);
            this.#updateInfoText();
        });

        this.action_card.addAction("create-factions", "create-factions", () => this.#createFactions());
        this.action_card.addAction("reset-factions", "reset-factions", () => this.#resetFactions());
    }

    deactivate() {
        this.action_card.reset();
        this.#resetFactions();
    }

    onMapClick() { }
    onProvinceEnter(index) { }
    onProvinceLeave(index) { }
    onProvinceClick(index) { }

    #updateInfoText() {
        this.action_card.setText(this.max_factions + " faction(s)");
    }

    #createFactions() {
        this.#resetFactions();

        const factions_data = [
            { name: "faction-1", color: "red" },
            { name: "faction-2", color: "blue" },
            { name: "faction-3", color: "green" },
            { name: "faction-4", color: "white" },
            { name: "faction-5", color: "black" },
            { name: "faction-6", color: "yellow" },
            { name: "faction-7", color: "orange" },
            { name: "faction-8", color: "cyan" },
            { name: "faction-9", color: "purple" },
            { name: "faction-0", color: "pink" }
        ];

        // Compute Factions Size
        const faction_size = Math.floor(this.provinces.length / this.max_factions);
        const remainer = this.provinces.length % this.max_factions;
        var factions_size = [];
        for (var i = 0; i < this.max_factions; i++) {
            factions_size.push(faction_size);
            if (i < remainer) factions_size[i]++;
        }

        // Available Provinces
        var available_provinces = [...Array(this.provinces.length).keys()];

        // Coastal Provinces
        const coastal_provinces = this.provinces.filter(p => p.is_coastal);

        var factions_index = 0;
        while (factions_index < this.max_factions) {

            // Create Faction
            const faction_data = factions_data[factions_index % factions_data.length];
            const faction = new Faction(factions_index, faction_data.name, faction_data.color);

            // Random First
            {
                const idx = Math.floor(Math.random() * available_provinces.length);
                faction.provinces.push(available_provinces[idx]); // Add to Faction
                available_provinces.splice(idx, 1); // Remove from Available
            }

            // Fill Faction
            while (faction.provinces.length < factions_size[factions_index]) {

                // Find Neighbors
                const neighbors = new Set([]);
                faction.provinces.forEach(p => {

                    // Add Neighbors
                    const province = this.provinces[p];
                    province.neighbors.forEach(n => {
                        if (available_provinces.indexOf(n) >= 0) neighbors.add({ idx: n, value: 0 });
                    });

                    // Add Coastal Provinces
                    if (province.is_coastal) {
                        coastal_provinces.forEach(c => {
                            if (available_provinces.indexOf(c.index) >= 0) neighbors.add({ idx: c.index, value: 10 });
                        });
                    }
                });

                if (neighbors.size == 0)
                    break;

                // Evaluate Neighbors
                neighbors.forEach(n => {
                    var value = this.provinces[n.idx].neighbors.reduce((acc, p) => (available_provinces.indexOf(p) >= 0 ? acc + 1 : acc), n.value);
                    n.value = value;
                });

                // Sort Neighbors
                const neighbors_array = Array.from(neighbors);
                neighbors_array.sort((a, b) => (a.value - b.value));

                const best_candidate = neighbors_array[0];
                faction.provinces.push(best_candidate.idx); // Add to Faction

                const idx = available_provinces.indexOf(best_candidate.idx);
                available_provinces.splice(idx, 1); // Remove from Available
            }

            faction.provinces.forEach(p => {
                var element = d3.select("#" + indexToId(p));
                element.style("fill", faction.color);
            })

            factions_index++;
        }

        console.log("DONE");
    }

    #resetFactions() {
        this.provinces.forEach(p => {
            var element = d3.select("#" + indexToId(p.index));
            element.style("fill", null);
        })
    }
}