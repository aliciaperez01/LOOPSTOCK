const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true
    },
    sku: {
      type: String,
      required: [true, "El SKU es obligatorio"],
      unique: true,
      trim: true,
      uppercase: true
    },
    category: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "El stock no puede ser negativo"],
      default: 0
    },
    price: {
      type: Number,
      required: true,
      min: [0, "El precio no puede ser negativo"],
      default: 0
    },
    supplier: {
      type: String,
      trim: true,
      default: ""
    },
    minStock: {
      type: Number,
      min: [0, "El stock mínimo no puede ser negativo"],
      default: 0
    }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    },
    collection: "products"
  }
);

productSchema.set("toJSON", {
  versionKey: false
});

module.exports = mongoose.model("Product", productSchema);