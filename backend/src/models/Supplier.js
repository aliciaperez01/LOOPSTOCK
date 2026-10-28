const mongoose = require("mongoose");

// Convierte "" en undefined para que los campos opcionales vacíos no se guarden
const vacioAUndefined = (valor) => (valor === "" ? undefined : valor);

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del proveedor es obligatorio"],
      unique: true,
      trim: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [80, "El nombre no puede superar 80 caracteres"]
    },
    taxId: {
      type: String,
      trim: true,
      uppercase: true,
      set: vacioAUndefined,
      match: [/^[A-Z0-9]{8,12}$/, "El CIF/NIF no es válido"]
    },
    contactName: {
      type: String,
      trim: true,
      maxlength: [80, "El nombre de contacto no puede superar 80 caracteres"]
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      set: vacioAUndefined,
      match: [/^\S+@\S+\.\S+$/, "El email no es válido"]
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, "El teléfono no puede superar 20 caracteres"]
    },
    website: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Las notas no pueden superar 500 caracteres"]
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// CIF único solo cuando existe (varios proveedores pueden no tenerlo)
supplierSchema.index(
  { taxId: 1 },
  { unique: true, partialFilterExpression: { taxId: { $type: "string" } } }
);

supplierSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model("Supplier", supplierSchema);
