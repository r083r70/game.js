
export function indexToId(id) { return "prov-" + id; }
export function idToIndex(id) { return parseInt(id.slice(5)); }

export class Province {
    constructor(index, properties, reg_index, neighbors) {
        this.index = index;
        this.name = properties.prov_name.toString();
        this.acronym = properties.prov_acr.toString();
        this.neighbors = neighbors;
        this.region_index = reg_index;

        this.mountain_level = 0; // 0,1,2,3
        this.is_coastal = false;
    }

    toString() { return `${this.name} [${this.acronym}]`; }
}

export class Region {
    constructor(index, name) {
        this.index = index;
        this.name = name.toString();
        this.provinces = [];
    }

    toString() { return this.name; }
}

export class Faction {
    constructor(index, name, color) {
        this.index = index;
        this.name = name.toString();
        this.color = color;
        this.provinces = [];
    }

    toString() { return this.name; }
}