import {src, dest} from 'gulp';
import plumber from 'gulp-plumber';
import babel from 'gulp-babel';
import {rollup} from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import rollupBabel from 'rollup-plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import {default as notify, onError} from 'gulp-notify';
import {default as uglify} from 'gulp-uglify-es';

import config from '../config';



/**
 * ================================
 * Compile JavaScript.
 * Notify end of task.
 * ================================
 */

export const build = done => {
  const bundles = [
    'data',
    'fields'
  ];

  for (const bundle of bundles) {
    rollup({
      input: `./src/scripts/${bundle}/index.js`,
      plugins: [
        rollupBabel({
          presets: [
            [
              '@babel/env',
              {
                modules: false
              }
            ]
          ]
        }),
        resolve(),
        commonjs()
      ]
    })
      .then(({write}) =>
        write({
          file: `${config.build.scripts}/${bundle}.js`,
          name: `loci.${bundle}`, // TODO: Don't hardcode plugin namespace.
          format: 'umd'
        })
      );
  }


  src([
    config.src.scripts,
    ...bundles.map(dir => `!src/scripts/${dir}/**/*`)
  ])
    .pipe(plumber())
    .pipe(babel())
    .on('error', onError({
      title: 'Error in scripts',
      message: '<%= error.message %>'
    }))
    .pipe(dest(config.build.scripts))
    .pipe(notify({
      message: 'JavaScript generated!',
      onLast: true
    }));

  done();
};



/*
 * ========================================================
 * Uglify JavaScript.
 * Notify end of task.
 * ========================================================
 */

export const dist = () =>
  src(config.build.globs.scripts)
    .pipe(plumber())
    .pipe(uglify())
    .on('error', onError({
      title: 'Error in scripts for distribution',
      message: '<%= error.message %>'
    }))
    .pipe(dest(config.dist.base))
    .pipe(notify({
      message: 'JavaScript uglified!',
      onLast: true
    }));
