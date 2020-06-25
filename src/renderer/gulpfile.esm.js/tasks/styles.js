import {src, dest} from 'gulp';
import sass from 'gulp-sass';
import {default as notify, onError} from 'gulp-notify';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import rename from 'gulp-rename';
import cssnano from 'cssnano';

import config from '../config';
import {dirToFile} from '../utils';



/**
 * ================================
 * Compile Sass files.
 * Autoprefix.
 * Notify end of task.
 * ================================
 */

export const build = () =>
  src(config.src.styles)
    .pipe(sass({
      outputStyle: 'expanded',
      precision: 10
    }))
    .on('error', onError({
      title: 'Error in styles',
      message: '<%= error.message %>'
    }))
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(rename(dirToFile))
    .pipe(dest(config.build.styles))
    .pipe(notify({
      message: 'CSS generated!',
      onLast: true
    }));



/**
 * ================================
 * Compress styles.
 * Notify end of task.
 * ================================
 */

export const dist = () =>
  src(config.build.globs.styles)
    .pipe(postcss([
      cssnano()
    ]))
    .pipe(dest(config.dist.base))
    .pipe(notify({
      message: 'CSS minified!',
      onLast: true
    }));
