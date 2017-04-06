const gulp = require('gulp');
const notify = require('gulp-notify');

const sass = require('gulp-sass');

const paths = {
	dev: {
		// to separate the already written css from my
		// messing around
		styles: './lib/static/css/compiled/',
		mainSass: './lib/static/sass/main.sass',
		otherSass: './lib/static/sass/**/*.sass'
	}
};



function processStyles(done) {
	gulp.src(paths.dev.mainSass)
		.pipe(sass({
			errLogToConsole: true,
			outputStyle: 'compact',
			precision: 10
		}))
		.pipe(gulp.dest(paths.dev.styles))
		.pipe(notify('Styles task complete'))
		done();
}


gulp.task('styles', processStyles);
