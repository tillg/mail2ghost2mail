const logger = require('./config/logger')('app:mail2postController');
const { getUnreadMails, markMailAsRead } = require('./services/mail');
const { transformToPost } = require('./services/mail2post');
const { addPost } = require('./services/post');

// read & process unread emails from inbox
const processUnreadMails = () => {
	logger.info(`processUnreadMails: Processing unread Emails...`);
	getUnreadMails().then(mails => {
		logger.info(`processUnreadMails: Processing ${mails.length} emails.`);
		mails.forEach(mail => {
			const post = transformToPost(mail);
			addPost(post)
				.then(() => markMailAsRead(mail))
				.catch(err => {
					logger.error(`processUnreadMails: Error when adding post: ${err}`);
					throw err;
				});
		});
	});
};

// Wait for new, incoming mails

module.exports = { processUnreadMails };
