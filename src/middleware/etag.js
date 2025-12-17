const crypto = require('crypto');

const etagMiddleware = (req, res, next) => {
  if (req.method !== 'GET') {
    return next();
  }

  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  res.json = function (data) {
    const body = JSON.stringify(data);
    const etag = crypto.createHash('md5').update(body).digest('hex');

    res.set('ETag', `"${etag}"`);

    const clientEtag = req.headers['if-none-match'];
    if (clientEtag === `"${etag}"`) {
      return res.status(304).end();
    }

    return originalJson(data);
  };

  res.send = function (data) {
    const body = typeof data === 'string' ? data : JSON.stringify(data);
    const etag = crypto.createHash('md5').update(body).digest('hex');

    res.set('ETag', `"${etag}"`);

    const clientEtag = req.headers['if-none-match'];
    if (clientEtag === `"${etag}"`) {
      return res.status(304).end();
    }

    return originalSend(data);
  };

  next();
};

module.exports = { etagMiddleware };


