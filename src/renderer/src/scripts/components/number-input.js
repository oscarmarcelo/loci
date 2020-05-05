const numberInputComponents = document.querySelectorAll('.number-input');



// Step up/down a number input value.
function step(input, direction) {
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


  // Trigger a change event, so number inputs coupled with range inputs can update their range counterparts.
  input.dispatchEvent(new Event('change', {
    bubbles: false,
    cancelable: true
  }));
}



// Apply events to all `.number-input` components.
for (const component of numberInputComponents) {
  const input = component.querySelector('.number-input__reference');
  const spinners = {
    up: component.querySelector('.number-input__spinner--up'),
    down: component.querySelector('.number-input__spinner--down')
  };
  const form = component.closest('form');



  // Set input step to 10.
  const pressShiftKey = () => {
    if (input.step !== '10') {
      input.step = '10';
    }
  };



  // Set input step to 1.
  const unpressShiftKey = () => {
    if (input.step !== '1') {
      input.step = '1';
    }
  };



  // Control input value increments/decrements when using Arrow and Shift keys.
  input.addEventListener('keydown', event => {
    // Change input step to 10 when using Shift key.
    if (['ArrowUp', 'ArrowDown', 'Shift'].includes(event.key)) {
      if (event.shiftKey || event.key === 'Shift') {
        pressShiftKey();
      }
    }

    // Override Safari behavior of always trying to get to a value multipliable by the step amount.
    if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();

      step(input, event.key === 'ArrowUp' ? 'up' : 'down');
    }
  });



  // Revert input step back to 1 when Shift Key is released.
  input.addEventListener('keyup', event => {
    if (event.key === 'Shift') {
      unpressShiftKey();
    }

    // REVIEW: Check if there's a more native way to trigger form change event.
    if (form && ['ArrowUp', 'ArrowDown'].includes(event.key)) {
      form.dispatchEvent(new Event('change', {
        bubbles: false,
        cancelable: true
      }));
    }
  });



  // Revert input step back to 1 when leaving input.
  input.addEventListener('blur', unpressShiftKey);



  // Global references for the spinner timers.
  let spinnerTimeout;
  let spinnerInterval;


  for (const [direction, spinner] of Object.entries(spinners)) {
    spinner.addEventListener('mousedown', event => {
      if (event.shiftKey && input.step !== '10') {
        input.step = '10';
      }

      step(input, direction);

      window.addEventListener('keydown', pressShiftKey);
      window.addEventListener('keyup', unpressShiftKey);

      spinnerTimeout = setTimeout(() => {
        step(input, direction);

        spinnerInterval = setInterval(step, 50, input, direction);
      }, 500);
    });


    spinner.addEventListener('mouseup', () => {
      clearTimeout(spinnerTimeout);
      clearInterval(spinnerInterval);
      window.removeEventListener('keydown', pressShiftKey);
      window.removeEventListener('keyup', unpressShiftKey);
      unpressShiftKey();

      // REVIEW: Check if there's a more native way to trigger form change event.
      if (form) {
        form.dispatchEvent(new Event('change', {
          bubbles: false,
          cancelable: true
        }));
      }
    });
  }
}
