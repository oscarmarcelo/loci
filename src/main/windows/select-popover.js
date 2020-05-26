import BrowserWindow from 'sketch-module-web-view';

import theme from '../utils/theme';
import constants from '../../common/constants';


/**
 * Create a Select Popover.
 * @param {string} id - The BrowserWindow identifier.
 * @param {Object[]} options - Additional options.
 * @param {Object} options[].parent - The parent BrowserWindow.
 * @param {Object} options[].anchorBounds - The rectangle bounds of the anchor that triggered the popover opening.
 * @param {string} [options[].align='center'] - The popover alignment. It accepts `left` and `center`.
 * @param {boolean} options[].search - If set to `false`, the select popover will not have the search field.
 * @param {string} options[].placeholder - The placeholder for the search input. This option is ignored if `options.search` is set to `false`.
 * @param {boolean} options[].multiple - Wether the select menu will accept multiple selected items.
 * @param {Object[]} options[].menu - The list of options that will compose the select menu.
 * @param {string} options[].menu[].id - The item ID. It will be used as `<option>` value if it is an item, or `[data-group]` if it is a group.
 * @param {string} options[].menu[].name - The item name. It will be the visual text of the item or group.
 * @param {boolean} options[].menu[].selected - The item selection state. It will be ignored if it's a group.
 * @param {Object} options[].menu[].items - Using this property will turn the item into a group. It accepts all `options.menu` properties, except for `options.menu.items`.
 * @param {Array[]} options[].actions - The list of actions that the select is subscribed. Its accepts `filterResult`, `navigationResult`, and `submitResult`.
 * @param {function} options[].actions[].filterResult - Called when the select filters the select menu based on search input or provided via `filterMenu()`.
 * @param {function} options[].actions[].navigationResult - Called when the user navigated the select menu using `ArrowUp` or `ArrowDown` keys.
 * @param {function} options[].actions[].submitResult - Called when the user selects a select menu item.
 * @returns {object} The BrowserWindow instance.
 */
export function create(id, options) {
  const window = new BrowserWindow({
    identifier: id,
    parent: options.parent,
    width: 214,
    height: 203,
    // hidesOnDeactivate: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    fullscreenable: false,
    show: false,
    frame: false,
    acceptsFirstMouse: true,
    transparent: true
  });


  window.setAlwaysOnTop(true, 'pop-up-menu', 0.2);


  window.loadURL(require('../../../build/select-popover.html'));


  window.once('ready-to-show', () => {
    window.webContents.executeJavaScript(`setTheme("${theme()}");`)
      .catch(error => {
        console.error('setTheme', error);
      });

    const parentBounds = options.parent.getBounds();
    const popoverBounds = window.getBounds();
    const offsetX = parentBounds.x;
    const offsetY = parentBounds.y - parentBounds.height + popoverBounds.height;
    const offsetTip = 6;
    const anchorLeftX = options.anchorBounds.x + (options.align === 'left' ? 8 : (options.anchorBounds.width / 2));
    const anchorBottomY = options.anchorBounds.y + options.anchorBounds.height;

    let popoverX = anchorLeftX - (popoverBounds.width / 2);

    window.setPosition(Math.round(offsetX + popoverX), Math.round(offsetY + anchorBottomY + offsetTip));

    if (options.multiple) {
      window.webContents.executeJavaScript(`window.loci.multiple = true;`)
        .catch(error => {
          console.error('set multiple', error);
        });
    }

    if (options.actions) {
      window.webContents.executeJavaScript(`window.loci.actions = ${JSON.stringify(Object.keys(options.actions))};`)
        .catch(error => {
          console.error('set actions', error);
        });
    }

    window.webContents.executeJavaScript(`setMenu(${JSON.stringify(options.menu)})`)
      .catch(error => {
        console.error('setMenu', error);
      });

    if (options.search === false) {
      window.webContents.executeJavaScript('hideSearch()')
        .catch(error => {
          console.error('hideSearch', error);
        });
    } else if (options.placeholder) {
      window.webContents.executeJavaScript(`setPlaceholder("${options.placeholder}")`)
        .then(() => {
          window.show();
        })
        .catch(error => {
          console.error('setPlaceholder', error);
        });
    } else {
      window.show();
    }
  });


  if (options.search !== false) {
    window.on('blur', () => {
      window.close();

      // HACK: Setting timeout to force getting `isFocused()` in the right time.
      setTimeout(() => {
        if (options.parent?.id === constants.TOKEN_POPOVER_WINDOW_ID && Boolean(options.parent?.isFocused()) === false) {
          options.parent.close();
        }
      }, 0)
    });
  }


  if (options.actions?.filterResult) {
    window.webContents.on('select-menu__filter-result', numberOfResults => {

      options.actions.filterResult(numberOfResults);
    });
  }


  if (options.actions?.navigationResult) {
    window.webContents.on('select-menu__navigation-result', highlightedItem => {

      options.actions.navigationResult(highlightedItem);
    });
  }


  if (options.actions?.submitResult) {
    window.webContents.on('select-menu__submit-result', selectedItems => {
      options.actions.submitResult(selectedItems);
    });
  }


  return window;
}
