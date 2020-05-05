const settings = document.querySelector('.token-custom-settings');

export function appendToSettings(field) {
  const previousField = settings.lastElementChild;

  if (previousField && !previousField?.classList.contains('heading-2') && previousField?.tagName !== 'HR') {
    field.children[0].classList.add('mt-10');
  }

  // TODO: This function should return the DOM so it can be appended to a DocumentFragment in the loop.
  settings.append(field);
}
