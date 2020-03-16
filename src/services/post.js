const GhostAdminAPI = require('@tryghost/admin-api');
const GhostContentAPI = require('@tryghost/content-api');
const logger = require('../config/logger')('app:post');
const config = require('config');

const adminApi = new GhostAdminAPI({
	url: process.env.GHOST_API_URL,
	key: process.env.GHOST_ADMIN_API_KEY,
	version: 'v3'
});

const contentApi = new GhostContentAPI({
	url: process.env.GHOST_API_URL,
	key: process.env.GHOST_CONTENT_API_KEY,
	version: 'v3'
});

const getPosts = () => {
	adminApi.posts.browse({ include: 'tags,authors' }).then(posts => {
		logger.info(`getPosts: Retrieved ${posts.length} posts.`);
		posts.forEach(post => logger.info(JSON.stringify(post, null, 4)));
		return posts;
	});
};

const getAuthors = () => {
	return contentApi.authors.browse({ include: 'email' }).then(authors => {
		logger.info(`getAuthors: Retrieved ${authors.length} authors.`);
		authors.forEach(author =>
			logger.info(`getAuthors: ${JSON.stringify(author, null, 4)}`)
		);
		return authors;
	});
};

const addPost = post => {
	// Check that post has a proper author
	const validAuthors = config.get('validAuthors');
	if (!validAuthors.includes(post.authors[0])) {
		return Promise.reject(
			`addPost: Author ${post.authors[0]} not valid, post will not be created.\n   Valid authors are ${validAuthors}`
		);
	}

	return adminApi.posts.add(post, { source: 'html' });
};

module.exports = { getPosts, getAuthors, addPost };
