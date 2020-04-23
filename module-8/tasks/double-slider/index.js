export default class DoubleSlider {
  element;
  subElements = {};

  constructor ({
     min = 100,
     max = 200,
     formatValue = value => '$' + value,
     selected = {
       from: min,
       to: max
     }
   } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = selected;

    this.onThumbPointerMove = this.onThumbPointerMove.bind(this);
    this.onThumbPointerUp = this.onThumbPointerUp.bind(this);

    this.render();
  }

  get template () {

    return `
    <div class="range-slider">
      <span data-element="from"></span>
      <div data-element="inner" class="range-slider__inner">
        <span data-element="progress" class="range-slider__progress" style="left: 0%; right: 0%"></span>
        <span data-element="thumbLeft" class="range-slider__thumb-left" style="left: 0%"></span>
        <span data-element="thumbRight" class="range-slider__thumb-right" style="right: 0%"></span>
      </div>
      <span data-element="to"></span>
    </div>`;
  }

  update (){    
    this.subElements.progress.style.left = Math.floor((this.selected.from-this.min)/(this.max-this.min)*100)+"%";
    this.subElements.progress.style.right = Math.floor((this.max-this.selected.to)/(this.max-this.min)*100)+"%";
    this.subElements.thumbLeft.style.left = this.subElements.progress.style.left;
    this.subElements.thumbRight.style.right = this.subElements.progress.style.right;
    this.subElements.from.innerHTML = this.formatValue(this.selected.from);
    this.subElements.to.innerHTML = this.formatValue(this.selected.to);
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);

    this.initEventListeners();
    this.update();
  }

  onThumbPointerDown (event) {   
    event.preventDefault();

    var rect = event.target.getBoundingClientRect();
    event.target === this.subElements.thumbLeft 
      ? this.shiftX = rect.right - event.clientX 
      : this.shiftX = rect.left - event.clientX;

    this.dragging = event.target,
    this.element.classList.add("range-slider_dragging");

    document.addEventListener("pointermove", this.onThumbPointerMove);
    document.addEventListener("pointerup", this.onThumbPointerUp);
  }  

  getSelectedValues() {
    return {
      from: Math.round(this.min + parseFloat(this.subElements.thumbLeft.style.left) * (this.max - this.min) / 100),
      to: Math.round(this.max - parseFloat(this.subElements.thumbRight.style.right) * (this.max - this.min) / 100)
    }
  }
  
  onDraggingThumbLeft = event => {
    let rect = this.subElements.inner.getBoundingClientRect();

    let position = (event.clientX - rect.left + this.shiftX) / this.subElements.inner.offsetWidth;
    let positionPersent = position * 100;
    positionPersent < 0 && (positionPersent = 0);        

    var right = parseFloat(this.subElements.thumbRight.style.right);
    positionPersent + right > 100 && (positionPersent = 100 - right);        

    this.dragging.style.left = this.subElements.progress.style.left = positionPersent + '%';
    this.subElements.from.innerHTML = this.formatValue(this.getSelectedValues().from);
  }

  onDraggingThumbRight () {
    let rect = this.subElements.inner.getBoundingClientRect();

    let position = (rect.right - event.clientX - this.shiftX) / this.subElements.inner.offsetWidth;
    let positionPersent = position * 100;
    positionPersent < 0 && (positionPersent = 0);
    
    var left = parseFloat(this.subElements.thumbLeft.style.left);
    left + positionPersent > 100 && (positionPersent = 100 - left);

    this.dragging.style.right = this.subElements.progress.style.right = positionPersent + "%";
    this.subElements.to.innerHTML= this.formatValue(this.getSelectedValues().to);
  }

  onThumbPointerMove (event) {
    event.preventDefault();
    let rect = this.subElements.inner.getBoundingClientRect();

    this.dragging === this.subElements.thumbLeft
      ? this.onDraggingThumbLeft(event)
      : this.onDraggingThumbRight(event);
    
    this.element.dispatchEvent(new CustomEvent("range-move", { detail: this.getSelectedValues()}));
  }

  onThumbPointerUp (event) {
    this.element.classList.remove("range-slider_dragging");

    document.removeEventListener("pointermove", this.onThumbPointerMove);
    document.removeEventListener("pointerup", this.onThumbPointerUp);

    this.element.dispatchEvent(new CustomEvent("range-select", { detail: this.getSelectedValues(), bubbles: true }));
  }

  initEventListeners () {
    this.element.ondragstart = function() { return false; };

    this.subElements.thumbLeft.addEventListener("pointerdown", event => this.onThumbPointerDown(event));    
    this.subElements.thumbRight.addEventListener("pointerdown", event => this.onThumbPointerDown(event));    
  }

  getSubElements (element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove () {
    this.element.remove();
    document.removeEventListener("pointermove", this.onThumbPointerMove);
    document.removeEventListener("pointerup", this.onThumbPointerUp);
  }

  destroy() {
    this.remove();    
  }
}
