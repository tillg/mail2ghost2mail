const logger = require('./config/logger')('app:mail2postController');
const {
	getUnreadMailsFromConnection,
	markMailAsRead,
	getImapConnection
} = require('./services/mail');
const { transformToPost } = require('./services/mail2post');
const { addPost } = require('./services/post');
let connection;
let processCount = 0;
let connectionIsBusy = false;

const processUnreadMail = mail => {
	const post = transformToPost(mail);
	return addPost(post)
		.catch(err => {
			logger.error(
				`processUnreadMail[${processId}]: Error when adding post. Email will be marked as read nevertheless.`
			);
		})
		.then(() => markMailAsRead(mail))
		.catch(err => {
			logger.error(
				`processUnreadMail[${processId}]: Error when marking email as read: ${email.subject}\n     Error: ${err}`
			);
		});
};

// read & process unread emails from inbox
const processUnreadMails = processId => {
	if (!connection) {
		logger.warn(`processUnreadMails[${processId}]: No connection, aborting`);
		return Promise.resolve();
	} else if (connectionIsBusy) {
		logger.warn(`processUnreadMails[${processId}]: Connection busy, aborting`);
		return Promise.resolve();
	} else {
		logger.info(
			`processUnreadMails[${processId}]: Starting to process unread Emails...`
		);
		connectionIsBusy = true;
		return getUnreadMailsFromConnection(connection)
			.then(mails => {
				let msg;
				if (mails) {
					msg = `processUnreadMails[${processId}]: Loaded ${mails.length} unread emails to process.`;
				} else {
					msg = `processUnreadMails[${processId}]: No unread mails, nothing to do.`;
				}
				logger.info(msg);
				let mailProcessingPromises = [];
				if (mails)
					mails.forEach(mail => {
						mailProcessingPromises.push(processUnreadMail(mail, processId));
					});
				return Promise.all(mailProcessingPromises);
			})
			.catch(err => {
				logger.warn(`processUnreadMails[${processId}]: ${err}`);
			})
			.then(() => {
				connectionIsBusy = false;
				logger.info(
					`processUnreadMails[${processId}]: Connection set to not busy anymore.`
				);
			});
	}
};

const imapEventHandler = num => {
	logger.info(`imapEventHandler: onMail fired, No of affected mails: ${num}`);
	processCount++;
	const myProcessId = 'imapEvent:' + processCount;
	processUnreadMails(myProcessId);
};

const launchMailProcessing = () => {
	getImapConnection(imapEventHandler)
		.then(localConnection => {
			connection = localConnection;
			logger.info(
				`launchMailProcessing: Set connection, waiting for incoming mails.`
			);
			//processUnreadMailsFromConnection(localConnection);
		})
		.then(() => {
			processCount++;
			const myProcessId = 'launchMailProcessing:' + processCount;
			return processUnreadMails(myProcessId);
		});
};

module.exports = { launchMailProcessing };
