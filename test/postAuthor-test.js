const config = require('config');
const logger = require('../src/config/logger')('test:postAuthor');
const {
	isValidEmailAddress,
	getPostAuthorForEmail,
} = require('../src/services/postAuthor');
const assert = require('assert');

const postAuthors = config.get('postAuthors');

//logger.info(JSON.stringify(postAuthors, null, 3));

describe('isValidEmailAddress', function() {
	it('should return TRUE when checking an email that is in the list', function() {
		assert.equal(
			isValidEmailAddress('synoname1@gmail.com', { postAuthors }),
			true
		);
	});
	it('should return TRUE when checking an email that is in the list, even if Upper/Lowercase mismatched.', function() {
		assert.equal(
			isValidEmailAddress('synoname1@gmail.COM', { postAuthors }),
			true
		);
		assert.equal(
			isValidEmailAddress('synoname1@whatever.com', { postAuthors }),
			true
		);
	});
	it('should return TRUE when checking an email that is in the list, even with leading/trailing whitespaces.', function() {
		assert.equal(
			isValidEmailAddress('synoname1@gmail.COM ', { postAuthors }),
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

describe('getPostAuthorForEmail', function() {
	it('should return the postAuthor when checking an email that is in the list', function() {
		assert.equal(
			getPostAuthorForEmail('synoname1@gmail.com', { postAuthors }),
			'author1@whatever.com'
		);
	});
	it('should return the postAuthor when checking an email that is in the list but written with LowerUpper and blanks', function() {
		assert.equal(
			getPostAuthorForEmail(' synoname1@gMAIL.com ', { postAuthors }),
			'author1@whatever.com'
		);
	});
	it('should return nothing when checking an email that is not in the list', function() {
		assert.equal(
			getPostAuthorForEmail('nonExistant1@gmail.com', { postAuthors }),
			null
		);
	});
});
