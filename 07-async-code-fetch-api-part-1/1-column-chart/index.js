import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50;
  subElements = {};

  data = [];

  constructor({ url = '', range = {}, label = '', link = null, value = 0, formatHeading = null } = {}) {
    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.value = value;
    this.formatHeading = formatHeading;

    this.render();
    // first initialization
    this.update(this.range.from, this.range.to);
  }

  getColumnProps() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

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

  getChartValue() {
    const sum = this.value || this.data.reduce((prev, next) => prev + next, 0);

    if (typeof this.formatHeading === 'function') {
      return this.formatHeading(sum);
    }

    return sum;
  }

  getChartColumns() {
    const columnProps = this.getColumnProps();

    return columnProps.map(({ value, percent }) => `
      <div style="--value: ${value}" data-tooltip="${percent}"></div>
    `).join('');
  }

  get template() {
    return `
      <div class="${this.getClassName()}" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.link ? this.getChartLink() : ''}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.getChartValue()}</div>
          <div data-element="body" class="column-chart__chart">
            ${this.getChartColumns()}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  toggleLoading() {
    this.element.className = this.getClassName();
  }

  async update(from, to) {
    await this.loadData(from, to);
  }

  async loadData(from = new Date(), to = new Date()) {
    const { header, body } = this.subElements;
    const searchParams = new URLSearchParams({
      from: from.toISOString(),
      to: to.toISOString(),
    });

    this.data = [];
    this.toggleLoading();

    const response = await fetchJson(`${BACKEND_URL}/${this.url}?${searchParams.toString()}`);
    this.data = Object.values(response);

    this.toggleLoading();

    header.innerHTML = this.getChartValue();
    body.innerHTML = this.getChartColumns();
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // this.element = null;
    this.subElements = {};
    this.data = [];
  }
}
