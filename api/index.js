const cors = require("cors");

const express = require("express");
const mysql = require("mysql2");

const app = express();

app.use(cors()); // Habilitar CORS para todas las rutas

// Configuración de la base de datos
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Cambia esto por tu usuario de MySQL
  password: "root", // Cambia esto por tu contraseña
  database: "dataquiniela", // Asegúrate de crear esta base de datos
  port: 8889,
});

// Conexión a la base de datos
db.connect((err) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err);
    return;
  }
  console.log("Conectado a la base de datos.");
});

// Middleware para parsear JSON
app.use(express.json());

// Endpoint: Obtener todas las carreras
app.get("/carreras", (req, res) => {
  const query = "SELECT * FROM carreras order by fecha";
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener carreras" });
    } else {
      res.json(results);
    }
  });
});

// Endpoint para obtener puntos por carrera
app.get("/puntos/carreras", (req, res) => {
  const query = `
        SELECT
            c.nombre  as carrera,p.nombre AS usuario,rq.score as puntos
        FROM
        resultados_quiniela rq
        JOIN carreras c
        ON rq.carrera_id = c.id 
        JOIN participantes p
        ON p.id = rq.participante_id
        ORDER BY c.fecha, p.id;
    `;
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener los puntos" });
    } else {
      res.json(results);
    }
  });
});

// Endpoint para puntos totales por usuario
app.get("/puntos/totales", (req, res) => {
  const query = `
       SELECT
            p.nombre,
            sum(rq.score)
        FROM
            participantes p
            JOIN resultados_quiniela rq
            ON p.id = rq.participante_id
            GROUP BY p.id

    `;
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener los puntos totales" });
    } else {
      res.json(results);
    }
  });
});
// Endpoint para puntos totales por usuario
app.get("/posicion", (req, res) => {
  const query = `
      
WITH puntos_acumulados AS (
  SELECT
c.nombre as carrera,
c.id as carrera_id,
p.nombre AS nombre,
p.borderColor,
SUM(score) OVER (PARTITION BY participante_id ORDER BY carrera_id) AS total_acumulado,
rq.score
FROM
resultados_quiniela rq
JOIN carreras c
ON rq.carrera_id = c.id 
JOIN participantes p
ON p.id = rq.participante_id

)
SELECT 
    puntos_acumulados.nombre,
		puntos_acumulados.borderColor,
    puntos_acumulados.carrera,
    puntos_acumulados.score,
    puntos_acumulados.total_acumulado,
    RANK() OVER (PARTITION BY puntos_acumulados.carrera_id ORDER BY puntos_acumulados.total_acumulado DESC) AS posicion
FROM puntos_acumulados
ORDER BY puntos_acumulados.carrera_id, posicion;


  
      `;
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener los puntos totales" });
    } else {
      res.json(results);
    }
  });
});

const PORT = 3000;
// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
