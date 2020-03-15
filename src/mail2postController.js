const logger = require('./config/logger')('app:mail2postController');
const { getUnreadMails } = require('./services/mail');
const { transformToPost } = require('./services/mail2post');
const { addPost } = require('./services/post');

// read & process unread emails from inbox
const processUnreadMails = () => {
	logger.info(`Processing unread Emails...`);
	getUnreadMails().then(mails => {
		logger.info(`Processing ${mails.length} emails.`);
		mails.forEach(mail => {
			const post = transformToPost(mail);
			addPost(post)
				.then(`Successfully added new post: ${post.title}`)
				.catch(err => {
					log.error(`Error when adding post: ${err}`);
				});
		});
	});
};

// Wait for new, incoming mails

module.exports = { processUnreadMails };
