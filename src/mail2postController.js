const logger = require('./config/logger')('app:mail2postController');
const {
	getUnreadMailsFromConnection,
	markMailAsRead,
	getConnection,
} = require('./services/mail');
const { transformToPost } = require('./services/mail2post');
const { addPost } = require('./services/post');

let connection;

const processUnreadMail = (mail) => {
	const post = transformToPost(mail);
	return addPost(post)
		.catch((err) => {
			logger.error(
				`processUnreadMails: Error when adding post. Email will be marked as read nevertheless.`
			);
		})
		.then(() => markMailAsRead(mail))
		.catch((err) => {
			logger.error(
				`Error when marking email as read: ${email.subject}\n     Error: ${err}`
			);
		});
};

// read & process unread emails from inbox
const processUnreadMailsFromConnection = (connection) => {
	logger.info(`processUnreadMailsFromConnection: Processing unread Emails...`);
	return getUnreadMailsFromConnection(connection).then((mails) => {
		logger.info(
			`processUnreadMailsFromConnection: Processing ${mails.length} emails.`
		);
		mails.forEach((mail) => processUnreadMail(mail));
	});
};

const launchMailProcessing = () => {
	getConnection((num) => {
		logger.info(
			`launchMailProcessing: Received a notification. No of mails: ${num}`
		);
		processUnreadMailsFromConnection(connection);
	})
		.then((localConnection) => {
			logger.info(
				`launchMailProcessing: Set connection, waiting for incoming mails.`
			);
			connection = localConnection;
			return localConnection;
		})
		.then((connection) => processUnreadMailsFromConnection(connection));
};

// Wait for new, incoming mails

module.exports = { launchMailProcessing };
