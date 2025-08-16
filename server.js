
import express from "express";
import cors from "cors"; // consumir api
import { sequelize } from "./src/models/index.js"; // ORM


const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares base
app.use(cors());
app.use(express.json());


// Rutas API
// app.use("/api/items", itemRoutes);




// DB
(async () => {
  try {
    await sequelize.sync(); // crear tablas si no existen
    app.listen(PORT, () => console.log(`✔ Servidor en http://localhost:${PORT}`));
  } catch (err) {
    console.error("Error al iniciar:", err);
    process.exit(1);
  }
})();
