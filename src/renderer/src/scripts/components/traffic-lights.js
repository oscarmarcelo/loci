const trafficLights = document.querySelector('.traffic-lights');
const close = trafficLights.querySelector('.traffic-lights__button--close');



window.addEventListener('focus', () => {
  trafficLights.classList.add('traffic-lights--active');
});



window.addEventListener('blur', () => {
  trafficLights.classList.remove('traffic-lights--active');
});



close.addEventListener('click', () => {
  window.postMessage('close', null);
});
