import BrowserWindow from 'sketch-module-web-view';

import theme from '../theme';



export function create(id, options) {
  const window = new BrowserWindow({
    identifier: `loci.select-popover.${id}`,
    parent: options.parent,
    width: 214,
    height: 203,
    hidesOnDeactivate: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    fullscreenable: false,
    show: false,
    frame: false,
    acceptFirstMouse: true,
    transparent: true
  });


  window.setAlwaysOnTop(true, 'pop-up-menu', 0.2);


  window.loadURL(require('../../../build/select-popover.html'));


  window.once('ready-to-show', () => {
    window.webContents.executeJavaScript(`setTheme(${JSON.stringify(theme())});`)
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

    if (options?.search === false) {
      window.webContents.executeJavaScript('hideSearch()')
        .then(() => {
          window.show();
          options.parent.focus();
        })
        .catch(error => {
          console.error('hideSearch', error);
        });
    } else {
      window.show();
    }
  });


  if (typeof options.search === 'undefined' || options.search !== false) {
    window.once('blur', () => {
      window.close();
    });
  }


  window.webContents.on('select-menu-results', results => {
    const mainWindow = BrowserWindow.fromId('loci.main');

    if (results > 0) {
      window.show();
      mainWindow.focus();
    } else {
      window.hide();
    }
  });


  return window;
}
