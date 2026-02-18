const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'plataforma_streaming'
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

// Registrar o Actualizar (Ruta Inteligente)
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

// Listar
app.get('/peliculas', (req, res) => {
    db.query("SELECT * FROM peliculas", (err, results) => {
        if (err) return res.status(500).send(err);
        res.send(results);
    });
});

// Cambiar Estado (Activar/Desactivar)
app.put('/cambiar-estado/:tabla/:id', (req, res) => {
    const { tabla, id } = req.params;
    const { nuevoEstado } = req.body;
    const idCol = tabla === 'peliculas' ? 'id_pelicula' : 'id_cliente';
    const sql = `UPDATE ${tabla} SET estado = ? WHERE ${idCol} = ?`;
    db.query(sql, [nuevoEstado, id], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Estado actualizado' });
    });
});

// Eliminar (Borrado definitivo)
app.delete('/eliminar/:tabla/:id', (req, res) => {
    const { tabla, id } = req.params;
    const idCol = tabla === 'peliculas' ? 'id_pelicula' : 'id_cliente';
    const sql = `DELETE FROM ${tabla} WHERE ${idCol} = ?`;
    db.query(sql, [id], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Eliminado correctamente' });
    });
});

app.listen(3000, () => console.log('Servidor Peli-Ya listo en puerto 3000'));