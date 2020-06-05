import faker from 'faker';

import {/*language, */textTransform, sanitizeValue} from '../utils';



const config = {
  id: 'iban',
  name: 'IBAN',
  fields: [
    // TODO: Limit IBANs to some countries.
    // {
    //   type: 'languages'
    // },
    {
      type: 'checkbox',
      id: 'formatted',
      text: 'Formatted IBAN'
    },
    {
      type: 'separator'
    },
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
  // Expect a boolean. Default is `false` (undefined).
  options.formatted = sanitizeValue('boolean', options.formatted);

  // Expect a string. Default is 'none'.
  options['text-transform'] = sanitizeValue('string', options['text-transform'], 'none');

  return options;
}



function generator(options) {
  // const _language = language(options.languages);

  return textTransform(faker.finance.iban(options.formatted), options['text-transform']);
}



export default {
  config,
  sanitize,
  generator
};
