import faker from 'faker';

import {language, gender, textTransform} from '../utils';



const config = {
  id: 'first-name',
  name: 'First Name',
  fields: [
    'languages',
    'gender',
    'separator',
    {
      type: 'heading-2',
      text: 'Text Options'
    },
    'text-transform'
  ]
};



function handler(options) {
  const _language = language(options.languages);
  const _gender = gender(options.gender);

  faker.locale = _language;

  return textTransform(faker.name.firstName(_gender), options['text-transform'], _language);
}



export default {
  config,
  handler
};
