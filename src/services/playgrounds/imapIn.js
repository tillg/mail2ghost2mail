const logger = require('../../config/logger')('app:imapIn');
const Imap = require('imap');
const inspect = require('util').inspect;
const fs = require('fs');

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

function findTextPart(struct) {
	for (var i = 0, len = struct.length, r; i < len; ++i) {
		if (Array.isArray(struct[i])) {
			if ((r = findTextPart(struct[i]))) return r;
		} else if (
			struct[i].type === 'text' &&
			(struct[i].subtype === 'plain' || struct[i].subtype === 'html')
		)
			return [struct[i].partID, struct[i].type + '/' + struct[i].subtype];
	}
}

processEmailObject = mail => {
	logger.info(
		`processEmailObject: #${mail.seqno ? mail.seqno : 'Unknown'}\n  From: ${
			mail.header.from
		} \n  Subject: ${mail.header.subject} \n  ${mail.header.date}`
	);
	fs.writeFile(
		`email_no_${mail.seqno}.json`,
		JSON.stringify(mail, null, 4),
		'utf8',
		function(err) {
			if (err) {
				logger.error(
					`processEmailObject: An error occured while writing JSON Object to File: ${err}`
				);
				return err;
			}
		}
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
		attributes = attrs; //inspect(attrs, false, 8);
		if (attrs.struct.length > 1) {
			// const partIds = attrs.struct[1][1].forEach(part => {
			// 	part.partId;
			// });
			const partIds = findTextPart(attrs.struct);
			logger.info(
				`processEmailStream: #${seqno}: partIDs: ${JSON.stringify(
					partIds,
					null,
					4
				)}`
			);
		}
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
				logger.info(
					`processUnseenEmails: Messages to be retrieved: ${results}`
				);
				if (err) throw err;
				//logger.info(`Length of results: ${results.length}`);
				var f = imap.fetch(results, {
					bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', '1.1', '1.2'],
					struct: true
				});
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
		logger.error(`processUnseenEmails: ${JSON.stringify(err, null, 4)}`);
	});

	imap.once('end', function() {
		logger.info(`processUnseenEmails: Connection ended.`);
	});

	imap.connect();
};

module.exports = processUnseenEmails;
