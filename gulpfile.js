var gulp =  require('gulp'),

	plumber = require('gulp-plumber'),
	connect = require('gulp-connect'),
	svgSprite = require('gulp-svg-sprite');

gulp.task('watch-connect', function () {
	connect.server({
		root: '.',
		livereload: true
	});
});


gulp.task('svg', function () {
	gulp.src('./src/images/**/*.svg')
		.pipe(plumber())
		.pipe(svgSprite({
			mode: {
				defs: {
					dest: '',
					sprite: 'sprite.defs.svg'
				}
			}
		}))
		.pipe(gulp.dest('./src/images'));
});
