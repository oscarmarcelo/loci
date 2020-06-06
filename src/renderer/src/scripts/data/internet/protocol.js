import faker from 'faker';

import {textTransform, sanitizeValue} from '../utils';



const config = {
  id: 'protocol',
  name: 'HTTP Protocol',
  fields: [
    {
      type: 'heading-2',
      text: 'Text Options'
    },
    {
      type: 'text-transform'
    }
  ]
};



function sanitize(options) {
  // Expect a string. Default is 'none'.
  options['text-transform'] = sanitizeValue('string', options['text-transform'], 'none');

  return options;
}



function generate(options) {
  return textTransform(faker.internet.protocol(), options['text-transform']);
}



export default {
  config,
  sanitize,
  generate
};
