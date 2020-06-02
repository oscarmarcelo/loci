import faker from 'faker';

import {textTransform} from '../utils';



const config = {
  id: 'color-hex',
  name: 'Hex Color',
  fields: [
    {
      type: 'checkbox',
      id: 'no-number-sign',
      text: 'Hide “#” before value.'
    },
    {
      type: 'separator'
    },
    {
      type: 'heading-2',
      text: 'Text Options'
    },
    {
      type: 'text-transform',
      exclude: [
        'capitalize'
      ]
    }
  ]
};



function generator(options) {
  // Make Hex print in uppercase by default.
  const transform = options['text-transform'] === 'none' ? 'uppercase' : options['text-transform'];

  let color = faker.internet.color();

  if (['on', true].includes(options['no-number-sign'])) {
    color = color.slice(1);
  }

  return textTransform(color, transform);
}



export default {
  config,
  generator
};
