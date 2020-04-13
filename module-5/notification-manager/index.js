import { SuccessNotificationMessage, ErrorNotificationMessage, WarningNotificationMessage, NotificationMessage } from '../notification/index.js';

export class NotificationManager{
  activeNotifications;
  notificationManagerElement;

  constructor({ stackLimit = 5 } = {}){
    this.activeNotifications = [];
    this.stackLimit = stackLimit;

    this.createContainer();   
  }

  getNotificationClass(type){
    switch(type){
      case"success":
        return SuccessNotificationMessage;
      case"error":
        return ErrorNotificationMessage;
      case"warning":
        return WarningNotificationMessage;
      default:
        return NotificationMessage;
    }
  }

  showMessage(message, {
    duration = 2000,
    type = 'success',
  } = {}){
    const notificationClass = this.getNotificationClass(type);
    let notification = new notificationClass(message, { duration, type });
    notification.show(this.notificationManagerElement);

    if (this.activeNotifications.length >= this.stackLimit) {
      this.removeOldMessage();
    }

    if (notification.type != 'error'){
      this.activeNotifications.push(notification);    
    }
  }

  removeOldMessage(){
    this.activeNotifications.shift().remove();
  }

  createContainer(){
    this.notificationManagerElement = document.createElement("div");
    this.notificationManagerElement.className="notifications-container";
    document.body.append(this.notificationManagerElement);
  }

  remove(){
    if (this.notificationManagerElement){
      this.notificationManagerElement.remove();
    }   
  }

  destroy(){
    this.remove();  
    this.activeNotifications = [];      
  }
}


