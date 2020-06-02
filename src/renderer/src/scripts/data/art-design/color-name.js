import faker from 'faker';

import {language, textTransform} from '../utils';



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



function generator(options) {
  const _language = language(options.languages);

  faker.locale = _language;

  const color = faker.commerce.color();

  return textTransform(`${color.charAt(0).toUpperCase()}${color.slice(1)}`, options['text-transform'], _language);
}



export default {
  config,
  generator
};
