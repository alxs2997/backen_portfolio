require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Conectar a MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error conectando a MongoDB:", err));

// Definir el modelo de visitas
const VisitSchema = new mongoose.Schema({
  ip: String,
  timestamp: { type: Date, default: Date.now },
});

const Visit = mongoose.model("Visit", VisitSchema);

// Ruta para registrar una visita
app.post("/visit", async (req, res) => {
  const ip =
    req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  const lastVisit = await Visit.findOne({ ip }).sort({ timestamp: -1 });

  if (!lastVisit || new Date() - lastVisit.timestamp > 24 * 60 * 60 * 1000) {
    await Visit.create({ ip });
    res.json({ message: "Visita registrada" });
  } else {
    res.json({ message: "Visita reciente ya registrada" });
  }
});

// Ruta para obtener el número de visitas
app.get("/visits", async (req, res) => {
  const count = await Visit.countDocuments();
  res.json({ totalVisits: count });
});

// Iniciar el servidor
app.listen(process.env.PORT, () =>
  console.log(`Servidor en http://localhost:${process.env.PORT}`)
);
