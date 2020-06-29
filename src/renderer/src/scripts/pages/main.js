function generateUUID() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

/*
 * ========================================================
 * Window
 * ========================================================
 */

window.addEventListener('focus', () => {
  document.body.classList.remove('window-blurred');
});

window.addEventListener('blur', () => {
  document.body.classList.add('window-blurred');
});



/*
 * ========================================================
 * Sidebar
 * ========================================================
 */

const sidebarList = document.querySelector('.sidebar__list');



function createSidebarItem (id = generateUUID(), icon = 'person', name = 'Template', dataConfig) {
  const template = document.querySelector('#sidebar-item');
  const clone = template.content.cloneNode(template);

  const sidebarItem = clone.querySelector('.sidebar__item');
  const sidebarItemIconUse = sidebarItem.querySelector('.sidebar__item-icon use');
  const sidebarItemName = sidebarItem.querySelector('.sidebar__item-name');
  // const sidebarItemData = sidebarItem.querySelector('.sidebar__item-data'); // TODO: Support adding template as Sketch Data Supplier.

  sidebarItem.dataset.id = id;
  sidebarItem.dataConfig = dataConfig;

  sidebarItem.addEventListener('click', () => {
    // Ignore if it's not the first click of a click sequence or is in edit mode.
    if (event.detail > 1 || sidebarItemName.contentEditable === 'plaintext-only') {
      return;
    }

    setDataConfig({
      dataConfig: sidebarItem.dataConfig
    });
  });

  sidebarItem.addEventListener('dblclick', () => {
    sidebarItemName.originalText = sidebarItemName.textContent;
    sidebarItemName.contentEditable = 'plaintext-only';

    const range = document.createRange();
    const selection = window.getSelection();

    range.selectNodeContents(sidebarItemName);
    selection.removeAllRanges();
    selection.addRange(range);
  });

  sidebarItem.addEventListener('contextmenu', () => {
    // Ensure native context menu still opens when in edit mode.
    if (sidebarItemName.contentEditable === 'inherit') {
      window.postMessage('open-sidebar-item-context-menu', sidebarItem.dataset.id)
      .catch(error => {
        console.error('open-sidebar-item-context-menu', error);
      });
    }
  });

  sidebarItemIconUse.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#template-icon__${icon}`);

  sidebarItemName.textContent = name;

  sidebarItemName.addEventListener('keydown', event => {
    if (['Enter', 'Escape'].includes(event.key)) {
      event.preventDefault();
      sidebarItemName.blur();
    }
  });

  sidebarItemName.addEventListener('blur', () => {
    sidebarItemName.contentEditable = 'inherit';
    sidebarItemName.textContent = sidebarItemName.textContent.trim();
    sidebarItemName.scrollLeft = 0;

    if (sidebarItemName.textContent === '') {
      sidebarItemName.textContent = sidebarItemName.originalText;
    }

    updateTemplateSettings();
  });

  return clone;
}



function setSidebarItems(sidebarItems) {
  const sidebarItemList = new DocumentFragment();

  sidebarItems.forEach(item => {
    sidebarItemList.append(createSidebarItem(undefined, item.icon, item.name, item.data));
  });

  sidebarList.append(sidebarItemList);
}



function updateSidebarSelection(dataConfig = getDataConfig()) {
  // TODO: Compare between properties instead of stringified JSONs when we implement token relations.

  let dataConfigString = dataConfig;

  // Remove token IDs, since they are not need to for comparison.
  dataConfigString.tokens = dataConfigString.tokens?.map(token => {
    delete token.id;

    return token;
  });

  dataConfigString = JSON.stringify(dataConfigString)
  dataConfigString = dataConfigString.replace('\xA0', ' '); // Normalize spaces before comparison.

  const sidebarItemList = document.querySelectorAll('.sidebar__item');

  [...sidebarItemList].forEach(sidebarItem => {
    let sidebarItemDataConfigString = sidebarItem.dataConfig;

    sidebarItemDataConfigString.tokens = sidebarItemDataConfigString.tokens?.map(token => {
      delete token.id;

      return token;
    });

    sidebarItemDataConfigString = JSON.stringify(sidebarItemDataConfigString);
    sidebarItemDataConfigString = sidebarItemDataConfigString.replace('\xA0', ' '); // Normalize spaces before comparison.

    sidebarItem.classList.toggle('sidebar__item--active', dataConfigString === sidebarItemDataConfigString);
  });

  document.querySelector('.sidebar__item--active')?.scrollIntoView({
    block: 'nearest'
  });
}



function updateTemplateSettings() {
  const sidebarItems = document.querySelectorAll('.sidebar__item');
  const templateSettings = [];

  sidebarItems.forEach(item => {
    templateSettings.push({
      name: item.querySelector('.sidebar__item-name').textContent,
      icon: item.querySelector('.sidebar__item-icon use').getAttributeNS('http://www.w3.org/1999/xlink', 'href').slice('#template-icon__'.length),
      // version: constants.PLUGIN_VERSION, // TODO: Store version for backwards compatibility.
      data: item.dataConfig
    });
  });

  window.postMessage('update-template-settings', templateSettings)
    .catch(error => {
      console.error('update-template-settings', error);
    });
}



