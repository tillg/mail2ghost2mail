const logger = require('../config/logger')('app:imapIn-simple');
const imaps = require('imap-simple');
const inspect = require('util').inspect;
const fs = require('fs');
const simpleParser = require('mailparser').simpleParser;

const config = {
	imap: {
		user: process.env.IMAP_USER,
		password: process.env.IMAP_PASSWORD,
		host: process.env.IMAP_HOST,
		port: process.env.IMAP_PORT,
		tls: process.env.IMAP_TLS,
		tlsOptions: {
			rejectUnauthorized: false
		}
	}
};

processUnseenEmails = () => {
	logger.info(
		`processUnseenEmails: Connecting to IMAP Server ${process.env.IMAP_HOST} for user ${process.env.IMAP_USER}...`
	);
	imaps.connect(config).then(function(connection) {
		connection
			.openBox('INBOX')
			.then(function() {
				var searchCriteria = ['UNSEEN'];

				var fetchOptions = {
					bodies: ['HEADER', 'TEXT'],
					markSeen: false,
					struct: true
				};

				return connection.search(searchCriteria, fetchOptions);
			})
			.then(function(messages) {
				logger.info(
					`processUnseenEmails: No of messages: ${
						messages.length
					}, typeof: ${typeof messages}, keys: ${Object.keys(messages)}`
				);
				messages.forEach(message => {
					processMessageMessageParser(message, connection);
				});
			});
	});
};

const processMessageMessageParser = message => {
	const options = {};
	simpleParser(message, options)
		.then(parsed => {
			logger.info(`processMessageMessageParser: ${parsed}`);
		})
		.catch(err => {
			logger.error(`processMessageMessageParser: ${err}`);
		});
};
processMessage = (message, connection) => {
	const subject = message.parts.filter(function(part) {
		return part.which === 'HEADER';
	})[0].body.subject[0];
	const parts = imaps.getParts(message.attributes.struct);
	Object.keys(parts).forEach(key => {
		const part = parts[key];
		const dispoType = part.disposition && part.disposition.type;
		logger.info(
			`processUnseenEmails: ${subject}: Part[${key}]  partId: ${part.partID}, type/subtype: ${part.type}/${part.subtype}, disposition type: ${dispoType}`
		);
		let attachment;
		if (dispoType === 'ATTACHMENT') {
			connection.getPartData(message, part).then(function(partData) {
				attachment = {
					filename: part.disposition.params.filename,
					data: partData
				};
				logger.info(`processUnseenEmails: ${subject}: attachment`);
				console.log(attachment);
			});
		}
	});
};
module.exports = processUnseenEmails;
