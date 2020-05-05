import {appendToSettings} from './utils';

export default text => {
  const template = document.querySelector('#heading-2');
  const clone = template.content.cloneNode(template);
  const heading = clone.querySelector('.heading-2');

  heading.textContent = text;

  appendToSettings(clone);
};
