const src = {};
const build = {};
const dist = {};

src.base = './src';

build.base = '../../build';
build.assets = `${build.base}/assets`;

dist.base = './dist';


export default {
  src: {
    styles: `${src.base}/styles/**/*.s+(a|c)ss`,
    symbols: `${src.base}/symbols`,
    templateIcons: `${src.base}/template-icons/**/*.svg`,
    images: `${src.base}/images/**/*`,
    scripts: `${src.base}/scripts/**/*.js`,
    views: `${src.base}/views/**/*.pug`
  },
  build: {
    base: build.base,
    styles: `${build.assets}/styles`,
    images: `${build.assets}/images`,
    scripts: `${build.assets}/scripts`,
    views: build.base,
    globs: {
      base: `${build.base}/**/*`,
      styles: `${build.assets}/**/*.css`,
      scripts: `${build.assets}/**/*.js`
    }
  },
  dist: {
    base: dist.base,
    globs: {
      all: `${dist.base}/**/*`
    }
  }
};
