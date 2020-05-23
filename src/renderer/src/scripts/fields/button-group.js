import {appendToSettings} from './utils';

export default (field, value) => {
  const buttonGroupTemplate = document.querySelector('#button-group');
  const buttonTemplate = document.querySelector('#button-group__button');
  const buttonGroupClone = buttonGroupTemplate.content.cloneNode(buttonGroupTemplate);
  const component = buttonGroupClone.querySelector('.button-group');
  const buttonList = buttonGroupClone.querySelector('.button-group__list');

  if (field.type === 'gender') {
    field = {
      id: 'gender',
      items: [
        {
          value: 'both',
          text: 'Both Genders',
          description: 'Use all names.',
          icon: 'both-genders'
        },
        {
          value: 'male',
          text: 'Male',
          description: 'Use only male names.',
          icon: 'male'
        },
        {
          value: 'female',
          text: 'Female',
          description: 'Use only female names.',
          icon: 'female'
        }
      ]
    };
  } else if (field.type === 'text-transform') {
    field = {
      id: 'text-transform',
      largeButtonText: true,
      items: [
        {
          value: 'none',
          text: 'No Transform',
          description: 'No letter casing.',
          icon: 'none'
        },
        // TODO: Disabled until generator util `language` can capitalize content.
        // {
        //   value: 'capitalize',
        //   text: 'Capitalize',
        //   description: 'Capitalize words.',
        //   buttonText: 'Aa'
        // },
        {
          value: 'uppercase',
          text: 'Uppercase',
          description: 'Use uppercase characters.',
          buttonText: 'AA'
        },
        {
          value: 'lowercase',
          text: 'Lowercase',
          description: 'Use lowercase characters.',
          buttonText: 'aa'
        }
      ]
    };
  }

  if (field.largeButtonText) {
    component.classList.add('button-group--large-button-text');
  }

  field.items.forEach(item => {
    const buttonClone = buttonTemplate.content.cloneNode(buttonTemplate);
    const control = buttonClone.querySelector('.button-group__control');
    const reference = buttonClone.querySelector('.button-group__reference');

    control.setAttribute('aria-title', item.text);
    control.title = item.description;

    reference.name = field.id;
    reference.value = item.value;

    if (item.icon) {
      buttonClone.querySelector('.button-group__icon use').setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#${item.icon}`);
    } else {
      buttonClone.querySelector('.button-group__mask').textContent = item.buttonText;
    }

    buttonList.append(buttonClone);
  });


  const checkedControl = buttonList.querySelector(`.button-group__reference${value ? `[value="${value}"]` : ''}`);

  checkedControl.checked = true;

  window.initButtonGroup(buttonGroupClone);
  appendToSettings(buttonGroupClone);

  checkedControl.dispatchEvent(new Event('change', {
    cancelable: true
  }));
};
