import {getSelectedDocument, fromNative, DataSupplier, Settings} from 'sketch';
import {toArray} from 'util';

import constants from '../common/constants';
import * as mainWindow from './windows/main';
import {getSelectedOverrides, getOverrideDataConfig} from './utils/overrides';



export default function () {
  const items = getSelectedDocument()?.selectedLayers?.layers || [];

  mainWindow.create(false, items);
}



export function onStartup() {
  DataSupplier.registerDataSupplier('public.text', constants.PLUGIN_NAME, constants.DATA_SUPPLIER_ACTION);
}



export function onShutdown() {
  mainWindow.close();
  DataSupplier.deregisterDataSuppliers();
}



export function onSupplyData(context) {
  const items = toArray(context.data.items).map(fromNative);

  // TODO [>=1.0.0]: Find out why when selecting a Text layers and a Text Overrides go in separate actions,
  //                 causing only one of both types having data applied.
  //                 Find a way to get both and apply data using the appropriate Data Key.

  items.forEach((item, index) => {
    let dataConfig;

    if (item.type === 'DataOverride') {
      // REVIEW: Analyze this decision once we get enough feedback to see if this clashes with native behaviour.
      //         Since only the Data Menu is shows "Refreshes Data from Master", we are using an alternative version
      //         via Inspector were it refreshes with symbolInstance dataConfig, because the wording is just "Refresh" in there.
      // TODO [>=1.0.0]: When Refreshing from Data Menu ("Refreshes Data from Master") it should refresh using Symbol Master dataConfigs.
      dataConfig = getOverrideDataConfig(item.symbolInstance, item.override);
    } else {
      dataConfig = Settings.layerSettingForKey(item, 'dataConfig');
    }

    // This is used to force the opening of the plugin window when there's data configuration but the layer isn't connected to the data supplier.
    // otherwise, it would just apply the data because it detected the data configuration, and that's something that the user doesn't want/expect to happen.

    const layer = item.type === 'DataOverride' ? item.override.affectedLayer : item;
    // TODO: Find a way to get the identifier without hardcoding it.
    //       Still missing the handler part: [context.plugin.identifier(), context.command.identifier()].join('_').
    const dataSupplierId = [constants.PLUGIN_ID, constants.DATA_SCRIPTS_ID, constants.DATA_SUPPLIER_ACTION].join('_');
    const isConnected = String(layer.sketchObject.userInfo()?.valueForKey('datasupplier.key')) === dataSupplierId;

    let itemsToRefresh = Settings.sessionVariable('itemsToRefresh');

    // REVIEW: Find a way to make `onDataSupply()` distinguish a `RefreshData` from a `DataSupply` action natively.
    if (dataConfig && isConnected && Number.isFinite(itemsToRefresh) && itemsToRefresh > 0) {
      DataSupplier.supplyDataAtIndex(context.data.key, mainWindow.generateData(dataConfig), index);
    } else {
      // TODO: Make mainWindow open only once when there are multiple layers.

      // REVIEW: Forcing Data Key to be a string, since it comes as an object.
      mainWindow.create(String(context.data.key), items);
    }

    // Decrease number of items left to refresh.
    if (Number.isFinite(itemsToRefresh)) {
      Settings.setSessionVariable('itemsToRefresh', itemsToRefresh > 1 ? --itemsToRefresh : undefined);
    }
  });
}



export function onRefreshData() {
  // REVIEW: Find a way to make `onDataSupply()` distinguish a `RefreshData` from a `DataSupply` action natively.
  //         Also, see if it is possible to merge multiple `DataSupply` actions, since DataOverrides goes in a separate
  //         `DataSupply` action instead of going in the same action with the Text layers.

  const items = getSelectedDocument()?.selectedLayers?.layers || [];

  // TODO: Find a way to get the identifier without hardcoding it.
  //       Still missing the handler part: [context.plugin.identifier(), context.command.identifier()].join('_').
  const dataSupplierId = [constants.PLUGIN_ID, constants.DATA_SCRIPTS_ID, constants.DATA_SUPPLIER_ACTION].join('_');

  let itemsToRefresh = 0;

  items.forEach(item => {
    if (item.type === 'Text') {
      if (String(item.sketchObject.userInfo()?.valueForKey('datasupplier.key')) === dataSupplierId) {
        itemsToRefresh++;
      }
    } else if (item.type === 'SymbolInstance' && item?.overrides.length > 0) {
      getSelectedOverrides(item).forEach(override => {
        if (String(override.affectedLayer.sketchObject.userInfo()?.valueForKey('datasupplier.key')) === dataSupplierId) {
          itemsToRefresh++;
        }
      });
    }
  });

  Settings.setSessionVariable('itemsToRefresh', itemsToRefresh);
}



export function onSelectionChanged(context) {
  const items = toArray(context.actionContext.newSelection).map(fromNative);

  mainWindow.setSelection(false, items);
}



export function onClearDataRecord() {
  const items = getSelectedDocument()?.selectedLayers?.layers || [];

  items.forEach(item => {
    Settings.setLayerSettingForKey(item, 'dataConfig', undefined);
    Settings.setLayerSettingForKey(item, 'version', undefined);
  });
}



export function onRemoveAllOverrides(context) {
  // TODO: Find a way to use this instead: context.actionContext.action.affectedOverrideRepresentations().
  const items = getSelectedDocument()?.selectedLayers?.layers || [];

  items.forEach(item => {
    Settings.setLayerSettingForKey(item, 'symbolDataConfig', undefined);
    Settings.setLayerSettingForKey(item, 'version', undefined);
  });
}
