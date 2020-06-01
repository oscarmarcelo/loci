import heading1 from './heading-1';
import heading2 from './heading-2';
import separator from './separator';
import languages from './languages';
import buttonGroup from './button-group';
import checkbox from './checkbox';
import minMax from './min-max';



export default (field, tokenConfig) => {
  switch (field.type) {
    case 'heading-1':
      heading1(field.text);
      break;

    case 'heading-2':
      heading2(field.text);
      break;

    case 'separator':
      separator(field?.fillEdges);
      break;

    case 'languages':
      languages(field, tokenConfig?.languages);
      break;

    case 'button-group':
    case 'gender':
    case 'text-transform':
      buttonGroup(field, tokenConfig?.[field.id] || tokenConfig?.[field.type]);
      break;

    case 'checkbox':
      checkbox(field, tokenConfig?.[field.id] || tokenConfig?.[field.type]);
      break;

    case 'min-max':
      minMax(field, {
        min: tokenConfig?.[`${field.prefix}-min`],
        max: tokenConfig?.[`${field.prefix}-max`],
        precision: tokenConfig?.[`${field.prefix}-precision`],
        unit: tokenConfig?.[`${field.prefix}-unit`]
      });
      break;

    default:
      break;
  }
};
