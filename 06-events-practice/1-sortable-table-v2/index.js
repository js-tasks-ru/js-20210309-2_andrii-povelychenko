export default class SortableTable {
  subElements = {};

  constructor(header = [], { data = [], sortField = '', sortOrder = 'asc' } = {}) {
    this.header = header;
    this.data = data;
    this.sortField = sortField;
    this.sortOrder = sortOrder;

    this.sortByClick = this.sortByClick.bind(this);

    this.render();
    this.initEventListeners();
    this.sortByDefault();
  }

  getTableHead() {
    return this.header.map(({ id, title, sortable, sortType = '' }) => {
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
    const columns = this.header;

    return columns.map(({ id, template }) => {
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
        <div class="sortable-table ${!this.data.length ? 'sortable-table_empty' : ''}">
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

  sortByDefault() {
    const firstSortableColumn = this.header.find(({ sortable }) => sortable);
    const sortField = this.sortField || (firstSortableColumn && firstSortableColumn.id);

    if (!sortField) {
      return;
    }

    this.sort(sortField, this.sortOrder);
  }

  sortByClick({ target }) {
    const column = target.closest('[data-id]');

    if (!column) {
      return;
    }

    const sortField = column.dataset.id;
    const sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';

    this.sort(sortField, sortOrder);
  }

  sort(field, order = 'asc') {
    const { header, body, arrow } = this.subElements;
    const column = header.querySelector(`[data-id="${field}"]`);
    const direction = order === 'asc' ? 1 : 0;
    let sortedData;

    if (column.dataset.sortable === 'false') {
      return;
    }

    this.sortField = field;
    this.sortOrder = order;

    if (column.dataset.type === 'string') {
      sortedData = sortByString(this.data, field, direction);
    } else {
      sortedData = sortByNumber(this.data, field, direction);
    }

    column.dataset.order = order;
    column.append(arrow);
    body.innerHTML = this.getTableRows(sortedData);
  }

  initEventListeners() {
    const { header } = this.subElements;

    header.addEventListener('pointerdown', this.sortByClick);
  }

  removeEventListeners() {
    const { header } = this.subElements;

    header.removeEventListener('pointerdown', this.sortByClick);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    // this.removeEventListeners();
    this.remove();
    this.subElements = {};
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
