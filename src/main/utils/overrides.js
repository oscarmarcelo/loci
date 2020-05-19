import {Settings} from 'sketch';



export function getSelectedOverrides(symbol) {
  let result = [];

  if (symbol?.overrides) {
    let overrides = [];

    // If the symbol has only one override, consider it always selected.
    if (symbol.overrides.length === 1) {
      overrides = symbol.overrides;
    } else {
      overrides = symbol.overrides.filter(({selected}) => selected);

      // If no overrides are selected, then consider all of them.
      if (overrides.length === 0) {
        overrides = symbol.overrides;
      }
    }

    // Then get only the text overrides.
    result = overrides.filter(({property}) => property === 'stringValue');
  }

  return result;
};



export function getOverrideDataConfig(symbol, override) {
  return Settings.layerSettingForKey(symbol, 'symbolDataConfig')?.[override.id] ||
  Settings.layerSettingForKey(override.affectedLayer, 'dataConfig');
}
