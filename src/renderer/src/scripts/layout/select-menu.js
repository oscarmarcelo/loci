const input = document.querySelector('.select-menu__search-input');
const groups = document.querySelectorAll('.select-menu__group');
const items = document.querySelectorAll('.select-menu__item');
const current = document.querySelector('.select-menu__item--current');



function hideSearch() {
  const search = document.querySelector('.select-menu__search');
  search.classList.add('select-menu__search--hidden');
}



function filterOptions(query) {
  // TODO: Improve this!!!
  const words = query.toLowerCase().split(' ').filter(word => word.length > 0 && word !== ' ');

  let results = 0;

  if (groups.length > 0) {
    for (const group of groups) {
      const items = group.querySelectorAll('.select-menu__item');
      let groupHasResults = false;

      for (const item of items) {
        const itemName = item.textContent.toLowerCase();
        let itemHasResults = true;

        for (const word of words) {
          if (!itemName.includes(word)) {
            itemHasResults = false;
          }
        }

        item.classList.toggle('select-menu__item--hidden', !itemHasResults);
        results += itemHasResults ? 1 : 0;

        if (itemHasResults) {
          groupHasResults = true;
        }
      }

      group.classList.toggle('select-menu__group--hidden', !groupHasResults);
    }
  } else {
    // const items = document.querySelectorAll('.select-menu__item');
    // for (const item of items) {
    //   const result = input.value.length > 0 && item.textContent.toLowerCase().includes(input.value.toLowerCase());
    //   item.style.display = result ? 'none' : '';
    // }
  }

  window.postMessage('select-menu-results', results)
    .catch(error => {
      console.error('select-menu-results', error);
    });
}



input.addEventListener('input', () => {
  filterOptions(input.value);
});



for (const item of items) {
  item.addEventListener('mousedown', () => {
    const current = [...items].find(item => item.classList.contains('select-menu__item--current'));

    current.classList.remove('select-menu__item--selected', 'select-menu__item--current');
    item.classList.add('select-menu__item--selected', 'select-menu__item--current');
  });
}



window.addEventListener('blur', () => {
  document.querySelector('.select-menu__item--selected').classList.remove('select-menu__item--selected');
});



if (current) {
  current.scrollIntoView({
    block: 'center'
  });
}



// document.addEventListener('keydown', event => {
//   if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
//     event.preventDefault();
//     if (current) {
//       let sibling;

//       if (event.key === 'ArrowUp') {
//         sibling = current.previousElementSibling;
//       } else if (event.key === 'ArrowDown') {
//         sibling = current.nextElementSibling;
//       }

//       if (sibling) {
//         current.classList.remove('select-menu__item--current');
//         sibling.focus();
//         sibling.scrollIntoView();
//         sibling.classList.add('select-menu__item--current');
//       }
//     } else {
//       const firstItem = items[0];
//       firstItem.focus();
//       firstItem.classList.add('select-menu__item--current');
//     }
//   }
// });
