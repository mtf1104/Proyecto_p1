const API_URL = window.location.origin; 
let editPeliId = null;
let editAdminId = null;
let editClientId = null;

function mostrarSeccion(id) {
    // Ocultar secciones
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    
    // Resaltar botón de navegación
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    // Buscamos el botón que tenga el onclick correspondiente al id
    const btnActivo = Array.from(document.querySelectorAll('nav button'))
                           .find(b => b.getAttribute('onclick').includes(id));
    if(btnActivo) btnActivo.classList.add('active');

    if (id === 'con-peli') cargarPeliculas();
    if (id === 'con-clie') cargarClientes();
    if (id === 'reg-user') cargarAdministradores();
}

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

// --- GESTIÓN DE PELÍCULAS ---
async function guardarPelicula() {
    const peli = {
        nombre: document.getElementById('peli-nom').value,
        genero: document.getElementById('peli-gen').value,
        url: document.getElementById('peli-url').value,
        imagen: document.getElementById('peli-img').value,
        descripcion: document.getElementById('peli-desc').value
    };

    const metodo = editPeliId ? 'PUT' : 'POST';
    const url = editPeliId ? `${API_URL}/actualizar-peli/${editPeliId}` : `${API_URL}/registrar-peli`;

    const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(peli)
    });

    const data = await res.json();
    alert(data.message);
    resetearFormPeli();
    mostrarSeccion('con-peli');
}

async function cargarPeliculas() {
    const res = await fetch(`${API_URL}/peliculas`);
    const data = await res.json();
    
    document.getElementById('tabla-peliculas-body').innerHTML = data.map(p => {
        const textoBoton = p.estado === 'Activo' ? 'Desactivar' : 'Activar';
        const nuevoEstado = p.estado === 'Activo' ? 'Inactivo' : 'Activo';

        return `
        <tr>
            <td><img src="${p.imagen_url}" width="50" style="object-fit:cover; border-radius:4px;"></td>
            <td>${p.nombre_pelicula}</td>
            <td>${p.genero}</td>
            <td style="color: ${p.estado === 'Activo' ? 'green' : 'red'}"><strong>${p.estado}</strong></td>
            <td>
                <button onclick="cambiarEstado('peliculas', ${p.id_pelicula}, '${nuevoEstado}')">${textoBoton}</button>
                <button class="btn-update" onclick='prepararEdicionPeli(${JSON.stringify(p)})'>Editar</button>
                <button onclick="eliminarRegistro('peliculas', ${p.id_pelicula})" style="background:black; color:white;">Eliminar</button>
            </td>
        </tr>`;
    }).join('');
}

function prepararEdicionPeli(p) {
    editPeliId = p.id_pelicula;
    mostrarSeccion('reg-peli');
    document.getElementById('peli-nom').value = p.nombre_pelicula;
    document.getElementById('peli-gen').value = p.genero;
    document.getElementById('peli-url').value = p.video_url;
    document.getElementById('peli-img').value = p.imagen_url;
    document.getElementById('peli-desc').value = p.descripcion;
    document.querySelector('#reg-peli .btn-save').innerText = "Actualizar Película";
}

function resetearFormPeli() {
    editPeliId = null;
    document.querySelectorAll('#reg-peli input, #reg-peli textarea').forEach(i => i.value = "");
    document.querySelector('#reg-peli .btn-save').innerText = "Guardar Película";
}

// --- GESTIÓN DE CLIENTES ---
async function cargarClientes() {
    const res = await fetch(`${API_URL}/clientes`);
    const data = await res.json();
    
    document.getElementById('tabla-clientes-body').innerHTML = data.map(c => {
        const textoBoton = c.estado === 'Activo' ? 'Desactivar' : 'Activar';
        const nuevoEstado = c.estado === 'Activo' ? 'Inactivo' : 'Activo';

        return `
        <tr>
            <td>${c.nombre} ${c.apellido_paterno}</td>
            <td>${c.correo}</td>
            <td>${new Date(c.fecha_registro).toLocaleDateString()}</td>
            <td style="color: ${c.estado === 'Activo' ? 'green' : 'red'}"><strong>${c.estado}</strong></td>
            <td>
                <button onclick="cambiarEstado('clientes', ${c.id_cliente}, '${nuevoEstado}')">${textoBoton}</button>
                <button onclick='prepararEdicionCliente(${JSON.stringify(c)})'>Editar</button>
                <button onclick="eliminarRegistro('clientes', ${c.id_cliente})" style="background:black; color:white;">Eliminar</button>
            </td>
        </tr>`;
    }).join('');
}

function prepararEdicionCliente(c) {
    editClientId = c.id_cliente;
    document.getElementById('edit-client-area').style.display = 'block';
    document.getElementById('ed-clie-nom').value = c.nombre;
    document.getElementById('ed-clie-pat').value = c.apellido_paterno;
    document.getElementById('ed-clie-mail').value = c.correo;
}

