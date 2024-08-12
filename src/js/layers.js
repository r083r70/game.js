import { Faction, indexToId } from "./types.js";

export class EmptyLayer {
    activate() { }
    deactivate() { }

    onMapClick() { }
    onProvinceEnter(index) { }
    onProvinceLeave(index) { }
    onProvinceClick(index) { }
    onProvinceDoubleClick(index) { }
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

    onProvinceDoubleClick(index) { }

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

    onProvinceDoubleClick(index) { }

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
        this.target = -1;
    }

    activate() {
        const createMode = (name) => this.action_card.addAction(name, name, () => this.#changeMode(name));
        createMode("mountain");
        createMode("coastal");
        createMode("water-neighbors");

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
            case "water-neighbors":
                if (this.target >= 0 && this.target != index) {

                    // Help Lambda
                    const toogleWaterNeighbor = (p, v) => {
                        const idx = p.water_neighbors.indexOf(v);
                        if (idx < 0) {
                            p.water_neighbors.push(v);
                        } else {
                            p.water_neighbors.splice(idx, 1);
                        }
                    };

                    toogleWaterNeighbor(p, this.target);
                    toogleWaterNeighbor(this.provinces[this.target], index);
                }
                break;
        }

        this.#updateProvince(p);
    }

    onProvinceDoubleClick(index) {
        if (this.mode == "water-neighbors") {
            this.target = index;
            this.#cleanAllProvinces();
            this.#updateAllProvinces();
        }
    }

    #changeMode(mode) {
        this.mode = mode;
        this.target = -1;

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
                "water_neighbors": p.water_neighbors
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
            case "water-neighbors":
                element.classed("highlighted-1", p.index == this.target);
                element.classed("highlighted-2", p.water_neighbors.indexOf(this.target) >= 0);
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
            element.classed("highlighted-1", false);
            element.classed("highlighted-2", false);
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
        var available_provinces = [...this.provinces.keys()];
        const removeFromAvaliables = (p) => {
            const idx = available_provinces.indexOf(p);
            available_provinces.splice(idx, 1);
        }

        var factions_index = 0;
        while (factions_index < this.max_factions) {

            // Create Faction
            const faction_data = factions_data[factions_index % factions_data.length];
            const faction = new Faction(factions_index, faction_data.name, faction_data.color);
            var has_coastal = false;

            // Neighbors
            const faction_neighbors = [];

            // Helper Lambda
            const addProvinceToFaction = (province_index) => {

                // Remove from Availables
                removeFromAvaliables(province_index);

                // Add to Faction
                faction.provinces.push(province_index);

                // Province
                const province = this.provinces[province_index];
                has_coastal |= province.is_coastal;

                // Update Neighbors
                province.neighbors.forEach(neighbor_index => {

                    // Unavailable > Ignore
                    if (available_provinces.indexOf(neighbor_index) < 0)
                        return;

                    // Find in Neighbors
                    const index = faction_neighbors.findIndex(n => (n.index == neighbor_index));

                    // Existing Neighbor > Update value
                    if (index >= 0) {
                        faction_neighbors[index].value--;
                        return;
                    }

                    // New Neighbor > Compute value
                    const value = this.provinces[neighbor_index].neighbors.reduce((acc, p) => (available_provinces.indexOf(p) >= 0 ? acc + 1 : acc), 0);
                    faction_neighbors.push({ index: neighbor_index, value: value });
                });
            }

            // Random First
            {
                const idx = Math.floor(Math.random() * available_provinces.length);
                addProvinceToFaction(available_provinces[idx]);
            }

            // Fill Faction
            while (faction.provinces.length < factions_size[factions_index]) {
                // Has Neighbors
                if (faction_neighbors.length > 0) {
                    // Sort Neighbors
                    faction_neighbors.sort((a, b) => (a.value - b.value));

                    // Select best Candidate
                    const best_candidate = faction_neighbors[0].index;
                    faction_neighbors.splice(0, 1);

                    // Add to Faction
                    addProvinceToFaction(best_candidate);
                }
                // Try Water Neighbors
                else {

                    // Collect all Water Neighbors
                    const water_neighbors = [];
                    faction.provinces.forEach(p => this.provinces[p].water_neighbors.forEach(w => {
                        if (available_provinces.indexOf(w) >= 0)
                            water_neighbors.push(w);
                    }));

                    // Has Water Neighbors > Get Random one
                    if (water_neighbors.length > 0) {
                        const idx = Math.floor(Math.random() * water_neighbors.length);
                        addProvinceToFaction(water_neighbors[idx]);
                    }
                    // No Availabilities > Fail
                    else {
                        break;
                    }
                }
            }

            faction.provinces.forEach(p => {
                var element = d3.select("#" + indexToId(p));
                element.style("fill", faction.color);
            })

            factions_index++;
        }
    }

    #resetFactions() {
        this.provinces.forEach(p => {
            var element = d3.select("#" + indexToId(p.index));
            element.style("fill", null);
        })
    }
}