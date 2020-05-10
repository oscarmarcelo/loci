/*
 * ========================================================
 * Data Editor Input
 * ========================================================
 */

const tokenBoxSelect = document.querySelector('.token-box__select');
const tokenBoxSelectOptions = new DocumentFragment();

for (const group of window.data) {
  const optgroup = document.createElement('optgroup');
  optgroup.setAttribute('label', group.name);

  group.items.forEach(item => {
    const option = document.createElement('option');

    option.textContent = item.name;
    option.value = item.id;
    option.dataset.group = group.id;

    optgroup.append(option);
  });

  tokenBoxSelectOptions.append(optgroup);
}

tokenBoxSelect.append(tokenBoxSelectOptions);
tokenBoxSelect.selectedIndex = -1;


// TODO [>=1.0.0]: Using temporary native select. Use data-popover instead.

// const dataEditorInput = document.querySelector('.data-editor-input');



// dataEditorInput.addEventListener('input', () => {
//   window.postMessage('data-suggestion', {
//     value: dataEditorInput.value,
//     anchorBounds: dataEditorInput.getBoundingClientRect()
//   });
// });



// dataEditorInput.addEventListener('keydown', event => {
//   if (event.key === 'Enter') {
//     window.postMessage('close-data-suggestions', null);
//   } else if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
//     event.preventDefault();
//     window.postMessage('navigate-data-suggestions', event.key);
//   }
// });



function updateTokenConfig(id, config) {
  const token = document.querySelector(`#${id}`);

  if (token) {
    token.tokenConfig = config;

    const dataGroup = window.data.find(group => group.id === config.data.group);
    const dataItem = dataGroup.items.find(item => item.id === config.data.item);

    token.querySelector('.token__text').textContent = dataItem.name;

    if (config.gender) {
      token.classList.toggle('token--male', config.gender === 'male');
      token.classList.toggle('token--female', config.gender === 'female');
    }

    if (config['text-transform']) {
      token.style.setProperty('text-transform', config['text-transform']);
    } else {
      token.style.removeProperty('text-transform');
    }
  }
}



/*
 * ========================================================
 * Data Setting Form
 * ========================================================
 */

const dataForm = document.querySelector('.js-data-settings-form');

dataForm.addEventListener('submit', event => {
  event.preventDefault();
});



/*
 * ========================================================
 * Limit inputs
 * ========================================================
 */

const limitsMinInput = document.querySelector('.limits__min');
const limitsMaxInput = document.querySelector('.limits__max');



// Ensure that max limit is not smaller than the min limit.
limitsMinInput.addEventListener('change', () => {
  if (
    Number.isFinite(limitsMinInput.valueAsNumber) &&
    Number.isFinite(limitsMaxInput.valueAsNumber) &&
    limitsMinInput.valueAsNumber > limitsMaxInput.valueAsNumber
  ) {
    limitsMaxInput.valueAsNumber = limitsMinInput.valueAsNumber;
  }
});



// Ensure that min limit is not greater than the max limit.
limitsMaxInput.addEventListener('change', () => {
  if (
    Number.isFinite(limitsMinInput.valueAsNumber) &&
    Number.isFinite(limitsMaxInput.valueAsNumber) &&
    limitsMinInput.valueAsNumber > limitsMaxInput.valueAsNumber
  ) {
    limitsMinInput.valueAsNumber = limitsMaxInput.valueAsNumber;
  }
});



/*
 * ========================================================
 * Apply Data
 * ========================================================
 */

const applyButton = document.querySelector('.js-apply-button');

applyButton.addEventListener('click', () => {
  const tokens = document.querySelectorAll('.token-box .token');
  const formData = new FormData(dataForm);
  const dataConfig = {
    tokens: [],
    general: {}
  };


  for (const token of tokens) {
    if (token.classList.contains('token--data')) {
      dataConfig.tokens.push({
        type: 'data',
        config: token.tokenConfig
      });
    } else if (token.classList.contains('token--newline')) {
      dataConfig.tokens.push({
        type: `${token.textContent.includes('⇧') ? 'shift-' : ''}newline`
      });
    } else {
      dataConfig.tokens.push({
        type: 'text',
        text: token.textContent
      });
    }
  }


  for (const field of formData) {
    dataConfig.general[field[0]] = field[1];
  }


  window.postMessage('apply-data', dataConfig);
});
