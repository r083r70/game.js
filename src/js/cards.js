import { CreateAlbersProjection } from "./misc.js";

export class Card {
    constructor(parent, id, title, size) {
        this.element = parent.append("div");
        this.element.attr("id", id);
        this.element.classed("card", true);

        this.title = this.element.append("div");
        this.title.classed("card-title", true);
        this.title.style("width", size.x + "px");
        this.title.text(title);

        this.body = this.element.append("div");
        this.body.classed("card-body", true);
        this.body.style("width", size.x + "px");
        this.body.style("height", size.y + "px");
    }
}

export class MenuCard extends Card {
    constructor(parent, heigth) {
        super(parent, "menu", "menu", { x: 150, y: heigth});
        this.buttons = [];
    }

    addButton(id, text, onClick) {
        var button = this.body.append("button");
        button.attr("id", id);
        button.classed("menu-btn", true);
        button.text(text);
        button.on("click", onClick);

        this.buttons.push(button);
    }

    addSeparator() {
        this.body.append("hr");
    }
}

export class MapCard extends Card {
    constructor(parent, size, onClick) {
        super(parent, "map", "map", size);
        this.svg = this.body.append("svg");
        this.svg.on("click", onClick);

        this.projection = CreateAlbersProjection(size);
    }

    setData(data, indexToId, onMouseEnter, onMouseLeave, onClick) {
        this.svg.selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .attr("d", d3.geoPath().projection(this.projection))
            .attr("id", (_, index) => indexToId(index))
            .on("mouseenter", (event) => onMouseEnter(event))
            .on("mouseleave", (event) => onMouseLeave(event))
            .on("click", (event) => onClick(event));
    }
}

export class InfoCard extends Card {
    constructor(parent) {
        super(parent, "info", "-", { x: 300, y: 250});
    }

    setTitle(title) { this.title.text(title); }
    setText(text) { this.body.text(text); }
    setHtml(html) { this.body.html(html); }

    reset() {
        this.title.text("-");
        this.body.text("");
    }
}

export class ActionCard extends Card {
    constructor(parent) {
        super(parent, "action", "actions", { x: 300, y: 150});
        this.text = this.body.append("div");
        this.actions = this.body.append("div");
        this.buttons = [];
    }

    setText(text) { this.text.text(text); }

    addAction(id, text, onClick) {
        var button = this.actions.append("button");
        button.attr("id", id);
        button.classed("action-btn", true);
        button.text(text);
        button.on("click", onClick);

        this.buttons.push(button);
    }

    reset() {
        this.text.text("");
        this.buttons.forEach(e => e.remove());
        this.buttons = [];
    }
}
