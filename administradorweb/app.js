// URL de tu servidor Node.js (asegúrate de que server.js esté corriendo en este puerto)
const API_URL = "http://localhost:3000";

// INICIO DE SESIÓN (LOGIN)
async function ejecutarLogin() {
    const usuario = document.getElementById('login-email').value;
    const password = document.getElementById('login-pass').value;

    if (!usuario || !password) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });

        const data = await res.json();

        if (data.auth) {
            alert("Bienvenido a Peli-Ya");
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('admin-panel').style.display = 'block';
            // Por defecto mostrar la sección de registro de películas al entrar
            mostrarSeccion('reg-peli'); 
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        console.error("Error en login:", error);
        alert("No se pudo conectar con el servidor.");
    }
}

// NAVEGACIÓN ENTRE APARTADOS
function mostrarSeccion(id) {
    // Ocultar todas las secciones de contenido
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    
    // Mostrar la sección seleccionada
    const seccion = document.getElementById(id);
    if (seccion) {
        seccion.style.display = 'block';
    }

    // Cargar datos automáticamente si es una sección de consulta
    if (id === 'con-peli') cargarPeliculas();
    if (id === 'con-clie') cargarClientes();
}

// REGISTRO DE ADMINISTRADORES (USUARIOS)
async function registrarAdmin() {
    const datos = {
        nombre: document.getElementById('adm-nom').value,
        ap_paterno: document.getElementById('adm-pat').value,
        ap_materno: document.getElementById('adm-mat').value,
        correo: document.getElementById('adm-mail').value,
        clave: document.getElementById('adm-clave').value
    };

    try {
        const res = await fetch(`${API_URL}/registrar-admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const result = await res.json();
        alert(result.message);
        // Limpiar campos tras guardar
        limpiarFormularioAdmin();
    } catch (error) {
        console.error("Error al registrar admin:", error);
    }
}

// Generar clave aleatoria como 'y76qwer'
function generarClave() {
    const caracteres = "abcdefghijklmnopqrstuvwxyz0123456789";
    let claveAleatoria = "";
    for (let i = 0; i < 7; i++) {
        claveAleatoria += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    document.getElementById('adm-clave').value = claveAleatoria;
}

// GESTIÓN DE PELÍCULAS
async function registrarPelicula() {
    const peli = {
        nombre: document.getElementById('peli-nom').value,
        genero: document.getElementById('peli-gen').value,
        url: document.getElementById('peli-url').value,
        descripcion: document.getElementById('peli-desc').value
    };

    try {
        const res = await fetch(`${API_URL}/registrar-peli`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(peli)
        });
        const data = await res.json();
        alert(data.message);
    } catch (error) {
        console.error("Error al registrar película:", error);
    }
}

async function cargarPeliculas() {
    try {
        const res = await fetch(`${API_URL}/peliculas`);
        const data = await res.json();
        const tablaBody = document.getElementById('tabla-peliculas-body');
        
        tablaBody.innerHTML = data.map(p => `
            <tr>
                <td><img src="${p.imagen_url || 'placeholder.png'}" width="50"></td>
                <td>${p.nombre_pelicula}</td>
                <td>${p.genero}</td>
                <td>${p.estado}</td>
                <td>
                    <button class="btn-activate" onclick="cambiarEstado('peliculas', ${p.id_pelicula}, 'Activo')">Activar</button>
                    <button class="btn-inactivate" onclick="cambiarEstado('peliculas', ${p.id_pelicula}, 'Inactivo')">Inactivar</button>
                    <button class="btn-update">Actualizar</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error("Error al cargar películas:", error);
    }
}

//GESTIÓN DE CLIENTES
async function cargarClientes() {
    try {
        const res = await fetch(`${API_URL}/clientes`);
        const data = await res.json();
        const tablaBody = document.getElementById('tabla-clientes-body');
        
        tablaBody.innerHTML = data.map(c => `
            <tr>
                <td>${c.nombre} ${c.apellido_paterno} ${c.apellido_materno}</td>
                <td>${c.correo}</td>
                <td>${new Date(c.fecha_registro).toLocaleDateString()}</td>
                <td>
                    <button class="btn-delete" onclick="eliminarRegistro('clientes', ${c.id_cliente})">Eliminar</button>
                    <button class="btn-activate">Activar</button>
                    <button class="btn-update">Actualizar</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error("Error al cargar clientes:", error);
    }
}

//  (ESTADOS Y ELIMINACIÓN)
async function cambiarEstado(tabla, id, nuevoEstado) {
    try {
        await fetch(`${API_URL}/cambiar-estado/${tabla}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nuevoEstado })
        });
        // Recargar la tabla actual
        tabla === 'peliculas' ? cargarPeliculas() : cargarClientes();
    } catch (error) {
        console.error("Error al cambiar estado:", error);
    }
}

function limpiarFormularioAdmin() {
    document.getElementById('adm-nom').value = "";
    document.getElementById('adm-pat').value = "";
    document.getElementById('adm-mat').value = "";
    document.getElementById('adm-mail').value = "";
    generarClave();
}