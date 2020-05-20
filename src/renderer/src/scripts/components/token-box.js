const tokenBox = document.querySelector('.token-box');
const tokenBoxScroller = tokenBox.querySelector('.token-box__scroller');
const tokenBoxInput = tokenBox.querySelector('.token-box__input');
const tokenBoxSelect2 = tokenBox.querySelector('.token-box__select'); // TODO [>=1.0.0]: Temporary. Use data-popover instead.



function createToken(id, type, text, tokenConfig) {
  const token = document.createElement('div');

  token.classList.add('token');

  if (type === 'data') {
    token.classList.add('token--data');

    const tokenIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const tokenUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');

    tokenIcon.classList.add('token__icon');
    tokenUse.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#text-lines');

    tokenIcon.append(tokenUse);
    token.append(tokenIcon);

    const tokenText = document.createElement('span');
    tokenText.classList.add('token__text');
    tokenText.textContent = text;

    if (tokenConfig.gender) {
      token.classList.add(`token--${tokenConfig.gender}`);
    }

    if (tokenConfig['text-transform']) {
      token.style.setProperty('text-transform', tokenConfig['text-transform']);
    }

    token.tokenConfig = tokenConfig;

    token.append(tokenText);
  } else if (['newline', 'shift-newline'].includes(type)) {
    token.classList.add('token--newline');
    token.textContent = `${type === 'shift-newline' ? '⇧' : ''}⏎`;
  } else {
    token.textContent = text;
  }

  // TODO: Consider generating a GUID instead.
  //       Ex.: NSUUID.UUID().UUIDString()
  token.id = id || new Array(16)
    .fill(0)
    .map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 97))
    .join('') +
    Date.now().toString(24);

  tokenBoxInput.parentNode.insertBefore(token, tokenBoxInput);
  window.initToken(token);
}


tokenBoxScroller.addEventListener('click', event => {
  // Ignore if the user clicked on a children.
  if (event.target === tokenBoxScroller) {
    tokenBoxInput.focus();
  }
});



tokenBoxInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    // Prevent creating `<div>`s and `<br>`s.
    event.preventDefault();

    let tokenType = 'text';
    let tokenText;

    if (tokenBoxInput.textContent.length === 0) {
      tokenType = `${event.shiftKey ? 'shift-' : ''}newline`;
    } else {
      tokenText = tokenBoxInput.textContent;
    }

    createToken(undefined, tokenType, tokenText);

    tokenBoxInput.textContent = '';
    tokenBoxInput.scrollIntoView();
  }

  if (event.key === 'Backspace' && tokenBoxInput.textContent.length === 0 && tokenBoxInput.previousElementSibling) {
    tokenBoxInput.previousElementSibling.remove();
  }
});



// TODO [>=1.0.0]: Temporary. Use data-popover instead.
tokenBoxSelect2.addEventListener('change', () => {
  const option = tokenBoxSelect2.selectedOptions[0];

  // If there are text in `tokenBoxInput`, create a token text with it before creating the data token.
  if (tokenBoxInput.textContent !== '') {
    tokenBoxInput.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter'
    }));
  }

  createToken(undefined, 'data', option.textContent, {
    data: {
      group: option.dataset.group,
      item: option.value
    }
  });

  tokenBoxSelect2.selectedIndex = -1;

  tokenBoxInput.focus();
});
