const API_URL = "http://localhost:3000";
let editandoId = null;

// --- LOGIN ---
async function ejecutarLogin() {
    const usuario = document.getElementById('login-email').value;
    const password = document.getElementById('login-pass').value;

    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password })
    });

    const data = await res.json();
    if (data.auth) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        mostrarSeccion('reg-peli');
    } else {
        alert(data.message);
    }
}

// --- CRUD PELÍCULAS ---

async function guardarPelicula() {
    const peli = {
        nombre: document.getElementById('peli-nom').value,
        genero: document.getElementById('peli-gen').value,
        url: document.getElementById('peli-url').value,
        imagen: document.getElementById('peli-img').value,
        descripcion: document.getElementById('peli-desc').value
    };

    const metodo = editandoId ? 'PUT' : 'POST';
    const url = editandoId ? `${API_URL}/actualizar-peli/${editandoId}` : `${API_URL}/registrar-peli`;

    const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(peli)
    });

    const data = await res.json();
    alert(data.message);
    resetearFormulario();
    mostrarSeccion('con-peli');
}

async function cargarPeliculas() {
    const res = await fetch(`${API_URL}/peliculas`);
    const data = await res.json();
    const tabla = document.getElementById('tabla-peliculas-body');
    
    tabla.innerHTML = data.map(p => `
        <tr>
            <td><img src="${p.imagen_url}" style="width:50px; height:75px; object-fit:cover;"></td>
            <td>${p.nombre_pelicula}</td>
            <td>${p.genero}</td>
            <td><strong>${p.estado}</strong></td>
            <td>
                <button class="btn-activate" onclick="cambiarEstado('peliculas', ${p.id_pelicula}, 'Activo')">Activar</button>
                <button class="btn-inactivate" onclick="cambiarEstado('peliculas', ${p.id_pelicula}, 'Inactivo')">Desactivar</button>
                <button class="btn-update" onclick='prepararEdicion(${JSON.stringify(p)})'>Actualizar</button>
                <button class="btn-inactivate" style="background:black; color:white;" onclick="eliminarRegistro('peliculas', ${p.id_pelicula})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

function prepararEdicion(p) {
    editandoId = p.id_pelicula;
    mostrarSeccion('reg-peli');
    document.getElementById('peli-nom').value = p.nombre_pelicula;
    document.getElementById('peli-gen').value = p.genero;
    document.getElementById('peli-url').value = p.video_url;
    document.getElementById('peli-img').value = p.imagen_url;
    document.getElementById('peli-desc').value = p.descripcion;
    document.querySelector('.btn-save').innerText = "Guardar Cambios (Actualizar)";
}

async function cambiarEstado(tabla, id, nuevoEstado) {
    await fetch(`${API_URL}/cambiar-estado/${tabla}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevoEstado })
    });
    cargarPeliculas();
}

async function eliminarRegistro(tabla, id) {
    if (confirm("¿Estás seguro de eliminarlo permanentemente?")) {
        await fetch(`${API_URL}/eliminar/${tabla}/${id}`, { method: 'DELETE' });
        cargarPeliculas();
    }
}

function resetearFormulario() {
    editandoId = null;
    document.querySelector('.btn-save').innerText = "Registrar Película";
    document.querySelectorAll('#reg-peli input, #reg-peli textarea').forEach(i => i.value = "");
}

function mostrarSeccion(id) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    if (id === 'con-peli') cargarPeliculas();
}