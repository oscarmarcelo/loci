// Disable the context menu (eg. the right click menu) to have a more native feel,
// but keep it on input fields, so the user can have access to clipboard actions.
document.addEventListener('contextmenu', event => {
  if (event.target.tagName !== 'INPUT' && event.target.contentEditable !== 'true') {
    event.preventDefault();
  }
});



if (typeof window.loci === 'undefined') {
  window.loci = {};
}



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



document.querySelectorAll('.js-no-submit').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
  });
});
