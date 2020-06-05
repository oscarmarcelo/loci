import {appendToSettings} from './utils';

export default (field, value) => {
  const template = document.querySelector('#checkbox');
  const clone = template.content.cloneNode(template);
  const control = clone.querySelector('.checkable__reference');
  const label = clone.querySelector('.checkable__label');
  const description = clone.querySelector('.checkable__description');
  const replacement = clone.querySelector('.checkable__replacement-reference');

  control.name = field.id;

  if (['on', true].includes(value)) {
    control.checked = true;
  } else if (['off', false].includes(value)) {
    control.checked = false;
  } else {
    control.checked = field.checked;
  }

  label.textContent = field.text;

  if (field.description?.length > 0) {
    description.textContent = field.description;
  } else {
    description.remove();
  }

  replacement.name = field.id;

  control.addEventListener('change', () => {
    replacement.disabled = control.checked;
  });

  appendToSettings(clone);
};
