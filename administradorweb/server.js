const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de la conexión a MySQL (XAMPP)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'plataforma_streaming'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Conectado a la base de datos MySQL');
});

// Registro de Administradores
app.post('/registrar-admin', (req, res) => {
    const { nombre, ap_paterno, ap_materno, correo, clave } = req.body;
    const sql = "INSERT INTO administradores (nombre, apellido_paterno, apellido_materno, correo_electronico, clave) VALUES (?, ?, ?, ?, ?)";
    
    db.query(sql, [nombre, ap_paterno, ap_materno, correo, clave], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Administrador registrado con éxito' });
    });
});

// Login
app.post('/login', (req, res) => {
    const { usuario, password } = req.body;
    const sql = "SELECT * FROM administradores WHERE correo_electronico = ? AND clave = ? AND estado = 'Activo'";
    
    db.query(sql, [usuario, password], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.length > 0) {
            res.send({ auth: true, user: result[0] });
        } else {
            res.send({ auth: false, message: 'Credenciales incorrectas' });
        }
    });
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});