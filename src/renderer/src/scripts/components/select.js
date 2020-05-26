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
  const selectIcon = select.querySelector('select__icon');

  const token = document.createElement('div');

  token.classList.add('select__token');
  if (groupValue) {
    token.dataset.group = groupValue;
  }
  token.dataset.value = value;
  token.textContent = text;

  token.addEventListener('mousedown', () => {
    selectSelectToken(token);
  });

  select.insertBefore(token, selectIcon);

  return token;
}


function updateSelectView(select) {
  const reference = select.querySelector('.select__reference');
  const placeholder = select.querySelector('.select__placeholder');
  const selectedTokens = [];

  // TODO: Try to use DocumentFragment, for performance reasons, and also because there's a MutationObserver watching.
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

  // TODO: Try to use DocumentFragment, for performance reasons, and also because there's a MutationObserver watching.
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

  const maybeUnselectSelectToken = event => {
    if (
      !event ||
      event.target.nodeType !== Node.ELEMENT_NODE ||
      (
        token !== event.target &&
        token.contains(event.target) === false
      )
    ) {
      token.classList.remove('select__token--selected');

      window.removeEventListener('mousedown', maybeUnselectSelectToken);
      window.removeEventListener('blur', maybeUnselectSelectToken);
      window.removeEventListener('resize', maybeUnselectSelectToken);
      window.removeEventListener('keydown', maybeRemoveSelectToken);
    }
  };

  const maybeRemoveSelectToken = event => {
    if (event.key === 'Backspace') {
      const token = document.querySelector('.select__token--selected');

      removeSelectToken(token);

      window.removeEventListener('mousedown', maybeUnselectSelectToken);
      window.removeEventListener('blur', maybeUnselectSelectToken);
      window.removeEventListener('resize', maybeUnselectSelectToken);
      window.removeEventListener('keydown', maybeRemoveSelectToken);
    }
  };

  window.addEventListener('mousedown', maybeUnselectSelectToken);
  window.addEventListener('blur', maybeUnselectSelectToken);
  window.addEventListener('resize', maybeUnselectSelectToken);
  window.addEventListener('keydown', maybeRemoveSelectToken);
}



// Remove token and select the previous sibling.
function removeSelectToken(token) {
  const reference = token.closest('.select').querySelector('.select__reference');
  const previousToken = token.previousElementSibling;

  [...reference.options].find(option => option.dataset.group === token.dataset.group && option.value === token.dataset.value)
  .selected = false;

  if (previousToken?.classList.contains('select__token')) {
    selectSelectToken(previousToken);
  }

  token.remove();

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
    const selected = selectedItems.some(item => typeof item === 'string' ? item === option.value : item.group === option.parentElement.dataset.group && item.id === option.value);

    option.selected = selected;
  });

  reference.dispatchEvent(new Event('change', {
    bubbles: true,
    cancelable: true
  }));
}
