const config = {
  id: 'tld',
  name: 'Top-Level Domain',
  fields: [
    'languages',
    {
      type: 'checkbox',
      id: 'common-tlds',
      text: 'Only common TLDs',
      description: 'Use only "com", "net", "org", and country TLDs related to the selected languages.'
    },
    'separator',
    {
      type: 'heading-2',
      text: 'Text Options'
    },
    'text-transform'
  ]
};



function handler(options) {
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
  handler
};