const updateSidebarObserver = new MutationObserver(() => {
  updateSidebarSelection();
});

// TODO: This selector is also defined in a variable used below. Use that variable instead.
updateSidebarObserver.observe(document.querySelector('.token-box__scroller'), {
  childList: true
});



const addTemplateButton = document.querySelector('.js-add-template');

addTemplateButton.addEventListener('click', () => {
  createTemplate();
});



/*
 * ========================================================
 * Templates
 * ========================================================
 */

function createTemplate() {
  // TODO: Add template to plugin settings.
  const templateId = generateUUID();
  const sidebarItem = createSidebarItem(templateId, undefined, undefined, getDataConfig());

  sidebarList.append(sidebarItem);

  document.querySelector(`[data-id="${templateId}"]`).scrollIntoView({
    block: 'nearest'
  });

  updateTemplateSettings();

  renameTemplate(templateId);
}



function requestTemplateIconChange (id) {
  const sidebarItem = sidebarList.querySelector(`[data-id="${id}"]`);
  const sidebarItemIcon = sidebarItem.querySelector('.sidebar__item-icon');
  const sidebarItemIconUse = sidebarItem.querySelector('.sidebar__item-icon use');
  const icon = sidebarItemIconUse.getAttributeNS('http://www.w3.org/1999/xlink', 'href').slice('#template-icon__'.length);

  sidebarItem.classList.add('sidebar__item--active');

  window.postMessage('open-icon-popover', id, icon, sidebarItemIcon.getBoundingClientRect())
    .catch(error => {
      console.error('open-icon-popover', error);
    });
}



function changeTemplateIcon(id, icon) {
  const sidebarItem = sidebarList.querySelector(`[data-id="${id}"]`);
  const sidebarItemIconUse = sidebarItem.querySelector('.sidebar__item-icon use');

  sidebarItemIconUse.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#template-icon__${icon}`);

  updateTemplateSettings();
}



function renameTemplate(id) {
  const sidebarItem = sidebarList.querySelector(`[data-id="${id}"]`);

  sidebarItem.classList.add('sidebar__item--active');

  sidebarItem.dispatchEvent(new Event('dblclick', {
    cancelable: true
  }));
}



function deleteTemplate(id) {
  // TODO: Remove template from plugin settings.
  sidebarList.querySelector(`[data-id="${id}"]`).remove();

  updateTemplateSettings();
}



/*
 * ========================================================
 * Data Editor Input
 * ========================================================
 */

const tokenBox = document.querySelector('.token-box');
const tokenBoxScroller = tokenBox.querySelector('.token-box__scroller');
const tokenBoxInput = tokenBox.querySelector('.token-box__input');
const tokenBoxChevron = document.querySelector('.token-box__chevron');
const dataGeneralSettingsForm = document.querySelector('.js-data-general-settings-form');



function createToken(id, type, text, tokenConfig, insertPendingTextFirst) {
  // If there is text in `tokenBoxInput`, create a text token with it before creating the requested token.
  if (insertPendingTextFirst !== false && tokenBoxInput.textContent !== '') {
    tokenBoxInput.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter'
    }));
  } else {
    tokenBoxInput.textContent = '';
  }

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

  // TODO: Use browser implementation when available: https://github.com/tc39/proposal-uuid
  token.dataset.id = id || generateUUID();

  tokenBoxInput.parentNode.insertBefore(token, tokenBoxInput);
  window.initToken(token);

  tokenBoxInput.focus();
}



function getDataConfig() {
  const tokens = document.querySelectorAll('.token-box .token');
  const formData = new FormData(dataGeneralSettingsForm);
  const dataConfig = {
    tokens: [],
    general: {}
  };

  for (const token of tokens) {
    const tokenObject = {
      id: token.dataset.id
    };

    if (token.classList.contains('token--data')) {
      tokenObject.type = 'data';
      tokenObject.config = token.tokenConfig;
    } else if (token.classList.contains('token--newline')) {
      tokenObject.type = `${token.textContent.includes('⇧') ? 'shift-' : ''}newline`
    } else {
      tokenObject.type = 'text';
      tokenObject.text = token.textContent;
    }

    dataConfig.tokens.push(tokenObject);
  }

  for (const [name, value] of formData.entries()) {
    // Only add fields with one of the following conditions:
    // - if aren't related to limits;
    // - if are related to limits, but only if limit-max have values.
    if (
      (
        value.length > 0 &&
        ['limit-unit', 'ellipsis'].includes(name) === false
      ) ||
      (
        ['limit-unit', 'ellipsis'].includes(name) &&
        (
          formData.get('limit-max') !== null &&
          formData.get('limit-max') !== ''
        )
      )
    ) {
      dataConfig.general[name] = value;
    }
  }

  // Remove property if unused.
  if (Object.keys(dataConfig.general).length === 0) {
    delete dataConfig.general;
  }

  return dataConfig;
}



