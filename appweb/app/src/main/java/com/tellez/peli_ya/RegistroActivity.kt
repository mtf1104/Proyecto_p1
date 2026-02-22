package com.tellez.peli_ya

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.tellez.peli_ya.databinding.ActivityRegistroBinding
import kotlinx.coroutines.launch

class RegistroActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegistroBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegistroBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnRegistrarFinal.setOnClickListener {
            registrarUsuario()
        }
    }

    private fun registrarUsuario() {
        // Obtenemos los datos limpiando espacios en blanco
        val nombre = binding.etNombre.text.toString().trim()
        val apellidoP = binding.etApellidoP.text.toString().trim()
        val apellidoM = binding.etApellidoM.text.toString().trim()
        val correo = binding.etEmail.text.toString().trim()
        val clave = binding.etPass.text.toString().trim()

        if (nombre.isEmpty() || correo.isEmpty() || clave.isEmpty()) {
            Toast.makeText(this, "Completa los campos obligatorios", Toast.LENGTH_SHORT).show()
            return
        }

        // AJUSTE CLAVE: Asegúrate de que tu modelo Usuario.kt use estos nombres exactos:
        // nombre, apellido_p, apellido_m, correo, clave
        // Dentro de registrarUsuario()
        val nuevoUsuario = Usuario(
            nombre = nombre,
            apellido_p = apellidoP,
            apellido_m = apellidoM,
            correo = correo,
            clave = clave
        )

        lifecycleScope.launch {
            // Deshabilitamos el botón mientras el servidor de Render "despierta"
            binding.btnRegistrarFinal.isEnabled = false
            Toast.makeText(this@RegistroActivity, "Conectando al servidor (puede tardar 1 min)...", Toast.LENGTH_LONG).show()

            try {
                // La ruta configurada en tu ApiService debe ser @POST("registrar-admin") o similar
                val response = RetrofitClient.instance.registrarUsuario(nuevoUsuario)

                if (response.isSuccessful) {
                    Toast.makeText(this@RegistroActivity, "¡Bienvenido a Peli-Ya, $nombre!", Toast.LENGTH_LONG).show()
                    finish()
                } else {
                    binding.btnRegistrarFinal.isEnabled = true
                    Toast.makeText(this@RegistroActivity, "Error en el servidor: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                binding.btnRegistrarFinal.isEnabled = true
                // Render puede tardar más de 50 segundos en responder tras inactividad
                Toast.makeText(this@RegistroActivity, "Error de conexión: Verifica tu red o espera a que el hosting despierte", Toast.LENGTH_LONG).show()
            }
        }
    }
}