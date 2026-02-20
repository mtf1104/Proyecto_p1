const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json()); // Usamos express.json() directamente
app.use(express.static(__dirname));

// Configuración de conexión optimizada para TiDB
const db = mysql.createConnection(process.env.DATABASE_URL || {
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'plataforma_streaming',
    ssl: { rejectUnauthorized: false }
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a TiDB:', err);
        return;
    }
    console.log('Conectado exitosamente a TiDB');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- LOGIN ---
app.post('/login', (req, res) => {
    const { usuario, password } = req.body;
    const sql = "SELECT * FROM administradores WHERE correo_electronico = ? AND clave = ? AND estado = 'Activo'";
    db.query(sql, [usuario, password], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length > 0) res.send({ auth: true, user: results[0] });
        else res.status(401).send({ auth: false, message: 'Credenciales inválidas' });
    });
});

// --- PELÍCULAS ---
app.get('/peliculas', (req, res) => {
    db.query("SELECT * FROM peliculas", (err, results) => {
        if (err) return res.status(500).send(err);
        res.send(results);
    });
});

app.post('/registrar-peli', (req, res) => {
    const { nombre, genero, url, imagen, descripcion } = req.body;
    const sql = "INSERT INTO peliculas (nombre_pelicula, genero, video_url, imagen_url, descripcion) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [nombre, genero, url, imagen, descripcion], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Película guardada' });
    });
});

// --- ADMINISTRADORES ---
app.get('/administradores', (req, res) => {
    db.query("SELECT * FROM administradores", (err, results) => {
        if (err) return res.status(500).send(err);
        res.send(results);
    });
});

app.post('/registrar-admin', (req, res) => {
    const { nombre, apellido_p, apellido_m, correo, clave } = req.body;
    const sql = "INSERT INTO administradores (nombre, apellido_paterno, apellido_materno, correo_electronico, clave) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [nombre, apellido_p, apellido_m, correo, clave], (err) => {
        if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).send({ message: 'El correo ya existe' });
        if (err) return res.status(500).send(err);
        res.send({ message: 'Administrador registrado' });
    });
});

// --- ESTADO Y ELIMINAR ---
app.put('/cambiar-estado/:tabla/:id', (req, res) => {
    const { tabla, id } = req.params;
    const { nuevoEstado } = req.body;
    const idCol = tabla === 'peliculas' ? 'id_pelicula' : (tabla === 'clientes' ? 'id_cliente' : 'id_admin');
    const sql = `UPDATE ${tabla} SET estado = ? WHERE ${idCol} = ?`;
    db.query(sql, [nuevoEstado, id], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Estado actualizado' });
    });
});

app.delete('/eliminar/:tabla/:id', (req, res) => {
    const { tabla, id } = req.params;
    const idCol = tabla === 'peliculas' ? 'id_pelicula' : (tabla === 'clientes' ? 'id_cliente' : 'id_admin');
    const sql = `DELETE FROM ${tabla} WHERE ${idCol} = ?`;
    db.query(sql, [id], (err) => { // Corregido: solo pasamos el ID
        if (err) return res.status(500).send(err);
        res.send({ message: 'Registro eliminado' });
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor en puerto ${port}`));