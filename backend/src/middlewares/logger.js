function logger(req, res, next) {
  const inicioCuenta = Date.now();

  res.on("finish", () => {
    const tiempo = Date.now() - inicioCuenta;

    console.log(
      `${req.method}: ${req.originalUrl} => ${res.statusCode} ${tiempo}ms`
    );
  });

  next();
}

module.exports = logger;


