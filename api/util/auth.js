const checkAuth = (req, res, next) => {
  const user = req.user;
  if (!user) {
    logger.error ('User not logged in');
    return res.status (403).json ({message: 'User is not logged in'});
  }
  next ();
};

module.exports = {checkAuth};
