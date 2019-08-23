var request = require('request');

var Q = require('q');

function invite (channel, email, token) {

	var d = Q.defer();

	request({
		url: 'https://' + channel + '.slack.com/api/users.admin.invite',
		method: 'POST',
		qs: {
			t: 1416723927
		},
		form: {
			email: email,
			token: token,
			set_active: true,
			_attempts: 1
		}
	}, function (error, response, body) {
		body = JSON.parse(body);

		if (error || !body || !body.ok) {
			d.resolve(error || body && body.error || 'Could not invite user.');
		} else {
			d.resolve('Invited user.');
		}
	});

	return d.promise;
}

var SlackForm = function (config) {
	this.typeformApiKey = config.typeformApiKey;
	this.typeformId = config.typeformId;
	this.typeformEmail = config.typeformEmail;
	this.slackChannel = config.slackChannel;
	this.slackToken = config.slackToken;
}

SlackForm.prototype.invite = function (callback) {
	var that = this;

	var hour = 60 * 60 * 1;

	request({
		url: 'https://api.typeform.com/v0/form/' + this.typeformId,
		method: 'GET',
		qs: {
			key: this.typeformApiKey,
			completed: true,
			since: Math.floor(Date.now() / 1000) - hour
		}
	}, function (error, response, body) {

		var data = JSON.parse(body);

		if (!data || !data.responses || !data.responses.length) {
			return callback(null, 'No results.');
		}

		Q.all(data.responses.map(function (response) {

			return invite(that.slackChannel, response.answers[that.typeformEmail], that.slackToken);
		})).then(function (data) {
			callback(null, data);
		});
	});

}

/*************************************
//TODO: CHANGE YOUR DATA HERE
*************************************/
var slackForm = new SlackForm({
    typeformApiKey: '3df69f8f21a21f6211fc089bad94c90b07c59e85',
    typeformId: 'XMhbbW',
    typeformEmail: 'email_33436254',
    slackChannel: 'angelhack',
    slackToken: 'xoxp-34110702418-123709501942-219040654465-3eda5c4b8c46e38ad0d784c63a74d049'
});

exports.handler = function(phone, context, callback) {
    console.log("function inviteTypeFormToSlack()");

	slackForm.invite(function (err, data) {
		if (err) {
			throw err;
		}

		console.log(data);
	});



}
