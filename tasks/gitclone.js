'use strict';

// region --Dependencies

var path = require('path'),
	fs = require('fs');

var async = require('async'),
	exec = require('exec'),
	wrench = require('wrench'),
	GitHubClient = require('github');

// endregion

// Helpers

var clone = function (src, dest, callback) {
	wrench.mkdirSyncRecursive(dest);
	exec(["git", "clone", src, dest], callback);
};

var repull = function (dir, callback) {
	// ** danger **
	// Be aware that this removes all working directory changes make sure
	// the current working directory is correct!
	// ** danger **
	exec(["git", "reset", "--hard"], { cwd: dir }, function (err) {
		if (err) { callback(err); return; }
		exec(["git", "pull"], { cwd: dir }, callback);
	});
};

module.exports = function (grunt) {
	var client = new GitHubClient({
		version: "3.0.0"
	});

	var task = function () {
		var done = this.async(),
			options = this.options({
				username: "nate-wilkins",
				forked: false,
				subset: 'all'
			});
		options.dest = this.files[0].dest;

		client.repos.getFromUser({
			user: options.username
		}, function (err, repositories) {
			if (err || !repositories) { done(err); return; }

			async.filter(repositories, function (repo, filterCallback) {
				if (!options.forked && repo.fork) { filterCallback(false); return; }
				if (options.subset === 'all') { filterCallback(true); return; }
				if (grunt.util.kindOf(options.subset) !== 'array') { filterCallback(false); return; }
				async.detect(options.subset, function (cloned, hasCallback) { hasCallback(cloned === repo.name); }, filterCallback);
			}, function (filtered) {
				async.each(filtered, function (repo, clonedCallback) {
					var clonePath = path.join(options.dest, repo.name);
					if (fs.existsSync(clonePath)) {
						repull(clonePath, clonedCallback);
						return;
					}
					clone(repo["clone_url"], clonePath, clonedCallback);
				}, done);
			});
		});
	};

	grunt.registerMultiTask(path.basename(__filename, '.js'), task);
};
