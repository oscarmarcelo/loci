import {getSelectedDocument, Settings} from 'sketch';

import BrowserWindow from 'sketch-module-web-view';
import MochaJSDelegate from 'mocha-js-delegate';

import constants from '../../constants';
import * as tokenPopover from './token-popover';
import * as selectPopover from './select-popover';
import theme from '../theme';
import {get as getData} from '../../renderer/src/scripts/data';



function createWindow() {
  const window = new BrowserWindow({
    identifier: constants.MAIN_WINDOW_ID,
    width: 374,
    height: 219,
    remembersWindowFrame: true,
    // hidesOnDeactivate: false, // TODO: Find a way to keep window always on top of Sketch, but not on top of other apps.
    minWidth: 374,
    minHeight: 219 - 37, // Somehow, 37px are added to minHeight
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    fullscreenable: false,
    show: false,
    titleBarStyle: 'hidden',
    acceptsFirstMouse: true,
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

    threadDictionary[constants.MAIN_WINDOW_OBSERVERS] = delegate;

    window.show();
  });


  window.on('close', () => {
    // TODO: Consider listing all window ids somewhere on creation.
    const windowIds = [
      constants.TOKEN_POPOVER_WINDOW_ID,
      constants.DATA_SUGGESTIONS_WINDOW_ID
    ];

    for (const id of windowIds) {
      const window = BrowserWindow.fromId(id);

      if (window) {
        window.close();
      }
    }
  });


  window.on('closed', () => {
    const delegate = threadDictionary[constants.MAIN_WINDOW_OBSERVERS];

    if (delegate) {
      NSNotificationCenter.defaultCenter().removeObserver(delegate);
      threadDictionary.removeObjectForKey(constants.MAIN_WINDOW_OBSERVERS);
    }
  });


  window.webContents.on('open-token-popover', message => {
    const payload = Object.assign(message, {
      parentBounds: window.getBounds()
    });

    tokenPopover.create(payload);
  });


  window.webContents.on('data-suggestion', message => {
    let popover = BrowserWindow.fromId(constants.DATA_SUGGESTIONS_WINDOW_ID);

    if (!popover) {
      popover = selectPopover.create(constants.DATA_SUGGESTIONS_WINDOW_ID, {
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
    const popover = BrowserWindow.fromId(constants.DATA_SUGGESTIONS_WINDOW_ID);

    if (popover) {
      popover.close();
    }
  });


  window.webContents.on('navigate-data-suggestions', key => {
    const popover = BrowserWindow.fromId(constants.DATA_SUGGESTIONS_WINDOW_ID);

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
      Settings.setLayerSettingForKey(item, 'dataConfig', dataConfig);

      // TODO: Exit edit mode before applying text, or data be lost if exiting after.
      item.text = generateData(dataConfig);

      const nativeItem = item.sketchObject;
      const userInfo = nativeItem.userInfo().mutableCopy();

      // TODO: Find a way to get the identifier without hardcoding it.
      userInfo.setValue_forKey([constants.PLUGIN_ID, '__index', constants.DATA_SUPPLIER_ACTION].join('_'), 'datasupplier.key');
      nativeItem.setUserInfo(userInfo);
    });
  });
}



export function create() {
  const window = BrowserWindow.fromId(constants.MAIN_WINDOW_ID);
  if (window) {
    window.show();
    window.focus();
  } else {
    createWindow();
  }
}



export function generateData(dataConfig) {
  let result = '';

  for (const tokenConfig of dataConfig.tokens) {
    if (tokenConfig.type === 'data') {
      const dataItem = getData(tokenConfig.config.data.group, tokenConfig.config.data.item);

      result += dataItem.handler(tokenConfig.config);
    } else if (tokenConfig.type === 'newline') {
      result += '\u2029';
    } else if (tokenConfig.type === 'shift-newline') {
      result += '\u2028';
    } else {
      result += tokenConfig.text;
    }
  }

  const limitMax = Number.parseInt(dataConfig.general['limit-max'], 10);

  if (limitMax) {
    let splits;

    if (dataConfig.general['limit-unit'] === 'character') {
      splits = result.split('');

      if (splits.length > limitMax) {
        result = result.slice(0, limitMax);
      }
    } else if (dataConfig.general['limit-unit'] === 'word') {
      splits = result.match(/\s*\S+/g);

      if (splits.length > limitMax) {
        result = splits.slice(0, limitMax).join('');
      }
    }

    if (dataConfig.general.ellipsis && splits.length > limitMax) {
      result += '\u2026';
    }
  }

  return result;
}



export function close() {
  const window = BrowserWindow.fromId(constants.MAIN_WINDOW_ID);
  if (window) {
    window.close();
  }
}
