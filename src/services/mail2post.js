const transformToPost = mail => {
	const post = {
		status: 'published',
		title: mail.subject,
		html: mail.html ? mail.html : mail.textAsHtml
	};
	return post;
};

module.exports = { transformToPost };
