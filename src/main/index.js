import {getSelectedDocument, fromNative, DataSupplier, Settings} from 'sketch';
import {toArray} from 'util';

import constants from '../common/constants';
import * as mainWindow from './windows/main';
import {getOverrideDataConfig} from './utils/overrides';



export default function () {
  const items = getSelectedDocument()?.selectedLayers?.layers || [];

  mainWindow.create(undefined, items);
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

  // TODO: Find out why when selecting a Text layer and a Text Override,
  //       `context.data` only returns one type, not both,
  //       but when `RefreshData` is called, it returns all of them.

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
