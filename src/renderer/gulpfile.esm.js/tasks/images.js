import {src, lastRun, dest} from 'gulp';
import plumber from 'gulp-plumber';
import imagemin from 'gulp-imagemin';
import {default as notify, onError} from 'gulp-notify';

import config from '../config';



/**
 * ================================
 * Optimize images.
 * Notify end of task.
 * ================================
 */

const build = () =>
  src(config.src.images, {
    since: lastRun(build)
  })
    .pipe(plumber())
    .pipe(imagemin({
      svgoPlugins: [{
        removeViewBox: false
      }]
    }))
    .on('error', onError({
      title: 'Error in images',
      message: '<%= error.message %>'
    }))
    .pipe(dest(config.build.images))
    .pipe(notify({
      message: 'Images optimized!',
      onLast: true
    }));

export default build;
