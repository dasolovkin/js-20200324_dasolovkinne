import escapeHtml from "../../utils/escape-html.js";

export default class ProductFormComponent {
  element;
  subElements = {};
  defaultFormData = {
    title: '',
    description: '',
    subcategory: '',
    price: '',
    discount: '',
    quantity: '',
    status: '',
    images: [],
    categories: []
  };  
  
  constructor (formData = {}) {
    this.formData = {...this.defaultFormData, ...formData, statuses: [ { value: 1, text: 'Активен' }, { value: 0, text: 'Неактивен' } ]};
    this.render();
  }

  getImageItem (src, alt) {
    return `
    <li class="products-edit__imagelist-item sortable-list__item">        
      <span>
        <img src="https://cdn.glitch.com/438a748f-2081-4450-8d96-d8694cf08d54%2Ficon-grab.svg?v=1587040820141" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="${alt}" src="${src}">
        <span>foo.jpg</span>
      </span>

      <button type="button">
        <img src="https://cdn.glitch.com/438a748f-2081-4450-8d96-d8694cf08d54%2Ficon-trash.svg?v=1587040822484" alt="delete" data-delete-handle="">
      </button>
    </li>`;
  }
  
  get renderImagelistItems() {
    return this.formData.images.map(item => this.getImageItem (item.url, item.name)).join('');
  }
  
  get renderSubcategories () {    
    var divElement = document.createElement("div");
    divElement.innerHTML = '<select class="form-control" name="category"></select>';
    var categoryElement = divElement.firstElementChild;
    
    this.formData.categories.forEach((item) => {
      let option = document.createElement('option');
      option.setAttribute('value', item.value);
      option.text = item.text;
      if (item.value && this.formData.subcategory == item.value){
        option.setAttribute('selected', 'selected');
      }
      categoryElement.append(option);
    });
    
    return categoryElement.outerHTML;
  }

  get renderStatues () {    
    var divElement = document.createElement("div");
    divElement.innerHTML = '<select class="form-control" name="status"></select>';
    var statusesElement = divElement.firstElementChild;
    
    this.formData.statuses.forEach((item) => {
      let option = document.createElement('option');
      option.setAttribute('value', item.value);
      option.text = item.text;
      if (item.value && this.formData.subcategory == item.value){
        option.setAttribute('selected', 'selected');
      }
      statusesElement.append(option);
    });
    
    return statusesElement.outerHTML;
  }

  get template () {
    return `<div id="root">
    <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required="" type="text" name="title" class="form-control" placeholder="Название товара" value="${this.formData.title}">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара">${this.formData.description}</textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          <div data-element="sortable-list-container">
            <ul data-element="imageListContainer" class="sortable-list">
              ${this.renderImagelistItems}              
            </ul>
          </div>
          <div data-element="fileInputList"></div>
          <button data-element="uploadImage" type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          ${this.renderSubcategories}
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" type="number" name="price" class="form-control" placeholder="100" value="${this.formData.price}">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required="" type="number" name="discount" class="form-control" placeholder="0" value="${this.formData.discount}">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required="" type="number" class="form-control" name="quantity" placeholder="1" value="${this.formData.quantity}">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          ${ this.renderStatues }
        </div>
        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            Сохранить товар
          </button>
        </div>
      </form>
    </div>
  </div>`;
  }

  render () {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);

    this.initEventListeners();
  }

  getSubElements (element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }
  
  getFormData () {    
    let productForm = this.subElements.productForm;
    let formData = Object.keys(this.defaultFormData).reduce(function(result, item){
      result[item] = productForm[item] && productForm[item].value;
      return result;
    }, {});
    
    formData.images = [...document.querySelectorAll(".sortable-table__cell-img")].map(item => { return { url: item.src, source: item.alt }} );
    
    return formData;
  }
  
  dispatchEvent () {
    this.element.dispatchEvent(new CustomEvent("product-saved", { bubbles: true, detail: this.getFormData() }));
  }

  onSubmit = event => {
    event.preventDefault();
    this.dispatchEvent();
  };

  createUploadImageInput () {
    var e = document.createElement("div");
    e.innerHTML='<input hidden name="images" type="file" accept="image/*">';
    return e.firstElementChild;
  }    

  uploadImage = () => {            
    let upLoader = this.createUploadImageInput();
    upLoader.addEventListener("change", event => {
      var file = event.target.files[0];
  
      let fileReader = new FileReader;
      fileReader.onload = event => {
        let newImageElement = document.createElement("div");
        newImageElement.innerHTML = this.getImageItem(event.target.result, file.name);
        this.subElements.imageListContainer.append(newImageElement.firstElementChild);
      };      
      
      fileReader.readAsDataURL(file);
      this.subElements.fileInputList.append(upLoader);
    });

    upLoader.click();
  };

  initEventListeners () {        
    this.subElements.productForm.addEventListener("submit", this.onSubmit);
    this.subElements.uploadImage.addEventListener("click", this.uploadImage);
    this.subElements.imageListContainer.addEventListener("click", function(event) {
      "deleteHandle" in event.target.dataset && event.target.closest("li").remove();
    });
  }

  destroy () {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

  remove () {
    this.element.remove();
  }
}