export default [
  {
    id: 'person',
    name: 'Person',
    items: [
      require('./name/first-name'),
      require('./name/last-name')
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
      require('./internet/tld')
    ]
  }
];
