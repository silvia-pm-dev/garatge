const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Connexió a la base de dades del taller
const db = new sqlite3.Database("./garage.db", (err) => {
    if (err) console.error(err.message);
    else console.log("✅ Connexió a la base de dades del taller establerta.");
});

// Crear la taula de vehicles segons l'enunciat
db.run(
    `CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plate TEXT NOT NULL,
        km INTEGER NOT NULL DEFAULT 0
    )`
);

// GET /garage - Llistar tots els vehicles
app.get("/garage", (req, res) => {
    db.all("SELECT * FROM vehicles", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST /garage - Afegir vehicle
app.post("/garage", (req, res) => {
    const { plate, km } = req.body;
    if (!plate) return res.status(400).json({ error: "La matrícula és obligatòria." });

    db.run("INSERT INTO vehicles (plate, km) VALUES (?, ?)", [plate, km || 0], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, plate, km: km || 0 });
    });
});

// PUT /garage/:id - Actualitzar km 
app.put("/garage/:id", (req, res) => {
    const { id } = req.params;
    const { plate, km } = req.body;
    db.run("UPDATE vehicles SET plate = ?, km = ? WHERE id = ?", [plate, km, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Vehicle actualitzat." });
    });
});

// DELETE /garage/:id - Eliminar vehicle
app.delete("/garage/:id", (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM vehicles WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Vehicle eliminat." });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor del taller a http://localhost:${PORT}`);
});