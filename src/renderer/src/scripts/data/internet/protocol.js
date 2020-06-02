import faker from 'faker';

import {textTransform} from '../utils';



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



function generator(options) {
  return textTransform(faker.internet.protocol(), options['text-transform']);
}



export default {
  config,
  generator
};
