import {series, parallel} from 'gulp';

import * as styles from './tasks/styles';
import {symbols, templateIcons} from './tasks/symbols';
import images from './tasks/images';
import * as scripts from './tasks/scripts';
import views from './tasks/views';
import copy from './tasks/copy';
import deploy from './tasks/deploy';
import watch from './tasks/watch';



export const build = series(
  parallel(
    styles.build,
    series(
      symbols,
      templateIcons
    ),
    images,
    scripts.build),
  views
);

export const dist = parallel(
  styles.dist,
  scripts.dist,
  copy
);

export {deploy};

export default series(
  build,
  watch
);
