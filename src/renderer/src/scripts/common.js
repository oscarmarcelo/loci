// Disable the context menu (eg. the right click menu) to have a more native feel
document.addEventListener('contextmenu', event => {
  // event.preventDefault();
});



function setTheme(theme) {
  const themes = [
    'theme-blue',
    'theme-purple',
    'theme-pink',
    'theme-red',
    'theme-orange',
    'theme-yellow',
    'theme-green',
    'theme-graphite'
  ];

  document.body.classList.remove(...themes);
  document.body.classList.add(`theme-${theme}`);
}