function setDataConfig(options) {
  // Set datakey, dataItems, and documentId.
  // If an option is explicitly set to `false`, then remove the property.
  if (typeof options.dataKey !== 'undefined') {
    window.loci.dataKey = options.dataKey || undefined;
  }

  if (typeof options.dataItems !== 'undefined') {
    window.loci.dataItems = options.dataItems || undefined;
  }

  if (typeof options.documentId !== 'undefined') {
    window.loci.document = options.documentId || undefined;
  }

  const tokens = tokenBoxScroller.querySelectorAll('.token');

  // TODO: Use DocumentFragment.
  tokens.forEach(token => {
    token.remove();
  });

  dataGeneralSettingsForm.reset();

  // TODO: Handle multiple selections.
  //       Analyze dataConfigs and decide what to show.
  const dataConfig = options.dataConfig || options.dataItems.find(item => item.dataConfig)?.dataConfig || {};

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
    createToken(tokenConfig.id, tokenConfig.type, name, config);
  });

  Object.entries(dataConfig.general || {}).forEach(([name, value]) => {
    const field = dataGeneralSettingsForm.elements.namedItem(name);

    if (field.type === 'checkbox') {
      field.checked = Boolean(value);
    } else {
      field.value = value;
    }
  });

  updateSidebarSelection(dataConfig);
}



function updateTokenConfig(id, tokenConfig) {
  const token = document.querySelector(`.token[data-id="${id}"]`);

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

  updateSidebarSelection();
}



tokenBoxScroller.addEventListener('click', event => {
  // Ignore if the user clicked on a children.
  if (event.target === tokenBoxScroller) {
    tokenBoxInput.focus();
  }
});



tokenBoxChevron.addEventListener('click', () => {
  window.postMessage('open-data-list-popover', tokenBoxChevron.getBoundingClientRect())
    .catch(error => {
      console.error('open-data-list-popover', error);
    });
});



tokenBoxInput.addEventListener('input', () => {
  window.postMessage('data-suggestion', tokenBoxInput.textContent, tokenBoxInput.getBoundingClientRect())
    .catch(error => {
      console.error('data-suggestion', error);
    });
});



tokenBoxInput.addEventListener('keydown', event => {
  if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
    event.preventDefault();

    window.postMessage('navigate-data-suggestions', event.key)
      .catch(error => {
        console.error('navigate-data-suggestions', error);
      });
  } else if (event.key === 'Enter') {
    // Prevent creating `<div>`s and `<br>`s.
    event.preventDefault();

    let tokenType;
    let tokenText;
    let tokenConfig;

    if (window.loci.dataSuggestion) {
      tokenType = 'data';
      tokenText = window.loci.data.get(window.loci.dataSuggestion.group, window.loci.dataSuggestion.item).config.name;
      tokenConfig = {
        data: window.loci.dataSuggestion
      };

      window.loci.dataSuggestion = undefined;
    } else if (tokenBoxInput.textContent.length === 0) {
      tokenType = `${event.shiftKey ? 'shift-' : ''}newline`;
    } else {
      tokenType = 'text';
      tokenText = tokenBoxInput.textContent;
    }

    createToken(undefined, tokenType, tokenText, tokenConfig, false);

    tokenBoxInput.scrollIntoView();

    window.postMessage('close-data-suggestions', null)
      .catch(error => {
        console.error('close-data-suggestions (Enter)', error);
      });
  } else if (event.key === 'Escape') {
    event.preventDefault();

    window.postMessage('close-data-suggestions', null)
      .catch(error => {
        console.error('close-data-suggestions (Escape)', error);
      });
  } else if (event.key === 'Backspace' && tokenBoxInput.textContent.length === 0 && tokenBoxInput.previousElementSibling) {
    tokenBoxInput.previousElementSibling.remove();
  }

  window.loci.dataSuggestion = undefined;
});



tokenBoxInput.addEventListener('blur', () => {
  window.loci.dataSuggestion = undefined;

  window.postMessage('close-data-suggestions', null)
    .catch(error => {
      console.error('close-data-suggestions', error);
    });
});



/*
 * ========================================================
 * Apply Data
 * ========================================================
 */

const applyButton = document.querySelector('.js-apply-button');

// TODO: Improve this observer code style.
function toggleApplyButton() {
  const dataTokens = tokenBoxScroller.querySelectorAll('.token--data');

  applyButton.disabled = dataTokens.length === 0;

  if (dataTokens.length === 0) {
    applyButton.title = 'Data should have at least one dynamic token.';
  } else {
    applyButton.removeAttribute('title');
  }
}

toggleApplyButton();

const toggleApplyButtonObserver = new MutationObserver(toggleApplyButton);

toggleApplyButtonObserver.observe(tokenBoxScroller, {
  childList: true
});


applyButton.addEventListener('click', () => {
  const dataConfig = getDataConfig();

  window.postMessage('apply-data', window.loci.dataKey, window.loci.dataItems, dataConfig, window.loci.document)
    .catch(error => {
      console.error('apply-data', error);
    });

  // Reset `dataKey` after `apply-data`, since it can only be used once.
  // The plugin will look for selected items for the next `apply-data` messages in this session.
  window.loci.dataKey = undefined;
});
