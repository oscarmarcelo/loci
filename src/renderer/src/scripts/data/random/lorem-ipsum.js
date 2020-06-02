import faker from 'faker';

import {textTransform} from '../utils';



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
        placeholder: '1'
      },
      max: {
        min: 1,
        step: 1,
        placeholder: '10'
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
        placeholder: '3'
      },
      max: {
        min: 1,
        step: 1,
        placeholder: '15'
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
          value: 'dot',
          text: 'Space',
          description: 'Use a space between sentences.',
          buttonText: '⌴'
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
        placeholder: '1'
      },
      max: {
        min: 1,
        step: 1,
        placeholder: '5'
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


function handler() {
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
  // end of `renderTokenSettings()`, which will happen after calling `handler()`.

  amountUnit.addEventListener('change', () => {
    toggleConditionalFields();

    // TODO: Safari 13.1+ supports ResizeObserver. Use it when available.
    window.updatePopoverHeight();
  });
}



function generator(options) {
  const minAmount = Number(options['amount-min']) || 1;
  const maxAmount = Number(options['amount-max']) || 10;
  const amountUnit = options['amount-unit'] || 'word';

  const minWords = Number(options['word-min']) || 3;
  const maxWords = Number(options['word-max']) || 15;

  const minSentences = Number(options['sentence-min']) || 1;
  const maxSentences = Number(options['sentence-max']) || 5;


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

  let amount = (Math.random() * (maxAmount - minAmount)) + minAmount;
  let result;

  if (amountUnit === 'word') {
    result = faker.lorem.words(amount);
    result = `${result.charAt(0).toUpperCase()}${result.slice(1)}`;
  } else if (amountUnit === 'sentence') {
    result = [];

    for (amount; amount > 0; amount--) {
      const wordAmount = (Math.random() * (maxWords - minWords)) + minWords;
      result.push(faker.lorem.sentence(wordAmount));
    }

    result = result.join(sentenceSeparator);
  } else if (amountUnit === 'paragraph') {
    result = [];

    for (amount; amount > 0; amount--) {
      const paragrah = [];

      let sentenceAmount = (Math.random() * (maxSentences - minSentences)) + minSentences;

      for (sentenceAmount; sentenceAmount > 0; sentenceAmount--) {
        const wordAmount = (Math.random() * (maxWords - minWords)) + minWords;
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
  handler,
  generator
};
