package com.tellez.peli_ya

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.tellez.peli_ya.databinding.ActivityCarteleraBinding
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class CarteleraActivity : AppCompatActivity() {

    private lateinit var binding: ActivityCarteleraBinding
    private lateinit var adapter: PeliculaAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCarteleraBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Título personalizado
        // Cambia el bloque de supportActionBar por este:
        supportActionBar?.apply {
            setDisplayShowTitleEnabled(false) // ESTO OCULTA EL TÍTULO GRIS REPETIDO
            setDisplayShowCustomEnabled(true)
            setCustomView(R.layout.toolbar_custom)
            elevation = 0f
        }

        binding.rvCartelera.layoutManager = LinearLayoutManager(this)

        // CORRECCIÓN: Pasamos emptyList() para cumplir con el constructor del adaptador
        adapter = PeliculaAdapter(emptyList()) { pelicula ->
            val intent = Intent(this, ReproductorActivity::class.java)
            intent.putExtra("URL_VIDEO", pelicula.video_url)
            startActivity(intent)
        }
        binding.rvCartelera.adapter = adapter

        obtenerPeliculas()
    }

    private fun obtenerPeliculas() {
        // Al quitar 'suspend' de la API, 'enqueue' ahora funcionará perfectamente
        RetrofitClient.instance.getPeliculas().enqueue(object : Callback<List<Pelicula>> {
            override fun onResponse(call: Call<List<Pelicula>>, response: Response<List<Pelicula>>) {
                if (response.isSuccessful) {
                    val lista = response.body() ?: emptyList()
                    adapter.updateList(lista) // Refresca las tarjetas
                }
            }

            override fun onFailure(call: Call<List<Pelicula>>, t: Throwable) {
                Toast.makeText(this@CarteleraActivity, "Error de red", Toast.LENGTH_SHORT).show()
            }
        })
    }

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.menu_cartelera, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        if (item.itemId == R.id.menu_logout) {
            val intent = Intent(this, MainActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
        }
        return super.onOptionsItemSelected(item)
    }
}