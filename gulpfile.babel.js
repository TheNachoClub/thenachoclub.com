import { argv } from 'yargs'
import assign from 'lodash.assign'
import chalk from 'chalk'
import del from 'del'
import browserSync from 'browser-sync'
import browserify from 'browserify'
import handlebars from 'handlebars'
import watchify from 'watchify'

// Gulp modules
import gulp from 'gulp'
import gulpFM from 'gulp-front-matter'
import autoprefixer from 'gulp-autoprefixer'
import buffer from 'gulp-buffer'
import imagemin from 'gulp-imagemin'
import rename from 'gulp-rename'
import replace from 'gulp-replace'
import runSequence from 'run-sequence'
import sass from 'gulp-sass'
import uglify from 'gulp-uglify'
import gutil from 'gulp-util'
import source from 'vinyl-source-stream'

// Metalsmith modules
import gulpsmith from 'gulpsmith'
import define from 'metalsmith-define'
import inPlace from 'metalsmith-in-place'
import layouts from 'metalsmith-layouts'
import markdown from 'metalsmith-markdown'
import permalinks from 'metalsmith-permalinks'

const paths = {
  base: {
    src: './src/',
    dest: './build/',
  },
  html: {
    src: './src/content/**/*.+(html|md)',
    partials: './src/partials/',
    layouts: './src/layouts/',
    dest: './build/',
  },
  css: {
    src: './src/assets/css/index.scss',
    dest: './build/assets/css/',
    filename: 'styles.css',
  },
  js: {
    src: './src/assets/js/index.js',
    dest: './build/assets/js/',
    filename: 'scripts.js'
  },
  images: {
    src: './src/assets/images/**/*',
    dest: './build/assets/images/',
  },
}

// Make errors more readable
function mapError(err) {
  if (err.fileName) {
    // Regular error
    gutil.log(
      chalk.red(err.name) + ': ' +
      chalk.yellow(err.fileName.replace(__dirname + '/src/assets/js/', '')) + ': ' +
      'Line ' + chalk.magenta(err.lineNumber) + ' & ' +
      'Column ' + chalk.magenta(err.columnNumber || err.column) + ': ' +
      chalk.blue(err.description)
    )
  } else {
    // Browserify error
    gutil.log(
      chalk.red(err.name) + ': ' +
      chalk.yellow(err.message)
    )
  }
}

// Bundle Javascript using Browserify
function bundle(watch) {
  const props = {
    entries: [paths.js.src],
    debug: !argv.production,
    cache: {},
    packageCache: {},
  }
  let bundler = browserify(props)
  bundler = watch ? watchify(bundler) : bundler
  function rebundle() {
    gutil.log('Bundling javascript...')
    const stream = bundler.bundle()
    return stream.on('error', mapError)
      .pipe(source(paths.js.src))
      .pipe(buffer())
      .pipe(argv.production ? uglify({ mangle: true }) : gutil.noop())
      .pipe(rename(paths.js.filename))
      .pipe(gulp.dest(paths.js.dest))
      .pipe(browserSync.reload({ stream: true })
    )
  }
  bundler.on('update', rebundle)
  return rebundle()
}

// Clean the build folder
gulp.task('clean', () => {
  return del.sync(paths.html.dest)
})

// Compile HTML
gulp.task('metalsmith', () => {
  return gulp.src(paths.html.src)
    .pipe(gulpFM({ remove: true })
      .on('data', (file) => {
        assign(file, file.frontMatter)
        delete(file.frontMatter)
      })
    )
    .pipe(gulpsmith()
      .use(define({
        config: { environment: argv.production ? 'production' : 'dev' }
      }))
      .use(markdown({
        smartypants: true,
        gfm: true,
      }))
      .use(permalinks())
      .use(layouts({
        engine: 'handlebars',
        directory: paths.html.layouts,
        partials: paths.html.partials,
        pattern: '**/*.html',
        default: 'default.html',
      }))
      .use(inPlace({
        engine: 'handlebars',
        partials: paths.html.partials,
      }))
    )
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.reload({ stream: true }))
})

// Compile SASS
gulp.task('styles', () => {
  return gulp.src(paths.css.src)
    .pipe(sass({
      outputStyle: 'compressed',
    }))
    .on('error', sass.logError)
    .pipe(autoprefixer({
      browsers: ['last 2 versions', '> 5%', 'ie 9'],
      cascade: false,
    }))
    .pipe(gulp.dest(paths.css.dest))
    .pipe(browserSync.reload({ stream: true }))
})

// Run JavaScript bundler
gulp.task('scripts', () => {
  return bundle(false)
})

gulp.task('images', () => {
  return gulp.src(paths.images.src)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.images.dest))
})

// Cache bust assets
gulp.task('cachebust', () => {
  return gulp.src(paths.html.dest + '**/*.html')
  .pipe(replace(/styles.css\?v=([0-9]*)/g, 'styles.css?v=' + Date.now()))
  .pipe(replace(/scripts.js\?v=([0-9]*)/g, 'scripts.js?v=' + Date.now()))
  .pipe(gulp.dest(paths.html.dest))
})

// Start server w/ cross-device syncing & style injection
gulp.task('browser-sync', () => {
  return browserSync.init({
    server: {
      baseDir: paths.html.dest
    }
  })
})

// Move CNAME file over
gulp.task('cname', () => {
  return gulp.src(paths.base.src + 'CNAME')
    .pipe(gulp.dest(paths.base.dest))
})

// Run build chain of tasks
gulp.task('build', () => {
  return runSequence('clean', 'styles', 'scripts', 'metalsmith', 'images', 'cachebust')
})

// Everything required to get started developing
gulp.task('serve', () => {
  gulp.watch([
    paths.html.src,
    paths.html.layouts + '**/*',
    paths.html.partials + '**/*',
  ], ['metalsmith'])
  gulp.watch(paths.css.src, ['styles'])
  bundle(true)
  runSequence('build', 'browser-sync')
})

gulp.task('default', ['build'])
