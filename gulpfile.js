// General modules
var argv         = require('yargs').argv
var assign       = require('lodash.assign');
var chalk        = require('chalk');
var del          = require('del');
var browserSync  = require('browser-sync');
var browserify   = require('browserify');
var handlebars   = require('handlebars');
var watchify     = require('watchify');

// Gulp modules
var gulp         = require('gulp');
var gulpFM       = require('gulp-front-matter');
var autoprefixer = require('gulp-autoprefixer');
var buffer       = require('gulp-buffer');
var notify       = require('gulp-notify');
var rename       = require('gulp-rename');
var replace      = require('gulp-replace');
var runSequence  = require('run-sequence');
var sass         = require('gulp-sass');
var uglify       = require('gulp-uglify');
var gutil        = require('gulp-util');
var source       = require('vinyl-source-stream');

// Metalsmith modules
var gulpsmith    = require('gulpsmith');
var define       = require('metalsmith-define');
var inPlace      = require('metalsmith-in-place');
var layouts      = require('metalsmith-layouts');
var markdown     = require('metalsmith-markdown');
var permalinks   = require('metalsmith-permalinks');

var paths = {
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
  docs: {
    src: './src/assets/docs/**/*',
    dest: './build/assets/docs/',
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
    );
  } else {
    // Browserify error
    gutil.log(
      chalk.red(err.name) + ': ' +
      chalk.yellow(err.message)
    );
  }
}

// Bundle Javascript using Browserify
function bundle(watch) {
  var props = {
    entries: [paths.js.src],
    debug: !argv.production,
    cache: {},
    packageCache: {},
  };
  var bundler = browserify(props);
  bundler = watch ? watchify(bundler) : bundler;
  function rebundle() {
    var stream;
    gutil.log('Rebundling javascript...');
    stream = bundler.bundle();
    return stream.on('error', mapError)
      .pipe(source(paths.js.src))
      .pipe(buffer())
      .pipe(argv.production ? uglify({ mangle: false }) : gutil.noop())
      .pipe(rename(paths.js.filename))
      .pipe(gulp.dest(paths.js.dest))
      .pipe(browserSync.reload({
        stream: true,
      })
    );
  };
  bundler.on('update', rebundle);
  return rebundle();
};

// Clean the build folder
gulp.task('clean', function() {
  return del.sync(paths.html.dest);
});

// Compile HTML
gulp.task('metalsmith', function() {
  return gulp.src(paths.html.src)
    .pipe(gulpFM({ remove: true })
      .on('data', function(file) {
        assign(file, file.frontMatter);
        delete(file.frontMatter);
      })
    )
    .pipe(gulpsmith()
      .use(define({
        config: {
          environment: argv.production ? 'production' : 'testing'
        }
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
    .pipe(browserSync.reload({ stream: true }));
});

// Compile SASS
gulp.task('styles', function() {
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
    .pipe(browserSync.reload({ stream: true }));
});

// Run JavaScript bundler
gulp.task('scripts', function() {
  return bundle(false);
});

// Cache bust assets
gulp.task('cachebust', function() {
  return gulp.src(paths.html.dest + '**/*.html')
  .pipe(replace(/styles.css\?v=([0-9]*)/g, 'styles.css?v=' + Date.now()))
  .pipe(replace(/scripts.js\?v=([0-9]*)/g, 'scripts.js?v=' + Date.now()))
  .pipe(gulp.dest(paths.html.dest));
});

// Start server w/ cross-device syncing & style injection
gulp.task('browser-sync', function() {
  return browserSync.init({
    server: {
      baseDir: paths.html.dest
    }
  });
});

// Run build chain of tasks
gulp.task('build', function() {
  return runSequence('clean', 'metalsmith', 'styles', 'scripts', 'cachebust');
});

// Everything required to get started developing
gulp.task('serve', function() {
  gulp.watch([
    paths.html.src,
    paths.html.layouts + '**/*',
    paths.html.partials + '**/*',
  ], ['metalsmith']);
  gulp.watch(paths.css.src, ['styles']);
  bundle(true);
  runSequence('build', 'browser-sync');
});
