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
    // hidesOnDeactivate: false, // TODO: Find a way to keep window always on top of Sketch, but not on top of other apps.
    // remembersWindowFrame: true, // FIXME: HACK: Using workaround to manually store frame until this feature becomes reliable.
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


  // HACK: Workaround until `remembersWindowFrame` reliability is fixed.
  const lastFrame = Settings.settingForKey(`${constants.MAIN_WINDOW_ID}.frame`);

  if (lastFrame) {
    // TODO: We still need to handle differences of screen boundaries between sessions:
    //       - When there's a different amount of displays, screen resolutions, or screen arrangements (macOS seems to already handle this, but we need to check for edge cases);
    //       - When Sketch is placed in a different screen than `lastFrame`, the plugin should probabily open in that screen instead.
    window.setBounds(lastFrame);
  }


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

    const items = getSelectedDocument()?.selectedLayers?.layers || [];

    if (items) {
      setSelection(items);
    }

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

    // HACK: Workaround until `remembersWindowFrame` reliability is fixed.
    Settings.setSettingForKey(`${constants.MAIN_WINDOW_ID}.frame`, window.getBounds());
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
    const items = getSelectedDocument()?.selectedLayers?.layers || [];

    items.forEach(item => {
      if (item.type === 'Text') {
        // TODO: Exit edit mode before applying text, or applied data be lost when exiting afterwards.
        item.text = generateData(dataConfig);

        Settings.setLayerSettingForKey(item, 'dataConfig', dataConfig);

        const nativeItem = item.sketchObject;
        const userInfo = nativeItem.userInfo().mutableCopy();

        // TODO: Find a way to get the identifier without hardcoding it.
        userInfo.setValue_forKey([constants.PLUGIN_ID, '__index', constants.DATA_SUPPLIER_ACTION].join('_'), 'datasupplier.key');
        nativeItem.setUserInfo(userInfo);
      } else if (item.type === 'SymbolInstance') {
        // `selectedLayers()` gives us only the selected symbols, not the selected overrides. We need to get them ouserselves.
        let overrides = item.overrides.filter(override => override.selected);

        // If there are no selected overrides, it means we should apply data to all of them.
        if (overrides.length === 0) {
          overrides = item.overrides;
        }

        // Get only the text overrides.
        overrides = overrides.filter(override => override.property === 'stringValue');

        const symbolDataConfig = Settings.layerSettingForKey(item, 'symbolDataConfig') || {};

        overrides.forEach(override => {
          override.value = generateData(dataConfig);

          // REVIEW [>=1.0.0]: API says we can store a setting in a Override.
          //                   We should store in the Override instead, but last time we tried, it thrown errors.
          symbolDataConfig[override.id] = dataConfig;
        });

        Settings.setLayerSettingForKey(item, 'symbolDataConfig', symbolDataConfig);
      }
    });
  });
}



export function create() {
  const window = BrowserWindow.fromId(constants.MAIN_WINDOW_ID);
  if (window) {
    window.show();
    // TODO: We also need to bring the window to visibility when it is hidden in an inactive window space.
    //       Probably need to check with NSPanel.isOnActiveSpace() and NSPanel.CollectionBehavior.moveToActiveSpace().
    //       Or this probably won't be needed if we make the window to always show on the same space as Sketch's.
    window.focus();
  } else {
    createWindow();
  }
}



export function setSelection(items) {
  const window = BrowserWindow.fromId(constants.MAIN_WINDOW_ID);

  const getSelectedOverrides = symbol => {
    let result = [];

    if (symbol?.overrides) {
      let overrides = [];

      // If the symbol has only one override, consider it always selected.
      if (symbol.overrides.length === 1) {
        overrides = overrides.push(overrides[0]);
      } else {
        overrides = symbol.overrides.filter(({selected}) => selected);

        // if no overrides are selected, then consider all of them.
        if (overrides.length === 0) {
          overrides = symbol.overrides;
        }
      }

      // Then get only the text overrides.
      result = overrides.filter(({property}) => property === 'stringValue');
    }

    return result;
  };

  const getOverrideDataConfig = (symbol, override) =>
    Settings.layerSettingForKey(symbol, 'symbolDataConfig')?.[override.id] ||
    Settings.layerSettingForKey(override.affectedLayer, 'dataConfig');


  if (window) {
    const selection = items.filter(item => {
      let result = false;

      if (item.type === 'Text') {
        result = Boolean(Settings.layerSettingForKey(item, 'dataConfig'));
      } else if (item.type === 'SymbolInstance' && item?.overrides.length > 0) {
        const overrides = getSelectedOverrides(item);

        if (overrides.length > 0) {
          result = overrides.find(override => Boolean(getOverrideDataConfig(item, override)));
        }
      }

      return result;
    });

    let dataConfig = {};

    if (selection.length > 0) {
      // TODO: Handle multiple selections.
      if (selection[0].type === 'Text') {
        dataConfig = Settings.layerSettingForKey(selection[0], 'dataConfig');
      } else if (selection[0].type === 'SymbolInstance') {
        dataConfig = getOverrideDataConfig(selection[0], getSelectedOverrides(selection[0])[0]);
      }
    }

    // FIXME: BrowserWindow somehow silently breaks internally on this step, breaking `remembersWindowFrame` feature.
    window.webContents.executeJavaScript(`setDataConfig(${JSON.stringify(dataConfig)})`)
      .catch(error => {
        console.error('setDataConfig', error);
      });
  }
}



export function generateData(dataConfig) {
  let result = '';

  dataConfig.tokens?.forEach(tokenConfig => {
    // TODO: Handle Chance of Appearance.
    if (tokenConfig.type === 'data') {
      const dataItem = getData(tokenConfig.config.data.group, tokenConfig.config.data.item);

      result += dataItem.generator(tokenConfig.config);
    } else if (tokenConfig.type === 'newline') {
      result += '\u2029';
    } else if (tokenConfig.type === 'shift-newline') {
      result += '\u2028';
    } else {
      result += tokenConfig.text;
    }
  });

  // TODO: Handle limit-min field.

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
