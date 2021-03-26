export default class ColumnChart {
  constructor({ label = '', link = null, value = 0, data = [] } = {}) {
    this._chartHeight = 50;

    this.label = label;
    this.link = link;
    this.value = value;
    this.data = data;

    this.render();
  }

  get chartHeight() {
    return this._chartHeight;
  }

  _getColumnProps() {
    const maxValue = Math.max(...this.data);
    const scale = this._chartHeight / maxValue;

    return this.data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  getClassName() {
    return this.data.length === 0 ? 'column-chart column-chart_loading' : 'column-chart';
  }

  getChartLink() {
    return `<a href="${this.link}" class="column-chart__link">View all</a>`;
  }

  getChartColumns() {
    const columnProps = this._getColumnProps();

    return columnProps.map(({ value, percent }) => `
      <div style="--value: ${value}" data-tooltip="${percent}"></div>
    `).join('');
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div class="${this.getClassName()}" style="--chart-height: ${this._chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.link ? this.getChartLink() : ''}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.value}</div>
          <div data-element="body" class="column-chart__chart">
            ${this.getChartColumns()}
          </div>
        </div>
      </div>
    `;

    this.element = element.firstElementChild;
  }

  update(data = []) {
    const bodyEl = this.element.querySelector('[data-element="body"]');

    this.data = data;
    this.element.className = this.getClassName();
    bodyEl.innerHTML = this.getChartColumns();
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
