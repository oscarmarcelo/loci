import {appendToSettings} from './utils';

export default fillEdges => {
  const template = document.querySelector('#separator');
  const clone = template.content.cloneNode(template);

  if (fillEdges) {
    clone.querySelector('hr').classList.add('fill-edges');
  }

  appendToSettings(clone);
};
