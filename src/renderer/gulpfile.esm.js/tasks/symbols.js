import {parse as parsePath} from 'path';
import {src, dest} from 'gulp';
import plumber from 'gulp-plumber';
import cheerio from 'gulp-cheerio';
import imagemin from 'gulp-imagemin';
import svgSprite from 'gulp-svg-sprite';
import {default as notify, onError} from 'gulp-notify';
import merge from 'merge-stream';

import config from '../config';
import {getDirs, path} from '../utils';



/**
 * ================================
 * Add visible overflow to all SVG files.
 * Optimize SVG files.
 * Concatenate SVG files into symbols files.
 * Notify end of task.
 * ================================
 */

export const symbols = done => {
  const dirs = getDirs(config.src.symbols);

  if (dirs.length === 0) {
    return done();
  }

  const subtasks = dirs.map(dir =>
    src(path(config.src.symbols, dir, '/*.svg'))
      .pipe(plumber())
      .pipe(cheerio(($, file) => { // eslint-disable-line no-unused-vars
        $('svg').attr('overflow', 'visible');
      }))
      .pipe(imagemin({
        svgoPlugins: [{
          removeViewBox: false
        }]
      }))
      .pipe(svgSprite({
        mode: {
          symbol: {
            dest: '.',
            sprite: `${dir === '.' ? 'symbols' : dir}.svg`
          }
        },
        svg: {
          xmlDeclaration: false,
          doctypeDeclaration: false
        }
      }))
      .on('error', onError({
        title: 'Error in symbols',
        message: '<%= error.message %>'
      }))
      .pipe(dest(config.build.images))
  );

  return merge(subtasks)
    .pipe(notify({
      message: 'Symbols generated!',
      onLast: true
    }));
};



/**
 * ================================
 * Add visible overflow to all SVG files.
 * Optimize SVG files.
 * Concatenate SVG files into symbols files.
 * Notify end of task.
 * ================================
 */

export const templateIcons = () =>
  src(config.src.templateIcons)
    .pipe(plumber())
    .pipe(cheerio(($, file) => {
      $('svg').attr('overflow', 'visible');

      $('#light #opaque').attr('fill', 'var(--color-icon-opaque-light)');
      $('#light #solid').attr('fill', 'var(--color-icon-solid-light)');
      $('#light #translucent').attr('fill', 'var(--color-icon-translucent-light)');

      $('#dark #opaque').attr('fill', 'var(--color-icon-opaque-dark)');
      $('#dark #solid').attr('fill', 'var(--color-icon-solid-dark)');
      $('#dark #translucent').attr('fill', 'var(--color-icon-translucent-dark)');

      $('[opacity]').removeAttr('opacity');
    }))
    .pipe(imagemin({
      svgoPlugins: [{
        removeViewBox: false
      }]
    }))
    .pipe(svgSprite({
      shape: {
        id: {
          generator: path => `template-icon__${parsePath(path).name}`
        }
      },
      mode: {
        symbol: {
          dest: '.',
          sprite: 'template-icons.svg'
        }
      },
      svg: {
        xmlDeclaration: false,
        doctypeDeclaration: false
      }
    }))
    .on('error', onError({
      title: 'Error in templateIcons',
      message: '<%= error.message %>'
    }))
    .pipe(dest(config.build.images))
    .pipe(notify({
      message: 'Template icons generated!',
      onLast: true
    }));
