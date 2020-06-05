import faker from 'faker';

import {language, textTransform, sanitizeValue} from '../utils';



const config = {
  id: 'country',
  name: 'Country',
  fields: [
    {
      type: 'languages',
      group: 'address',
      item: 'country'
    },
    // TODO: Support specification by continents.
    // TODO: Consider allowing only some countries.
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
  // Expect a string. Default is 'none'.
  options['text-transform'] = sanitizeValue('string', options['text-transform'], 'none');

  return options;
}



function generator(options) {
  const _language = language(options.languages);

  faker.locale = _language;

  return textTransform(faker.address.country(), options['text-transform'], _language);
}



export default {
  config,
  sanitize,
  generator
};
