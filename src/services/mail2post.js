const config = require('config');
const logger = require('../config/logger')('app:mail2post');
const {
	isValidEmailAddress,
	getPostAuthorForEmail,
	initialize,
} = require('./postAuthor');
const postAuthors = config.get('postAuthors');
initialize({ postAuthors });

const transformToPost = (mail) => {
	const emailAdressOfSender = [mail.from.value[0].address] + '';
	logger.info(
		`transformToPost: Processing email of sender ${emailAdressOfSender}. Email is of type ${typeof emailAdressOfSender}`
	);

	if (!isValidEmailAddress(emailAdressOfSender)) {
		const errStr = `transformToPost: Author ${candidateAuthor} not valid, post will not be created.`;
		logger.error(errStr);
		return null;
	}
	const postAuthor = getPostAuthorForEmail(emailAdressOfSender);
	const post = {
		status: 'published',
		published_at: mail.date,
		title: mail.subject,
		authors: [postAuthor],
		html: mail.html ? mail.html : mail.textAsHtml,
	};
	return post;
};

module.exports = { transformToPost };
