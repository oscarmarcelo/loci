import {getDocuments, getSelectedDocument, DataSupplier, Settings, UI} from 'sketch';

import BrowserWindow from 'sketch-module-web-view';
import MochaJSDelegate from 'mocha-js-delegate';

import constants from '../../common/constants';
import * as tokenPopover from './token-popover';
import * as selectPopover from './select-popover';
import theme from '../utils/theme';
import {getSelectedOverrides, getOverrideDataConfig} from '../utils/overrides';
import {list as dataList, get as getData} from '../../renderer/src/scripts/data';



function createWindow(dataKey, items) {
  const window = new BrowserWindow({
    identifier: constants.MAIN_WINDOW_ID,
    width: 374,
    height: 219,
    // hidesOnDeactivate: false, // TODO: Find a way to keep window always on top of Sketch, but not on top of other apps.
    // remembersWindowFrame: true, // FIXME: HACK: Workaround until we find the reason why windows aren't being garbage collected on close.
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


  // HACK: Workaround until we find the reason why windows aren't being garbage collected on close.
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

    items = items || getSelectedDocument()?.selectedLayers?.layers || [];

    if (items) {
      setSelection(dataKey, items);
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

    // HACK: Workaround until we find the reason why windows aren't being garbage collected on close.
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


  window.webContents.on('data-suggestion', (suggestion, anchorBounds) => {
    let popover = BrowserWindow.fromId(constants.DATA_SUGGESTIONS_WINDOW_ID);

    if (!popover && suggestion?.length > 0) {
      console.log('creating popover');
      popover = selectPopover.create(constants.DATA_SUGGESTIONS_WINDOW_ID, {
        parent: window,
        anchorBounds: anchorBounds,
        search: false,
        menu: dataList.map(group => {
          return {
            id: group.id,
            name: group.name,
            items: group.items.map(({default: item}) => { // TODO: Find a way to make Webpack not export as named default.
              return {
                id: item.config.id,
                name: item.config.name
              }
            })
          }
        }),
        actions: {
          filterResult: dataSuggestionFilterResult,
          navigationResult: dataSuggestionNavigationResult,
          submitResult: dataSuggestionSubmitResult
        }
      });
    }

    if (suggestion?.length > 0) {
      console.log(`filter options: "${suggestion}", ${suggestion.length}`)
      popover.webContents.executeJavaScript(`filterMenu("${suggestion}")`)
        .catch(error => {
          console.error('filterMenu', error);
        });
    } else {
      console.log('hiding popover!');
      popover?.hide();
    }
  });


  function dataSuggestionFilterResult(numberOfResults) {
    const popover = BrowserWindow.fromId(constants.DATA_SUGGESTIONS_WINDOW_ID);

    if (popover && numberOfResults > 0) {
      console.log('showing')
      popover.showInactive();
    } else {
      console.log('hiding')
      popover.hide();
    }
  }


  function dataSuggestionNavigationResult(item) {
    window.webContents.executeJavaScript(`suggestionNavigationResult(${JSON.stringify(item)})`)
    .catch(error => {
      console.log('suggestionNavigationResult', error);
    })
  }


  function dataSuggestionSubmitResult(item) {
    window.webContents.executeJavaScript(`createToken(undefined, "data", "${getData(item.group, item.item).config.name}", ${JSON.stringify({data: item})}, false)`);

    const popover = BrowserWindow.fromId(constants.DATA_SUGGESTIONS_WINDOW_ID);

    if (popover) {
      console.log('closing')
      popover.close();
    }
  }


  window.webContents.on('navigate-data-suggestions', key => {
    const popover = BrowserWindow.fromId(constants.DATA_SUGGESTIONS_WINDOW_ID);

    if (popover) {
      popover.webContents.executeJavaScript(`navigateMenu("${key}")`)
        .catch(error => {
          console.error('navigateMenu', error);
        });
    }
  });



  window.webContents.on('close-data-suggestions', () => {
    const popover = BrowserWindow.fromId(constants.DATA_SUGGESTIONS_WINDOW_ID);

    if (popover && Boolean(popover.isFocused()) === false) {
      console.log('closing popover');
      popover.close();
    }
  });


  window.webContents.on('open-data-list-popover', anchorBounds => {
    const popover = BrowserWindow.fromId(constants.DATA_LIST_WINDOW_ID);

    if (!popover) {
      console.log('creating popover');
      selectPopover.create(constants.DATA_LIST_WINDOW_ID, {
        parent: window,
        anchorBounds: anchorBounds,
        placeholder: 'Search Data',
        menu: dataList.map(group => {
          return {
            id: group.id,
            name: group.name,
            items: group.items.map(({default: item}) => { // TODO: Find a way to make Webpack not export as named default.
              return {
                id: item.config.id,
                name: item.config.name
              }
            })
          }
        }),
        actions: {
          submitResult: dataListSubmitResult
        }
      });
    }
  });


  function dataListSubmitResult(item) {
    window.webContents.executeJavaScript(`createToken(undefined, "data", "${getData(item.group, item.item).config.name}", ${JSON.stringify({data: item})})`)
      .then(() => {
        const popover = BrowserWindow.fromId(constants.DATA_LIST_WINDOW_ID);

        if (popover) {
          console.log('closing popover');
          popover.close();
          window.focus();
        }
      })
      .catch(error => {
        console.error('createToken', error);
      });
  }


  window.webContents.on('apply-data', (dataKey, dataItems, dataConfig, documentId) => {
    if (getSelectedDocument().id !== documentId) {
      const document = getDocuments().find(({id}) => id === documentId);
      let documentName = document ? `document "${document.sketchObject.displayName()}"` : 'a document that isn\'t open anymore';

      UI.message(`⚠️ Can't apply data that was expected to be applied to ${documentName}.`);

      return;
    }

    if (dataItems?.length > 0) {
      dataItems.forEach(dataItem => {
        let symbol;
        let item;

        if (dataItem.type === 'text') {
          item = getSelectedDocument().getLayerWithID(dataItem.id);

          Settings.setLayerSettingForKey(item, 'dataConfig', dataConfig);
        } else {
          symbol = getSelectedDocument().getLayerWithID(dataItem.parent);

          const symbolDataConfig = Settings.layerSettingForKey(symbol, 'symbolDataConfig') || {};

          symbolDataConfig[dataItem.id] = dataConfig;

          Settings.setLayerSettingForKey(symbol, 'symbolDataConfig', symbolDataConfig);
        }

        // This happens when the user wants to use the plugin opened via Inspector Data Override more than once without changing selection.
        // `dataKey` can only be used once, and here it isn't available anymore.
        if (!dataKey) {
          let itemProperty = 'text';

          // TODO: Exit edit mode before applying text, or applied data be lost when exiting afterwards.
          if (dataItem.type === 'text' && item.sketchObject.isEditingText() == 1) {
            UI.message(`⚠️ ${constants.PLUGIN_NAME} can't update content of text layers in edit mode.`);
          }

          if (dataItem.type === 'override') {
            item = symbol.overrides.find(({id}) => id === dataItem.id);
            itemProperty = 'value';
          }

          item[itemProperty] = generateData(dataConfig);
        }
      });

      if (dataKey) {
        DataSupplier.supplyData(dataKey, Array.from(Array(dataItems.length)).map(_ => generateData(dataConfig)));
      }
    } else {
      // TODO [>=1.0.0]: Remove this. It's still here just to watch for edge cases.
      UI.message('⚠️ Select something first.');
      console.log(dataKey, dataItems, dataConfig);
    }
  });
}



export function create(dataKey, items) {
  const window = BrowserWindow.fromId(constants.MAIN_WINDOW_ID);

  if (window) {
    setSelection(dataKey, items);
    window.show();
    // TODO: We also need to bring the window to visibility when it is hidden in an inactive window space.
    //       Probably need to check with NSPanel.isOnActiveSpace() and NSPanel.CollectionBehavior.moveToActiveSpace().
    //       Or this probably won't be needed if we make the window to always show on the same space as Sketch's.
    window.focus();
  } else {
    createWindow(dataKey, items);
  }
}



export function setSelection(dataKey, items) {
  const window = BrowserWindow.fromId(constants.MAIN_WINDOW_ID);

  // Only apply if the plugin is open.
  // This check is necessary because it is being called by `SelectionChanged` action,
  // and it doesn't take into account of plugin window existance.
  if (window) {
    // If `key` is not defined, it means that the items doesn't come from the `DataSupply` action.
    // If so, filter all items to get only the Text and Text Override items.
    if (typeof key === 'undefined') {
      items = items.filter(item => {
        let result = false;

        if (item.type === 'Text') {
          result = true;
        } else if (item.type === 'SymbolInstance' && item?.overrides.length > 0) {
          result = getSelectedOverrides(item).length > 0;
        } else if (item.type === 'DataOverride') {
          result = true;
        }

        return result;
      });
    }

    const dataItems = [];

    // Gather item identifications and dataConfigs.
    items.forEach(item => {
      if (item.type === 'Text') {
        dataItems.push({
          type: 'text',
          id: String(item.id),
          dataConfig: Settings.layerSettingForKey(items[0], 'dataConfig')
        });
      } else if (item.type === 'SymbolInstance') {
        getSelectedOverrides(item).forEach(override => {
          dataItems.push({
            type: 'override',
            id: String(override.id),
            parent: String(item.id),
            dataConfig: getOverrideDataConfig(item, override)
          });
        });
      } else if (item.type === 'DataOverride') {
        dataItems.push({
          type: 'override',
          id: String(item.override.id),
          parent: String(item.symbolInstance.id),
          dataConfig: getOverrideDataConfig(item.symbolInstance, item.override)
        })
      }
    });

    // Prepare Data Key to be sent.
    if (typeof dataKey !== 'undefined') {
      dataKey = `"${String(dataKey)}"`;
    }

    // TODO: Find a way to detect when the document focus changed and trigger a new selection instead.
    const documentId = getSelectedDocument().id;

    // FIXME: BrowserWindow somehow silently breaks internally on this step, breaking `remembersWindowFrame` feature.
    window.webContents.executeJavaScript(`setDataConfig(${dataKey}, ${JSON.stringify(dataItems)}, "${documentId}")`)
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

  const limitMax = Number.parseInt(dataConfig.general?.['limit-max'], 10);

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
