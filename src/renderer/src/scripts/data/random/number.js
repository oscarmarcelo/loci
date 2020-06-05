import {/*language, */sanitizeValue} from '../utils';



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



function sanitize(options) {
  // Expect a number. Default is 0.
  options['limit-min'] = sanitizeValue('number', options['limit-min'], 0);

  // Expect a number. Default is 100.
  options['limit-max'] = sanitizeValue('number', options['limit-max'], 100);

  // TODO: Find a way to handle min > max, since the token-popover can be closed without letting the inputs validate themselves.

  // Expect an integer between 0 and 20. Default is 0.
  // Negative numbers are also excluded. Numbers above 20 are clamped.
  options['limit-precision'] = sanitizeValue('number', options['limit-precision'], 0, value => {
    value = Math.min(Math.floor(value), 20);
    return value > 0 ? value : undefined;
  });

  // Expect a boolean. Default is `false` (undefined).
  options['keep-decimal-zeros'] = sanitizeValue('boolean', options['keep-decimal-zeros']);

  // Expect a string. Default is `none`.
  options['group-separator'] = sanitizeValue('string', options['group-separator'], 'none');

  // Expect a string. Default is `dot`.
  options['decimal-separator'] = sanitizeValue('string', options['decimal-separator'], 'dot');

  return options;
}



function generator(options) {
  options = Object.assign({
    'limit-min': 0,
    'limit-max': 100,
    'limit-precision': 0,
    'group-separator': 'none',
    'decimal-separator': 'dot'
  }, options);

  // TODO:
  // const _language = language(options.languages);

  // faker.locale = _language;

  const separators = {
    none: '',
    space: ' ',
    dot: '.',
    comma: ','
  };

  return new Intl.NumberFormat('en', {
    minimumFractionDigits: options['keep-decimal-zeros'] ? options['limit-precision'] : 0,
    maximumFractionDigits: options['limit-precision']
  })
    .formatToParts((Math.random() * (options['limit-max'] - options['limit-min'])) + options['limit-min']) // TODO: `Math.random()` doesn't produce enough fraction digits (should be up to 20).
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
  sanitize,
  generator
};
