export default class NotificationMessage {
  static instance = null;
  timer = null;

  constructor(message = '', { type = 'success', duration = 1000 } = {}) {
    this.message = message;
    this.type = type;
    this.duration = duration;

    this.render();
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div class="notification ${this.type}" style="--value: ${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">${this.message}</div>
        </div>
      </div>
    `;

    this.element = element.firstElementChild;
  }

  show(targetElem = document.body) {
    if (NotificationMessage.instance) {
      NotificationMessage.instance.destroy();
    }

    NotificationMessage.instance = this;
    targetElem.append(this.element);

    this.timer = setTimeout(() => this.remove(), this.duration);
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    NotificationMessage.instance = null;
  }
}
