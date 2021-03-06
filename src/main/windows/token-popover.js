import BrowserWindow from 'sketch-module-web-view';

import theme from '../utils/theme';
import constants from '../../common/constants';
import * as selectPopover from './select-popover';



export function create(options) {
  const window = new BrowserWindow({
    identifier: constants.TOKEN_POPOVER_WINDOW_ID,
    parent: BrowserWindow.fromId(constants.MAIN_WINDOW_ID),
    width: 228,
    height: 306,
    // hidesOnDeactivate: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    fullscreenable: false,
    show: false,
    frame: false,
    acceptsFirstMouse: true,
    transparent: true,
    webPreferences: {
      devTools: false
    }
  });


  window.setAlwaysOnTop(true, 'pop-up-menu', 0.1);


  window.loadURL(require('../../../build/token-popover.html'));


  window.once('ready-to-show', () => {
    window.webContents.executeJavaScript(`setTheme("${theme()}");`)
      .catch(error => {
        console.error('setTheme', error);
      });

    const popoverBounds = window.getBounds();
    const minLeft = 139;
    const maxLeft = options.parentBounds.width - popoverBounds.width - 7;
    const offsetX = options.parentBounds.x;
    const offsetY = options.parentBounds.y - options.parentBounds.height + popoverBounds.height;
    const offsetTip = 6;
    const anchorCenterX = options.anchorBounds.x + (options.anchorBounds.width / 2);
    const anchorBottomY = options.anchorBounds.y + options.anchorBounds.height;

    let popoverX = anchorCenterX - (popoverBounds.width / 2);
    popoverX = Math.min(Math.max(popoverX, minLeft), maxLeft);

    window.setPosition(Math.round(offsetX + popoverX), Math.round(offsetY + anchorBottomY + offsetTip));

    window.webContents.executeJavaScript(`setTokenConfig(${JSON.stringify(options.tokenConfig)})`)
      .catch(error => {
        console.error('setTokenConfig', error);
      });

    // TODO: Still need to check if window was placed in the expected position.
    //       If the parent window is outside monitor bounds, the popover window will try to stay fully inside monitor bounds,
    //       overriding the provided coordinates.
    //       If bounds are still not enough, we need to enable scroll on popover body.
    //       We can't rely on the previous position. We need to ask for window bounds again.
    window.webContents.executeJavaScript(`setPopoverCaretPosition(${anchorCenterX - (Math.round(offsetX + popoverX) - offsetX)})`)
      .then(() => {
        window.show();
      })
      .catch(error => {
        console.error('setPopoverCaretPosition', error);
      });
  });


  window.on('blur', () => {
    const selectMenuPopover = BrowserWindow.fromId(constants.SELECT_WINDOW_ID);

    // HACK: Setting timeout to force getting `isFocused()` in the right time.
    setTimeout(() => {
      if (selectMenuPopover?.isFocused() !== 1) {
          window.close();
        }
    }, 0);
  });


  window.webContents.on('update-popover-height', height => {
    const bounds = window.getBounds();
    const newBounds = Object.assign({}, bounds);

    newBounds.height = height;
    newBounds.y = bounds.y + (height - bounds.height);

    window.setBounds(newBounds);
  });


  window.webContents.on('update-token-config', tokenConfig => {
    const mainWindow = BrowserWindow.fromId(constants.MAIN_WINDOW_ID);

    // FIXME: BrowserWindow somehow silently breaks internally on this step,
    //        making new window instances not having their frame positions persisted.
    mainWindow.webContents.executeJavaScript(`updateTokenConfig("${options.id}", ${JSON.stringify(tokenConfig)})`)
      .catch(error => {
        console.error('updateTokenConfig', error);
      });
  });


  window.webContents.on('open-select', options => {
    const selectMenuPopover = BrowserWindow.fromId(constants.SELECT_WINDOW_ID);

    if (!selectMenuPopover) {
      selectPopover.create(constants.SELECT_WINDOW_ID, {
        parent: window,
        anchorBounds: options.anchorBounds,
        placeholder: options.placeholder,
        multiple: options.multiple,
        menu: options.menu,
        actions: {
          submitResult: selectSubmitResult
        }
      });
    }

    function selectSubmitResult(selectedItems) {
      window.webContents.executeJavaScript(`updateSelectResult("${options.name}", ${JSON.stringify(selectedItems)})`)
        .catch(error => {
          console.error('updateSelectResult', error);
        });

      const selectMenuPopover = BrowserWindow.fromId(constants.SELECT_WINDOW_ID);

      if (selectMenuPopover) {
        selectMenuPopover.close();
        options.parent?.focus();
      }
    }
  });


  return window;
}
