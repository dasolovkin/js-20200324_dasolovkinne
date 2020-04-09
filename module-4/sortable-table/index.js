export default class SortableTable {
  element;
  subElements = {};
  headersConfig = [];
  data = [];

  constructor(headersConfig, {
    data = []
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;    
    
    this.render();
  }
    
  sortData(field, order) {
    let header = this.headersConfig.find(function(item){
      return item.id === field;
    });
    let direction = order == 'asc' ? 1 : -1;

    return this.data.sort(function(a, b){
      switch(header.sortType){
        case 'number':
            return direction * (a[field] - b[field]);            
          case 'string': 
            return direction * a[field].localeCompare(b[field], 'default', {caseFirst: 'upper'});                        
          default:
            return direction * (a[field] - b[field]);         
      }
    });
  }    
 
  getTableHeader() {
    let headerItemsHTML = '';
    for(let headersConfigItem of this.headersConfig){
      headerItemsHTML += `        
        <div class="sortable-table__cell" data-id="${headersConfigItem.id}" data-sortable="${headersConfigItem.sortable}">
          <span>${headersConfigItem.title}</span>         
        </div>`;
    }

    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${headerItemsHTML}        
      </div>`;
  }
 
  getTableRow(dataItem){
     let dataItemHTML = this.headersConfig.map(function(item){
      return item.template
        ? item.template(dataItem[item.id])
        : `<div class="sortable-table__cell">${dataItem[item.id]}</div>`;
    }).join(""); 

    return `<a href="/products/${dataItem.id}" class="sortable-table__row">${dataItemHTML}</a>`;    
  }

  getTableRows(data){
    return data.map(item => this.getTableRow(item)).join("");         
  }

  getTableBody(data = this.data){
    return this.getTableRows(data);
  }

  getTable() {
    return `
      <div class="sortable-table">    
        ${this.getTableHeader()}
        <div data-element="body" class="sortable-table__body">
          ${this.getTableBody()} 
        </div>               
      </div>`;
  } 

  getSubElements(paentElement){
    return [...paentElement.querySelectorAll("[data-element]")].reduce(function(previousValue, item){
      previousValue[item.dataset.element] = item;
      return previousValue;
    }, {});
  }
  
  render() {    
    const element = document.createElement('div');
    element.innerHTML = this.getTable(this.data);
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }
  
  sort (field, order) {    
    let sortData = this.sortData(field, order);   
    
    //Удаляем аттрибуты созтировки у всех заголовков
    this.element.querySelectorAll(".sortable-table__cell[data-id]").forEach(function(item){
      item.dataset.order =  "";
      let arrowElement = item.querySelector('span.sortable-table__sort-arrow');
      if (arrowElement){
        arrowElement.remove();
      }
    });

    //Добавляем аттрибуты сортировки к сортируемому заголовку
    let sortFileldElement = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);
    sortFileldElement.setAttribute('data-order', order); 
    sortFileldElement.insertAdjacentHTML('beforeend', '<span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>');
    this.subElements.body.innerHTML = this.getTableBody(sortData);
  }   
 
  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}