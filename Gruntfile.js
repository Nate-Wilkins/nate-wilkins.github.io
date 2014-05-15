'use strict';

var fs = require('fs'),
	path = require('path');

var loadGruntTasks = require('load-grunt-tasks'),
	exec = require('exec'),
	npm = require('npm');

module.exports = function (grunt) {
	var config = {
		pkg: grunt.file.readJSON('package.json'),

		gitclone: {
			docs: {
				options: {
					username: 'nate-wilkins',
					forked: false,
					clone: 'all',
					subset: [
						"angular-lint",
						"grunt-wildamd"
					]
				},
				dest: "./repositories"
			}
		},

		repodocs: {
			docs: {
				options: {
					generators: [
						{
							file: "Gruntfile.js",
							process: function (fullPath, files, callback) {
								var dir = path.dirname(fullPath);
								if (dir.indexOf("node_modules") > -1) { callback(); return; }

								grunt.log.writeln(fullPath);
								npm.load(grunt.file.readJSON(path.join(dir, "package.json")), function (err) {
									if (err) { callback(err); return; }
									npm.commands.install(dir, [], callback);
								});
								// npm.on("log", grunt.log.writeln);
							}
						}
					]
				},
				src: "./repositories"
			}
		}
	};

	grunt.initConfig(config);

	loadGruntTasks(grunt);
	grunt.loadTasks("./tasks");

	grunt.registerTask('default', [
		'gitclone',
		'repodocs'
	]);
};
