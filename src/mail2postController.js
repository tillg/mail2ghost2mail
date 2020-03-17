const logger = require('./config/logger')('app:mail2postController');
const { getUnreadMails, markMailAsRead } = require('./services/mail');
const { transformToPost } = require('./services/mail2post');
const { addPost } = require('./services/post');

const processUnreadMail = mail => {
	const post = transformToPost(mail);
	return addPost(post)
		.catch(err => {
			logger.error(
				`processUnreadMails: Error when adding post. Email will be marked as read nevertheless.`
			);
		})
		.then(() => markMailAsRead(mail))
		.catch(err => {
			logger.error(
				`Error when marking email as read: ${email.subject}\n     Error: ${err}`
			);
		});
};

// read & process unread emails from inbox
const processUnreadMails = () => {
	logger.info(`processUnreadMails: Processing unread Emails...`);
	return getUnreadMails().then(mails => {
		logger.info(`processUnreadMails: Processing ${mails.length} emails.`);
		mails.forEach(mail => processUnreadMail(mail));
	});
};

// Wait for new, incoming mails

module.exports = { processUnreadMails };
