import faker from 'faker';

import {language, gender, textTransform} from '../utils';



const config = {
  id: 'last-name',
  name: 'Last Name',
  fields: [
    {
      type: 'languages'
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
  // TODO: Only add gender field to languages that support it.

  faker.locale = _language;

  return textTransform(faker.name.lastName(_gender), options['text-transform'], _language);
}



export default {
  config,
  generator
};
