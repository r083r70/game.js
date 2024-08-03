
export class Province {
    constructor(index, properties, reg_index, neighbors) {
        this.index = index;
        this.name = properties.prov_name.toString();
        this.acronym = properties.prov_acr.toString();
        this.neighbors = neighbors;
        this.region_index = reg_index;
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
