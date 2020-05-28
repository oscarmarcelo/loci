const search = document.querySelector('.select-menu__search');
const input = document.querySelector('.select-menu__search-input');
const list = document.querySelector('.select-menu__list');

let groups;
let items;
let selectedItems;



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
//       if (mutation.target.classList.contains('select-menu__item--selected')) {
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

  let hasFirstToNavigate;

  const setMenuItem = (parent, itemObject) => {
    const item = document.createElement('button');

    item.classList.add('select-menu__item');
    item.dataset.value = itemObject.id;
    item.textContent = itemObject.name;

    if (itemObject.selected) {
      item.classList.add('select-menu__item--selected');

      if (hasFirstToNavigate !== true) {
        item.classList.add('js-first-to-navigate');
        hasFirstToNavigate = true;
      }
    }

    item.addEventListener('mousedown', () => {
      [...items].find(item => item.classList.contains('select-menu__item--highlighted'))
        ?.classList.remove('select-menu__item--highlighted');

      if (window.loci.multiple !== true) {
        [...items].find(item => item.classList.contains('select-menu__item--selected'))
          ?.classList.remove('select-menu__item--selected');
      }

      item.classList.toggle('select-menu__item--highlighted', 'select-menu__item--selected');
    });

    item.addEventListener('click', () => {
      if (window.loci.multiple) {
        if(item.classList.contains('select-menu__item--selected')) {
          const selectedIndex = selectedItems.findIndex(selectedItem => selectedItem === item);

          if (selectedIndex > -1) {
            selectedItems.splice(selectedIndex, 1);
          }
        } else {
          selectedItems.push(item);
        }
      } else {
        selectedItems[0] = item;
      }

      if (window.loci.actions?.includes('submitResult')) {
        const result = selectedItems.map(selectedItem => {
          let currentItem;

          if (selectedItem.parentElement.dataset.group) {
            currentItem = {
              group: selectedItem.parentElement.dataset.group,
              item: selectedItem.dataset.value
            };
          } else {
            currentItem = selectedItem.dataset.value
          }

          return currentItem;
        });

        window.postMessage('select-menu__submit-result', result)
          .catch(error => {
            console.error('select-menu__submit-result', error);
          });
      }
    });

    parent.append(item);
  };

  menu.forEach(itemObject => {
    if (Array.isArray(itemObject.items)) {
      const group = document.createElement('div');
      const heading = document.createElement('div');

      group.classList.add('select-menu__group');
      group.dataset.group = itemObject.id;

      heading.classList.add('select-menu__heading', 'heading-1');
      heading.textContent = itemObject.name;

      group.append(heading);

      itemObject.items.forEach(subItemObject => {
        setMenuItem(group, subItemObject);
      });

      menuList.append(group);
    } else {
      setMenuItem(menuList, itemObject);
    }
  });

  // TODO: Find another way to do this, because it defeats the usage of DocumentFragment.
  while (list.lastChild) {
    list.removeChild(list.lastChild);
  }

  list.append(menuList);

  groups = document.querySelectorAll('.select-menu__group');
  items = document.querySelectorAll('.select-menu__item');
  selectedItems = [...items].filter(item => item.classList.contains('select-menu__item--selected'));

  if (selectedItems.length > 0) {
    selectedItems[0].scrollIntoView({
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
  const highlightedItem = [...items].find(item => item.classList.contains('select-menu__item--highlighted')) || [...items].find(item => item.classList.contains('js-first-to-navigate'));
  const visibleHighlightedIndex = highlightedItem ? visibleItems.indexOf(highlightedItem) : -1;
  const visibleSiblingIndex = Math.min(Math.max(visibleHighlightedIndex + (key === 'ArrowUp' ? -1 : 1), 0), visibleItems.length - 1);
  const visibleSibling = visibleItems[visibleSiblingIndex];

  // TODO: Interrupt function if navigation is already at the edge to avoid sending unncessary IPC.

  if (highlightedItem) {
    highlightedItem.classList.remove('select-menu__item--highlighted', 'js-first-to-navigate');
  }

  visibleSibling.classList.add('select-menu__item--highlighted');
  visibleSibling.scrollIntoView({
    block: 'center'
  });

  if (window.loci.actions?.includes('navigationResult')) {
    let highlightedItem;

    if (visibleSibling.parentElement.dataset.group) {
      highlightedItem = {
        group: visibleSibling.parentElement.dataset.group,
        item: visibleSibling.dataset.value
      };
    } else {
      highlightedItem = visibleSibling.dataset.value;
    }

    window.postMessage('select-menu__navigation-result', highlightedItem)
      .catch(error => {
        console.error('select-menu__navigation-result', error);
      });
  }
}



input.addEventListener('input', () => {
  filterMenu(input.value);
});



window.addEventListener('blur', () => {
  [...items].find(item => item.classList.contains('select-menu__item--highlighted'))
    ?.classList.remove('select-menu__item--highlighted');
});



window.addEventListener('keydown', event => {
  if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
    event.preventDefault();
    navigateMenu(event.key);
  } else if (event.key === 'Enter') {
    [...items].find(item => item.classList.contains('select-menu__item--highlighted')).click();
  }
});
