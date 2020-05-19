function getColor(namedColor) {
  const mscolor = MSColor.colorWithNSColor(MSTheme.sharedTheme()[namedColor]());
  const color = mscolor.NSColorWithColorSpace(nil).hexValue().toLowerCase(); // eslint-ignore new-cap
  const alpha = mscolor.alpha() < 1 ? Math.round(mscolor.alpha() * 255).toString(16).padStart(2, 0) : '';

  return `#${color}${alpha}`;
}



export default () => {
  const accent = getColor('inspectorAccentColor');

  // Tints are from Sketch's MSTheme.sharedTheme().inspectorAccentColor().
  // First color is for Light Mode, and second is for Dark Mode.
  const tints = {
    blue: ['#007aff', '#007aff'],
    purple: ['#953d96', '#a550a7'],
    pink: ['#f74f9e', '#f74f9e'],
    red: ['#e0383e', '#ff5257'],
    orange: ['#f7821b', '#f7821b'],
    yellow: ['#fcb827', '#fcb827'],
    green: ['#62ba46', '#62ba46'],
    graphite: ['#989898', '#8c8c8c']
  };

  return Object.keys(tints).find(theme => {
    return tints[theme].includes(accent);
  });
};
