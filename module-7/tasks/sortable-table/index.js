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
    this.start = this.startPage * this.pageSize + 1;
    this.end = this.start + this.pageSize;
    this.needToRead = true;

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

    this.data.length > 0
      ? this.element.classList.remove("sortable-table_empty")
      : this.element.classList.add("sortable-table_empty");    

    this.subElements.body.innerHTML = this.getTableBody(this.data);
  }

  update (data) {    
    this.needToRead = data.length > 0;
    var dataElement = document.createElement("div");
    dataElement.innerHTML = this.getTableBody(this.data);
    this.subElements.body.append.apply(this.subElements.body, dataElement.childNodes);   
  }
   
  async loadData () {      
    this.url.searchParams.set('_sort', this.sorted.id);
    this.url.searchParams.set('_order', this.sorted.order);
    this.url.searchParams.set('_start', this.start);
    this.url.searchParams.set('_end', this.end);

    this.element.classList.add('sortable-table_loading');
        
    const result = await fetchJson(this.url);        
    
    this.element.classList.remove('sortable-table_loading');

    return result;
  }
  
  initEventListeners () {
    this.subElements.header.addEventListener('click', event => this.onTableHeaderClick(event));
    document.addEventListener("scroll",this.onScroll);
  }
 
  onScroll = (event) => this.onScrollFunction(event);  

  async onScrollFunction(event) {    
    if (this.inPorcess){
      return;
    }
    
    this.inPorcess = true;
                       
    if(!this.isSortLocally && 
      document.documentElement.getBoundingClientRect().bottom < (document.documentElement.clientHeight + 10) && 
       this.needToRead){      
      this.start = this.end;
      this.end = this.start + this.pageSize;      
      this.update(await this.loadData());      
    }

    this.inPorcess = false;
  }

  sortLocally () {
    this.renderRows(this.sortData())    
  }

  async sortOnServer() {        
    this.start = this.startPage * this.pageSize + 1;
    this.end = this.start + this.pageSize;     
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
    document.removeEventListener("scroll",this.onScroll);
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}

//var SortableTable=function(){function e(){var t=this,r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},a=n.url,s=void 0===a?"":a,o=n.sorted,i=void 0===o?{id:r.find(function(e){return e.sortable}).id,order:"asc"}:o,l=n.isSortLocally,d=void 0!==l&&l,c=n.step,u=void 0===c?20:c,h=n.start,v=void 0===h?1:h,m=n.end,b=void 0===m?v+u:m;_classCallCheck(this,e),_defineProperty(this,"element",void 0),_defineProperty(this,"subElements",{}),_defineProperty(this,"data",[]),_defineProperty(this,"loading",!1),_defineProperty(this,"step",20),_defineProperty(this,"start",1),_defineProperty(this,"end",this.start+this.step),

