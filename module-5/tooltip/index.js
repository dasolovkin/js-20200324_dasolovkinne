class Tooltip {
  static instance;

  element;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  initEventListeners () {    
    document.addEventListener('mouseover', this.onMouseoverFunction);
    document.addEventListener('mouseout', this.onMouseoutFunction);
    document.addEventListener('mousemove', this.onMousemoveFunction);
  }

  removeEventListeners () {    
    document.removeEventListener('mouseover', this.onMouseoverFunction);
    document.removeEventListener('mouseout', this.onMouseoutFunction);  
    document.removeEventListener('mousemove', this.onMousemoveFunction);
  }

  onMouseover (event) {    
    let tooltipHtml = event.target.dataset.tooltip;
    if (tooltipHtml) {
      this.render(event.x, event.y + 5, tooltipHtml);
    }            
  }

  onMousemove = function(e) {
    if (this.element) {
      this.element.style.top  = event.y + 5 + 'px';
      this.element.style.left = event.x + 'px';
    }
  }

  onMouseout = function(e) {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  };

  initialize () {
    this.onMouseoverFunction = event => this.onMouseover(event);
    this.onMouseoutFunction = event => this.onMouseout(event);
    this.onMousemoveFunction = event => this.onMousemove(event);
    this.initEventListeners();
  }

  render (top, left, tooltipHtml) {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = tooltipHtml;
    this.element.style.top  = top + 'px';
    this.element.style.left = left + 'px';
    document.body.append(this.element);  
  }

  destroy () {
    this.onMouseout();
    this.removeEventListeners();   
  }
}

const tooltip = new Tooltip();

export default tooltip;
