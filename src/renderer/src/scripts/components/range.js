const rangeInputs = document.querySelectorAll('input[type="range"][data-range]');
const numberInputs = document.querySelectorAll('input[type="number"][data-range]');



// Update range inputs' background and input defined in `[data-range]`.
function updateRange(range) {
  range.style.setProperty('--value', (((range.value - range.min) * 100) / (range.max - range.min)) + '%');
}



// Update number input on range input event.
for (const range of rangeInputs) {
  // Ensure that background is in the right position from the beginning.
  updateRange(range);

  // Update range and number inputs visually...
  range.addEventListener('input', event => {
    // Don't let parent form capture this range change.
    // It should get the change from the number input instead.
    event.stopPropagation();

    // Trigger an input event in the number input, but only if this event was triggered by a user action.
    // This check avoids an event loop when the trigger comes from the number input.
    if (event.isTrusted) {
      [...numberInputs]
        .find(input => input.dataset.range === range.dataset.range)
        .value = range.value;
    }

    updateRange(range);
  });

  // ... and then tell number input when changes were made.
  range.addEventListener('change', event => {
    // Don't let parent form capture this range change.
    // It should get the change from the number input instead.
    event.stopPropagation();

    // Trigger a change event in the number input, but only if this event was triggered by a user action.
    // This check avoids an event loop when the trigger comes from the number input.
    if (event.isTrusted) {
      [...numberInputs]
        .find(input => input.dataset.range === range.dataset.range)
        .dispatchEvent(new Event('change', {
          bubbles: true,
          cancelable: true
        }));
    }
  });
}



// Update range counterpart when asked.
// `pseudo-change` is used to keep fields in sync when we don't want the input to trigger `input` or `change` yet.
for (const input of numberInputs) {
  ['change', 'pseudo-change'].forEach(event => {
    input.addEventListener(event, () => {
      const range = [...rangeInputs].find(range => range.dataset.range === input.dataset.range);

      range.value = input.value;
      updateRange(range);
    });
  });
}
