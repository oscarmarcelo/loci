function initToken(token) {
  token.addEventListener('mousedown', () => {
    if (token.contentEditable !== 'true') {
      selectToken(token);
    }
  });

  if (token.classList.contains('token--data')) {
    initDataToken(token);
  } else if (!token.classList.contains('token--newline')) {
    initTextToken(token);
  }
}



function initDataToken(token) {
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

      // TODO: Consider placing caret at cursor position.
      const range = document.createRange();
      const selection = window.getSelection();

      range.selectNodeContents(token);
      selection.removeAllRanges();
      selection.addRange(range);


      token.addEventListener('keydown', event => {
        // Disallow newlines.
        // Also exit of edit mode when pressing Enter or Escape.
        if (['Enter', 'Escape'].includes(event.key)) {
          event.preventDefault();
          token.blur();

          // Also, remove token if it's empty when exiting of edit mode.
          // TODO: Consider transforming token into token--newline when hitting Enter.
          //       This also involves removing unwanted events, which currently are unnamed.
          if (token.textContent.length === 0) {
            removeToken(token);
          }
        }
      });

      token.addEventListener('blur', () => {
        token.contentEditable = 'inherit';
        token.classList.remove('token--selected');
      }, {
        once: true
      });
    }
  });
}



function selectToken(token) {
  token.classList.add('token--selected');

  token.addEventListener('keydown', event => {
    if (event.key === 'Backspace' && token.contentEditable !== 'true') {
      removeToken();
    }
  });

  const maybeUnselectToken = event => {
    if (!event || event.target.nodeType !== Node.ELEMENT_NODE || (token !== event.target && token.contains(event.target) === false)) {
      token.classList.remove('token--selected');

      window.removeEventListener('mousedown', maybeUnselectToken);
      window.removeEventListener('blur', maybeUnselectToken);
      window.removeEventListener('resize', maybeUnselectToken);
      window.removeEventListener('keydown', maybeRemoveToken);
    }
  };

  const maybeRemoveToken = event => {
    if (event.key === 'Backspace') {
      const token = document.querySelector('.token--selected');

      if (token?.contentEditable !== 'true') {
        removeToken(token);

        window.removeEventListener('mousedown', maybeUnselectToken);
        window.removeEventListener('blur', maybeUnselectToken);
        window.removeEventListener('resize', maybeUnselectToken);
        window.removeEventListener('keydown', maybeRemoveToken);
      }
    }
  };

  window.addEventListener('mousedown', maybeUnselectToken);
  window.addEventListener('blur', maybeUnselectToken);
  window.addEventListener('resize', maybeUnselectToken);
  window.addEventListener('keydown', maybeRemoveToken);
}



// Remove token and select the previous sibling.
function removeToken(token) {
  const previousToken = token.previousElementSibling;
  if (previousToken?.classList.contains('token')) {
    selectToken(previousToken);
  }

  token.remove();
}



// Initiate all available tokens.
for (const token of document.querySelectorAll('.token')) {
  initToken(token);
}
