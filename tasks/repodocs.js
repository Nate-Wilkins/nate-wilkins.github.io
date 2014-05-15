'use strict';

// region --Dependencies

var path = require('path'),
	fs = require('fs');

var async = require('async'),
	exec = require('exec'),
	wrench = require('wrench');

// endregion

// Helpers

var normalizePaths = function (dir, paths, filter, callback) {
	async.map(paths, function (basePath, mapCallback) {
		mapCallback(null, path.join(dir, basePath));
	}, function (err, fullPaths) {
		async.filter(fullPaths, function (fullPath, filterCallback) {
			fs.stat(fullPath, function (err, stats) {
				if (err) { filterCallback(false); return; }
				filter(stats, fullPath, filterCallback);
			});
		}, callback);
	});
};

module.exports = function (grunt) {
	var execute = function (files, generators, executeCallback) {
		async.eachSeries(files, function (file, fileCallback) {
			async.eachSeries(generators, function (generator, genCallback) {
				if (generator.file !== path.basename(file)) { genCallback(); }
				generator.process(file, files, genCallback);
			}, fileCallback);
		}, executeCallback);
	};

	var process = function (repoDir, generators, processCallback) {
		var allGeneratorFiles = [];

		wrench.readdirRecursive(repoDir, function (err, paths) {
			if (err) { processCallback(err); return; }
			if (!err && !paths) { execute(allGeneratorFiles, generators, processCallback); return; }

			normalizePaths(repoDir, paths, function (stats, fullPath, callback) {
				var isFile = stats.isFile();
				async.detect(generators, function (generator, genCallback) {
					genCallback(generator.file === path.basename(fullPath));
				}, function (first) { callback(isFile && first); });
			}, function (genFiles) {
				async.eachSeries(genFiles, function (file, pushCallback) {
					allGeneratorFiles.push(file);
					pushCallback();
				});
			});
		});
	};

	var task = function () {
		var done = this.async(),
			options = this.options({
				generators: [

				]
			});
		options.src = this.files[0].src[0];

		fs.readdir(options.src, function (err, paths) {
			if (err) { done(err); return; }

			normalizePaths(options.src, paths, function (stats, fullPath, callback) {
				callback(stats.isDirectory());
			}, function (repoDirs) {
				async.each(repoDirs, function (dir, callback) {
					process(dir, options.generators, callback);
				}, done);
			});
		});
	};

	grunt.registerMultiTask(path.basename(__filename, '.js'), task);
};
