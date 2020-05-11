function setPopoverCaretPosition(position) {
  const caret = document.querySelector('.popover__caret');

  caret.style.marginLeft = `${position}px`;
}

// TODO: Safari 13.1+ supports ResizeObserver. Use it when available.
function updatePopoverHeight() {
  const popover = document.querySelector('.popover');

  window.postMessage('update-popover-height', popover.offsetHeight)
    .catch(error => {
      console.error('update-popover-height', error);
    });
}
