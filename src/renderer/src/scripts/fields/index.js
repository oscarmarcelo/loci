import heading2 from './heading-2';
import separator from './separator';
import languages from './languages';
import buttonGroup from './button-group';
import checkbox from './checkbox';

export default (field, config) => {
  const type = typeof field === 'string' ? field : field.type;
  let value;

  if (['heading-2', 'separator'].includes(type) === false && config) {
    value = config[field.id || field] || undefined;
  }

  if (type === 'heading-2') {
    heading2(field.text);
  } else if (type === 'separator') {
    separator();
  } else if (type === 'languages') {
    languages(value);
  } else if (['gender', 'text-transform'].includes(type)) {
    buttonGroup(type, value);
  } else if (type === 'checkbox') {
    checkbox(field, value);
  }
};
