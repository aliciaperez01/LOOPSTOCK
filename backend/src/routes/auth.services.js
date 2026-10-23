const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generarToken = (usuario) => {
    return jwt.sign({
        id: usuario._id,
        rol: usuario.rol
    }, 
        process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

async function registrar({nombre, email, password}) {
    const usuario = await User.create({nombre, email, password});
    return { usuario, token: generarToken(usuario) };
}

async function login(email, password) {
    const usuario = await User.findOne({email}).select("password");
    if (!usuario) return null;

    const coincide = await usuario.comparePassword(password);
    if (!coincide) return null;

    return { usuario, token: generarToken(usuario) };
}

async function buscarPorId(id) {
    return User.findById(id);
}

        
module.exports = {registrar, login, buscarPorId}    