const { src, dest, watch, parallel } = require('gulp');
const browsersync = require('browser-sync').create();
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const sass = require('gulp-sass');
const replace = require('gulp-replace');
const cheerio = require('gulp-cheerio');
const fileinclude = require('gulp-file-include');

function font() {
  return src('app/fonts/**/*.{ttf,otf,woff}')
    .pipe(dest('dist/fonts'))
    .pipe(browsersync.stream());
}

const server = () => {
  browsersync.init({
    server: { baseDir: 'dist/' },
    notify: false,
  });
}

const compileSass = () => {
  return src('app/styles/**/*.scss')
    .pipe(sass())
    .pipe(dest('dist/styles'))
    .pipe(browsersync.stream());
}

const createSprite = () => {
  return src('app/images/svg/simple/*.svg')
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
      },
      parserOptions: {xmlMode: true}
    }))
    .pipe(replace('&gt;', '>'))
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: '../sprite.svg',
          render: {
            scss: {
              dest: '../../../app/styles/components/_simple-icons.scss',
              template: "app/styles/templates/_sprite_template.scss"
            }
          }
        }
      }
    }))
    .pipe(dest('dist/images'))
    .pipe(browsersync.stream());
}

const createStrokedSvg = () => {
  return src('app/images/svg/stroked/*.svg')
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: '../stroked-sprite.svg',
        }
      }
    }))
    .pipe(dest('dist/images'))
    .pipe(browsersync.stream());
}

const images = () => {
  return src(['app/images/*.{png,svg}'])
    .pipe(dest('dist/images'))
    .pipe(browsersync.stream());
}

const parseHtml = () => {
  return src('app/*.html')
    .pipe(fileinclude({ basepath: 'app/templates' }))
    .pipe(dest('dist'))
    .pipe(browsersync.stream());
}

const watchers = () => {
  watch(['app/images/simple/*.svg'], createSprite);
  watch(['app/images/stroked/*.svg'], createStrokedSvg);
  watch(['app/images/*.{png, svg}'], images);
  watch(['app/styles/**/*.scss'], compileSass);
  watch('app/**/*.html', parseHtml)
  watch('dist/*.html').on('change', browsersync.reload);
}

exports.default = parallel(parseHtml, images, createSprite, createStrokedSvg, compileSass, watchers, server, font);
