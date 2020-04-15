import fetchJson from "../../utils/fetch-json.js";

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  startPage = 0;
  pageSize = 30;
  headersConfig = [];
  

  constructor(headersConfig = [], {
    url = '',
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = false
  } = {}) {
    this.headersConfig = headersConfig;
    this.url = new URL(url, BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;

    this.render();
  }
  
  sortData() {
    const { sortType, customSorting }  = this.headersConfig.find(item => item.id === this.sorted.id);
    let direction = this.sorted.order === 'asc' ? 1 : -1;

    return this.data.sort((a, b) => {
      switch(sortType){
        case 'number':
            return direction * (a[this.sorted.id] - b[this.sorted.id]);            
        case 'string': 
            return direction * a[this.sorted.id].localeCompare(b[this.sorted.id], 'ru');
        case 'custom':
            return direction * customSorting(a[this.sorted.id], b[this.sorted.id]);
        default:
            return direction * (a[this.sorted.id] - b[this.sorted.id]);         
      }
    });
  }    
  
  getTableHeaderRows() {
    return this.headersConfig.map(headersConfigItem => `        
        <div class="sortable-table__cell" data-id="${headersConfigItem.id}" data-sortable="${headersConfigItem.sortable}" data-order="${this.sorted.id == headersConfigItem.id ? this.sorted.order : ''}">
          <span>${headersConfigItem.title}</span> 
          <span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>
        </div>`).join('');    
  }

  getTableHeader() {    
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.getTableHeaderRows()}        
      </div>`;
  }
 
  getTableRow(dataItem){
     let dataItemHTML = this.headersConfig.map(function(item){
      return item.template
        ? item.template(dataItem[item.id])
        : `<div class="sortable-table__cell">${dataItem[item.id]}</div>`;}).join(""); 

    return `<a href="/products/${dataItem.id}" class="sortable-table__row">${dataItemHTML}</a>`;    
  }

  getTableBody(data){
    return data.map(item => this.getTableRow(item)).join("");         
  }  

  getTable(data) {
    return `
      <div class="sortable-table">    
        ${this.getTableHeader()}
        <div data-element="body" class="sortable-table__body">          
        </div>   
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>  
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">No products</div>          
      </div>`;
  } 

  getSubElements(paentElement){
    return [...paentElement.querySelectorAll("[data-element]")].reduce(function(previousValue, item){
      previousValue[item.dataset.element] = item;
      return previousValue;
    }, {});
  }
   
  async render() {        
    const element = document.createElement('div');
    element.innerHTML = this.getTable();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);    
    
    this.sortOnServer();   
    this.initEventListeners();
  }

  renderRows (data) {
    this.data = data;

    if (this.data.length > 0){
      this.element.classList.remove("sortable-table_empty");     
    } else {
      this.element.classList.add("sortable-table_empty");
    }

    this.subElements.body.innerHTML = this.getTableBody(this.data);
  }

  async loadData () {  
    this.element.classList.add('sortable-table_loading');

    const url = this.url + `?_sort=${this.sorted.id}&_order=${this.sorted.order}&_start=${this.startPage * this.pageSize}&_end=${this.pageSize}`;    
    const result = await fetchJson(url);

    this.element.classList.remove('sortable-table_loading');

    return result;
  }
  
  initEventListeners () {
    this.subElements.header.addEventListener('click', event => this.onTableHeaderClick(event))
  }
 
  sortLocally () {
    this.renderRows(this.sortData())    
  }

  async sortOnServer() {        
    this.renderRows(await this.loadData());
  }

  onTableHeaderClick(event) {
    let checkedHeaderItem = event.target.closest('div.sortable-table__cell');
    if (checkedHeaderItem && checkedHeaderItem.dataset.sortable === 'true'){
      this.sorted.id = checkedHeaderItem.dataset.id;
      this.sorted.order = checkedHeaderItem.dataset.order === 'asc' ? 'desc' : 'asc';

      for (let headerItem of this.subElements.header.querySelectorAll('div.sortable-table__cell')){
        headerItem.dataset.order = headerItem.dataset.id == this.sorted.id ? this.sorted.order : '';
      }
      
      this.isSortLocally ? this.sortLocally() : this.sortOnServer();
    }
  }      
 
  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}