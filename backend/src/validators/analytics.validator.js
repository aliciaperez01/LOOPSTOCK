const { query } = require("express-validator");

// GET /api/analytics/top-value
const reglasTopValue = [
  query("limit").optional().isInt({ min: 1, max: 50 })
    .withMessage("limit tiene que ser un entero entre 1 y 50")
];

// GET /api/analytics/imports/timeline
const reglasImportsTimeline = [
  query("days").optional().isInt({ min: 1, max: 365 })
    .withMessage("days tiene que ser un entero entre 1 y 365")
];

module.exports = { reglasTopValue, reglasImportsTimeline };
