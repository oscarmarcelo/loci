import faker from 'faker';

import {appendToSettings} from './utils';

export default (field, selectedLanguages) => {
  const template = document.querySelector('#languages');
  const clone = template.content.cloneNode(template);
  const component = clone.querySelector('.select');
  const reference = clone.querySelector('.select__reference');
  const availableLanguages = [];
  const options = new DocumentFragment();
  const languagesBlacklist = [
    'en_AU_ocker',
    'en_BORK'
  ];

  Object.entries(faker.locales).forEach(([id, {title: name}]) => {
    if (languagesBlacklist.includes(id) === false && faker.locales[id]?.[field.group]?.[field.item]) {
      availableLanguages.push({
        id,
        name
      });
    }
  });

  availableLanguages.sort((a, b) => a.name.localeCompare(b.name)).forEach(language => {
    const option = document.createElement('option');

    option.value = language.id;
    option.textContent = language.name;

    if (selectedLanguages?.includes(language.id)) {
      option.selected = true;
    }

    options.append(option);
  });

  reference.append(options);

  window.initSelect(component);

  appendToSettings(clone);
};
