const form = document.querySelector('.token-settings-form');
const dataListSelect = form.querySelector('.js-data-list');
const settings = form.querySelector('.token-custom-settings');
const tokenBoxSelectOptions = new DocumentFragment();



// TODO: Use DocumentFragment to add all fields at once instead of adding them one by one.
//       Also, window seems to be resized for each field that is added.
function renderTokenSettings(config) {
  settings.textContent = '';

  const option = dataListSelect.selectedOptions[0];

  const dataItem = window.loci.data.get(option.dataset.group, option.value);
  const fields = dataItem.config.fields;

  if (fields.length > 0) {
    if (typeof fields[0] === 'string' || fields[0].type !== 'heading-2') {
      fields.unshift({
        type: 'heading-2',
        text: 'Settings'
      });
    }

    if (fields[fields.length - 1] !== 'separator') {
      fields.push('separator');
    }

    for (const field of fields) {
      window.loci.fields(field, config);
    }
  }

  window.updatePopoverHeight();
}



function setTokenConfig(config) {
  // First update the Data field.
  dataListSelect.value = config.data.item;

  // Then update the Chance of Appearance combo fields.
  if (config.appearance) {
    const appearance = document.querySelector('[name="appearance"]');

    appearance.value = config.appearance;

    // Make range input detect the value change.
    appearance.dispatchEvent(new Event('change', {
      bubbles: false,
      cancelable: true
    }));
  }

  // And then procceed with the data-specific settings.
  renderTokenSettings(config);
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



form.addEventListener('submit', event => {
  event.preventDefault();
});
