const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Reemplaza la configuración de db en server.js
const db = mysql.createConnection(process.env.DATABASE_URL || {
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'plataforma_streaming',
    ssl: {
        rejectUnauthorized: false // Esto permite la conexión segura con TiDB
    }
});
const path = require('path');

// Esto le dice a Express que sirva los archivos de la carpeta actual
app.use(express.static(__dirname));

// Esto asegura que al entrar a la URL raíz, se cargue tu index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- LOGIN DE ADMINISTRADOR ---
app.post('/login', (req, res) => {
    const { usuario, password } = req.body;
    const sql = "SELECT * FROM administradores WHERE correo_electronico = ? AND clave = ? AND estado = 'Activo'";
    
    db.query(sql, [usuario, password], (err, results) => {
        if (err) return res.status(500).send({ auth: false, message: 'Error en el servidor' });
        if (results.length > 0) {
            res.send({ auth: true, user: results[0] });
        } else {
            res.status(401).send({ auth: false, message: 'Correo o contraseña incorrectos o cuenta inactiva' });
        }
    });
});

// --- OPERACIONES DE PELÍCULAS ---
app.post('/registrar-peli', (req, res) => {
    const { nombre, genero, url, imagen, descripcion } = req.body;
    const sql = "INSERT INTO peliculas (nombre_pelicula, genero, video_url, imagen_url, descripcion) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [nombre, genero, url, imagen, descripcion], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Película guardada' });
    });
});

app.put('/actualizar-peli/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, genero, url, imagen, descripcion } = req.body;
    const sql = "UPDATE peliculas SET nombre_pelicula=?, genero=?, video_url=?, imagen_url=?, descripcion=? WHERE id_pelicula=?";
    db.query(sql, [nombre, genero, url, imagen, descripcion, id], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Película actualizada' });
    });
});

app.get('/peliculas', (req, res) => {
    db.query("SELECT * FROM peliculas", (err, results) => {
        if (err) return res.status(500).send(err);
        res.send(results);
    });
});

// --- OPERACIONES DE CLIENTES ---
app.get('/clientes', (req, res) => {
    db.query("SELECT * FROM clientes", (err, results) => {
        if (err) return res.status(500).send(err);
        res.send(results);
    });
});

app.put('/actualizar-cliente/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, apellido_p, apellido_m, correo } = req.body;
    const sql = "UPDATE clientes SET nombre=?, apellido_paterno=?, apellido_materno=?, correo=? WHERE id_cliente=?";
    db.query(sql, [nombre, apellido_p, apellido_m, correo, id], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Cliente actualizado correctamente' });
    });
});

// --- OPERACIONES DE ADMINISTRADORES ---
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
        if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).send({ message: 'Correo ya registrado' });
        if (err) return res.status(500).send(err);
        res.send({ message: 'Administrador registrado con éxito' });
    });
});

app.put('/actualizar-admin/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, apellido_p, apellido_m, correo, clave } = req.body;
    const sql = "UPDATE administradores SET nombre=?, apellido_paterno=?, apellido_materno=?, correo_electronico=?, clave=? WHERE id_admin=?";
    db.query(sql, [nombre, apellido_p, apellido_m, correo, clave, id], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Administrador actualizado' });
    });
});

app.put('/cambiar-estado/:tabla/:id', (req, res) => {
    const { tabla, id } = req.params;
    const { nuevoEstado } = req.body;
    let idCol = tabla === 'peliculas' ? 'id_pelicula' : (tabla === 'clientes' ? 'id_cliente' : 'id_admin');
    
    const sql = `UPDATE ${tabla} SET estado = ? WHERE ${idCol} = ?`;
    db.query(sql, [nuevoEstado, id], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Estado actualizado con éxito' });
    });
});
app.delete('/eliminar/:tabla/:id', (req, res) => {
    const { tabla, id } = req.params;
    let idCol = tabla === 'peliculas' ? 'id_pelicula' : (tabla === 'clientes' ? 'id_cliente' : 'id_admin');
    const sql = `DELETE FROM ${tabla} WHERE ${idCol} = ?`;
    db.query(sql, [id], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Eliminado correctamente' });
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});