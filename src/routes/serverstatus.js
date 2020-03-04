const express = require('express');
const router = new express.Router();
const pjson = require('../../package.json');

/**
 * Returns alive
 */
router.get('/', async (req, res) => {
	return res.status(200).send({
		status: 200,
		message: 'Server alive',
		softwareName: pjson.name,
		version: pjson.version || 'Unknown'
	});
});

module.exports = router;
