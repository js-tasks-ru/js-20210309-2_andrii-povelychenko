export default class SortableTable {
  subElements = {};

  constructor(header = [], { data = [] } = {}) {
    this.header = header;
    this.data = data;

    this.render();
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

  sort(field, order = 'asc') {
    const { header, body, arrow } = this.subElements;
    const column = header.querySelector(`[data-id="${field}"]`);
    const direction = order === 'asc' ? 1 : 0;
    let sortedData;

    if (column.dataset.sortable === 'false') {
      return;
    }

    if (column.dataset.type === 'string') {
      sortedData = sortByString(this.data, field, direction);
    } else {
      sortedData = sortByNumber(this.data, field, direction);
    }

    column.dataset.order = order;
    column.append(arrow);
    body.innerHTML = this.getTableRows(sortedData);
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // this.element = null;
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
