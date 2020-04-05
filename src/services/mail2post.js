const config = require('config');
const logger = require('../config/logger')('app:mail2post');

const transformToPost = (mail) => {
	const emailAdressOfSender = [mail.from.value[0].address] + '';
	logger.info(
		`transformToPost: Processing email of sender ${emailAdressOfSender}. Email is of type ${typeof emailAdressOfSender}`
	);
	const validAuthors = config
		.get('validAuthors')
		.map((email) => email.toLowerCase());
	const candidateAuthor = emailAdressOfSender.toLowerCase();
	if (!validAuthors.includes(candidateAuthor)) {
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
