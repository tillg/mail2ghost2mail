const logger = require('../config/logger')('app:mail');
const imaps = require('imap-simple');
const _ = require('lodash');
const fs = require('fs');
const { inspect } = require('util');
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

const getUnreadMails = () => {
	return imaps.connect(config).then(connection => {
		return connection.openBox('INBOX').then(() => {
			const searchCriteria = ['UNSEEN'];
			const fetchOptions = {
				bodies: ['HEADER', 'TEXT', '']
			};
			return connection.search(searchCriteria, fetchOptions).then(rawMails => {
				let mailsPromises = [];
				rawMails.forEach(function(item) {
					const all = _.find(item.parts, { which: '' });
					const uid = item.attributes.uid;
					const idHeader = 'Imap-Id: ' + uid + '\r\n';
					let mailPromise = simpleParser(idHeader + all.body).then(mail => {
						return { ...mail, uid };
					});

					mailsPromises.push(mailPromise);
				});
				return Promise.all(mailsPromises);
			});
		});
	});
};

const markMailAsRead = mail => {
	logger.info(`markMailAsRead: Marking Mail as read: ${mail.subject}`);

	return imaps
		.connect(config)
		.then(connection => {
			return connection
				.openBox('INBOX')
				.then(() => connection.addFlags(mail.uid, 'SEEN'));
		})
		.catch(err => {
			logger.error(`markMailAsRead: Error when marking mail as unread: ${err}`);
			throw err;
		});
};

module.exports = { getUnreadMails, markMailAsRead };
