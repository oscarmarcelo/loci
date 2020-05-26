import {appendToSettings} from './utils';

export default languages => {
  const template = document.querySelector('#languages');
  const clone = template.content.cloneNode(template);
  const component = clone.querySelector('.select');
  const reference = clone.querySelector('.select__reference');

  if (languages) {
    languages.forEach(language => {
      [...reference.options].find(option => typeof language === 'string' ? language === option.value : language.group === option.parentElement.dataset.group && language.id === option.value)
        .selected = true;
    });
  }

  window.initSelect(component);

  appendToSettings(clone);
};
