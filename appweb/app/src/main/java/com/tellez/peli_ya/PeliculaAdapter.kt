package com.tellez.peli_ya

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.tellez.peli_ya.databinding.ItemPeliculaBinding

class PeliculaAdapter(
    private var peliculas: List<Pelicula>, // 1. Cambiado a 'var' para poder actualizarla
    private val onItemClick: (Pelicula) -> Unit // 2. Agregado el listener para la navegación
) : RecyclerView.Adapter<PeliculaAdapter.PeliculaViewHolder>() {

    class PeliculaViewHolder(val binding: ItemPeliculaBinding) : RecyclerView.ViewHolder(binding.root)

    // 3. Función necesaria para que CarteleraActivity no marque error
    fun updateList(newList: List<Pelicula>) {
        this.peliculas = newList
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PeliculaViewHolder {
        val binding = ItemPeliculaBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return PeliculaViewHolder(binding)
    }

    override fun onBindViewHolder(holder: PeliculaViewHolder, position: Int) {
        val p = peliculas[position]

        // Usamos los nombres reales de tu base de datos
        holder.binding.tvTituloGenero.text = "${p.nombre_pelicula} - ${p.genero}"
        holder.binding.tvDescripcion.text = p.descripcion

        Glide.with(holder.itemView.context)
            .load(p.imagen_url) // Carga la imagen real
            .placeholder(android.R.drawable.ic_menu_gallery)
            .into(holder.binding.ivPoster)

        holder.binding.btnVer.setOnClickListener {
            onItemClick(p)
        }
    }

    override fun getItemCount(): Int = peliculas.size
}