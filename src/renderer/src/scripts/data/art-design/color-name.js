import faker from 'faker';

import {language, textTransform, sanitizeValue} from '../utils';



const config = {
  id: 'color-name',
  name: 'Color',
  fields: [
    {
      type: 'languages',
      group: 'commerce',
      item: 'color'
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
  // Expect a string. Default is 'none'.
  options['text-transform'] = sanitizeValue('string', options['text-transform'], 'none');

  return options;
}



function generate(options) {
  const _language = language(options.languages);

  faker.locale = _language;

  const color = faker.commerce.color();

  return textTransform(`${color.charAt(0).toUpperCase()}${color.slice(1)}`, options['text-transform'], _language);
}



export default {
  config,
  sanitize,
  generate
};
