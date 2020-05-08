import faker from 'faker';



export function language(language) {
  if (language && language !== '0') {
    // TODO: language = faker.random.arrayElement(language);
  } else {
    language = faker.random.locale();
  }

  return language;
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



export function textTransform(text, transform, language) {
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
