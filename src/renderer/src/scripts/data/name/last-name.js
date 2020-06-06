import faker from 'faker';

import {language, gender, textTransform, sanitizeValue} from '../utils';



const config = {
  id: 'last-name',
  name: 'Last Name',
  fields: [
    {
      type: 'languages',
      group: 'name',
      item: 'last_name'
      // TODO: We need to combine `last_name`, `male_last_name`, and `female_last_name`.
      //       `sk` language doesn't have `last_name`.
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
  const _gender = gender(options.gender);
  // TODO: Only add gender field to languages that support it.

  faker.locale = _language;

  return textTransform(faker.name.lastName(_gender), options['text-transform'], _language);
}



export default {
  config,
  sanitize,
  generate
};
