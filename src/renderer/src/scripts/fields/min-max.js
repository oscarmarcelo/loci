import {appendToSettings} from './utils';

export default (min, max, usePrecision, precision) => {
  const template = document.querySelector('#min-max');
  const clone = template.content.cloneNode(template);
  const minInput = clone.querySelector('[name="limit-min"]');
  const maxInput = clone.querySelector('[name="limit-max"]');
  const precisionInput = clone.querySelector('[name="precision"]');

  minInput.value = min;
  maxInput.value = max;

  if (usePrecision) {
    if (precision) {
      precisionInput.value = precision;
    }
  } else {
    precisionInput.remove();
  }

  for (const numberInput of clone.querySelectorAll('.number-input')) {
    window.initNumberInput(numberInput);
  }

  window.pairMinMaxInputs(minInput, maxInput);

  appendToSettings(clone);
};
