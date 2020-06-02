import faker from 'faker';

import {language, textTransform} from '../utils';



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



function generator(options) {
  const _language = language(options.languages);

  faker.locale = _language;

  return textTransform(faker.address.country(), options['text-transform'], _language);
}



export default {
  config,
  generator
};
