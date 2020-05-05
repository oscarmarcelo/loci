import {watch} from 'gulp';

import config from '../config';

import {build as styles} from './styles';
import symbols from './symbols';
import images from './images';
import {build as scripts} from './scripts';
import views from './views';



/**
 * ================================
 * Watch files.
 * ================================
 */

export default done => {
  // When styles update, compile Sass files.
  watch(config.src.styles, styles);

  // When symbols update, compile symbols.
  watch(config.src.symbols, symbols);

  // When images update, optimize images.
  watch(config.src.images, images);

  // When scripts update, compile scripts.
  watch(config.src.scripts, scripts);

  // When views update, compile views.
  watch(config.src.views, views);

  done();
};
