export default class NotificationMessage {
    element;

    constructor(message, {duration, type = 'success', onlyOne = true} = {}){
        this.message = message;
        this.duration = duration;
        this.type = type;
        this.onlyOne = onlyOne;                

        this.render();
    }

    get template () {
        return `
        <div class="notification ${this.type}" style="--value:${this.duration}s">
            <div class="timer"></div>
            <div class="inner-wrapper">
            <div class="notification-header">${this.type}</div>
            <div class="notification-body">${this.message}</div>
            </div>
        </div>    
        `;
    }

    show(parentElement) {            
        if (this.onlyOne) {
            //Удаляем все предыдущие
            for (let notificationElement of document.body.querySelectorAll('div.notification')){
                notificationElement.remove();
            }
        }

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