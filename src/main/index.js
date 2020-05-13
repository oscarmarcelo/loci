import {fromNative, DataSupplier, Settings} from 'sketch';
import {toArray} from 'util';

import constants from '../constants';
import * as mainWindow from './windows/main';



export default function () {
  mainWindow.create();
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
    // TODO: If it's a DataOverride, we can't/won't store config because Sketch doesn't store a datasupplier.key for overrides.
    //       However, we can try to store it at symbol instance level (don't know if it's possible).
    //       For now, the native approach is to check for override config in the symbol master and apply it.
    //       If it was directly asked to use Loci from the context menu, open the window, even if config exists.
    //       If it was trigerred by a refresh, then just reapply data using config.
    const dataConfig = Settings.layerSettingForKey(item, 'dataConfig');
    // TODO: Find a way to get the identifier without hardcoding it.
    //       Still missing the handler part: [context.plugin.identifier(), context.command.identifier()].join('_')
    const isConnected = String(item.sketchObject.userInfo()?.valueForKey('datasupplier.key')) === [constants.PLUGIN_ID, '__index', constants.DATA_SUPPLIER_ACTION].join('_');

    if (dataConfig && isConnected) {
      DataSupplier.supplyDataAtIndex(context.data.key, mainWindow.generateData(dataConfig), index);
    } else {
      mainWindow.create();
    }
  });
}



export function onSelectionChanged(context) {
  const items = toArray(context.actionContext.newSelection).map(fromNative);

  mainWindow.setSelection(items);
}
