const logger = require('../config/logger')('app:imapIn');
const Imap = require('imap');
const inspect = require('util').inspect;

const imap = new Imap({
	user: process.env.IMAP_USER,
	password: process.env.IMAP_PASSWORD,
	host: process.env.IMAP_HOST,
	port: process.env.IMAP_PORT,
	tls: process.env.IMAP_TLS,
	tlsOptions: {
		rejectUnauthorized: false
	}
});

processEmailObject = mail => {
	logger.info(
		`processEmailObject: #${mail.seqno ? mail.seqno : 'Unknown'}\n  From: ${
			mail.header.from
		} \n  Subject: ${mail.header.subject} \n  ${mail.header.date}`
	);
};

processEmailStream = emailStream => {
	let body = '';
	let header;
	let attributes;
	let seqno;

	emailStream.on('body', function(stream, info) {
		logger.info(`processEmailStream: #${info.seqno}`);
		seqno = info.seqno;
		stream.on('data', function(chunk) {
			body += chunk.toString('utf8');
		});
		stream.once('end', function() {
			header = Imap.parseHeader(body);
			// console.log(
			// 	prefix + 'Parsed header: %s',
			// 	inspect(Imap.parseHeader(body))
			// );
		});
	});
	emailStream.once('attributes', function(attrs) {
		attributes = inspect(attrs, false, 8);
		//console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
	});
	emailStream.once('end', function() {
		const emailObject = {
			body,
			header,
			attributes,
			seqno
		};
		processEmailObject(emailObject);
		logger.info(`processEmailStream: #${seqno}: Finished `);
	});
};

function openInbox(cb) {
	imap.openBox('INBOX', true, cb);
}

processUnseenEmails = () => {
	logger.info(
		`processUnseenEmails: Connecting to IMAP Server ${process.env.IMAP_HOST} for user ${process.env.IMAP_USER}...`
	);
	imap.once('ready', function() {
		logger.info(
			`processUnseenEmails: Connected to IMAP Server ${process.env.IMAP_HOST} for user ${process.env.IMAP_USER}.`
		);
		openInbox(function(err, box) {
			if (err) throw err;
			logger.info(`processUnseenEmails: Open box: ${box.name}`);
			imap.search(['UNSEEN'], function(err, results) {
				if (err) throw err;
				logger.info(`Length of results: ${results.length}`);
				var f = imap.fetch(results, { bodies: '' });
				f.on('message', function(msg, seqno) {
					processEmailStream(msg);
				});
				f.once('error', function(err) {
					logger.error(`processUnseenEmails: Fetch error: ${err}`);
				});
				f.once('end', function() {
					logger.info(`processUnseenEmails: Done fetching all messages`);
					imap.end();
				});
			});
		});
	});

	imap.once('error', function(err) {
		logger.error(`processUnseenEmails: ${err}`);
	});

	imap.once('end', function() {
		logger.info(`processUnseenEmails: Connection ended`);
	});

	imap.connect();
};

module.exports = processUnseenEmails;
