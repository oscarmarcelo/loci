function initSelect(select) {
  const reference = select.querySelector('.select__reference');

  updateSelectView(select);

  reference.addEventListener('change', () => {
    updateSelectView(select);
  });

  select.addEventListener('click', event => {
    if (event.target.classList.contains('select__token') === false) {
      window.postMessage('open-select', {
        name: reference.name,
        anchorBounds: select.getBoundingClientRect(),
        placeholder: select.dataset.placeholder,
        multiple: true,
        menu: [...reference.options].map(option => ({
          id: option.value,
          name: option.textContent,
          selected: option.selected
        }))
      })
        .catch(error => {
          console.error('open-select', error);
        });
    }
  });
}



function createSelectToken(select, text, groupValue, value) {
  const tokenList = select.querySelector('.select__token-list');

  const token = document.createElement('div');

  token.classList.add('select__token');
  if (groupValue) {
    token.dataset.group = groupValue;
  }
  token.dataset.value = value;
  token.textContent = text;

  token.addEventListener('mousedown', () => {
    // Ignore if it's not the first click of a click sequence or is in edit mode.
    if (event.detail > 1 || token.contentEditable === 'plaintext-only') {
      return;
    }

    selectSelectToken(token);
  });

  tokenList.append(token);

  return token;
}


function updateSelectView(select) {
  const reference = select.querySelector('.select__reference');
  const placeholder = select.querySelector('.select__placeholder');
  const selectedTokens = [];

  // TODO: Use DocumentFragment.
  select.querySelectorAll('.select__token').forEach(token => {
    if (token.classList.contains('select__token--selected')) {
      selectedTokens.push({
        group: token.dataset.group,
        value: token.dataset.value
      });
    }

    token.remove();
  });

  placeholder.classList.toggle('select__placeholder--hidden', [...reference.selectedOptions].length > 0);

  // TODO: Use DocumentFragment.
  [...reference.selectedOptions].forEach(option => {
    const token = createSelectToken(select, option.textContent, option.parentElement.dataset.group, option.value);
    const selectionState = selectedTokens.find(token => token.group === option.parentElement.dataset.group && token.value === option.value);

    if (selectionState) {
      selectSelectToken(token);
    }
  });
}



function selectSelectToken(token) {
  // TODO: Make the token toggle on click.
  token.classList.add('select__token--selected');

  // Create token event listeners to unselect or remove the token when applicable.
  ['mousedown', 'blur', 'resize', 'keydown'].forEach(eventName => {
    window.addEventListener(eventName, eventName === 'keydown' ? maybeRemoveSelectToken : maybeUnselectSelectToken);
  });
}



function maybeUnselectSelectToken(event) {
  let selectedTokens = document.querySelectorAll('.select__token--selected');

  // If the event is directly related to the token, remove it from `selectedTokens`.
  if (['mousedown', 'keydown'].includes(event.type)) {
    selectedTokens = [...selectedTokens].filter(selectedToken =>
      selectedToken !== event.target &&
      event.target.nodeType === Node.ELEMENT_NODE &&
      selectedToken.contains(event.target) === false
    );
  }

  // Deselect all tokens.
  selectedTokens.forEach(selectedToken => {
    selectedToken.classList.remove('select__token--selected');
  });

  // Remove token event listeners related to deselection or removal if there are no selected tokens.
  // All tokens were deselected previously. We only need to check if the `event.target`
  // is also a selected token, to then deselected it.
  if (
    event.target.nodeType !== Node.ELEMENT_NODE ||
    (
      event.target.classList.contains('select__token--selected') === false &&
      event.target.closest('.select__token--selected') === null
    )
  ) {
    removeSelectTokenEvents();
  }
}



function maybeRemoveSelectToken(event) {
  if (event.key === 'Backspace') {
    const token = document.querySelector('.select__token--selected');

    removeSelectTokenEvents();
    removeSelectToken(token);
  }
}



// Remove all token event listeners related to deselection or removal.
function removeSelectTokenEvents() {
  ['mousedown', 'blur', 'resize', 'keydown'].forEach(eventName => {
    window.removeEventListener(eventName, eventName === 'keydown' ? maybeRemoveSelectToken : maybeUnselectSelectToken);
  });
}



// Remove token and select a sibling. Look for a previous sibling first, then for the next, if there isn't a previous.
function removeSelectToken(token) {
  const reference = token.closest('.select').querySelector('.select__reference');
  const sibling = token.previousElementSibling || token.nextElementSibling;

  [...reference.options].find(option => option.dataset.group === token.dataset.group && option.value === token.dataset.value)
    .selected = false;

  token.remove();

  // Remove token event listeners related to deselection or removal.
  removeSelectTokenEvents();

  // Select sibling token, if there is one.
  if (sibling?.classList.contains('select__token')) {
    selectSelectToken(sibling);
  }

  reference.dispatchEvent(new Event('change', {
    bubbles: true,
    cancelable: true
  }));
}



for (const select of document.querySelectorAll('.select--multiple')) {
  initSelect(select);
}



function updateSelectResult(selectName, selectedItems) {
  const reference = document.querySelector(`.select__reference[name="${selectName}"]`);

  [...reference.options].forEach(option => {
    const selected = selectedItems.some(item => typeof item === 'string' ? item === option.value : item.group === option.parentElement.dataset.group && item.item === option.value);

    option.selected = selected;
  });

  reference.dispatchEvent(new Event('change', {
    bubbles: true,
    cancelable: true
  }));
}