async function ejecutarActualizacionCliente() {
    const datos = {
        nombre: document.getElementById('ed-clie-nom').value,
        apellido_p: document.getElementById('ed-clie-pat').value,
        correo: document.getElementById('ed-clie-mail').value
    };

    await fetch(`${API_URL}/actualizar-cliente/${editClientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });

    alert("Cliente actualizado");
    document.getElementById('edit-client-area').style.display = 'none';
    cargarClientes();
}

// --- GESTIÓN DE ADMINISTRADORES ---
async function cargarAdministradores() {
    const res = await fetch(`${API_URL}/administradores`);
    const data = await res.json();
    
    document.getElementById('tabla-admins-body').innerHTML = data.map(a => {
        const textoBoton = a.estado === 'Activo' ? 'Desactivar' : 'Activar';
        const nuevoEstado = a.estado === 'Activo' ? 'Inactivo' : 'Activo';

        return `
        <tr>
            <td>${a.nombre} ${a.apellido_paterno}</td>
            <td>${a.correo_electronico}</td>
            <td style="color: ${a.estado === 'Activo' ? 'green' : 'red'}"><strong>${a.estado}</strong></td>
            <td>
                <button onclick="cambiarEstado('administradores', ${a.id_admin}, '${nuevoEstado}')">${textoBoton}</button>
                <button onclick='prepararEdicionAdmin(${JSON.stringify(a)})'>Editar</button>
                <button onclick="eliminarRegistro('administradores', ${a.id_admin})" style="background:black; color:white;">Eliminar</button>
            </td>
        </tr>`;
    }).join('');
}

async function registrarAdmin() {
    const adminData = {
        nombre: document.getElementById('adm-nom').value,
        apellido_p: document.getElementById('adm-pat').value,
        apellido_m: document.getElementById('adm-mat').value,
        correo: document.getElementById('adm-mail').value,
        clave: document.getElementById('adm-clave').value
    };

    const res = await fetch(`${API_URL}/registrar-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminData)
    });

    const data = await res.json();
    alert(data.message);
    resetFormAdmin();
    cargarAdministradores();
}

function prepararEdicionAdmin(a) {
    editAdminId = a.id_admin;
    document.getElementById('adm-nom').value = a.nombre;
    document.getElementById('adm-pat').value = a.apellido_paterno;
    document.getElementById('adm-mat').value = a.apellido_materno;
    document.getElementById('adm-mail').value = a.correo_electronico;
    document.getElementById('adm-clave').value = a.clave;
    
    const btn = document.getElementById('btn-admin-main');
    btn.innerText = "Actualizar Administrador";
    btn.onclick = ejecutarActualizacionAdmin;
}

async function ejecutarActualizacionAdmin() {
    const datos = {
        nombre: document.getElementById('adm-nom').value,
        apellido_p: document.getElementById('adm-pat').value,
        apellido_m: document.getElementById('adm-mat').value,
        correo: document.getElementById('adm-mail').value,
        clave: document.getElementById('adm-clave').value
    };

    await fetch(`${API_URL}/actualizar-admin/${editAdminId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });

    alert("Administrador actualizado");
    resetFormAdmin();
    cargarAdministradores();
}

function resetFormAdmin() {
    editAdminId = null;
    document.querySelectorAll('#reg-user input').forEach(i => i.value = "");
    const btn = document.getElementById('btn-admin-main');
    btn.innerText = "Registrar Administrador";
    btn.onclick = registrarAdmin;
    generarClave();
}

function generarClave() {
    document.getElementById('adm-clave').value = Math.random().toString(36).slice(-7);
}

// --- FUNCIONES GENÉRICAS (ESTADO Y ELIMINAR) ---
async function cambiarEstado(tabla, id, nuevoEstado) {
    await fetch(`${API_URL}/cambiar-estado/${tabla}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevoEstado })
    });
    refrescarTabla(tabla);
}

async function eliminarRegistro(tabla, id) {
    if (confirm("¿Estás seguro de eliminar este registro permanentemente?")) {
        await fetch(`${API_URL}/eliminar/${tabla}/${id}`, { method: 'DELETE' });
        refrescarTabla(tabla);
    }
}

function refrescarTabla(tabla) {
    if (tabla === 'peliculas') cargarPeliculas();
    if (tabla === 'clientes') cargarClientes();
    if (tabla === 'administradores') cargarAdministradores();
}

// Buscar por nombre (puedes llamarlo desde un input de búsqueda)
async function buscarPeliculaPorNombre(nombre) {
    const res = await fetch(`${API_URL}/buscar-peli?nombre=${nombre}`);
    const data = await res.json();
    // Aquí puedes redirigir la 'data' a una función que renderice los resultados
    console.log("Resultados de búsqueda:", data);
}

// Consultar una sola por ID
async function obtenerDetallePelicula(id) {
    const res = await fetch(`${API_URL}/peliculas/${id}`);
    const peli = await res.json();
    return peli;
}

// Registro de cliente
async function registrarClienteNuevo(datos) {
    // datos = { nombre, apellido_p, apellido_m, correo, clave }
    const res = await fetch(`${API_URL}/registro-cliente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    const data = await res.json();
    alert(data.message);
}

// Login de cliente
async function loginCliente() {
    const correo = document.getElementById('client-email').value;
    const clave = document.getElementById('client-pass').value;

    const res = await fetch(`${API_URL}/login-cliente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, clave })
    });

    const data = await res.json();
    if (data.auth) {
        alert(`Bienvenido, ${data.user.nombre}`);
        // Redirigir a la vista de películas para usuarios
    } else {
        alert(data.message);
    }
}