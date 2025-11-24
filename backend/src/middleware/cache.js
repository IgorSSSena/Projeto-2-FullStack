const cache = new Map();

function getKey(req) {
  const userId = req.userId || 'anon';
  return `${userId}:${req.originalUrl}`;
}

export function cacheMiddleware(ttlMs = 30 * 1000) {
  return (req, res, next) => {
    const key = getKey(req);
    const cached = cache.get(key);

    if (cached && cached.expires > Date.now()) {
      return res.json(cached.data);
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      cache.set(key, {
        data: body,
        expires: Date.now() + ttlMs,
      });
      return originalJson(body);
    };

    next();
  };
}
