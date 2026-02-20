const API_URL = "https://proyecto-p1.onrender.com"; 
let editPeliId = null;

function mostrarSeccion(id) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';

    if (id === 'con-peli') cargarPeliculas();
    if (id === 'con-clie') cargarClientes();
    if (id === 'reg-user') cargarAdministradores();
}

// Registro de Admin con manejo de error 500
async function registrarAdmin() {
    const adminData = {
        nombre: document.getElementById('adm-nom').value,
        apellido_p: document.getElementById('adm-pat').value,
        apellido_m: document.getElementById('adm-mat').value,
        correo: document.getElementById('adm-mail').value,
        clave: document.getElementById('adm-clave').value
    };

    try {
        const res = await fetch(`${API_URL}/registrar-admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminData)
        });
        const data = await res.json();
        alert(data.message);
        if(res.ok) {
            resetFormAdmin();
            cargarAdministradores();
        }
    } catch (error) {
        alert("Error al conectar con el servidor");
    }
}

async function cargarPeliculas() {
    const res = await fetch(`${API_URL}/peliculas`);
    const data = await res.json();
    const body = document.getElementById('tabla-peliculas-body');
    body.innerHTML = data.map(p => `
        <tr>
            <td><img src="${p.imagen_url}" width="50"></td>
            <td>${p.nombre_pelicula}</td>
            <td>${p.genero}</td>
            <td>${p.estado}</td>
            <td>
                <button onclick="eliminarRegistro('peliculas', ${p.id_pelicula})">Eliminar</button>
            </td>
        </tr>`).join('');
}

async function eliminarRegistro(tabla, id) {
    if (confirm("¿Eliminar registro?")) {
        await fetch(`${API_URL}/eliminar/${tabla}/${id}`, { method: 'DELETE' });
        if (tabla === 'peliculas') cargarPeliculas();
        if (tabla === 'administradores') cargarAdministradores();
    }
}

// Inicialización de clave
function generarClave() {
    document.getElementById('adm-clave').value = Math.random().toString(36).slice(-7);
}
window.onload = generarClave;