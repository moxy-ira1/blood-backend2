const roleMiddleware = {
  owner: (req, res, next) => {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Access denied. Owner role required.' });
    }
    next();
  },

  worker: (req, res, next) => {
    if (req.user.role !== 'worker') {
      return res.status(403).json({ error: 'Access denied. Worker role required.' });
    }
    next();
  },

  donor: (req, res, next) => {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ error: 'Access denied. Donor role required.' });
    }
    next();
  },

  ownerOrWorker: (req, res, next) => {
    if (!['owner', 'worker'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Owner or Worker role required.' });
    }
    next();
  },

  ownerOrDonor: (req, res, next) => {
    if (!['owner', 'donor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Owner or Donor role required.' });
    }
    next();
  },

  workerOrDonor: (req, res, next) => {
    if (!['worker', 'donor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Worker or Donor role required.' });
    }
    next();
  },

  any: (req, res, next) => {
    if (!['owner', 'worker', 'donor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Valid role required.' });
    }
    next();
  }
};

module.exports = roleMiddleware;
