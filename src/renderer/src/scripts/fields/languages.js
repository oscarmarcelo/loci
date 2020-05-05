import {appendToSettings} from './utils';

export default value => {
  const template = document.querySelector('#languages');
  const clone = template.content.cloneNode(template);
  const control = clone.querySelector('.select__reference');

  if (value) {
    control.value = value;
  }

  appendToSettings(clone);
};
