const GhostAdminAPI = require('@tryghost/admin-api');
const GhostContentAPI = require('@tryghost/content-api');
const logger = require('../config/logger')('app:ghostPlayground');

logger.info(`process.env.GHOST_API_URL: ${process.env.GHOST_API_URL}`);
logger.info(
	`process.env.GHOST_ADMIN_API_KEY: ${process.env.GHOST_ADMIN_API_KEY}`
);

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

const showPosts = () => {
	adminApi.posts.browse().then(posts => {
		posts.forEach(post => {
			console.log(post);
		});
	});
};

const listAuthors = () => {
	contentApi.authors.browse().then(authors => {
		authors.forEach(author => {
			console.log(author);
		});
	});
};
module.exports = { showPosts, listAuthors };
