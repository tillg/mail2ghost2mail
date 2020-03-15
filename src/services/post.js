const GhostAdminAPI = require('@tryghost/admin-api');
const GhostContentAPI = require('@tryghost/content-api');
const logger = require('../config/logger')('app:post');

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
	adminApi.posts.browse().then(posts => {
		log.info(`getPosts: Retrieved ${posts.length} posts.`);
		return posts;
	});
};

const getAuthors = () => {
	contentApi.authors.browse().then(authors => {
		log.info(`getAuthors: Retrieved ${authors.length} authors.`);
		return authors;
	});
};

const addPost = post => {
	logger.info(
		`addPost: Adding post: ${JSON.stringify(post, null, 4).substr(0, 200)}`
	);
	return adminApi.posts.add(post, { source: 'html' });
};

module.exports = { getPosts, getAuthors, addPost };
