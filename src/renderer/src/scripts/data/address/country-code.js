import faker from 'faker';

import {textTransform} from '../utils';



const config = {
  id: 'country-code',
  name: 'Country Code',
  fields: [
    // TODO: Support specification by continents.
    // TODO: Consider allowing only some countries.
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
  return textTransform(faker.address.countryCode(), options['text-transform']);
}



export default {
  config,
  generator
};
