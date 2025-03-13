// Klaidų apdorojimo middleware funkcijos

// 404 klaidos apdorojimas (resursas nerastas)
const notFound = (req, res, next) => {
  const error = new Error(`Nerasta - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Visų kitų klaidų apdorojimas
const errorHandler = (err, req, res, next) => {
  // Jei statuso kodas vis dar 200, nustatome 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode);
  
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler }; 