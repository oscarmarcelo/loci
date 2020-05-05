function initButtonGroup(group) {
  // TODO [>=1.0.0]: Old version with buttons. Remove this if not used.

  // const buttons = group.querySelectorAll('.button-group__button');
  // const label = group.querySelector('.button-group__label');

  // for (const button of buttons) {
  //   button.addEventListener('click', () => {
  //     const others = [...buttons].filter(element => element !== button && element.getAttribute('aria-pressed') !== true);

  //     for (const other of others) {
  //       other.removeAttribute('aria-pressed');
  //     }

  //     button.setAttribute('aria-pressed', true);
  //     label.textContent = button.getAttribute('aria-title');
  //   });
  // }

  const controls = group.querySelectorAll('.button-group__control');
  const label = group.querySelector('.button-group__label');

  for (const control of controls) {
    const reference = control.querySelector('.button-group__reference');

    reference.addEventListener('change', () => {
      label.textContent = control.getAttribute('aria-title');
    });
  }
}



for (const group of document.querySelectorAll('.button-group')) {
  initButtonGroup(group);
}
