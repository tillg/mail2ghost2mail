const transformToPost = mail => {
	const post = {
		status: 'published',
		published_at: mail.date,
		title: mail.subject,
		authors: [mail.from.value[0].address],
		html: mail.html ? mail.html : mail.textAsHtml
	};
	return post;
};

module.exports = { transformToPost };
