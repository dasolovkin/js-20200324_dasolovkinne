let tempNotification;

export default class NotificationMessage {
    element;

    constructor(message, {duration, type = 'success'} = {}){ 
        if (tempNotification){
            tempNotification.remove();
        }      
        this.message = message;
        this.duration = duration;
        this.type = type;                      

        this.render();
    }

    get template () {
        return `
        <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
            <div class="timer"></div>
            <div class="inner-wrapper">
            <div class="notification-header">${this.type}</div>
            <div class="notification-body">${this.message}</div>
            </div>
        </div>    
        `;
    }

    show(parentElement) {   
        tempNotification = this;

        //Добавляем новое
        (parentElement || document.body).append(this.element);

        //Добавляем удаление по таймауту
        setTimeout(() => this.remove(), this.duration);
    }

    render() {
        const element = document.createElement('div');
        element.innerHTML = this.template;
        this.element = element.firstElementChild;
    }

    remove() {
        if (this.element){
            this.element.remove();
        }
    }

    destroy() {
        this.remove();
    }
}