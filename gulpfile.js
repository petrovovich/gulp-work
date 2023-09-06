const { src, dest, watch, parallel, series } = require('gulp'); // - создал две константы и присвоил им возможности gulp.

const scss = require('gulp-sass')(require('sass')); //  - создал константу "scss" и присвоил им возможности "gulp-sass" и "sass"
const concat = require('gulp-concat'); // из нескальких ф-ов делает один ,а также переименовает файл
const uglify = require('gulp-uglify-es').default; // минификатор js
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const svgSprite = require('gulp-svg-sprite');
const include = require('gulp-include');


function pages() {
   return src('app/pages/*.html')
      .pipe(include({
         includePaths: 'app/components'
      }))
      .pipe(dest('app'))
      .pipe(browserSync.stream())
}

function fonts() {
   return src('app/fonts/src/*.*')
      .pipe(fonter({
         formats: ['woff', 'ttf']
      }))
      .pipe(src('app/fonts/src/*.ttf'))
      .pipe(ttf2woff2())
      .pipe(dest('app/fonts'))
}

function images() {
   return src(['app/img/src/*.*', '!app/img/src/*.svg'])
      .pipe(newer('app/img'))
      .pipe(avif({ quality: 50 }))

      .pipe(src('app/img/src/*.*'))
      .pipe(newer('app/img'))
      .pipe(webp())

      .pipe(src('app/img/src/*.*'))
      .pipe(newer('app/img'))
      .pipe(imagemin())

      .pipe(dest('app/img'))

}

function sprite() {
   return src('app/img/*.svg')
      .pipe(svgSprite({
         mode: {
            stack: {
               sprite: '../sprite.svg',
               example: true
            }
         }
      }))
      .pipe(dest('app/img'))
}


function scripts() {
   return src([
      'app/js/script.js'
   ])
      .pipe(concat('main.min.js'))
      .pipe(uglify())
      .pipe(dest('app/js'))
      .pipe(browserSync.stream())
}

function styles() {
   return src('app/scss/style.scss')
      .pipe(autoprefixer({ overrideBrowserslist: ['last 10 version'] }))
      .pipe(concat('style.min.css'))
      .pipe(scss({ outputStyle: 'compressed' }))
      .pipe(dest('app/css'))
      .pipe(browserSync.stream())
}

function watching() {
   browserSync.init({
      server: {
         baseDir: "app/"
      },
      browser: 'chrome'
   });
   watch(['app/scss/style.scss'], styles)
   watch(['app/img/src'], images)
   watch(['app/js/script.js'], scripts)
   watch(['app/components/*', 'app/pages/*'], pages)
   watch(['app/*.html']).on('change', browserSync.reload);
}

// function browsersync() {
//    browserSync.init({
//       server: {
//          baseDir: "app/"
//       },
//       browser: 'chrome'
//    });
// }

function cleandist() {
   return src('dist')
      .pipe(clean())
}

function building() {
   return src([
      'app/css/style.min.css',
      'app/img/*.*',
      '!app/img/*.svg',
      'app/img/sprite.svg',
      'app/fonts/*.*',
      'app/js/main.min.js',
      // 'app/**/*.html'
      'app/*.html'
   ], { base: 'app' })
      .pipe(dest('dist'))
}

exports.styles = styles;
exports.fonts = fonts;
exports.images = images;
exports.pages = pages;
exports.cleandist = cleandist
exports.building = building;
exports.sprite = sprite;
exports.scripts = scripts;
exports.watching = watching;
// exports.browsersync = browsersync;

exports.build = series(cleandist, building);
// exports.default = parallel(styles, scripts, browsersync, watching);
exports.default = parallel(styles, scripts, pages, watching);