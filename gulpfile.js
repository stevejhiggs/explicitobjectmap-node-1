'use strict';

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');

gulp.task('lint', () =>
  gulp.src(['src/**/*.js', 'tests/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
);

gulp.task('test', ['lint'], () => {
  gulp.src('tests/**/*.js')
    .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('watch', ['test'], () => {
  gulp.watch(['src/**/*.js', 'tests/**/*.js'], ['test']);
});

gulp.task('default', ['test']);
