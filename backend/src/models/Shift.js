const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El empleado es obligatorio"]
    },
    date: {
      type: String,
      required: [true, "La fecha es obligatoria"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD"]
    },
    startTime: {
      type: String,
      required: [true, "La hora de inicio es obligatoria"],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Hora de inicio no válida"]
    },
    endTime: {
      type: String,
      required: [true, "La hora de fin es obligatoria"],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Hora de fin no válida"]
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Las notas no pueden superar 500 caracteres"],
      default: ""
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El administrador responsable es obligatorio"]
    }
  },
  {
    timestamps: true,
    collection: "shifts"
  }
);

// Consultas rápidas por empleado y mes
shiftSchema.index({ employee: 1, date: 1 });

shiftSchema.set("toJSON", {
  versionKey: false
});

module.exports = mongoose.model("Shift", shiftSchema);