var imaps = require('imap-simple');

/* var config = {
	imap: {
		user: 'your@email.address',
		password: 'yourpassword',
		host: 'imap.gmail.com',
		port: 993,
		tls: true,
		authTimeout: 3000
	}
}; */

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

function doIt() {
	imaps.connect(config).then(function(connection) {
		connection
			.openBox('INBOX')
			.then(function() {
				// Fetch emails from the last 24h
				var delay = 24 * 3600 * 1000;
				var yesterday = new Date();
				yesterday.setTime(Date.now() - delay);
				yesterday = yesterday.toISOString();
				var searchCriteria = ['UNSEEN', ['SINCE', yesterday]];
				var fetchOptions = {
					bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
					struct: true
				};

				// retrieve only the headers of the messages
				return connection.search(searchCriteria, fetchOptions);
			})
			.then(function(messages) {
				var attachments = [];

				messages.forEach(function(message) {
					var parts = imaps.getParts(message.attributes.struct);
					attachments = attachments.concat(
						parts
							.filter(function(part) {
								return (
									part.disposition &&
									part.disposition.type.toUpperCase() === 'ATTACHMENT'
								);
							})
							.map(function(part) {
								// retrieve the attachments only of the messages with attachments
								return connection
									.getPartData(message, part)
									.then(function(partData) {
										return {
											filename: part.disposition.params.filename,
											data: partData
										};
									});
							})
					);
				});

				return Promise.all(attachments);
			})
			.then(function(attachments) {
				console.log(attachments);
				// =>
				//    [ { filename: 'cats.jpg', data: Buffer() },
				//      { filename: 'pay-stub.pdf', data: Buffer() } ]
			});
	});
}

module.exports = doIt;
