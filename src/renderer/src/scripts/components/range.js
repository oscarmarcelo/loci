const rangeInputs = document.querySelectorAll('input[type="range"][data-range]');
const numberInputs = document.querySelectorAll('input[type="number"][data-range]');



// Update range inputs' background and input defined in `[data-range]`.
function updateRange(range) {
  range.style.setProperty('--value', (((range.value - range.min) * 100) / (range.max - range.min)) + '%');
}



// Update number input on range input event.
for (const range of rangeInputs) {
  // Ensure that background is in the right position at start.
  updateRange(range);

  range.addEventListener('input', event => {
    const input = [...numberInputs].filter(input => input.dataset.range === range.dataset.range)[0];

    input.value = range.value;
    updateRange(range);

    // Trigger an input event in the number input, but only if this event was triggered by a user action.
    // This check avoids an event loop when the trigger comes from the number input.
    if (event.isTrusted) {
      input.dispatchEvent(new Event('input', {
        bubbles: false,
        cancelable: true
      }));
    }
  });
}



// Update range input on number change event.
for (const input of numberInputs) {
  input.addEventListener('change', () => {
    const range = [...rangeInputs].filter(range => range.dataset.range === input.dataset.range)[0];

    // If value is empty, revert value by using range's value.
    if (input.value === '') {
      input.value = range.value;
    } else {
      range.value = input.value;
    }

    // Trigger an input event in the range input, so it can update its background.
    range.dispatchEvent(new Event('input', {
      bubbles: false,
      cancelable: true
    }));
  });
}
