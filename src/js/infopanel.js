var infoElement = undefined;

export default class InfoPanel {
    constructor() {
        this.element = document.createElement('div');
        this.element.style.position = 'absolute';
    }
    
    update(target) {
        this.element.innerHTML = target.getAttribute("name");
    }
    
    showAt(x, y) {
        document.body.appendChild(this.element);
        this.element.style.left = x + 'px';
        this.element.style.top = y + 'px';
    }
    
    hide() {
        this.element.remove();
    }
} 
