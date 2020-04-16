export default class RangePicker {
  element;
  subElements = {};
  selected = {
    from: new Date(),
    to: new Date()
  };

  constructor({
    from = new Date(),
    to = new Date()} = {}
  ) { 
    this.showDateFrom = new Date(from);
    this.selected = {
      from: new Date(from.getFullYear(), from.getMonth(), from.getDate()), 
      to: new Date(to.getFullYear(), to.getMonth(), to.getDate())
    };        

    this.render();
  }

  get template () {
    return `
    <div class="container">
      <div class="rangepicker">
        <div class="rangepicker__input" data-elem="input">
          <span data-elem="from">${this._formatDate(this.selected.from)}</span> -
          <span data-elem="to">${this._formatDate(this.selected.to)}</span>
        </div>
        <div class="rangepicker__selector" data-elem="selector"></div>
      </div>
    </div>`;
  }

  _renderSelector(){
    this.subElements.selector.innerHTML = `
    <div class="rangepicker__selector-arrow"></div>
    <div class="rangepicker__selector-control-left"></div>
    <div class="rangepicker__selector-control-right"></div>    
    ${this._getPicker(this.showDateFrom)}
    ${this._getPicker(new Date(this.showDateFrom.getFullYear(), this.showDateFrom.getMonth() + 1, 1))}`;
  }

  _formatDate(date) {
    return date.toLocaleString("ru", { dateStyle:"short" });    
  }  

  _getFirsDayOfMonthDay(date){
    let firsDayOfMonthDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();     
    return firsDayOfMonthDay == 0 ? 7 : firsDayOfMonthDay;
  }

  _getMonthDayCount(date){
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  _getPickerDays(date){                 
    return ','.repeat(this._getMonthDayCount(date))
      .split(',')
      .reduce((prevValue, item, index) => {                               
        return prevValue += `<button type="button" ${ !prevValue ? `style="--start-from:${this._getFirsDayOfMonthDay(date)}"`: ''} class="rangepicker__cell" data-value="${new Date(date.getFullYear(), date.getMonth(), index).toISOString()}">${index}</button>`
      }); 
  }

  _getPicker(date){             
    return `
    <div class="rangepicker__calendar">
      <div class="rangepicker__month-indicator">
        <time datetime="${ date.toLocaleString('ru', { month: 'long' }) }">${ date.toLocaleString('ru', { month: 'long' }) }</time>
      </div>
      <div class="rangepicker__day-of-week">
        <div>Пн</div>
        <div>Вт</div>
        <div>Ср</div>
        <div>Чт</div>
        <div>Пт</div>
        <div>Сб</div>
        <div>Вс</div>
      </div>
      <div class="rangepicker__date-grid">
      ${ this._getPickerDays(date) }        
      </div>
    </div>`;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initEventListeners();
  }  

  getSubElements (element) {
    const elements = element.querySelectorAll('[data-elem]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.elem] = subElement;

      return accum;
    }, {});    
  }

  _onSelectorClick = (event) => {         
    if (event.target.classList.contains('rangepicker__selector-control-left')){
      this.showDateFrom.setMonth(this.showDateFrom.getMonth() - 1);
      this._renderSelector();
      this.renderHighlight();
    }
    
    if (event.target.classList.contains('rangepicker__selector-control-right')){
      this.showDateFrom.setMonth(this.showDateFrom.getMonth() + 1);
      this._renderSelector();
      this.renderHighlight();
    } 

    if (event.target.classList.contains('rangepicker__cell') && event.target.dataset.value){      
      const selectedDate = new Date(event.target.dataset.value);
      if (this.selected.to){
        this.selected = { from: selectedDate, to: null};
      } else if (this.selected.from) {
        if (selectedDate > this.selected.from){
          this.selected.to = selectedDate;
        } else {
          this.selected.to = this.selected.from;
          this.selected.from = selectedDate;
        }        
      }

      this.renderHighlight();

      if (this.selected.from && this.selected.to){
        this.element.dispatchEvent(new CustomEvent("date-select", { bubbles: true, detail: this.selected }))
        this.element.classList.remove("rangepicker_open");
        this.subElements.from.innerHTML = this._formatDate(this.selected.from);
        this.subElements.to.innerHTML = this._formatDate(this.selected.to);
      }    
    }    
  }

  renderHighlight() {
    for (let rangepickerCell of this.element.querySelectorAll(".rangepicker__cell")){
      rangepickerCell.classList.remove("rangepicker__selected-from");
      rangepickerCell.classList.remove("rangepicker__selected-between");
      rangepickerCell.classList.remove("rangepicker__selected-to");

      this.selected.from && rangepickerCell.dataset.value === this.selected.from.toISOString()
        ? rangepickerCell.classList.add("rangepicker__selected-from")
        : this.selected.to && rangepickerCell.dataset.value === this.selected.to.toISOString()
          ? rangepickerCell.classList.add("rangepicker__selected-to")
          : this.selected.from && 
            this.selected.to && 
            new Date(rangepickerCell.dataset.value) >= this.selected.from && 
            new Date(rangepickerCell.dataset.value) <= this.selected.to && 
            rangepickerCell.classList.add("rangepicker__selected-between");      
    }
  }
 
  _onInputClick = (event) => { 
    this.element.classList.toggle('rangepicker_open'); 
    this._renderSelector();
    this.renderHighlight();
  }

  _onDocumentClick = (event) => {            
    if (this.element.classList.contains("rangepicker_open") && 
      !this.element.contains(event.target) &&
      !event.target.classList.contains('rangepicker__selector-control-left') &&
      !event.target.classList.contains('rangepicker__selector-control-right')){
      this.element.classList.remove("rangepicker_open");
    }
  }

  initEventListeners () { 
    document.addEventListener("click", this._onDocumentClick);
    this.subElements.input.addEventListener("click", this._onInputClick);
    this.subElements.selector.addEventListener('click', this._onSelectorClick)
  }

  removeEventListeners () {
    this.element.addEventListener('click', this._onDocumentClick)
  }

  remove() {
    this.element.remove();
    this.removeEventListeners(); 
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}