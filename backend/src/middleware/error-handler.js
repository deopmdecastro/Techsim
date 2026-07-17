export function errorHandler(error, _req, res, _next) {
  console.error(error);
  const status = error.status || 500;
  return res.status(status).json({
    message: error.message || 'Erro interno do servidor.',
  });
}
