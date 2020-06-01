import {appendToSettings} from './utils';

export default (field, options) => {
  const template = document.querySelector('#min-max');
  const clone = template.content.cloneNode(template);
  const minInput = clone.querySelector('[name="min"]');
  const maxInput = clone.querySelector('[name="max"]');
  const precisionInput = clone.querySelector('[name="precision"]');
  const unitsSelect = clone.querySelector('[name="unit"]');

  minInput.name = `${field.prefix}-min`;
  minInput.value = options.min;

  if (field.min?.min) {
    minInput.min = field.min.min;
  }

  if (field.min?.max) {
    minInput.max = field.min.max;
  }

  if (field.min?.step) {
    minInput.step = field.min.step;
  }

  if (field.min?.placeholder) {
    minInput.placeholder = field.min.placeholder;
  }


  maxInput.name = `${field.prefix}-max`;
  maxInput.value = options.max;

  if (field.max?.min) {
    maxInput.min = field.max.min;
  }

  if (field.max?.max) {
    maxInput.max = field.max.max;
  }

  if (field.max?.step) {
    maxInput.step = field.max.step;
  }

  if (field.max?.placeholder) {
    maxInput.placeholder = field.max.placeholder;
  }


  for (const numberInput of clone.querySelectorAll('.number-input')) {
    window.initNumberInput(numberInput);
  }

  window.pairMinMaxInputs(minInput, maxInput);


  if (field.usePrecision) {
    precisionInput.name = `${field.prefix}-precision`;

    if (options.precision) {
      precisionInput.value = options.precision;
    }
  } else {
    precisionInput.closest('.label-below').remove();
  }


  if (field.units) {
    unitsSelect.name = `${field.prefix}-unit`;

    const unitsOptions = new DocumentFragment();

    field.units.forEach(unit => {
      const option = document.createElement('option');

      option.value = unit.id;
      option.textContent = unit.name;
      if (unit.selected) {
        option.selected = true;
      }

      unitsOptions.append(option);
    });

    unitsSelect.append(unitsOptions);

    if (options.unit) {
      unitsSelect.value = options.unit;
    }
  } else {
    unitsSelect.closest('.label-below').remove();
  }


  appendToSettings(clone);
};
