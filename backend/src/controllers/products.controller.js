
const productsService = require("../services/products.service.js");

// LISTAR PRODUCTOS
async function listar(req, res, next) {
  try {
    const filtros = {
      category: req.query.category,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit
    };

    const resultado = await productsService.listar(filtros);
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
}

// LISTAR PRODUCTOS CON STOCK BAJO
async function listarBajoStock(req, res, next) {
  try {
    const productos = await productsService.listar({
      lowStock: true
    });

    res.status(200).json(productos);
  } catch (error) {
    next(error);
  }
}

// OBTENER PRODUCTO POR ID
async function obtener(req, res, next) {
  try {
    const producto = await productsService.buscarPorId(req.params.id);

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json(producto);
  } catch (error) {
    next(error);
  }
}


 // CREAR PRODUCTO
async function crear(req, res, next) {
  try {
    const producto = await productsService.crear(req.body);
    res.status(201).json(producto);
  } catch (error) {
    next(error);
  }
}

// ACTUALIZAR PRODUCTO
async function actualizar(req, res, next) {
  try {
    const producto = await productsService.actualizar(
      req.params.id,
      req.body
    );

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json(producto);
  } catch (error) {
    next(error);
  }
}


// ELIMINAR PRODUCTO
async function eliminar(req, res, next) {
  try {
    const producto = await productsService.eliminar(req.params.id);

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json({
      mensaje: "Producto eliminado correctamente",
      producto
    });
  } catch (error) {
    next(error);
  }
}

// VALIDAR ID
function validarId(req, res, next) {
  if (!productsService.esIdValido(req.params.id)) {
    return res.status(400).json({
      error: "ID de producto no válido"
    });
  }

  next();
}

module.exports = {
  listar,
  listarBajoStock,
  obtener,
  crear,
  actualizar,
  eliminar,
  validarId
};
