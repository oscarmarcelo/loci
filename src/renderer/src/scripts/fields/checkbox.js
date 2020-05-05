import {appendToSettings} from './utils';

export default (field, value) => {
  const template = document.querySelector('#checkbox');
  const clone = template.content.cloneNode(template);
  const control = clone.querySelector('.checkable__reference');
  const label = clone.querySelector('.checkable__label');
  const description = clone.querySelector('.checkable__description');

  control.name = field.id;
  if (value === 'on') {
    control.checked = true;
  }

  label.textContent = field.text;

  if (field.description?.length > 0) {
    description.textContent = field.description;
  } else {
    description.remove();
  }

  appendToSettings(clone);
};
