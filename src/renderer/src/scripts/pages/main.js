/*
 * ========================================================
 * Data Editor Input
 * ========================================================
 */

const tokenBoxScroller2 = document.querySelector('.token-box__scroller'); // TODO: Improve variable management.
const tokenBoxSelect = document.querySelector('.token-box__select');
const tokenBoxSelectOptions = new DocumentFragment();
const dataForm = document.querySelector('.js-data-settings-form');

for (const group of window.loci.data.list) {
  const optgroup = document.createElement('optgroup');
  optgroup.setAttribute('label', group.name);

  group.items.forEach(({config: item}) => {
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
//   })
//     .catch(error => {
//       console.error('data-suggestion', error);
//     });
// });



// dataEditorInput.addEventListener('keydown', event => {
//   if (event.key === 'Enter') {
//     window.postMessage('close-data-suggestions', null)
//       .catch(error => {
//         console.error('close-data-suggestions', error);
//       });
//   } else if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
//     event.preventDefault();
//     window.postMessage('navigate-data-suggestions', event.key)
//       .catch(error => {
//         console.error('navigate-data-suggestions', error);
//       });
//   }
// });



function setDataConfig(dataConfig) {
  const tokens = tokenBoxScroller2.querySelectorAll('.token');

  // TODO: Use DocumentFragment.
  tokens.forEach(token => {
    token.remove();
  });

  dataConfig.tokens?.forEach(tokenConfig => {
    let name;
    let config;

    if (tokenConfig.type === 'data') {
      name = window.loci.data.get(tokenConfig.config.data.group, tokenConfig.config.data.item).config.name;
      config = tokenConfig.config;
    } else if (tokenConfig.type === 'text') {
      name = tokenConfig.text;
    }

    // TODO: Use DocumentFragment.
    createToken(tokenConfig.type, name, config);
  });

  dataForm.reset();

  Object.entries(dataConfig.general || {}).forEach(([name, value]) => {
    const field = dataForm.elements.namedItem(name);

    if (field.type === 'checkbox') {
      field.checked = Boolean(value);
    } else {
      field.value = value;
    }
  });
}


function updateTokenConfig(id, tokenConfig) {
  const token = document.querySelector(`#${id}`);

  if (token) {
    token.tokenConfig = tokenConfig;

    const {config: dataItem} = window.loci.data.get(tokenConfig.data.group, tokenConfig.data.item);

    token.querySelector('.token__text').textContent = dataItem.name;

    token.classList.toggle('token--male', tokenConfig?.gender === 'male');
    token.classList.toggle('token--female', tokenConfig?.gender === 'female');

    if (tokenConfig['text-transform']) {
      token.style.setProperty('text-transform', tokenConfig['text-transform']);
    } else {
      token.style.removeProperty('text-transform');
    }
  }
}



/*
 * ========================================================
 * Limit inputs
 * ========================================================
 */

pairMinMaxInputs(document.querySelector('.limits__min'), document.querySelector('.limits__max'));



/*
 * ========================================================
 * Apply Data
 * ========================================================
 */

const applyButton = document.querySelector('.js-apply-button');

// TODO: Improve this observer code style.
function toggleApplyButton() {
  const dataTokens = tokenBoxScroller2.querySelectorAll('.token--data');

  applyButton.disabled = dataTokens.length === 0;

  if (dataTokens.length === 0) {
    applyButton.title = 'Data should have at least one dynamic token.';
  } else {
    applyButton.removeAttribute('title');
  }
}

toggleApplyButton();

const observer = new MutationObserver(toggleApplyButton);

observer.observe(tokenBoxScroller2, {
  childList: true
});


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

  for (const [name, value] of formData.entries()) {
    // Only add fields with one of the following conditions:
    // - if aren't related to limits;
    // - if are related to limits, but only if limit-min or limit-max have values.
    if (
      (
        value.length > 0 &&
        ['limit-unit', 'ellipsis'].includes(name) === false
      ) ||
      (
        ['limit-unit', 'ellipsis'].includes(name) &&
        (
          (
            formData.get('limit-min') !== null &&
            formData.get('limit-min') !== ''
          ) ||
          (
            formData.get('limit-max') !== null &&
            formData.get('limit-max') !== ''
          )
        )
      )
    ) {
      dataConfig.general[name] = value;
    }
  }

  window.postMessage('apply-data', dataConfig)
    .catch(error => {
      console.error('apply-data', error);
    });
});
