const config = {
  id: 'iban',
  name: 'IBAN',
  fields: [
    {
      type: 'languages'
    },
    {
      type: 'checkbox',
      id: 'formatted',
      text: 'Formatted IBAN'
    }
  ]
};



function generator(options) {
  // if (options.language) {
  //   window.faker.locale = options.language;
  // }

  // let result = window.faker.name.firstName(options.gender);

  // if (options.textTransform) {
  //   // TODO:
  // }

  // return result;
}



export default {
  config,
  generator
};
