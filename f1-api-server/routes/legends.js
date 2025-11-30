const express = require("express");
const router = express.Router();
const Legend = require("./models/legend");

// GET /api/legends → tüm legend'ları getir
router.get("/", async (req, res) => {
  try {
    const legends = await Legend.find();
    res.json(legends);
  } catch (err) {
    console.error("Legend fetch error:", err);
    res.status(500).json({ error: "Failed to fetch legends" });
  }
});

// GET /api/legends/:category → pilot/engineer/principal filtreleme
router.get("/:category", async (req, res) => {
  try {
    const legends = await Legend.find({ category: req.params.category });
    res.json(legends);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

module.exports = router;
