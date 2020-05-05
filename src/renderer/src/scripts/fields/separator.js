import {appendToSettings} from './utils';

export default () => {
  const template = document.querySelector('#separator');
  const clone = template.content.cloneNode(template);

  appendToSettings(clone);
};
