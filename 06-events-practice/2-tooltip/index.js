class Tooltip {
  offset = 15;

  show = ({ target: { dataset: { tooltip } }, clientX, clientY }) => {
    if (!tooltip) {
      return;
    }

    this.render(tooltip);
    this.setCoords(clientX, clientY);
  };

  hide = ({ target: { dataset: { tooltip } } }) => {
    if (!tooltip) {
      return;
    }

    this.remove();
  };

  onMove = ({ target: { dataset: { tooltip } }, clientX, clientY }) => {
    if (!tooltip) {
      return;
    }

    this.setCoords(clientX, clientY);
  };

  initialize() {
    document.addEventListener('pointerover', this.show);
    document.addEventListener('pointerout', this.hide);
    document.addEventListener('pointermove', this.onMove);
  }

  render(tooltipMessage) {
    const element = document.createElement('div');

    element.innerHTML = `<div class="tooltip">${tooltipMessage}</div>`;

    this.element = element.firstElementChild;
    document.body.append(this.element);
  }

  setCoords(x, y) {
    this.element.style.left = `${x + this.offset}px`;
    this.element.style.top = `${y + this.offset}px`;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;

    document.removeEventListener('pointerover', this.show);
    document.removeEventListener('pointerout', this.hide);
    document.removeEventListener('pointermove', this.onMove);
  }
}

const tooltip = new Tooltip();

export default tooltip;
