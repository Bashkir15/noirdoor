const gulp = require('gulp');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const gutil = require('gulp-util');

const sass = require('gulp-sass');
const pure = require('gulp-purifycss');
const autoprefixer = require('gulp-autoprefixer'); // incase we want to be nice

const paths = {
	dev: {
		// to separate the already written css from my
		// messing around
		styles: './lib/static/css/compiled/',
		mainSass: './lib/static/sass/main.sass',
		otherSass: './lib/static/sass/**/*.sass'
	}
};

function handleErrors(...args) {
	gutil.beep();
	this.emit('end');

	notify.onError({
		title: 'Error',
		message: '<%= error.message %>'
	}).apply(this, args);
}

gulp.task('devStyles', () => {
	gulp.src(paths.dev.mainSass)
		.pipe(plumber({
			errorHandler: handleErrors
		}))
		.pipe(sass({
			errLogToConsole: true,
			outputStyle: 'compact',
			precision: 10
		}))
		.pipe(autoprefixer({
			browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
			cascade: true
		}))
		//gul.pipe(pure(['./lib/views/**/*.html', './lib/static/scripts/**/*.js']))
		.pipe(gulp.dest(paths.dev.styles))
		.pipe(notify('Styles Task Complete'))
})

gulp.task('default', ['devStyles'], () => {
	gulp.watch([paths.dev.mainSass, paths.dev.otherSass], ['devStyles']);
});