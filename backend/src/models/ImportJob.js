const mongoose = require("mongoose");

// Error de una fila concreta del CSV
const rowErrorSchema = new mongoose.Schema(
  {
    row: { type: Number, required: true },
    sku: { type: String, default: "" },
    message: { type: String, required: true }
  },
  { _id: false }
);

const importJobSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: [true, "El nombre del archivo es obligatorio"],
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["completed", "partial", "failed"],
      required: true
    },
    totalRows: { type: Number, default: 0, min: 0 },
    insertedRows: { type: Number, default: 0, min: 0 },
    errorRows: { type: Number, default: 0, min: 0 },
    rowErrors: { type: [rowErrorSchema], default: [] }
  },
  { timestamps: true }
);

importJobSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model("ImportJob", importJobSchema);
