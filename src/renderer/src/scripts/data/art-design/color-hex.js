import faker from 'faker';

import {textTransform, sanitizeValue} from '../utils';



const config = {
  id: 'color-hex',
  name: 'Hex Color',
  fields: [
    {
      type: 'checkbox',
      id: 'number-sign',
      text: 'Show “#” before value.',
      checked: true
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



function sanitize(options) {
  // Expect a boolean. Although default is `true`.
  options['number-sign'] = sanitizeValue('boolean', options['number-sign'], true);

  // Expect a string. Default is 'none'.
  options['text-transform'] = sanitizeValue('string', options['text-transform'], 'none');

  return options;
}



function generate(options) {
  // Make Hex print in uppercase by default.
  const transform = options['text-transform'] === 'none' ? 'uppercase' : options['text-transform'];

  let color = faker.internet.color();

  if (['off', false].includes(options['number-sign'])) {
    color = color.slice(1);
  }

  return textTransform(color, transform);
}



export default {
  config,
  sanitize,
  generate
};
