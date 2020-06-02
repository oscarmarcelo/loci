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



export function textTransform(text, transform, language = 'en') {
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
