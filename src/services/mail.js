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
	return imaps.connect(config).then(function(connection) {
		return connection.openBox('INBOX').then(function() {
			const searchCriteria = ['UNSEEN'];
			const fetchOptions = {
				bodies: ['HEADER', 'TEXT', '']
			};
			return connection.search(searchCriteria, fetchOptions).then(rawMails => {
				let mailsPromises = [];
				rawMails.forEach(function(item) {
					var all = _.find(item.parts, { which: '' });
					var id = item.attributes.uid;
					var idHeader = 'Imap-Id: ' + id + '\r\n';
					mailsPromises.push(simpleParser(idHeader + all.body));
				});
				return Promise.all(mailsPromises);
			});
		});
	});
};
module.exports = { getUnreadMails };
