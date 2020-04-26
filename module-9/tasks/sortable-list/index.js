export default class SortableList {
  element;  

  constructor({ items = [] } = {}) {
    this.items = items;

    this.render();

    this.onDocumentPointerMove = this.onDocumentPointerMove.bind(this);
    this.onDocumentPointerUp = this.onDocumentPointerUp.bind(this);
  }

  render() {   
    this.element = document.createElement("ul");
    this.element.className = "sortable-list";

    for (let item of this.items){
      item.classList.add("sortable-list__item");
      this.element.append(item);
    }
    
    this.element.addEventListener("pointerdown", this.onPointerDown);  
  }

  onPointerDown = event => {
    var dragElement = event.target.closest(".sortable-list__item");

    if(event.which !== 1 || !dragElement) return false;
    
    event.preventDefault();    
    event.target.closest("[data-grab-handle]") && this.dragStart(dragElement, event);
    event.target.closest("[data-delete-handle]") && this.removeItem(dragElement);      
  }
  
  dragStart(dragElement, event) {  
    this.draggingElem = dragElement;      
    this.elementInitialIndex = [...this.element.children].indexOf(dragElement);
    this.pointerInitialShift = {
      x: event.clientX - dragElement.getBoundingClientRect().x,
      y: event.clientY - dragElement.getBoundingClientRect().y
    };
        
    let dragElementWidth = dragElement.offsetWidth + 'px';
    let dragElementHeight = dragElement.offsetHeight + 'px';    
    
    this.placeholderElem = document.createElement("div");
    this.placeholderElem.className = "sortable-list__placeholder";
    this.placeholderElem.style.width = dragElementWidth;
    this.placeholderElem.style.height = dragElementHeight;

    dragElement.classList.add("sortable-list__item_dragging");
    dragElement.style.width = dragElementWidth;
    dragElement.style.height = dragElementHeight;  
    dragElement.style.left = event.clientX - this.pointerInitialShift.x + 'px';
    dragElement.style.top = event.clientY - this.pointerInitialShift.y + 'px';
    dragElement.after(this.placeholderElem);

    this.element.append(dragElement);    
    
    document.addEventListener("pointermove", this.onDocumentPointerMove);
    document.addEventListener("pointerup", this.onDocumentPointerUp);
  }  

  onDocumentPointerMove(event) {
    this.draggingElem.style.left = event.clientX - this.pointerInitialShift.x + 'px';
    this.draggingElem.style.top = event.clientY - this.pointerInitialShift.y + 'px';   
    
    if(event.clientY < this.element.firstElementChild.getBoundingClientRect().top)
      this.movePlaceholderAt(0);
    else if(event.clientY > this.element.lastElementChild.getBoundingClientRect().bottom)
      this.movePlaceholderAt(this.element.children.length);
    else for(var index = 0; index < this.element.children.length; index++){
      var draggingAtElem = this.element.children[index];
      var draggingAtElemRect = draggingAtElem.getBoundingClientRect();

      if(draggingAtElem !== this.draggingElem && event.clientY > draggingAtElemRect.top && event.clientY < draggingAtElemRect.bottom) { 
        this.movePlaceholderAt(event.clientY < draggingAtElemRect.top + draggingAtElem.offsetHeight / 2 ? index : index + 1);          
        break;
      }
    }

    event.clientY < 20 
      ? window.scrollBy(0, -10)
      : event.clientY > document.documentElement.clientHeight - 20 && window.scrollBy(0, 10);
  }

  movePlaceholderAt(atIndex) {
    this.element.children[atIndex] !== this.placeholderElem && this.element.insertBefore(this.placeholderElem, this.element.children[atIndex]);    
  }   

  onDocumentPointerUp() {
    var placeholderElemIndex = [...this.element.children].indexOf(this.placeholderElem);
    this.placeholderElem.replaceWith(this.draggingElem);
    this.draggingElem.classList.remove("sortable-list__item_dragging");
    this.draggingElem.style.left = '';
    this.draggingElem.style.top = '';
    this.draggingElem.style.width = '';
    this.draggingElem.style.height = '';
    this.draggingElem = null;

    document.removeEventListener("pointermove", this.onDocumentPointerMove);
    document.removeEventListener("pointerup", this.onDocumentPointerUp);
    
    placeholderElemIndex !== this.elementInitialIndex && this.dispatchEvent(placeholderElemIndex);
  }   

  dispatchEvent(toIndex) {
    this.element.dispatchEvent(new CustomEvent("sortable-list-reorder",{ bubbles: true, details: { from: this.elementInitialIndex, to: toIndex }}));
  }
}