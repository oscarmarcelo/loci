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
  if (options.language) {
    window.faker.locale = options.language;
  }

  let result = window.faker.name.lastName(options.gender);

  if (options.textTransform) {
    // TODO:
  }

  return result;
}
