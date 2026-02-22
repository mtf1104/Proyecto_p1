package com.tellez.peli_ya

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.Call

interface ApiService {
    // Cambia esto en tu interfaz de Retrofit
    @GET("peliculas")
    fun getPeliculas(): Call<List<Pelicula>> // SIN la palabra 'suspend' delante

    // Ruta corregida: coincidiendo con registrarClienteNuevo
    @POST("registro-cliente")
    suspend fun registrarUsuario(@Body usuario: Usuario): Response<Void>

    @POST("login-cliente")
    suspend fun login(@Body credenciales: Map<String, String>): Response<Map<String, Any>>
}