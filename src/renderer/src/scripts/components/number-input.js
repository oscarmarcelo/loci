function initNumberInput(component) {
  const input = component.querySelector('.number-input__reference');
  const spinners = {
    up: component.querySelector('.number-input__spinner--up'),
    down: component.querySelector('.number-input__spinner--down')
  };



  // Step up/down a number input value.
  const step = (input, direction) => {
    const step = Number.parseFloat(input.step) || 1;
    const min = Number.parseFloat(input.min);
    const max = Number.parseFloat(input.max);

    let value = input.valueAsNumber;


    // Set a base value if there isn't, having limits in mind.
    if (Number.isNaN(value)) {
      value = 0;

      if (Number.isFinite(min)) {
        value = Math.max(value, min);
      }

      if (Number.isFinite(max)) {
        value = Math.min(value, max);
      }
    }


    // Step up/down value, having limits in mind.
    if (direction === 'up') {
      if (Number.isFinite(max) && value + step > max) {
        value = max;
      } else {
        value += step;
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (Number.isFinite(min) && value - step < min) {
        value = min;
      } else {
        value -= step;
      }
    }

    input.valueAsNumber = value;


    // This event is used to sync with other fields without triggering `input` or `change`.
    input.dispatchEvent(new Event('pseudo-change', {
      cancelable: true
    }));
  };



  // Set input step to 10.
  const pressShiftKey = () => {
    if (input.step !== '10') {
      input.step = '10';
    }
  };



  // Revert the input step.
  const unpressShiftKey = () => {
    if (input.step !== input.originalStep) {
      input.step = input.originalStep;
    }
  };



  // Stop spinner when pointer is out of bounds.
  const unpressSpinner = event => {
    window.addEventListener('mouseup', () => {
      event.target.dispatchEvent(new Event('mouseup', {
        bubbles: true,
        cancelable: true
      }));
    }, {
      once: true
    });
  }



  // Store the original step value so we can go back to it when necessary.
  input.originalStep = input.step;



  // Try to store the value for reference in future validations.
  if (input.checkValidity()) {
    input.lastValidValue = input.value;
  }



  // Control input value increments/decrements when using Arrow and Shift keys.
  input.addEventListener('keydown', event => {
    // Change input step to 10 when using Shift key.
    if (['ArrowUp', 'ArrowDown', 'Shift'].includes(event.key)) {
      if (event.shiftKey || event.key === 'Shift') {
        pressShiftKey();
      }
    }

    // Override Safari behavior of always trying to get to a value multipliable by the step amount.
    // Also disable native stepping, since it triggers `change`.
    if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();

      step(input, event.key === 'ArrowUp' ? 'up' : 'down');
    }

    // Validate value and select it. `change` event will be triggered natively.
    if (event.key === 'Enter') {
      if (input.checkValidity()) {
        input.select();
      }
    }

    // REVIEW: Somehow, escape isn't working navitely.
    if (event.key === 'Escape') {
      event.preventDefault();
      input.blur();
    }
  });



  input.addEventListener('keyup', event => {
    // Revert input step when Shift Key is released.
    if (event.key === 'Shift') {
      unpressShiftKey();
    }

    // REVIEW: Check if there's a more native way to trigger form change event.
    //         Probably being prevented by stepping navigation on `keydown`.
    if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
      input.dispatchEvent(new Event('change', {
        bubbles: true,
        cancelable: true
      }));
    }
  });



  // Revert input step when leaving input.
  input.addEventListener('blur', unpressShiftKey);



  // Try to fix invalid values.
  // If successful, store the valid value for reference in future validations.
  // If unsuccessful, warn the user.
  input.addEventListener('invalid', event => {
    // TODO: Signal with system beep.
    //       Probably need to do thing in the main process, because webviews don't allow this.

    // Reset step to avoid conflict with `validity.stepMismatch`.
    unpressShiftKey();

    const validity = input.validity;

    if (validity.badInput) {
      input.value = input.lastValidValue ?? input.defaultValue;
    } else if (validity.rangeOverflow) {
      input.value = input.max;
    } else if (validity.rangeUnderflow) {
      input.value = input.min;
    } else if (validity.stepMismatch) {
      input.valueAsNumber -= ((input.valueAsNumber - Number(input.min)) % (Number(input.step) || 1));
    } else if (validity.valueMissing) {
      input.value = input.lastValidValue ?? input.defaultValue;
    }

    // Check validity again, now with the value possibly fixed.
    if (input.validity.valid) {
      input.lastValidValue = input.value;
    } else {
      input.reportValidity();
    }

    // Restore shifted step if applicable.
    if (event.shiftKey) {
      pressShiftKey();
    }
  });

  input.addEventListener('change', () => {
    if (input.checkValidity()) {
      input.lastValidValue = input.value;
    }
  });



  // Also check for invalid input values that didn't trigger the change event:
  // - When the user inserts a non-number value on a previously empty input.
  // - When the input was already invalid.
  input.addEventListener('blur', () => {
    // Just checking validity is enough, because the input will trigger `change` or `invalid` accordingly.
    input.checkValidity();
  });



  // Global references for the spinner timers.
  let spinnerTimeout;
  let spinnerInterval;

  for (const [direction, spinner] of Object.entries(spinners)) {
    spinner.addEventListener('mousedown', event => {
      // Only if made with the main mouse button.
      if (event.button === 0) {
        if (event.shiftKey && input.step !== '10') {
          input.step = '10';
        }

        step(input, direction);

        // HACK: Workaround to force spinner `mouseup` when the pointer leaves the spinner bounds.
        // TODO: Probably also need to trigger when another window steals focus.
        spinner.addEventListener('mouseleave', unpressSpinner, {
          once: true
        });

        window.addEventListener('keydown', pressShiftKey);
        window.addEventListener('keyup', unpressShiftKey);

        // TODO: Use macOS defined typing delays instead of hardcoding it.
        spinnerTimeout = setTimeout(() => {
          step(input, direction);

          spinnerInterval = setInterval(step, 50, input, direction);
        }, 500);
      }
    });


    spinner.addEventListener('mouseup', () => {
      spinner.removeEventListener('mouseleave', unpressSpinner);

      clearTimeout(spinnerTimeout);
      clearInterval(spinnerInterval);
      window.removeEventListener('keydown', pressShiftKey);
      window.removeEventListener('keyup', unpressShiftKey);
      unpressShiftKey();

      // REVIEW: Check if there's a more native way to trigger form change event.
      //         Probably being prevented by stepping navigation on `keydown`.
      input.dispatchEvent(new Event('change', {
        bubbles: true,
        cancelable: true
      }));
    });
  }
}



function pairMinMaxInputs(minInput, maxInput) {
  ['change', 'pseudo-change'].forEach(event => {
    // Ensure that max limit is not smaller than the min limit.
    minInput.addEventListener(event, () => {
      if (
        Number.isFinite(minInput.valueAsNumber) &&
        Number.isFinite(maxInput.valueAsNumber) &&
        minInput.valueAsNumber > maxInput.valueAsNumber
      ) {
        maxInput.valueAsNumber = minInput.valueAsNumber;
      }
    });

    // Ensure that min limit is not greater than the max limit.
    maxInput.addEventListener(event, () => {
      if (
        Number.isFinite(minInput.valueAsNumber) &&
        Number.isFinite(maxInput.valueAsNumber) &&
        minInput.valueAsNumber > maxInput.valueAsNumber
      ) {
        minInput.valueAsNumber = maxInput.valueAsNumber;
      }
    });
  });
}



// Apply events to all `.number-input` components.
for (const component of document.querySelectorAll('.number-input')) {
  initNumberInput(component);
}
