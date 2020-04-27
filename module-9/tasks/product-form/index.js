import escapeHtml from "../../utils/escape-html.js";
import fetchJson from "../../utils/fetch-json.js";
import ImageUploader from "../../utils/image-uploader.js";
import SortableList from "../sortable-list/Index.js";

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductFormComponent {
  element;
  subElements = {};
  defaultFormData = { 
    id: '',   
    title: '',
    description: '',
    subcategory: '',
    price: '',
    discount: '',
    quantity: '',
    status: '',
    images: []
  };        

  constructor (productId) { 
    this.productId = productId;

    this.render();
  }  

  render () {    
    const element = document.createElement('div');
    element.innerHTML = this.template;           
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);
          
    this.initEventListeners();
    this.fillForm();  
  }  

  getSubElements (element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners () {        
    this.subElements.productForm.addEventListener("submit", this.onSubmit);
    this.subElements.uploadImage.addEventListener("click", this.uploadImage);
    this.subElements.imageListContainer.addEventListener("click", event => "deleteHandle" in event.target.dataset && event.target.closest("li").remove());
  }

  async fillForm () {     
    const [categories, product, statuses] = await Promise.all([
      this.loadCategoriesList(), 
      this.productId ? await this.loadProductData(this.productId) : Promise.resolve([this.defaultFormData]), 
      this.loadStatusList()]);
        
    this.subElements.productTitle.value  = product.title;
    this.subElements.productDescription.value = product.description;
    this.subElements.productPrice.value = product.price;
    this.subElements.productDiscount.value = product.discount;
    this.subElements.productQuantity.value = product.quantity;
    
    this.fillSelecor('subcategory', categories, product.subcategory);
    this.fillSelecor('status', statuses, product.status);
   
    const sortableList = new SortableList({ 
      element: this.subElements.imageListContainer, 
      items: product ? product.images.map(item => this.getImageItem (item.url, item.source)) : [] 
    });    

    this.subElements.imageListContainer.innerHTML = sortableList.element.innerHTML; 
  }        

  async loadCategoriesList () {  
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
  
  async loadProductData (productId) {
    const productList = await fetchJson(`${BACKEND_URL}/api/rest/products?id=${productId}`);
    return productList && productList.length > 0 ? productList[0] : null;
  }

  async loadStatusList() {
    return Promise.resolve([ { value: 1, text: 'Активен' }, { value: 0, text: 'Неактивен' } ]);
  }   

  fillSelecor(name, items, selectedValue){
    let selectorElement = this.element.querySelector(`select[name="${name}"]`);     
    items.forEach(item => {    
      const isSelect = item.value && selectedValue && item.value === selectedValue;
      selectorElement.append(new Option(item.text, item.value, isSelect, isSelect));     
    });          
  }  

  onSubmit = event => {
    event.preventDefault();    
    this.saveToServer();
  };

  async saveToServer() {        
    try {
      const url = new URL('/api/rest/products', BACKEND_URL);
      const response = await fetchJson(url, {
        method: this.productId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify(this.getFormData())
      }); 

      this.dispatchEvent();
    } catch(err) {
      this.dispatchErrorEvent(err);
    }       
  } 

  getFormData () {    
    const { productForm, imageListContainer } = this.subElements;
    const excludedFields = ['images'];  
    const formatToNumber = ['price', 'quantity', 'discount', 'status']; 
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));
    let formData = {
      images: [...imageListContainer.querySelectorAll(".sortable-table__cell-img")].map(item => { return { url: item.src, source: item.alt }} )
    };

    for (const field of fields) {
      formData[field] = formatToNumber.includes(field)
        ? parseInt(productForm[field].value)
        : productForm[field].value;
    }               
    
    return formData;
  } 

  dispatchEvent () {
    this.element.dispatchEvent(new CustomEvent("product-saved", { bubbles: true, detail: this.getFormData() }));
  }

  dispatchErrorEvent (error) {
    this.element.dispatchEvent(new CustomEvent("product-error-saved", { bubbles: true, detail: error }));
  }

  getImageItem(src, alt) {
    let newImageElement = document.createElement("div");
    newImageElement.innerHTML = this.getImageItemTemplate(src, alt);
    
    return newImageElement.firstElementChild;
  }

  getImageItemTemplate (src, alt) {
    return `
    <li class="products-edit__imagelist-item sortable-list__item">        
      <span>
        <img src="https://cdn.glitch.com/438a748f-2081-4450-8d96-d8694cf08d54%2Ficon-grab.svg?v=1587040820141" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="${escapeHtml(alt)}" src="${escapeHtml(src)}">
        <span>${escapeHtml(alt)}</span>
      </span>

      <button type="button">
        <img src="https://cdn.glitch.com/438a748f-2081-4450-8d96-d8694cf08d54%2Ficon-trash.svg?v=1587040822484" alt="delete" data-delete-handle="">
      </button>
    </li>`;
  }      

  get template () {
    return `<div id="root">
    <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <input type="hidden" name="id" value="${this.productId || ''}"/>             
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required="" type="text" name="title" data-element="productTitle" class="form-control" placeholder="Название товара" value="">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          <div data-element="sortable-list-container">
            <ul data-element="imageListContainer" class="sortable-list">                       
            </ul>
          </div>
          <div data-element="fileInputList"></div>
          <button data-element="uploadImage" type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          <select class="form-control" name="subcategory"></select>        
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" type="number" name="price" data-element="productPrice" class="form-control" placeholder="100" value="">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required="" type="number" name="discount" data-element="productDiscount" class="form-control" placeholder="0" value="">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required="" type="number" class="form-control" name="quantity" data-element="productQuantity" placeholder="1" value="">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select class="form-control" name="status"></select>          
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

  createUploadImageInput () {
    var upLoaderElement = document.createElement("div");
    upLoaderElement.innerHTML='<input hidden name="images" type="file" accept="image/*">';

    return upLoaderElement.firstElementChild;
  }      
  
  async upLoaderChange(file) {    
    let uploadedFile = await new ImageUploader().upload(file);    
    this.subElements.imageListContainer.append(this.getImageItem(uploadedFile.data.link, file.name));        
  }

  uploadImage = () => {            
    let upLoader = this.createUploadImageInput();
    upLoader.addEventListener("change", event => { this.upLoaderChange(event.target.files[0]); });
    upLoader.click();
  };  

  destroy () {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

  remove () {
    this.element.remove();
  }
}