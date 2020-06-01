// import {language} from '../utils';



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
      prefix: 'limit',
      usePrecision: true
    },
    {
      type: 'checkbox',
      id: 'keep-decimal-zeros',
      text: 'Keep decimal zeros'
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
        // REVIEW: It seems that there are other separators, and in some locales, even in fractions.
        //         If so, we might need to switch from a button-group to a select because of space availability.
        //         We should also check if/how Intl.NumberFormat handles this.
        //         See: https://en.wikipedia.org/wiki/Decimal_separator#Digit_grouping
        {
          value: 'none',
          text: 'None',
          description: 'Don\'t use group separators.',
          buttonText: '1000'
        },
        {
          value: 'space',
          text: 'Space',
          description: 'Use a space as group separator.',
          buttonText: '1 000'
        },
        {
          value: 'dot',
          text: 'Dot',
          description: 'Use a dot as group separator.',
          buttonText: '1.000'
        },
        {
          value: 'comma',
          text: 'Comma',
          description: 'Use a comma as group separator.',
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
        // REVIEW: It seems that there are other separators.
        //         We should also check if/how Intl.NumberFormat handles this.
        //         See: https://en.wikipedia.org/wiki/Decimal_separator
        {
          value: 'dot',
          text: 'Dot',
          description: 'Use a dot as decimal separator.',
          buttonText: '0.12'
        },
        {
          value: 'comma',
          text: 'Comma',
          description: 'Use a comma as decimal separator.',
          buttonText: '0,12'
        }
      ]
    }
    // TODO: Decimal Separator (locale sentient)
    // TODO: Group Separator (locale sentient)
  ]
};


// Ensure that number doesn't use dot or comma for both `group-separator` and the `decimal-separator`.
function handler() {
  const groupSeparatorInputs = document.querySelectorAll('[name="group-separator"]');
  const decimalSeparatorInputs = document.querySelectorAll('[name="decimal-separator"]');

  groupSeparatorInputs.forEach(input => {
    input.addEventListener('change', () => {
      if (['dot', 'comma'].includes(input.value)) {
        const checkbox = [...decimalSeparatorInputs]
          .find(decimalSeparatorInput => decimalSeparatorInput.value === (input.value === 'dot' ? 'comma' : 'dot'));

        checkbox.checked = true;

        checkbox.dispatchEvent(new Event('change', {
          cancelable: true
        }));
      }
    });
  });

  decimalSeparatorInputs.forEach(input => {
    input.addEventListener('change', () => {
      const checkedGroupSeparator = [...groupSeparatorInputs]
        .find(groupSeparatorInput => groupSeparatorInput.checked === true);

      if (checkedGroupSeparator.value === input.value) {
        const checkbox = [...groupSeparatorInputs]
          .find(groupSeparatorInput => groupSeparatorInput.value === (input.value === 'dot' ? 'comma' : 'dot'));

        checkbox.checked = true;

        checkbox.dispatchEvent(new Event('change', {
          cancelable: true
        }));
      }
    });
  });
}


function generator(options) {
  // TODO:
  // const _language = language(options.languages);

  // faker.locale = _language;

  const min = Number(options['limit-min']) || 0;
  const max = Number(options['limit-max']) || 100;
  const precision = options['limit-precision'] && Number(options['limit-precision']) >= 0 ? Math.min(Number(options['limit-precision']), 20) : 0; // TODO: Number range validation should be in a `validation()`.
  const keepDecimalZeros = options['keep-decimal-zeros'] ? precision : 0;
  const separators = {
    none: '',
    space: ' ',
    dot: '.',
    comma: ','
  };

  return new Intl.NumberFormat('en', {
    minimumFractionDigits: keepDecimalZeros,
    maximumFractionDigits: precision
  })
    .formatToParts((Math.random() * (max - min)) + min) // TODO: `Math.random()` doesn't produce enough fraction digits (should be up to 20).
    .map(({type, value}) => {
      switch (type) {
        case 'group':
          return separators[options['group-separator']];

        case 'decimal':
          return separators[options['decimal-separator']];

        default:
          return value;
      }
    })
    .reduce((string, part) => string + part);
}



export default {
  config,
  handler,
  generator
};
