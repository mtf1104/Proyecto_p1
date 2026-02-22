package com.tellez.peli_ya

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.tellez.peli_ya.databinding.ActivityMainBinding
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // 1. Lógica del botón Ingresar
        binding.btnIngresar.setOnClickListener {
            intentarLogin()
        }

        // 2. Navegación a la pantalla de Registro
        binding.tvRegistrarme.setOnClickListener {
            try {
                val intent = Intent(this, RegistroActivity::class.java)
                startActivity(intent)
            } catch (e: Exception) {
                // Previene que la app se cierre si falta algo en el Manifest
                Toast.makeText(this, "Error al abrir registro: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun intentarLogin() {
        val correoInput = binding.etUsuario.text.toString().trim()
        val claveInput = binding.etClave.text.toString().trim()

        if (correoInput.isEmpty() || claveInput.isEmpty()) {
            Toast.makeText(this, "Por favor, completa todos los campos", Toast.LENGTH_SHORT).show()
            return
        }

        // Estructura sincronizada con loginCliente en server.js/app.js
        val credenciales = mapOf(
            "correo" to correoInput,
            "clave" to claveInput
        )

        lifecycleScope.launch {
            binding.btnIngresar.isEnabled = false
            Toast.makeText(this@MainActivity, "Validando cliente...", Toast.LENGTH_SHORT).show()

            try {
                // Llamada a la API en Render
                val response = RetrofitClient.instance.login(credenciales)

                if (response.isSuccessful) {
                    val body = response.body()
                    // Verificamos 'auth' enviado por el servidor
                    if (body?.get("auth") == true) {
                        startActivity(Intent(this@MainActivity, CarteleraActivity::class.java))
                        finish()
                    } else {
                        binding.btnIngresar.isEnabled = true
                        Toast.makeText(this@MainActivity, "Correo o clave incorrectos", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    binding.btnIngresar.isEnabled = true
                    Toast.makeText(this@MainActivity, "Error del servidor: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                binding.btnIngresar.isEnabled = true
                // Manejo de despertar del servidor gratuito en Render
                Toast.makeText(this@MainActivity, "Servidor despertando, intenta de nuevo en unos segundos", Toast.LENGTH_LONG).show()
            }
        }
    }
}