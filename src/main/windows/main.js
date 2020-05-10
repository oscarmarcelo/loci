import {getSelectedDocument, Settings} from 'sketch';

import BrowserWindow from 'sketch-module-web-view';
import MochaJSDelegate from 'mocha-js-delegate';

import * as tokenPopover from './token-popover';
import * as selectPopover from './select-popover';
import theme from '../theme';
import dataHandler from '../../renderer/src/scripts/data';



function createWindow() {
  const window = new BrowserWindow({
    identifier: 'loci.main',
    width: 374,
    height: 219,
    hidesOnDeactivate: false,
    remembersWindowFrame: true,
    minWidth: 374,
    minHeight: 219 - 37, // Somehow, 37px are added to minHeight
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    fullscreenable: false,
    show: false,
    titleBarStyle: 'hidden',
    acceptFirstMouse: true,
    vibrancy: 'sidebar',
    webPreferences: {
      // TODO [>=1.0.0]: Enable this and disable context menu except for non-input/menu controls.
      // devTools: false
    }
  });

  const nativeWindow = window.getNativeWindowHandle();

  // TODO: Find a way to remove the miniaturize and zoom buttons instead of hidding it.
  nativeWindow.standardWindowButton(NSWindowMiniaturizeButton).setHidden(true);
  nativeWindow.standardWindowButton(NSWindowZoomButton).setHidden(true);

  // Some third-party macOS utilities check the zoom button's enabled state to
  // determine whether to show custom UI on hover, so we disable it here to
  // prevent them from doing so in a frameless app window.
  nativeWindow.standardWindowButton(NSWindowZoomButton).setEnabled(false);
  nativeWindow.standardWindowButton(NSWindowMiniaturizeButton).setEnabled(false);

  nativeWindow.standardWindowButton(NSWindowCloseButton).setFrameOrigin(NSMakePoint(8.5, 18));
  nativeWindow.standardWindowButton(NSWindowZoomButton).setFrameOrigin(NSMakePoint(8.5, 40));
  nativeWindow.standardWindowButton(NSWindowMiniaturizeButton).setFrameOrigin(NSMakePoint(8.5, 40));


  // Window should lose vibrancy, as per macOS guidelines.
  window._vibrantView.setState(NSVisualEffectStateFollowsWindowActiveState);


  window.loadURL(require('../../../build/main.html'));


  const threadDictionary = NSThread.mainThread().threadDictionary();


  window.once('ready-to-show', () => {
    window.webContents.executeJavaScript(`setTheme("${theme()}");`)
      .catch(error => {
        console.error('setTheme', error);
      });

    const delegate = new MochaJSDelegate({
      'onAccentChange:': _ => {
        // FIXME: This notification triggers twice.
        window.webContents.executeJavaScript(`setTheme("${theme()}");`)
          .catch(error => {
            console.error('setTheme (Accent Changed)', error);
          });
      },
      'onResize:': _ => {
        // Reposition traffic lights, since their positions reset when the window resizes.
        nativeWindow.standardWindowButton(NSWindowCloseButton).setFrameOrigin(NSMakePoint(8.5, 18));
        nativeWindow.standardWindowButton(NSWindowMiniaturizeButton).setFrameOrigin(NSMakePoint(8.5, 40));
        nativeWindow.standardWindowButton(NSWindowZoomButton).setFrameOrigin(NSMakePoint(8.5, 40));
      }
    }).getClassInstance();

    NSNotificationCenter.defaultCenter().addObserver_selector_name_object(delegate, NSSelectorFromString('onAccentChange:'), NSSystemColorsDidChangeNotification, nil);
    NSNotificationCenter.defaultCenter().addObserver_selector_name_object(delegate, NSSelectorFromString('onResize:'), NSWindowDidResizeNotification, nil);

    threadDictionary['loci.main.observers'] = delegate;

    window.show();
  });


  window.on('close', () => {
    // TODO: Consider listing all window ids somewhere on creation.
    const windowIds = [
      'loci.token-popover',
      'loci.select-popover.data-suggestions'
    ];

    for (const id of windowIds) {
      const window = BrowserWindow.fromId(id);

      if (window) {
        window.close();
      }
    }
  });


  window.on('closed', () => {
    const delegate = threadDictionary['loci.main.observers'];

    if (delegate) {
      NSNotificationCenter.defaultCenter().removeObserver(delegate);
      threadDictionary.removeObjectForKey('loci.main.observers');
    }
  });


  window.webContents.on('open-token-popover', message => {
    const payload = Object.assign(message, {
      parentBounds: window.getBounds()
    });

    tokenPopover.create(payload);
  });


  window.webContents.on('data-suggestion', message => {
    let popover = BrowserWindow.fromId('loci.select-popover.data-suggestions');

    if (!popover) {
      popover = selectPopover.create('data-suggestions', {
        parent: window,
        anchorBounds: message.anchorBounds,
        search: false
      });
    }

    if (message.value.length > 0) {
      popover.webContents.executeJavaScript(`filterOptions("${message.value}")`)
        .catch(error => {
          console.error('filterOptions', error);
        });
    } else {
      popover.hide();
    }
  });


  window.webContents.on('close-data-suggestions', () => {
    const popover = BrowserWindow.fromId('loci.select-popover.data-suggestions');

    if (popover) {
      popover.close();
    }
  });


  window.webContents.on('navigate-data-suggestions', key => {
    const popover = BrowserWindow.fromId('loci.select-popover.data-suggestions');

    if (popover) {
      popover.webContents.executeJavaScript(`navigateOptions("${key}")`)
        .catch(error => {
          console.error('navigateOptions', error);
        });
    }
  });


  window.webContents.on('apply-data', dataConfig => {
    const document = getSelectedDocument();
    const items = document ? document.selectedLayers.layers : [];

    items.forEach(item => {
      Settings.setLayerSettingForKey(item, 'data', dataConfig);

      // TODO: Exit edit mode before applying text, or data be lost if exiting after.
      item.text = generateData(dataConfig);

      const nativeItem = item.sketchObject;
      const userInfo = nativeItem.userInfo().mutableCopy();

      // TODO: Find a way to get the identifier without hardcoding it.
      userInfo.setValue_forKey('com.oscarmarcelo.loci___index_SupplyData', 'datasupplier.key');
      nativeItem.setUserInfo(userInfo);
    });
  });
}

export function create() {
  const window = BrowserWindow.fromId('loci.main');
  if (window) {
    window.show();
    window.focus();
  } else {
    createWindow();
  }
}



export function generateData(dataConfig) {
  let result = '';

  for (const tokenConfig of dataConfig) {
    if (tokenConfig.type === 'data') {
      const dataGroup = dataHandler.find(group => group.id === tokenConfig.config.data.group);
      const dataItem = dataGroup.items.find(item => item.default.id === tokenConfig.config.data.item);

      result += dataItem.handler(tokenConfig.config);
    } else if (tokenConfig.type === 'newline') {
      result += '\u2029';
    } else if (tokenConfig.type === 'shift-newline') {
      result += '\u2028';
    } else {
      result += tokenConfig.text;
    }
  }

  return result;
}



export function close() {
  const window = BrowserWindow.fromId('loci.main');
  if (window) {
    window.close();
  }
}
