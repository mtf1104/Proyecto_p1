package com.tellez.peli_ya

data class Usuario(
    val nombre: String,
    val apellido_p: String, // Coincide con 'datos.apellido_p' en app.js
    val apellido_m: String, // Coincide con 'datos.apellido_m' en app.js
    val correo: String,     // Coincide con 'datos.correo' en app.js
    val clave: String       // Coincide con 'datos.clave' en app.js
)