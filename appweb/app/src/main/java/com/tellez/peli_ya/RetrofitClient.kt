package com.tellez.peli_ya

import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    // Asegúrate de que la URL termine en /
    private const val BASE_URL = "https://proyecto-p1.onrender.com/"

    // Configuramos OkHttpClient para soportar la lentitud de Render Free
    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(1, TimeUnit.MINUTES) // Tiempo para conectar
        .readTimeout(1, TimeUnit.MINUTES)    // Tiempo para recibir datos
        .writeTimeout(1, TimeUnit.MINUTES)   // Tiempo para enviar datos
        .build()

    val instance: ApiService by lazy {
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient) // Aplicamos la configuración de tiempo
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        retrofit.create(ApiService::class.java)
    }
}