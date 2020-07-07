import faker from 'faker';

import {textTransform, sanitizeValue} from '../utils';



const config = {
  id: 'lorem-ipsum',
  name: 'Lorem Ipsum',
  fields: [
    {
      type: 'min-max',
      prefix: 'amount',
      min: {
        min: 1,
        step: 1,
        placeholder: 1
      },
      max: {
        min: 1,
        step: 1,
        placeholder: 10
      },
      units: [
        {
          id: 'word',
          name: 'Words',
          selected: true
        },
        {
          id: 'sentence',
          name: 'Sentences'
        },
        {
          id: 'paragraph',
          name: 'Paragraphs'
        }
      ]
    },
    {
      type: 'heading-2',
      text: 'Words per Sentence'
    },
    {
      type: 'min-max',
      prefix: 'word',
      min: {
        min: 1,
        step: 1,
        placeholder: 3
      },
      max: {
        min: 1,
        step: 1,
        placeholder: 15
      }
    },
    {
      type: 'heading-2',
      text: 'Sentence Separator'
    },
    {
      type: 'button-group',
      id: 'sentence-separator',
      items: [
        {
          value: 'space',
          text: 'Space',
          description: 'Use a space between sentences.',
          buttonText: '⌴' // TODO: Use an icon instead. This character isn't really beautiful.
        },
        {
          value: 'line-break',
          text: 'Line break',
          description: 'Use a line break between sentences.',
          buttonText: '⇧⏎'
        },
        {
          value: 'paragraph',
          text: 'Paragraph',
          description: 'Use a paragrah between sentences.',
          buttonText: '⏎'
        }
      ]
    },
    {
      type: 'heading-2',
      text: 'Sentences per Paragraph'
    },
    {
      type: 'min-max',
      prefix: 'sentence',
      min: {
        min: 1,
        step: 1,
        placeholder: 1
      },
      max: {
        min: 1,
        step: 1,
        placeholder: 5
      }
    },
    {
      type: 'separator'
    },
    {
      type: 'heading-2',
      text: 'Text Options'
    },
    {
      type: 'text-transform'
    }
  ]
};



function handle() {
  const amountUnit = document.querySelector('[name="amount-unit"]');

  const wordsPerSentenceInputs = document.querySelectorAll('[name^="word-"]');
  const wordsPerSentenceComboField = wordsPerSentenceInputs[0].closest('.combo-field');
  const wordsPerSentenceLabel = wordsPerSentenceComboField.previousElementSibling;

  const sentenceSeparatorButtons = document.querySelectorAll('[name="sentence-separator"]');
  const sentenceSeparatorButtonGroup = sentenceSeparatorButtons[0].closest('.button-group');
  const sentenceSeparatorLabel = sentenceSeparatorButtonGroup.previousElementSibling;

  const sentencesPerParagraphInputs = document.querySelectorAll('[name^="sentence-"]:not([name="sentence-separator"])');
  const sentencesPerParagraphComboField = sentencesPerParagraphInputs[0].closest('.combo-field');
  const sentencesPerParagraphLabel = sentencesPerParagraphComboField.previousElementSibling;


  const toggleConditionalFields = () => {
    // Hide "Words per Sentence" when amount unit is 'word';
    [...wordsPerSentenceInputs].forEach(input => {
      input.disabled = amountUnit.value === 'word';
    });

    wordsPerSentenceComboField.style.display = amountUnit.value === 'word' ? 'none' : '';
    wordsPerSentenceLabel.style.display = amountUnit.value === 'word' ? 'none' : '';

    // Only show "Sentence Separator" when amount unit is 'sentence';
    [...sentenceSeparatorButtons].forEach(input => {
      input.disabled = amountUnit.value !== 'sentence';
    });

    sentenceSeparatorButtonGroup.style.display = amountUnit.value === 'sentence' ? '' : 'none';
    sentenceSeparatorLabel.style.display = amountUnit.value === 'sentence' ? '' : 'none';

    // Only show "Sentences per Paragraph" when amount unit is 'paragraph';
    [...sentencesPerParagraphInputs].forEach(input => {
      input.disabled = amountUnit.value !== 'paragraph';
    });

    sentencesPerParagraphComboField.style.display = amountUnit.value === 'paragraph' ? '' : 'none';
    sentencesPerParagraphLabel.style.display = amountUnit.value === 'paragraph' ? '' : 'none';
  };


  toggleConditionalFields();
  // We don't need to update popover height here since it will be done at the
  // end of `renderTokenSettings()`, which will happen after calling `handle()`.

  amountUnit.addEventListener('change', () => {
    toggleConditionalFields();

    // TODO: Safari 13.1+ supports ResizeObserver. Use it when available.
    window.updatePopoverHeight();
  });
}



