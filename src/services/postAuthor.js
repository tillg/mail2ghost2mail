const logger = require('../config/logger')('app:postAuthors');

let postAuthors;
let postAuthorEmailAddresses = [];

const reCalcValidEmailAddresses = () => {
	let emailAddresses = [];
	Object.keys(postAuthors).map(postAuthor => {
		emailAddresses = emailAddresses.concat(
			postAuthors[postAuthor].emailAddresses
		);
	});
	postAuthorEmailAddresses = emailAddresses;
	return;
};

const initialize = options => {
	if (options && options.postAuthors) {
		postAuthors = options.postAuthors;
		reCalcValidEmailAddresses();
	}
	if (!postAuthors || postAuthors.length == 0) {
		logger.error(
			`postAuthor cannot operate without postAuthors. Pls fix your configuration!`
		);
	}
};

const isValidEmailAddress = (email, options) => {
	initialize(options);
	return postAuthorEmailAddresses.includes(email);
};

module.exports = { initialize, isValidEmailAddress };
