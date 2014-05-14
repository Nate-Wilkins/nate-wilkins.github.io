//http://mikedeboer.github.io/node-github/#repos.prototype.getFromUser

var //dgeni = require('dgeni'),
	GitHubClient = require("github"),
	nodegit = require("nodegit");

// Shorthand
var clone = nodegit.Repo.clone;

var client = new GitHubClient({
	version: "3.0.0"
});

module.exports = function (grunt) {
	grunt.initConfig({

	});

	grunt.registerTask('gitclone', "", function () {
		var done = this.async();

		client.repos.getFromUser({
			user: 'nate-wilkins'
		}, function (err, res) {
			if (err) { done(err); return err; }
			console.log(JSON.stringify(res));

			clone("https://github.com/nodegit/nodegit", "dest", null, done);

			done();
		});
	});

	grunt.registerTask('default', ['gitclone']);
};