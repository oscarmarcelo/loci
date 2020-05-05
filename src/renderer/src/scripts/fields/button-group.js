import {appendToSettings} from './utils';

export default (id, value) => {
  const template = document.querySelector(`#${id}`);
  const clone = template.content.cloneNode(template);
  const checkedControl = clone.querySelector(`.button-group__reference${value ? `[value="${value}"]` : ''}`);

  checkedControl.checked = true;

  window.initButtonGroup(clone);
  appendToSettings(clone);

  checkedControl.dispatchEvent(new Event('change', {
    bubbles: false,
    cancelable: true
  }));
};
