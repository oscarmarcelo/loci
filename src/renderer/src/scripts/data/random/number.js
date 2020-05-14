import faker from 'faker';

import {language} from '../utils';



const config = {
  id: 'number',
  name: 'Number',
  fields: [
    // {
    //   type: 'heading-2',
    //   text: 'Language'
    // },
    // {
    //   type: 'languages',
    //   single: true
    // },
    // {
    //   type: 'separator'
    // },
    {
      type: 'min-max',
      precision: true
    },
    {
      type: 'separator'
    },
    {
      type: 'heading-2',
      text: 'Group Separator'
    },
    {
      type: 'button-group',
      id: 'group-separator',
      items: [
        {
          value: 'none',
          text: 'None',
          description: '',
          buttonText: '1000'
        },
        {
          value: 'space',
          text: 'Space',
          description: '',
          buttonText: '1 000'
        },
        {
          value: 'dot',
          text: 'Dot',
          description: '',
          buttonText: '1.000'
        },
        {
          value: 'comma',
          text: 'Comma',
          description: '',
          buttonText: '1,000'
        }
      ]
    },
    {
      type: 'separator'
    },
    {
      type: 'heading-2',
      text: 'Decimal Separator'
    },
    {
      type: 'button-group',
      id: 'decimal-separator',
      items: [
        {
          value: 'dot',
          text: 'Dot',
          description: '',
          buttonText: '0.12'
        },
        {
          value: 'comma',
          text: 'Comma',
          description: '',
          buttonText: '0,12'
        }
      ]
    },
    {
      type: 'checkbox',
      id: 'keep-decimal-zeros',
      text: 'Keep decimal zeros'
    }
    // TODO: Decimal Separator (locale sentient)
    // TODO: Group Separator (locale sentient)
  ]
};


// Ensure that number doesn't use dot or comma for both group-separators and the decimal-separator.
function handler() {
  const groupSeparatorInputs = document.querySelectorAll('[name="group-separator"]');
  const decimalSeparatorInputs = document.querySelectorAll('[name="decimal-separator"]');

  groupSeparatorInputs.forEach(input => {
    input.addEventListener('change', () => {
      if (['dot', 'comma'].includes(input.value)) {
        [...decimalSeparatorInputs]
          .find(decimalSeparatorInput => decimalSeparatorInput.value === (input.value === 'dot' ? 'comma' : 'dot'))
          .checked = true;
      }
    });
  });

  decimalSeparatorInputs.forEach(input => {
    input.addEventListener('change', () => {
      if (['dot', 'comma'].includes(input.value)) {
        [...groupSeparatorInputs]
          .find(groupSeparatorInput => groupSeparatorInput.value === (input.value === 'dot' ? 'comma' : 'dot'))
          .checked = true;
      }
    });
  });
}


function generator(options) {
  // TODO:
  // const _language = language(options.languages);

  // faker.locale = _language;

  // TODO: keep-decimal-zeros
  // TODO: Handle like Intl.NumberFormat

  return faker.random.number({
    min: Number(options['limit-min']) || 0,
    max: Number(options['limit-max'] || 100),
    precision: Number(options.precision) || undefined
  });
}



export default {
  config,
  handler,
  generator
};
