import escapeHtml from "../../utils/escape-html.js";
import fetchJson from "../../utils/fetch-json.js";
import ImageUploader from "../../utils/image-uploader.js";

const BACKEND_URL = 'https://course-js.javascript.ru';

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
    images: []
  };        

  constructor (formData = {}) {    
    this.formData = {...this.defaultFormData, ...formData, statuses: [ { value: 1, text: 'Активен' }, { value: 0, text: 'Неактивен' } ]};
    this.render();
  }  

  dispatchEvent () {
    this.element.dispatchEvent(new CustomEvent("product-saved", { bubbles: true, detail: this.getFormData() }));
  }

  dispatchErrorEvent (error) {
    this.element.dispatchEvent(new CustomEvent("product-error-saved", { bubbles: true, detail: error }));
  }

  async saveToServer() {
    let url = new URL('/api/rest/products', BACKEND_URL);
    
    try {
      let response = await fetchJson(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify(this.getFormData())
      }); 

      this.dispatchEvent();
    } catch(err) {
      this.dispatchErrorEvent(err);
    }       
  }

  async getCategories () {  
    let url = new URL('/api/rest/categories', BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');
              
    return (await fetchJson(url)).reduce((subCategories, category) => {
      category.subcategories.forEach(subcCategory => {
        subCategories.push({ value: subcCategory.id, text: `${category.title} > ${subcCategory.title}`});        
      });      
  
      return subCategories;
    }, []);
  }  

  async fillSubcategories(){
    let categoryElement = this.element.querySelector('select[name="category"]');  
    let subCategories = await this.getCategories();
    subCategories.forEach(subCategory => {    
      categoryElement.append(new Option(subCategory.text, subCategory.value, false, subCategory.value && this.formData.subcategory == subCategory.value));     
    });        
  }

  getImageItem (src, alt) {
    return `
    <li class="products-edit__imagelist-item sortable-list__item">        
      <span>
        <img src="https://cdn.glitch.com/438a748f-2081-4450-8d96-d8694cf08d54%2Ficon-grab.svg?v=1587040820141" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="${alt}" src="${src}">
        <span>${alt}</span>
      </span>

      <button type="button">
        <img src="https://cdn.glitch.com/438a748f-2081-4450-8d96-d8694cf08d54%2Ficon-trash.svg?v=1587040822484" alt="delete" data-delete-handle="">
      </button>
    </li>`;
  }
  
  renderSelectControl(elementId, optionElements, selectedValue){
    let divElement = document.createElement("div");
    divElement.innerHTML = `<select class="form-control" name="${elementId}"></select>`;
    
    optionElements.forEach((item) => {      
      divElement.firstElementChild.append(new Option(item.text, item.value, false, item.value && selectedValue == item.value));
    });
    
    return divElement.firstElementChild.outerHTML;
  }

  get renderImagelistItems() {
    return this.formData.images.map(item => this.getImageItem (item.url, item.name)).join('');
  }
  
  get renderSubcategories () {  
    return this.renderSelectControl('category', [], null);       
  }  

  get renderStatues () {    
    return this.renderSelectControl('status', this.formData.statuses, this.formData.status);
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

    this.fillSubcategories(); 
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

  onSubmit = event => {
    event.preventDefault();    
    this.saveToServer();
  };

  createUploadImageInput () {
    var upLoaderElement = document.createElement("div");
    upLoaderElement.innerHTML='<input hidden name="images" type="file" accept="image/*">';
    return upLoaderElement.firstElementChild;
  }      
  
  async upLoaderChange(file) {
    let uploader = new ImageUploader();
    let result = await uploader.upload(file);

    let newImageElement = document.createElement("div");
    newImageElement.innerHTML = this.getImageItem(result.data.link, file.name);
    this.subElements.imageListContainer.append(newImageElement.firstElementChild);        
  }

  uploadImage = () => {            
    let upLoader = this.createUploadImageInput();
    upLoader.addEventListener("change", event => {
      this.upLoaderChange(event.target.files[0]);            
    });

    upLoader.click();
  };

  initEventListeners () {        
    this.subElements.productForm.addEventListener("submit", this.onSubmit);
    this.subElements.uploadImage.addEventListener("click", this.uploadImage);
    this.subElements.imageListContainer.addEventListener("click", event => "deleteHandle" in event.target.dataset && event.target.closest("li").remove());
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