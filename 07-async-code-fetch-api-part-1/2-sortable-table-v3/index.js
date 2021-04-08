import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element = null;
  subElements = {};

  isLoading = false;
  data = [];
  start = 0;
  step = 30;

  onHeaderClick = ({ target }) => {
    const column = target.closest('[data-id]');

    if (!column || column.dataset.sortable === 'false') {
      return;
    }

    const sortMethod = this.isSortLocally ? 'sortOnClient' : 'sortOnServer';
    const sortField = column.dataset.id;
    const sortOrder = this.sorted.order === 'asc' ? 'desc' : 'asc';

    this[sortMethod](sortField, sortOrder);
  };

  onScroll = async () => {
    const scrollHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );
    const scrollBottomPosition = Math.ceil(window.pageYOffset + document.documentElement.clientHeight);

    if (scrollBottomPosition === scrollHeight && !this.isLoading && !this.isSortLocally) {
      this.start = this.start + this.step;
      await this.loadData(this.sorted.id, this.sorted.order);
    }
  };

  constructor(headersConfig = [], {
    url = '',
    isSortLocally = false,
    sorted = {},
  } = {}) {
    this.headersConfig = headersConfig;
    this.url = url;
    this.isSortLocally = isSortLocally;
    this.sorted = {
      id: sorted.id || headersConfig.find(({ sortable }) => sortable).id,
      order: sorted.order || 'asc',
    };

    this.render();
    this.initEventListeners();
    this.initLoading();
  }

  getTableHead() {
    return this.headersConfig.map(({ id, title, sortable, sortType = '' }) => {
      return `
        <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-type="${sortType}">
          <span>${title}</span>
        </div>
      `;
    }).join('');
  }

  getTableRows(data = []) {
    return data.map((item) => {
      return `
        <a href="/products/${item.id}" class="sortable-table__row">
          ${this.getRowCells(item)}
        </a>
      `;
    }).join('');
  }

  getRowCells(item = {}) {
    return this.headersConfig.map(({ id, template }) => {
      const cellData = item[id];

      if (typeof template === 'function') {
        return template(cellData);
      }

      return `<div class="sortable-table__cell">${cellData}</div>`;
    }).join('');
  }

  get template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div data-element="table" class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.getTableHead()}
          </div>
          <div data-element="body" class="sortable-table__body">
            ${this.getTableRows(this.data)}
          </div>
          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
          </div>
        </div>
        <span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
          </span>
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

  async initLoading() {
    await this.loadData(this.sorted.id, this.sorted.order);
  }

  async loadData(id, order, { sort = false } = {}) {
    const searchParams = new URLSearchParams({
      _embed: 'subcategory.category',
      _sort: id,
      _order: order,
      _start: this.start,
      _end: this.start + this.step,
    });

    this.toggleLoading();

    const response = await fetchJson(`${BACKEND_URL}/${this.url}?${searchParams.toString()}`);
    this.data = sort ? [...response] : [...this.data, ...response];

    this.toggleLoading();
    this.toggleEmpty();
    this.updateTable(this.data, id, order);
  }

  toggleLoading() {
    const { table } = this.subElements;

    this.isLoading = !this.isLoading;
    table.classList.toggle('sortable-table_loading', this.isLoading);
  }

  toggleEmpty() {
    const { table } = this.subElements;

    table.classList.toggle('sortable-table_empty', this.data.length === 0);
  }

  updateTable(data = [], id, order) {
    const { header, body, arrow } = this.subElements;
    const column = header.querySelector(`[data-id="${id}"]`);

    column.dataset.order = order;
    column.append(arrow);
    body.innerHTML = this.getTableRows(data);
  }

  sortOnClient(id, order) {
    const { header } = this.subElements;
    const column = header.querySelector(`[data-id="${id}"]`);
    const direction = order === 'asc' ? 1 : 0;
    let sortedData;

    this.sorted = { id, order };

    if (column.dataset.type === 'string') {
      sortedData = sortByString(this.data, id, direction);
    } else {
      sortedData = sortByNumber(this.data, id, direction);
    }

    this.updateTable(sortedData, id, order);
  }

  async sortOnServer(id, order) {
    this.sorted = { id, order };

    this.start = 0; // reset pagination

    await this.loadData(id, order, { sort: true });
  }

  initEventListeners() {
    const { header } = this.subElements;

    header.addEventListener('pointerdown', this.onHeaderClick);
    window.addEventListener('scroll', this.onScroll);
  }

  removeEventListeners() {
    const { header } = this.subElements;

    header.removeEventListener('pointerdown', this.onHeaderClick);
    window.removeEventListener('scroll', this.onScroll);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
    // this.element = null;
    // this.subElements = {};
  }
}

function sortByString(arr = [], field, direction = 1) {
  return [...arr].sort((a, b) => {
    const [prevItem, nextItem] = direction ? [a[field], b[field]] : [b[field], a[field]];

    return prevItem.localeCompare(nextItem, ['ru', 'en'], {
      caseFirst: 'upper',
    });
  });
}

function sortByNumber(arr = [], field, direction = 1) {
  return [...arr].sort((a, b) => direction ? a[field] - b[field] : b[field] - a[field]);
}
