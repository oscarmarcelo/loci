import {appendToSettings} from './utils';

export default text => {
  const template = document.querySelector('#heading-1');
  const clone = template.content.cloneNode(template);

  clone.querySelector('.heading-1').textContent = text;

  appendToSettings(clone);
};
