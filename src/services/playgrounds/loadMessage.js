const logger = require('../../config/logger')('app:loadMessage');
const Imap = require('imap');
const inspect = require('util').inspect;
const fs = require('fs');

const MSG_NR = '13';

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

function getMsgByUID(uid, cb, partID) {
	logger.info(`getMsgByUID: Getting msg with UID ${uid}`);
	var f = imap.fetch(
			uid,
			partID
				? { bodies: ['HEADER.FIELDS (TO FROM SUBJECT)', partID[0]] }
				: { struct: true }
		),
		hadErr = false;

	if (partID) var msg = { header: undefined, body: '', attrs: undefined };

	f.on('error', function(err) {
		hadErr = true;
		cb(err);
	});

	if (!partID) {
		logger.info(`getMsgByUID: Called w/o a partID`);
		f.on('message', function(m) {
			logger.info(`getMsgByUID: message event fired...`);
			m.on('attributes', function(attrs) {
				partID = findTextPart(attrs.struct);
			});
		});
		f.on('end', function() {
			logger.info(`getMsgByUID: end event fired...`);
			if (hadErr) return;
			if (partID) getMsgByUID(uid, cb, partID);
			else cb(new Error('No text part found for message UID ' + uid));
		});
	} else {
		f.on('message', function(m) {
			m.on('body', function(stream, info) {
				var b = '';
				stream.on('data', function(d) {
					b += d;
				});
				stream.on('end', function() {
					if (/^header/i.test(info.which)) msg.header = Imap.parseHeader(b);
					else msg.body = b;
				});
			});
			m.on('attributes', function(attrs) {
				msg.attrs = attrs;
				msg.contentType = partID[1];
			});
		});
		f.on('end', function() {
			if (hadErr) return;
			cb(undefined, msg);
		});
	}
}

function getTheMsg() {
	logger.info(`Getting message #${MSG_NR}`);
	return getMsgByUID(MSG_NR, function(err, msg) {
		if (err) throw err;
		console.log(inspect(msg, false, 10));
	});
}

module.exports = getTheMsg;
