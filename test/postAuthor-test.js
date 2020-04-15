const config = require('config');
const logger = require('../src/config/logger')('test:postAuthor');
const { isValidEmailAddress } = require('../src/services/postAuthor');
const assert = require('assert');

const postAuthors = config.get('postAuthors');

//logger.info(JSON.stringify(postAuthors, null, 3));

describe('isValidEmailAddress', function() {
	describe('Positive check', function() {
		it('should return TRUE when checking an email that is in the list', function() {
			assert.equal(
				isValidEmailAddress('synoname1@gmail.com', { postAuthors }),
				true
			);
			assert.equal(
				isValidEmailAddress('till@whatever.com', { postAuthors }),
				true
			);
		});
		it('should return FALSE when checking an email that is not in the list', function() {
			assert.equal(
				isValidEmailAddress('wrongEmail@gmail.com', { postAuthors }),
				false
			);
			assert.equal(
				isValidEmailAddress('til@whatever.com', { postAuthors }),
				false
			);
		});
	});
});
