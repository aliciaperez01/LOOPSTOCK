const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ROLES = ["admin", "empleado"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [60, "El nombre no puede superar 60 caracteres"]
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "El email no es válido"]
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [8, "La contraseña debe tener al menos 8 caracteres"],
      select: false
    },
    role: {
      type: String,
      enum: { values: ROLES, message: "Rol no válido" },
      default: "empleado"
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Cifra la contraseña antes de guardar, solo si ha cambiado
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compara la contraseña recibida con el hash guardado
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// Nunca devolver la contraseña en las respuestas JSON
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
module.exports.ROLES = ROLES;