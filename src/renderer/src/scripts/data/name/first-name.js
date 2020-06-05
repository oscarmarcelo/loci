import faker from 'faker';

import {language, gender, textTransform, sanitizeValue} from '../utils';



const config = {
  id: 'first-name',
  name: 'First Name',
  fields: [
    {
      type: 'languages',
      group: 'name',
      item: 'first_name'
      // TODO: We need to combine `first_name`, `male_first_name`, and `female_first_name`.
      //       `sk` language doesn't have `first_name`.
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



function sanitize(options) {
  // Expect a string. Default is 'both'.
  options.gender = sanitizeValue('string', options.gender, 'both');

  // Expect a string. Default is 'none'.
  options['text-transform'] = sanitizeValue('string', options['text-transform'], 'none');

  return options;
}



function generator(options) {
  const _language = language(options.languages);
  const _gender = gender(options.gender);

  faker.locale = _language;

  return textTransform(faker.name.firstName(_gender), options['text-transform'], _language);
}



export default {
  config,
  sanitize,
  generator
};
