const logger = require('../utils/logger');

// Safe logger: use console if logger failed to load (e.g. in some Docker/production setups)
const log = logger && typeof logger.info === 'function' ? logger : console;

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    log.info('HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });

  next();
};

const performanceMonitor = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    // Log slow requests
    if (duration > 1000) {
      (log.warn || log.info).call(log, 'Slow request detected', {
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
      });
    }

    // TODO: Send to APM service (e.g., New Relic, Datadog)
  });

  next();
};

const errorTracker = (err, req, res, next) => {
  (log.error || log.info).call(log, 'Request error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    statusCode: res.statusCode || 500,
  });

  // TODO: Send to error tracking service (e.g., Sentry)
  next(err);
};

module.exports = {
  requestLogger,
  performanceMonitor,
  errorTracker,
};
