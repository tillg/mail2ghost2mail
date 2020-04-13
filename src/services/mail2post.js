const config = require('config');
const logger = require('../config/logger')('app:mail2post');

const validAuthorEmailAddresses = () => {
	let emailAddresses = [];
	const validAuthors = config.get('validAuthors');
	Object.keys(validAuthors).map((ghostAuthor) => {
		logger.info(
			`Merging author ${ghostAuthor} with email addresses ${validAuthors[ghostAuthor].emailAddresses}`
		);
		emailAddresses = emailAddresses.concat(
			validAuthors[ghostAuthor].emailAddresses
		);
	});
	logger.info(
		`validAuthorEmailAddresses: Created validAuthorsEmailAddresses:${emailAddresses}`
	);
	return emailAddresses;
};

const transformToPost = (mail) => {
	const emailAdressOfSender = [mail.from.value[0].address] + '';
	logger.info(
		`transformToPost: Processing email of sender ${emailAdressOfSender}. Email is of type ${typeof emailAdressOfSender}`
	);

	const candidateAuthor = emailAdressOfSender.toLowerCase();
	if (!validAuthorEmailAddresses().includes(candidateAuthor)) {
		const errStr = `transformToPost: Author ${candidateAuthor} not valid, post will not be created.\n   Valid authors are ${validAuthors}`;
		logger.error(errStr);
		return null;
	}
	const post = {
		status: 'published',
		published_at: mail.date,
		title: mail.subject,
		authors: [mail.from.value[0].address],
		html: mail.html ? mail.html : mail.textAsHtml,
	};
	return post;
};

module.exports = { transformToPost };
