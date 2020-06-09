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
        'capitalize',
        'uppercase'
      ]
    }
  ]
};



function sanitize(options) {
  // Expect a boolean. Although default is `true`.
  options['number-sign'] = sanitizeValue('boolean', options['number-sign'], true);

  // Expect a string. Default is 'uppercase'. Also, strip 'none', since it's legacy and does nothing.
  // TODO [>=1.0.0] Remove 'none' sanitization.
  options['text-transform'] = sanitizeValue('string', options['text-transform'], ['none', 'uppercase']);

  return options;
}



function generate(options) {
  // Make Hex print in uppercase by default.
  const transform = options['text-transform'] || 'uppercase';

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
