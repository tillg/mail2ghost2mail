const logger = require('../config/logger')('app:postAuthors');

let postAuthors;
let postAuthorEmailAddresses = [];
let email2PostAuthor;

const normalizeEmail = (mail) => {
	return mail.toLowerCase().trim();
};

const preCalcEmails = () => {
	let emailAddresses = [];
	email2PostAuthor = new Map();
	Object.keys(postAuthors).map((postAuthor) => {
		emailAddresses = emailAddresses.concat(
			postAuthors[postAuthor].emailAddresses.map(normalizeEmail)
		);
		postAuthors[postAuthor].emailAddresses.forEach((email) => {
			email2PostAuthor.set(normalizeEmail(email), normalizeEmail(postAuthor));
		});
	});
	postAuthorEmailAddresses = emailAddresses;
	return;
};

const initialize = (options) => {
	if (options && options.postAuthors) {
		postAuthors = options.postAuthors;
		preCalcEmails();
	}
	if (
		!postAuthors ||
		postAuthors.length == 0 ||
		!email2PostAuthor ||
		email2PostAuthor.size == 0
	) {
		logger.error(
			`postAuthor cannot operate without postAuthors. Pls fix your configuration!`
		);
	}
};

const isValidEmailAddress = (email, options) => {
	initialize(options);
	return postAuthorEmailAddresses.includes(normalizeEmail(email));
};

const getPostAuthorForEmail = (mail, options) => {
	initialize(options);
	const postAuthor = email2PostAuthor.get(normalizeEmail(mail));
	if (!postAuthor)
		logger.warn(
			`getPostAuthorForEmail: Could not find post author for email address ${normalizeEmail(
				mail
			)}`
		);
	return postAuthor;
};

module.exports = { initialize, isValidEmailAddress, getPostAuthorForEmail };
