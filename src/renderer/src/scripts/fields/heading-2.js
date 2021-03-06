import {appendToSettings} from './utils';

export default text => {
  const template = document.querySelector('#heading-2');
  const clone = template.content.cloneNode(template);

  clone.querySelector('.heading-2').textContent = text;

  appendToSettings(clone);
};
