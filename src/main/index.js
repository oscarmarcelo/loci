import {getSelectedDocument, fromNative, DataSupplier, Settings} from 'sketch';
import {toArray} from 'util';

import constants from '../common/constants';
import * as mainWindow from './windows/main';



export default function () {
  const items = getSelectedDocument()?.selectedLayers?.layers || [];

  mainWindow.create(null, items);
}



export function onStartup() {
  DataSupplier.registerDataSupplier('public.text', constants.PLUGIN_NAME, constants.DATA_SUPPLIER_ACTION);
}



export function onShutdown() {
  mainWindow.close();
  DataSupplier.deregisterDataSuppliers();
}



export function onSupplyData(context) {
  const items = toArray(context.data.items).map(fromNative).filter(({type}) => ['Text', 'DataOverride'].includes(type));

  items.forEach((item, index) => {
    let dataConfig;

    if (item.type === 'DataOverride') {
      dataConfig = Settings.layerSettingForKey(item.override.affectedLayer, 'dataConfig');
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

    // REVIEW: Find a way to make `onDataSupply()` distinguish a `RefreshData` from a `DataSupply` action natively.
    if (dataConfig && isConnected && Settings.sessionVariable('refreshData') === true) {
      DataSupplier.supplyDataAtIndex(context.data.key, mainWindow.generateData(dataConfig), index);
    } else {
      mainWindow.create(context.data.key, items);
    }

    Settings.setSessionVariable('refreshData', undefined);
  });
}



export function onRefreshData() {
  // REVIEW: Find a way to make `onDataSupply()` distinguish a `RefreshData` from a `DataSupply` action natively.
  Settings.setSessionVariable('refreshData', true);
}



export function onSelectionChanged(context) {
  const items = toArray(context.actionContext.newSelection).map(fromNative);

  mainWindow.setSelection(undefined, items);
}



export function onClearDataRecord() {
  const items = getSelectedDocument()?.selectedLayers?.layers || [];

  items.forEach(item => {
    Settings.setLayerSettingForKey(item, 'dataConfig', undefined);
  });
}



export function onRemoveAllOverrides(context) {
  // TODO: Find a way to use this instead: context.actionContext.action.affectedOverrideRepresentations().
  const items = getSelectedDocument()?.selectedLayers?.layers || [];

  items.forEach(item => {
    Settings.setLayerSettingForKey(item, 'symbolDataConfig', undefined);
  });
}
