import faker from 'faker';



export function language(language) {
  let selectedLanguage;

  if (Array.isArray(language) && language.length > 0) {
    selectedLanguage = faker.random.arrayElement(language);
  } else {
    selectedLanguage = faker.random.locale();
  }

  return selectedLanguage;
}



export function gender(gender) {
  if (gender === 'male') {
    gender = 0;
  } else if (gender === 'female') {
    gender = 1;
  } else {
    gender = null;
  }

  return gender;
}



export function textTransform(text, transform = 'none', language = 'en') {
  language = language.replace('_', '-');

  if (typeof transform === 'string') {
    if (transform === 'capitalize') {
      // TODO: Find a way to capitalize with locale.
    } else if (transform === 'uppercase') {
      text = text.toLocaleUpperCase(language);
    } else if (transform === 'lowercase') {
      text = text.toLocaleLowerCase(language);
    }
  }

  return text;
}


/**
 * Sanitize a value.
 *
 * @param {string} type - The expected type of the value.
 * @param {*} value - The value to be sanitized.
 * @param {string | number | array} excluders - The values to be excluded. If `value` matches an excluder, it will be converted to `undefined`. Useful for default values, where there's no need to have them explicitly defined. It accepts a single value or an array of values.
 * @param {function} callback - The function the be called after type sanitizations.
 */
export function sanitizeValue(type, value, excluders = [], options = {}, callback) {
  let result;


  if (typeof excluders !== 'undefined' && Array.isArray(excluders) === false) {
    excluders = [excluders];
  }


  if (type === 'string' && typeof value === 'string' && value !== '' && excluders?.includes(value) === false) {
    result = value;
  } else if (type === 'number' && value !== '' && Number.isFinite(Number(value))) {
    result = Number(value);

    if (['floor', 'round', 'ceil'].includes(options.roundingMethod)) {
      result = Math[options.roundingMethod](result);
    }

    if (Number.isFinite(options.min)) {
      result = Math.max(result, options.min);
    }

    if (Number.isFinite(options.max)) {
      result = Math.min(result, options.max);
    }

    if (excluders?.includes(result)) {
      result = undefined;
    }
  } else if (type === 'boolean' && ['on', true].includes(value)) {
    result = true;
  }


  if (typeof callback === 'function') {
    result = callback(result);
  }


  return result;
}
