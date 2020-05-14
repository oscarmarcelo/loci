import faker from 'faker';

import {language, gender, textTransform} from '../utils';



const config = {
  id: 'first-name',
  name: 'First Name',
  fields: [
    {
      type: 'languages'
    },
    {
      type: 'gender'
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
  const _gender = gender(options.gender);

  faker.locale = _language;

  return textTransform(faker.name.firstName(_gender), options['text-transform'], _language);
}



export default {
  config,
  generator
};
