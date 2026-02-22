package com.tellez.peli_ya

data class Pelicula(
    val id_pelicula: Int,
    val nombre_pelicula: String, // Coincide con tu BD
    val genero: String,
    val descripcion: String,     // Coincide con tu BD
    val imagen_url: String,      // Coincide con tu BD
    val video_url: String        // ESTE NOMBRE ES LA CLAVE
)