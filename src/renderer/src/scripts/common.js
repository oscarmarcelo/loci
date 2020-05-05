// Disable the context menu (eg. the right click menu) to have a more native feel
document.addEventListener('contextmenu', event => {
  // event.preventDefault();
});



function setTheme(theme) {
  for (const namedColor in theme) {
    if (Object.prototype.hasOwnProperty.call(theme, namedColor)) {
      document.documentElement.style.setProperty(`--${namedColor}`, theme[namedColor]);
    }
  }
}
