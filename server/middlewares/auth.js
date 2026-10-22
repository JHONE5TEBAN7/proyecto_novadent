const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET no está configurado');
    return res.status(500).json({
      ok: false,
      mensaje: 'Error de configuración del servidor'
    });
  }

  const authorization = req.get('authorization');
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({
      ok: false,
      mensaje: 'Se requiere un token Bearer'
    });
  }

  let usuario;
  try {
    usuario = jwt.verify(match[1], secret);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        ok: false,
        mensaje: 'El token ha expirado'
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Token inválido'
      });
    }

    console.error('Error al verificar el token:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor'
    });
  }

  if (typeof usuario !== 'object' || usuario === null || !usuario.id) {
    return res.status(401).json({
      ok: false,
      mensaje: 'Token inválido'
    });
  }

  req.usuario = usuario;
  next();
}

module.exports = verificarToken;
