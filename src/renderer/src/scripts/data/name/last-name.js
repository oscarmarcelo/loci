import faker from 'faker';

import {language, gender, textTransform} from '../utils';

export default {
  id: 'last-name',
  name: 'Last Name',
  fields: [
    'languages',
    'separator',
    {
      type: 'heading-2',
      text: 'Text Options'
    },
    'text-transform'
  ]
};

export function handler(options) {
  const _language = language(options.languages);
  const _gender = gender(options.gender);
  // TODO: Only add gender field to languages that support it.

  faker.locale = _language;

  return textTransform(faker.name.lastName(_gender), options['text-transform'], _language);
}
