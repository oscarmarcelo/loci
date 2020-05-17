import faker from 'faker';

// import {language} from '../utils';



const config = {
  id: 'iban',
  name: 'IBAN',
  fields: [
    // TODO: Limit IBANs to some countries.
    // {
    //   type: 'languages'
    // },
    {
      type: 'checkbox',
      id: 'formatted',
      text: 'Formatted IBAN'
    }
  ]
};



function generator(options) {
  // const _language = language(options.languages);

  return faker.finance.iban(options.formatted);
}



export default {
  config,
  generator
};
