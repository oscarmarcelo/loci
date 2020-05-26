const search = document.querySelector('.select-menu__search');
const input = document.querySelector('.select-menu__search-input');
const list = document.querySelector('.select-menu__list');

let groups;
let items;
let current;



function setActions(actions) {
  window.loci.actions = actions;
}



function hideSearch() {
  search.classList.add('select-menu__search--hidden');

  // This variable is used to check if the window should hide when there aren't filter results.
  window.loci.searchHidden = true;
}



function setPlaceholder(text) {
  input.placeholder = text;
}



// const selectMenuListObserver = new MutationObserver(mutations => {
//   mutations.forEach(mutation => {
//     if (mutation.attributeName === 'class') {
//       if (mutation.target.classList.contains('select-menu__item--current')) {
//         current = mutation.target;
//       }
//     }
//   });
// });

// items.forEach(item => {
//   item.observe({
//     attributes: true
//   });
// });



function setMenu(menu) {
  const menuList = new DocumentFragment();

  // TODO: Support menu lists without groups.
  menu.forEach(groupObject => {
    const group = document.createElement('div');
    const heading = document.createElement('div');

    group.classList.add('select-menu__group');
    group.dataset.group = groupObject.id;

    heading.classList.add('select-menu__heading', 'heading-1');
    heading.textContent = groupObject.name;

    group.append(heading);

    groupObject.items.forEach(itemObject => {
      const item = document.createElement('button');

      item.classList.add('select-menu__item');
      item.dataset.value = itemObject.id;
      item.textContent = itemObject.name;

      item.addEventListener('mousedown', () => {
        [...items].find(item => item.classList.contains('select-menu__item--current'))
          ?.classList.remove('select-menu__item--selected', 'select-menu__item--current');

        item.classList.add('select-menu__item--selected', 'select-menu__item--current');
      });

      item.addEventListener('click', () => {
        if (window.loci.actions?.includes('submitResult')) {
          window.postMessage('select-menu__submit-result', {
            group: groupObject.id,
            item: itemObject.id
          })
            .catch(error => {
              console.error('select-menu__submit-result', error);
            });
        }
      });

      group.append(item);
    });

    menuList.append(group);
  });

  // TODO: Find another way to do this, because it defeats the usage of DocumentFragment.
  while (list.lastChild) {
    list.removeChild(list.lastChild);
  }

  list.append(menuList);

  groups = document.querySelectorAll('.select-menu__group');
  items = document.querySelectorAll('.select-menu__item');
  // TODO: set current item, if available.

  if (current) {
    current.scrollIntoView({
      block: 'center'
    });
  }
}



function filterMenu(query) {
  // TODO: Improve this!!!
  const words = query.trim().toLowerCase().split(' ').filter(word => word.length > 0 && word !== ' ');

  let numberOfResults = 0;

  if (words.length > 0) {
    if (groups.length > 0) {
      groups.forEach(group => {
        const items = group.querySelectorAll('.select-menu__item');
        let groupHasResults = false;

        items.forEach(item => {
          const itemHasResults = words.every(word => item.textContent.toLowerCase().includes(word));

          item.classList.toggle('select-menu__item--hidden', !itemHasResults);
          numberOfResults += itemHasResults ? 1 : 0;

          if (itemHasResults) {
            groupHasResults = true;
          }
        });

        group.classList.toggle('select-menu__group--hidden', !groupHasResults);
      });
    } else {
      items.forEach(item => {
        const itemHasResults = words.every(word => item.textContent.toLowerCase().includes(word));

        item.classList.toggle('select-menu__item--hidden', !itemHasResults);
        numberOfResults += itemHasResults ? 1 : 0;
      });
    }
  } else {
    groups.forEach(group => {
      group.classList.remove('select-menu__group--hidden');
    });

    items.forEach(item => {
      item.classList.remove('select-menu__item--hidden');
    });
  }

  if (window.loci.actions?.includes('filterResult')) {
    window.postMessage('select-menu__filter-result', numberOfResults)
      .catch(error => {
        console.error('select-menu__filter-result', error);
      });
  }
}



function navigateMenu(key) {
  // TODO: Store this globally to avoid regenerating it everytime.
  //       Should be updated on `filterMenu()` or via MutationObserver.
  const visibleItems = [...items].filter(item => item.classList.contains('select-menu__item--hidden') === false);
  // If there isn't a current, `indexOf` will return `-1`, which will be clamped to `0` in `siblingIndex`,
  // resulting in the selection of the first item in `sibling`.
  const currentIndex = visibleItems.indexOf(current);
  const siblingIndex = Math.min(Math.max(currentIndex + (key === 'ArrowUp' ? -1 : 1), 0), visibleItems.length - 1);
  const sibling = visibleItems[siblingIndex];

  if (sibling) {
    if (current) {
      current.classList.remove('select-menu__item--selected', 'select-menu__item--current');
    }

    sibling.focus();
    sibling.scrollIntoView({
      block: 'center'
    });
    sibling.classList.add('select-menu__item--selected', 'select-menu__item--current');

    current = sibling;
  }

  if (window.loci.actions?.includes('navigationResult')) {
    window.postMessage('select-menu__navigation-result', {
      group: current.parentElement.dataset.group,
      item: current.dataset.value
    })
      .catch(error => {
        console.error('select-menu__navigation-result', error);
      });
  }
}



input.addEventListener('input', () => {
  filterMenu(input.value);
});



window.addEventListener('blur', () => {
  [...items].find(item => item.classList.contains('select-menu__item--selected'))
    ?.classList.remove('select-menu__item--selected');
});



window.addEventListener('keydown', event => {
  if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
    event.preventDefault();
    navigateMenu(event.key);
  }
});
