import faker from 'faker';



const config = {
  id: 'protocol',
  name: 'HTTP Protocol',
  fields: []
};



function generator() {
  return faker.internet.protocol();
}



export default {
  config,
  generator
};
