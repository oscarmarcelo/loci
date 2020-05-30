function initToken(token) {
  // Initiate data and text tokens.
  if (token.classList.contains('token--data')) {
    initDataToken(token);
  } else if (!token.classList.contains('token--newline')) {
    initTextToken(token);
  }

  // Select tokens.
  token.addEventListener('mousedown', event => {
    // Ignore if it's not the first click of a click sequence or is in edit mode.
    if (event.detail > 1 || token.contentEditable === true) {
      return;
    }

    selectToken(token);
  });
}



function initDataToken(token) {
  // Open the token popover with the token configuration.
  token.addEventListener('dblclick', () => {
    window.postMessage('open-token-popover', {
      id: token.id,
      tokenConfig: token.tokenConfig,
      anchorBounds: token.getBoundingClientRect()
    })
      .catch(error => {
        console.error('open-token-popover', error);
      });
  });
}



function initTextToken(token) {
  // Edit a text token when double-clicking it.
  token.addEventListener('dblclick', () => {
    if (token.contentEditable !== 'true') {
      token.contentEditable = true;

      const range = document.createRange();
      const selection = window.getSelection();

      range.selectNodeContents(token);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });

  // Disallow newlines.
  // Also prevent issues with `<div>` and `<br>` generation in contenteditable elements.
  // Also exit of edit mode when pressing Enter or Escape.
  token.addEventListener('keydown', event => {
    if (['Enter', 'Escape'].includes(event.key)) {
      event.preventDefault();
      token.blur();
    }
  });

  // Exit edit mode on text tokens and deselect them.
  token.addEventListener('blur', () => {
    token.contentEditable = 'inherit';
    token.classList.remove('token--selected');

    // Also, remove token if it's empty when exiting of edit mode.
    // TODO: Consider transforming token into token--newline when hitting Enter.
    //       This also involves removing unwanted events, which currently are unnamed.
    if (token.textContent.length === 0) {
      removeToken(token, false);
    }
  });
}



function selectToken(token) {
  token.classList.add('token--selected');

  // Create token event listeners to unselect or remove the token when applicable.
  ['mousedown', 'blur', 'resize', 'keydown'].forEach(eventName => {
    window.addEventListener(eventName, eventName === 'keydown' ? maybeRemoveToken : maybeUnselectToken);
  });
}



function maybeUnselectToken(event) {
  let selectedTokens = document.querySelectorAll('.token--selected');

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
    selectedToken.classList.remove('token--selected');
  });

  // Remove token event listeners related to deselection or removal if there are no selected tokens.
  // All tokens were deselected previously. We only need to check if the `event.target`
  // is also a selected token, to then deselected it.
  if (
    event.target.nodeType !== Node.ELEMENT_NODE ||
    (
      event.target.classList.contains('token--selected') === false &&
      event.target.closest('.token--selected') === null
    )
  ) {
    removeTokenEvents();
  }
}



function maybeRemoveToken(event) {
  if (event.key === 'Backspace') {
    const token = document.querySelector('.token--selected');

    // Only remove token if it's not in edit mode.
    // If removed, also remove all token event listeners.
    if (token?.contentEditable !== 'true') {
      removeTokenEvents();
      removeToken(token);
    }
  }
}



// Remove all token event listeners related to deselection or removal.
function removeTokenEvents() {
  ['mousedown', 'blur', 'resize', 'keydown'].forEach(eventName => {
    window.removeEventListener(eventName, eventName === 'keydown' ? maybeRemoveToken : maybeUnselectToken);
  });
}



// Remove token and select a sibling. Look for a previous sibling first, then for the next, if there isn't a previous.
function removeToken(token, selectSibling = true) {
  const sibling = token.previousElementSibling || token.nextElementSibling;

  token.remove();

  // Remove token event listeners related to deselection or removal.
  removeTokenEvents();

  // Select sibling token, if there is one and we are allowed to do that.
  if (sibling?.classList.contains('token') && selectSibling === true) {
    selectToken(sibling);
  }

  // TODO: Should also select `tokenBoxInput` when possible.
  //       - When removing a token without selecting the previous one.
  //       - When removing the first/only token of the list.
}
