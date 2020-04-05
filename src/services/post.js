const GhostAdminAPI = require('@tryghost/admin-api');
const GhostContentAPI = require('@tryghost/content-api');
const logger = require('../config/logger')('app:post');

// Check that env vars are set
if (
	!process.env.GHOST_API_URL ||
	!process.env.GHOST_ADMIN_API_KEY ||
	!process.env.GHOST_CONTENT_API_KEY
) {
	const errStr = `post.js: Environment variables GHOST_ADMIN_API_KEY, GHOST_CONTENT_API_KEY and GHOST_API_URL must be set.`;
	logger.error(errStr);
	throw new Error(errStr);
}

const adminApi = new GhostAdminAPI({
	url: process.env.GHOST_API_URL,
	key: process.env.GHOST_ADMIN_API_KEY,
	version: 'v3',
});

const contentApi = new GhostContentAPI({
	url: process.env.GHOST_API_URL,
	key: process.env.GHOST_CONTENT_API_KEY,
	version: 'v3',
});

const getPosts = () => {
	adminApi.posts.browse({ include: 'tags,authors' }).then((posts) => {
		logger.info(`getPosts: Retrieved ${posts.length} posts.`);
		posts.forEach((post) => logger.info(JSON.stringify(post, null, 4)));
		return posts;
	});
};

const getAuthors = () => {
	return contentApi.authors.browse({ include: 'email' }).then((authors) => {
		logger.info(`getAuthors: Retrieved ${authors.length} authors.`);
		authors.forEach((author) =>
			logger.info(`getAuthors: ${JSON.stringify(author, null, 4)}`)
		);
		return authors;
	});
};

const addPost = (post) => {
	if (post) return adminApi.posts.add(post, { source: 'html' });
	return Promise.reject('addPost: Cannot create an empty post');
};

module.exports = { getPosts, getAuthors, addPost };
