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
    brand: {
      type: String,
      trim: true,
      default: ""
    },
    model: {
      type: String,
      trim: true,
      default: ""
    },
    category: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    price: {
      type: Number,
      required: true,
      min: [0, "El precio no puede ser negativo"],
      default: 0
    },
    cost: {
      type: Number,
      min: [0, "El coste no puede ser negativo"],
      default: 0
    },
    quantity: {
    type: Number,
    required: [true, "La cantidad es obligatoria"],
    min: [0, "El stock no puede ser negativo"],
    default: 0
    },
    minStock: {
        type: Number,
        required: [true, "El stock mínimo es obligatorio"],
        min: [1, "El stock mínimo debe ser al menos 1"],
        default: 1
    },
    supplier: {
      type: String,
      trim: true,
      default: ""
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive"],
        message: "El estado debe ser active o inactive"
      },
      default: "active"
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