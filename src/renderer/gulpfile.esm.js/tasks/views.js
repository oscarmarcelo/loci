import {src, dest} from 'gulp';
import plumber from 'gulp-plumber';
import pug from 'gulp-pug';
import notify from 'gulp-notify';

import config from '../config';



/**
 * ================================
 * Compile Pug files.
 * Notify end of task.
 * ================================
 */

export default () =>
  src([
    config.src.views,
    '!**/_*'
  ])
    .pipe(plumber())
    .pipe(pug({
      pretty: true
    }))
    .pipe(dest(config.build.views))
    .pipe(notify({
      message: 'HTML generated!',
      onLast: true
    }));