/*
_defineProperty(this,"onWindowScroll",_asyncToGenerator(regeneratorRuntime.mark(function e(){
  var r,n,a,s,o,i;
  return regeneratorRuntime.wrap(function(e){
    for(;;)
    switch(e.prev=e.next){
      case 0:
        if(r=t.element.getBoundingClientRect(),n=r.bottom,a=t.sorted,s=a.id,o=a.order,
        !(n<document.documentElement.clientHeight)||t.loading){
          e.next=11;
          break}
          return t.start=t.end,t.end=t.start+t.step,t.loading=!0,e.next=8,t.loadData(s,o,t.start,t.end);
      case 8:
        i=e.sent,
        t.update(i),
        t.loading=!1;
      case 11:
      case"end":
      return e.stop()
    }},e)}
    
    ))),_defineProperty(this,"onSortClick",function(e){var r=e.target.closest('[data-sortable="true"]');if(r){var n=r.dataset,a=n.id,s=function(e){return{asc:"desc",desc:"asc"}[e]}(n.order);t.sorted={id:a,order:s},r.dataset.order=s,r.append(t.subElements.arrow),t.isSortLocally?t.sortLocally(a,s):t.sortOnServer(a,s,1, 1 + t.step)}}),this.headersConfig=r,this.url=new URL(s,BACKEND_URL),this.sorted=i,this.isSortLocally=d,this.step=u,this.start=v,this.end=b,this.render()}return _createClass(e,[{key:"render",value:function(){var e=_asyncToGenerator(regeneratorRuntime.mark(function e(){var t,r,n,a,s,o;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return t=this.sorted,r=t.id,n=t.order,(a=document.createElement("div")).innerHTML=this.getTable(),s=a.firstElementChild,this.element=s,this.subElements=this.getSubElements(s),e.next=8,this.loadData(r,n,this.start,this.end);case 8:o=e.sent,this.renderRows(o),this.initEventListeners();case 11:case"end":return e.stop()}},e,this)}));return function(){return e.apply(this,arguments)}}()},{key:"loadData",value:function(){var e=_asyncToGenerator(regeneratorRuntime.mark(function e(t,r){var n,a,s,o=arguments;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return n=o.length>2&&void 0!==o[2]?o[2]:this.start,a=o.length>3&&void 0!==o[3]?o[3]:this.end,this.url.searchParams.set("_sort",t),this.url.searchParams.set("_order",r),this.url.searchParams.set("_start",n),this.url.searchParams.set("_end",a),this.element.classList.add("sortable-table_loading"),e.next=9,fetchJson(this.url.toString());case 9:return s=e.sent,this.element.classList.remove("sortable-table_loading"),e.abrupt("return",s);case 12:case"end":return e.stop()}},e,this)}));return function(t,r){return e.apply(this,arguments)}}()},{key:"addRows",value:function(e){this.data=e,this.subElements.body.innerHTML=this.getTableRows(e)}},{
      
      key:"update",value:function(e){
        
        

        var t,r=document.createElement("div");
        this.data=[].concat(_toConsumableArray(this.data),_toConsumableArray(e)),
        r.innerHTML=this.getTableRows(e),
        (t=this.subElements.body).append.apply(t,_toConsumableArray(r.childNodes))
      
      }},{key:"getTableHeader",value:function(){var e=this;return'<div data-element="header" class="sortable-table__header sortable-table__row">\n      '.concat(this.headersConfig.map(function(t){return e.getHeaderRow(t)}).join(""),"\n    </div>")}},{key:"getHeaderRow",value:function(e){var t=e.id,r=e.title,n=e.sortable,a=this.sorted.id===t?this.sorted.order:"asc";return'\n      <div class="sortable-table__cell" data-id="'.concat(t,'" data-sortable="').concat(n,'" data-order="').concat(a,'">\n        <span>').concat(r,"</span>\n        ").concat(this.getHeaderSortingArrow(t),"\n      </div>\n    ")}},{key:"getHeaderSortingArrow",value:function(e){return(this.sorted.id===e?this.sorted.order:"")?'<span data-element="arrow" class="sortable-table__sort-arrow">\n          <span class="sort-arrow"></span>\n        </span>':""}},{key:"getTableBody",value:function(e){return'\n      <div data-element="body" class="sortable-table__body">\n        '.concat(this.getTableRows(e),"\n      </div>")}},{key:"getTableRows",value:function(e){var t=this;return e.map(function(r){return'\n      <div class="sortable-table__row">\n        '.concat(t.getTableRow(r,e),"\n      </div>")}).join("")}},{key:"getTableRow",value:function(e){return this.headersConfig.map(function(e){return{id:e.id,template:e.template}}).map(function(t){var r=t.id,n=t.template;return n?n(e[r]):'<div class="sortable-table__cell">'.concat(e[r],"</div>")}).join("")}},{key:"getTable",value:function(){return'\n      <div class="sortable-table">\n        '.concat(this.getTableHeader(),"\n        ").concat(this.getTableBody(this.data),'\n\n        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>\n\n        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">\n          No products\n        </div>\n      </div>')}},{
  
key:"initEventListeners",value:function(){
this.subElements.header.addEventListener("pointerdown",this.onSortClick),
document.addEventListener("scroll",this.onWindowScroll)}},


{key:"sortLocally",value:function(e,t){var r=this.sortData(e,t);this.subElements.body.innerHTML=this.getTableBody(r)}},{key:"sortOnServer",value:function(){var e=_asyncToGenerator(regeneratorRuntime.mark(function e(t,r,n,a){var s;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.loadData(t,r,n,a);case 2:s=e.sent,this.renderRows(s);case 4:case"end":return e.stop()}},e,this)}));return function(t,r,n,a){return e.apply(this,arguments)}}()},{key:"renderRows",value:function(e){e.length?(this.element.classList.remove("sortable-table_empty"),this.addRows(e)):this.element.classList.add("sortable-table_empty")}},{key:"sortData",value:function(e,t){var r=_toConsumableArray(this.data),n=this.headersConfig.find(function(t){return t.id===e}),a=n.sortType,s=n.customSorting,o="asc"===t?1:-1;return r.sort(function(t,r){switch(a){case"number":return o*(t[e]-r[e]);case"string":return o*t[e].localeCompare(r[e],"ru");case"custom":return o*s(t,r);default:return o*(t[e]-r[e])}})}},{key:"getSubElements",value:function(e){var t=e.querySelectorAll("[data-element]");return _toConsumableArray(t).reduce(function(e,t){return e[t.dataset.element]=t,e},{})}},{key:"remove",value:function(){this.element.remove(),document.removeEventListener("scroll",this.onWindowScroll)}},{key:"destroy",value:function(){this.remove(),this.subElements={}}}]),e}();


*/