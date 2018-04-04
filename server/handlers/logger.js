exports.logRequestStart = (req, res, next) => {
  console.info(`${req.method} ${req.originalUrl}`);
  res.on('finish', () => {
    console.info(
      `${res.statusCode} ${res.statusMessage}; ${res.get('Content-Length') ||
        0}b sent \n`
    );
  });
  next();
};
