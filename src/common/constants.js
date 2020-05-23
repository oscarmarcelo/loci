const pluginId = 'com.oscarmarcelo.loci';
const mainWindow = 'main';
const tokenPopover = 'token-popover';
const selectPopover = 'select-popover';

export default {
  PLUGIN_NAME: 'Loci',
  PLUGIN_ID: pluginId,
  MAIN_WINDOW_ID: `${pluginId}.${mainWindow}`,
  MAIN_WINDOW_OBSERVERS: `${pluginId}.${mainWindow}.observers`,
  TOKEN_POPOVER_WINDOW_ID: `${pluginId}.${tokenPopover}`,
  DATA_SUGGESTIONS_WINDOW_ID: `${pluginId}.${selectPopover}.data-suggestions`,
  DATA_LIST_WINDOW_ID: `${pluginId}.${selectPopover}.data-list`,
  DATA_SCRIPTS_ID: 'scripts',
  DATA_SUPPLIER_ACTION: 'SupplyData'
};