function sanitize(options) {
  const amountConfig = config.fields.find(field => field.prefix === 'amount');
  const wordConfig = config.fields.find(field => field.prefix === 'word');
  const sentenceConfig = config.fields.find(field => field.prefix === 'sentence');

  // Expect a number. Default is 1.
  options['amount-min'] = sanitizeValue('number', options['amount-min'], amountConfig.min.placeholder, {
    roundingMethod: 'floor',
    min: amountConfig.min.min
  });

  // Expect a number. Default is 10.
  options['amount-max'] = sanitizeValue('number', options['amount-max'], amountConfig.max.placeholder, {
    roundingMethod: 'floor',
    min: amountConfig.max.min
  });

  // Expect a string. Default is 'word'.
  options['amount-unit'] = sanitizeValue('string', options['amount-unit'], amountConfig.units.find(unit => unit.selected).id);

  // Expect a number. Default is 3.
  options['word-min'] = sanitizeValue('number', options['word-min'], wordConfig.min.placeholder, {
    roundingMethod: 'floor',
    min: wordConfig.min.min
  });

  // Expect a number. Default is 15.
  options['word-max'] = sanitizeValue('number', options['word-max'], wordConfig.max.placeholder, {
    roundingMethod: 'floor',
    min: wordConfig.max.min
  });

  // Expect a string. Default is 'space'.
  options['sentence-separator'] = sanitizeValue('string', options['sentence-separator'], 'space'); // TODO: Implement selected options in button-group and get default from there instead of hardcoding value.

  // Expect a number. Default is 1.
  options['sentence-min'] = sanitizeValue('number', options['sentence-min'], sentenceConfig.min.placeholder, {
    roundingMethod: 'floor',
    min: sentenceConfig.min.min
  });

  // Expect a number. Default is 5.
  options['sentence-max'] = sanitizeValue('number', options['sentence-max'], sentenceConfig.max.placeholder, {
    roundingMethod: 'floor',
    min: sentenceConfig.max.min
  });

  // Expect a string. Default is 'none'.
  options['text-transform'] = sanitizeValue('string', options['text-transform'], 'none');

  return options;
}



function generate(options) {
  const amountConfig = config.fields.find(field => field.prefix === 'amount');
  const wordConfig = config.fields.find(field => field.prefix === 'word');
  const sentenceConfig = config.fields.find(field => field.prefix === 'sentence');

  options = Object.assign({
    'amount-min': amountConfig.min.placeholder,
    'amount-max': amountConfig.max.placeholder,
    'amount-unit': amountConfig.units.find(unit => unit.selected).id,
    'word-min': wordConfig.min.placeholder,
    'word-max': wordConfig.max.placeholder,
    'sentence-separator': 'space', // TODO: Implement selected options in button-group and get default from there instead of hardcoding value.
    'sentence-min': sentenceConfig.min.placeholder,
    'sentence-max': sentenceConfig.max.placeholder
  }, options);

  let sentenceSeparator;

  switch (options['sentence-separator']) {
    case 'line-break':
      sentenceSeparator = '\u2028';
      break;

    case 'paragraph':
      sentenceSeparator = '\u2029';
      break;

    default:
      sentenceSeparator = ' ';
      break;
  }

  let amount = (Math.random() * (options['amount-max'] - options['amount-min'])) + options['amount-min'];
  let result;

  if (options['amount-unit'] === 'word') {
    result = faker.lorem.words(amount);
    result = `${result.charAt(0).toUpperCase()}${result.slice(1)}`;
  } else if (options['amount-unit'] === 'sentence') {
    result = [];

    for (amount; amount > 0; amount--) {
      const wordAmount = (Math.random() * (options['word-max'] - options['word-min'])) + options['word-min'];
      result.push(faker.lorem.sentence(wordAmount));
    }

    result = result.join(sentenceSeparator);
  } else if (options['amount-unit'] === 'paragraph') {
    result = [];

    for (amount; amount > 0; amount--) {
      const paragrah = [];

      let sentenceAmount = (Math.random() * (options['sentence-max'] - options['sentence-min'])) + options['sentence-min'];

      for (sentenceAmount; sentenceAmount > 0; sentenceAmount--) {
        const wordAmount = (Math.random() * (options['word-max'] - options['word-min'])) + options['word-min'];
        paragrah.push(faker.lorem.sentence(wordAmount));
      }

      result.push(paragrah.join(' '));
    }

    result = result.join('\u2029');
  }

  return textTransform(result, options['text-transform']);
}



export default {
  config,
  handle,
  sanitize,
  generate
};
