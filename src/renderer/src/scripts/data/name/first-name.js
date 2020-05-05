export default {
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

export function handler(options) {
  if (options.language) {
    window.faker.locale = options.language;
  }

  let result = window.faker.name.firstName(options.gender);

  if (options.textTransform) {
    // TODO:
  }

  return result;
}
