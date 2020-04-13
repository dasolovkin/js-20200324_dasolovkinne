export class NotificationMessage {  
  constructor (message, {
      duration = 2000,
      type = 'success'
    } = {}) {    
    this.message = message;
    this.durationInSeconds = (duration / 1000) + 's';
    this.type = type;
    this.duration = duration;
      
    this.render();
  }    

  get template () {
    return `<div class="notification ${this.type}" style="--value:${this.durationInSeconds}">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">
          ${this.message}
        </div>
      </div>
    </div>`;
  }

  render () {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
  }

  show (parent) {
    const root = parent || document.body;
    root.append(this.element);
    
    setTimeout(() => { this.remove(); }, this.duration);

    return this.element;
  }

  remove () {
    this.element.remove();
  }

  destroy () {
    this.remove();    
  }
}

export class SuccessNotificationMessage extends NotificationMessage{
  constructor (message, { duration = 2000 } = {}) {
    super(message, { duration: duration, type: 'success' });    
  }
}

export class ErrorNotificationMessage extends NotificationMessage{
  constructor (message, { duration = 2000 } = {}) {
    super(message, { duration: duration, type: 'error' });    

    document.addEventListener('click', event => this.onCloseClick(event))
  }

  get template () {
    return `<div class="notification ${this.type}">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}<span class="close">×</span></div>
        <div class="notification-body">
          ${this.message}
        </div>
      </div>
    </div>`;
  }

  onCloseClick(event) {
    let closeItem = event.target.closest('span.close');
    if (closeItem && closeItem.closest('div.notification') == this.element){      
      this.remove();
    }
  } 

  show (parent) {
    const root = parent || document.body;
    root.append(this.element);
    
    return this.element;
  }
}

export class WarningNotificationMessage extends NotificationMessage{
  constructor (message, { duration = 2000 } = {}) {
    super(message, { duration: duration, type: 'warning' });    
  }
}

