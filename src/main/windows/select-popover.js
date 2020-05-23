import BrowserWindow from 'sketch-module-web-view';

import theme from '../utils/theme';



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
    const anchorLeftX = options.anchorBounds.x + 8;
    const anchorBottomY = options.anchorBounds.y + options.anchorBounds.height;

    let popoverX = anchorLeftX - (popoverBounds.width / 2);

    window.setPosition(Math.round(offsetX + popoverX), Math.round(offsetY + anchorBottomY + offsetTip));

    if (options.actions) {
      window.webContents.executeJavaScript(`setActions(${JSON.stringify(Object.keys(options.actions))})`)
        .catch(error => {
          console.error('setActions', error);
        });
    }

    window.webContents.executeJavaScript(`setMenu(${JSON.stringify(options.menu)})`)
      .catch(error => {
        console.error('setMenu', error);
      });

    if (options.search === false) {
      window.webContents.executeJavaScript('hideSearch()')
        .then(() => {
          window.showInactive();
        })
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
    window.once('blur', () => {
      console.log('closing')
      window.close();
    });
  }


  if (options.actions?.filterResult) {
    window.webContents.on('select-menu__filter-result', numberOfResults => {

      options.actions.filterResult(numberOfResults);
    });
  }


  if (options.actions?.navigationResult) {
    window.webContents.on('select-menu__navigation-result', item => {

      options.actions.navigationResult(item);
    });
  }


  if (options.actions?.submitResult) {
    window.webContents.on('select-menu__submit-result', item => {

      options.actions.submitResult(item);
    });
  }


  return window;
}
