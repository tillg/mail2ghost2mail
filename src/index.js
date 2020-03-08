require('dotenv').config();

const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const path = require('path');
const chalk = require('chalk');
const logger = require('./config/logger')('app:index');
//const processUnseenEmails = require('./services/getAttachements');
const processUnseenEmails = require('./services/imapIn-simple');
//const processUnseenEmails = require('./services/loadMessage');

processUnseenEmails();

const app = express();

app.set('port', 8080);
const server = http.createServer(app);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/*
 * Routes
 */
// Serverstatus route is BEFORE security routes, so works w/o login
app.use('/serverstatus', require('./routes/serverstatus'));

// catch 404
app.use((req, res) => {
	logger.info(`Error 404 on ${req.url}.`);
	res.status(404).send({ status: 404, error: 'Not found' });
});

// catch errors
app.use((err, req, res) => {
	const status = err.status || 500;
	logger.info(
		`Error ${status} (${err.message}) on ${req.method} ${
			req.url
		} with payload ${JSON.stringify(req.body)}.`
	);
	res.status(status).send({ status, error: 'Server error' });
});

// start server
server.listen(process.env.PORT, () => {
	logger.info(
		chalk.bgGreen.black(
			`Server up & running on http://localhost:${process.env.PORT} (Note: That might be within a docker container!)`
		)
	);
});

logger.info('Index.js finished!');
