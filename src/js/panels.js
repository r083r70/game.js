
export class FloatingPanel {
    constructor() {
        this.element = d3.create('div');
        this.element.attr("id", "floating-panel");
    }

    show() { d3.select("body").append(() => this.element.node()); }
    hide() { this.element.remove(); }

    setPosition(position) {
        this.element.style("left", position.x + "px");
        this.element.style("top", position.y + "px");
    }

    setText(text) { this.element.text(text); }
    setHtml(html) { this.element.html(html); }
} 
