const mongoose = require("mongoose");

const movementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "El producto es obligatorio"]
    },
    type: {
      type: String,
      enum: {
        values: ["entrada", "salida"],
        message: "El tipo debe ser entrada o salida"
      },
      required: [true, "El tipo de movimiento es obligatorio"]
    },
    quantity: {
      type: Number,
      required: [true, "La cantidad es obligatoria"],
      min: [1, "La cantidad debe ser al menos 1"],
      validate: {
        validator: Number.isInteger,
        message: "La cantidad debe ser un número entero"
      }
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El usuario responsable es obligatorio"]
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Las notas no pueden superar 500 caracteres"],
      default: ""
    }
  },
  {
    timestamps: true,
    collection: "movements"
  }
);

movementSchema.set("toJSON", {
  versionKey: false
});

module.exports = mongoose.model("Movement", movementSchema);