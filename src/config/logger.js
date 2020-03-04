/**
 * Configure our Winston logger
 */
const winston = require('winston');

const { createLogger } = winston;

const fileTransport = new winston.transports.File({
  level: 'error',
  filename: 'spotz-errors.log',
});

const getLabelledFormatFunction = label => info =>
  `${info.timestamp} ${info.level}${label ? ` ${label}` : ''}: ${info.message}`; //  ${JSON.stringify(info, null, 2)}
const getLabelledWinstonFormat = label =>
  winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(getLabelledFormatFunction(label)),
  );

const getLabelledConsoleTransport = label =>
  new winston.transports.Console({
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
    format: getLabelledWinstonFormat(label),
  });

// Now we configure the default logger
winston.add(getLabelledConsoleTransport());
winston.add(fileTransport);
winston.debug('Logger is configured.');

/**
 * Returns a logger with a label
 * @param {*} label
 */
const getLabelledLogger = label => {
  if (!label) return winston;
  const newLogger = createLogger();
  newLogger.add(getLabelledConsoleTransport(label));
  newLogger.add(fileTransport);
  return newLogger;
};

module.exports = getLabelledLogger;
