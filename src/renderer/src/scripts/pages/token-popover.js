const form = document.querySelector('.token-settings-form');
const dataListSelect = form.querySelector('.js-data-list');
const settings = form.querySelector('.token-custom-settings');
const tokenBoxSelectOptions = new DocumentFragment();



// TODO: Use DocumentFragment to add all fields at once instead of adding them one by one.
//       Also, window seems to be resized for each field that is added.
function renderTokenSettings(tokenConfig) {
  settings.textContent = '';

  const option = dataListSelect.selectedOptions[0];

  const dataItem = window.loci.data.get(option.dataset.group, option.value);
  const fields = dataItem.config.fields;

  if (fields.length > 0) {
    if (['heading-1', 'heading-2'].includes(fields[0].type) === false) {
      fields.unshift({
        type: 'heading-1',
        text: 'Settings'
      });
    }

    if (fields[fields.length - 1].type !== 'separator') {
      fields.push({
        type: 'separator',
        fillEdges: true
      });
    }

    for (const field of fields) {
      window.loci.fields(field, tokenConfig);
    }

    if (typeof dataItem.handler === 'function') {
      dataItem.handler();
    }
  }

  window.updatePopoverHeight();
}



function setTokenConfig(tokenConfig) {
  // First update the Data field.
  dataListSelect.value = tokenConfig.data.item;

  // Then update the Chance of Appearance combo fields.
  if (tokenConfig.appearance) {
    const appearance = document.querySelector('[name="appearance"]');

    appearance.value = tokenConfig.appearance;

    // Make range input detect the value change.
    appearance.dispatchEvent(new Event('change', {
      bubbles: false,
      cancelable: true
    }));
  }

  // And then procceed with the data-specific settings.
  renderTokenSettings(tokenConfig);
}



/*
 * ========================================================
 * Data Select
 * ========================================================
 */

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

dataListSelect.append(tokenBoxSelectOptions);



/*
 * ========================================================
 * Settings Form
 * ========================================================
 */

form.addEventListener('change', event => {
  if (event.target === dataListSelect) {
    renderTokenSettings();
  }

  const formData = new FormData(form);
  const config = {};

  for (const [name, value] of formData.entries()) {
    if (name === 'data') {
      config.data = {
        group: dataListSelect.selectedOptions[0].dataset.group,
        item: value
      };
    } else {
      config[name] = value;
    }
  }

  window.postMessage('update-token-config', config)
    .catch(error => {
      console.error('update-token-config', error);
    });
});



// HACK: Input elements only trigger changes when they are blurred out or when there are arrow keys navigation, for example.
//       This ensures that input elements also have their values handled even if the window closes without having a change event.
//       As a side effect, `update-token-config` will be posted twice when there's also a `change` event.
form.addEventListener('input', () => {
  form.dispatchEvent(new Event('change', {
    bubbles: false,
    cancelable: true
  }));
});
