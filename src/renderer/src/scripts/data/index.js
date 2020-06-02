export const list = [
  {
    id: 'person',
    name: 'Person',
    items: [
      require('./name/first-name'),
      require('./name/last-name')
    ]
  },
  {
    id: 'address',
    name: 'Address',
    items: [
      require('./address/country')
    ]
  },
  {
    id: 'art-design',
    name: 'Art & Design',
    items: [
      require('./art-design/color-name'),
      require('./art-design/color-hex')
    ]
  },
  {
    id: 'finance',
    name: 'Finance',
    items: [
      require('./finance/iban')
    ]
  },
  {
    id: 'internet',
    name: 'Internet',
    items: [
      require('./internet/protocol'),
      require('./internet/tld')
    ]
  },
  {
    id: 'random',
    name: 'Random',
    items: [
      require('./random/lorem-ipsum'),
      require('./random/number')
    ]
  }
];



export function get(group, item) {
  let result = list.find(dataGroup => dataGroup.id === group);

  // TODO: Find a way to make Webpack not export all exportables inside a "default" property.
  if (item) {
    result = result.items.find(dataItem => (dataItem.default?.config.id || dataItem.config.id) === item);
  }

  return result.default || result;
}
