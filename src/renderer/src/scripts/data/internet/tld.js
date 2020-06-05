import faker from 'faker';

import {language, textTransform, sanitizeValue} from '../utils';



const config = {
  id: 'tld',
  name: 'Top-Level Domain',
  fields: [
    // TODO: Faker locales isn't good enough.
    //       Also consider option to only use country TLDs.
    // {
    //   type: 'languages'
    // },
    // {
    //   type: 'checkbox',
    //   id: 'common-tlds',
    //   text: 'Only common TLDs',
    //   description: 'Use only "com", "net", "org", and country TLDs related to the selected languages.'
    // },
    // {
    //   type: 'separator'
    // },
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



function generator(options) {
  const _language = language(options.languages);

  faker.locale = _language;

  return textTransform(faker.internet.domainSuffix(), options['text-transform'], _language);
}



export default {
  config,
  sanitize,
  generator
};
