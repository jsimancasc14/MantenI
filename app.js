// ======================================================
// MANTÉNTI ARJONA — SISTEMA DE GESTIÓN DE MANTENIMIENTO
// Base de datos local (almacenada en navegador)
// ======================================================

// DATOS INICIALES — Cargados desde tu documento
const DB = {
    inventario: [
        { id: "PC-ARJ-014", tipo: "PC escritorio", marca: "HP", modelo: "ProDesk 600 G4", serial: "MXC9123456", interno: "INV-2023-0456", adquisicion: "2023-03-15", proveedor: "Proveedor XYZ SAS", valor: 2800000, dependencia: "Hacienda", responsable: "Maria Perez", ubicacion: "Oficina 203, Piso 2", estado: "Operativo", procesador: "Intel Core i5-8500", ram: "8 GB DDR4", disco: "SSD 256 GB", so: "Windows 11 Pro", office: "Office 2019", programas: "SIIGO, ORFEO", observaciones: "" },
        { id: "PC-ARJ-063", tipo: "PC escritorio", marca: "Dell", modelo: "OptiPlex 3080", serial: "DL3080012", interno: "INV-2023-0512", adquisicion: "2023-05-20", proveedor: "Proveedor ABC Ltda", valor: 2650000, dependencia: "Planeacion", responsable: "Carlos Diaz", ubicacion: "Oficina 104, Piso 1", estado: "Operativo", procesador: "Intel Core i5-10500", ram: "8 GB DDR4", disco: "SSD 512 GB", so: "Windows 11 Pro", office: "Office 365", programas: "ORFEO, Excel avanzado", observaciones: "" },
        { id: "PC-ARJ-022", tipo: "PC escritorio", marca: "Lenovo", modelo: "ThinkCentre M720", serial: "LN2022008", interno: "INV-2022-0189", adquisicion: "2022-06-10", proveedor: "Proveedor ABC Ltda", valor: 2400000, dependencia: "Talento Humano", responsable: "Ana Gomez", ubicacion: "Oficina 115, Piso 1", estado: "En reparación", procesador: "Intel Core i3-9100", ram: "4 GB DDR4", disco: "HDD 500 GB", so: "Windows 10 Pro", office: "Office 2016", programas: "ORFEO", observaciones: "Equipo lento, se recomienda cambio a SSD" }
    ],
    ordenes: [
        { id: "OT-2026-00128", solicitud: "2026-08-27", programada: "2026-08-27", cierre: "", equipo: "PC-ARJ-014", tipo: "Correctivo", prioridad: "Alta", solicitante: "Maria Perez", dependenciaSol: "Hacienda", tecnico: "C. Martínez", falla: "El equipo se apaga de manera intermitente y presenta lentitud", diagnostico: "Pendiente diagnóstico final", actividades: "Limpieza interna, revisión de temperaturas, pruebas de estabilidad", repuestos: "", horas: 2.5, costo: 0, diagnosticoFinal: "", estadoEquipoCierre: "", observaciones: "Se recomienda monitoreo por 1 semana", estado: "En proceso" },
        { id: "OT-2026-00127", solicitud: "2026-08-26", programada: "2026-08-28", cierre: "", equipo: "PC-ARJ-063", tipo: "Preventivo", prioridad: "Media", solicitante: "Carlos Diaz", dependenciaSol: "Planeacion", tecnico: "J. Rodríguez", falla: "Mantenimiento preventivo semestral programado", diagnostico: "Mantenimiento preventivo programado semestre 2-2026", actividades: "Limpieza interna y externa, actualización SO y antivirus, revisión de disco y RAM", repuestos: "Pasta térmica", horas: 2.0, costo: 0, diagnosticoFinal: "", estadoEquipoCierre: "", observaciones: "Próximo preventivo: febrero 2027", estado: "Programado" },
        { id: "OT-2026-00126", solicitud: "2026-08-20", programada: "2026-08-20", cierre: "2026-08-20", equipo: "PC-ARJ-022", tipo: "Preventivo", prioridad: "Baja", solicitante: "Ana Gomez", dependenciaSol: "Talento Humano", tecnico: "J. Rodríguez", falla: "Mantenimiento preventivo semestral", diagnostico: "Mantenimiento preventivo programado", actividades: "Limpieza interna y externa, actualización SO, revisión de antivirus", repuestos: "Sin repuestos", horas: 1.5, costo: 0, diagnosticoFinal: "Equipo queda operativo, se recomienda cambio de HDD a SSD", estadoEquipoCierre: "Operativo", observaciones: "Se deja programada cotización de SSD", estado: "Cerrado" }
    ],
    preventivos: [
        { id: "PR-001", equipo: "PC-ARJ-014", dependencia: "Hacienda", frecuencia: "Semestral", ultimo: "2026-02-10", proximo: "2026-08-10", tecnico: "J. Rodríguez", estado: "Programado", actividades: "Limpieza interna y externa, actualización SO y antivirus, revisión de disco y RAM, verificación de periféricos", observaciones: "" },
        { id: "PR-002", equipo: "PC-ARJ-063", dependencia: "Planeacion", frecuencia: "Semestral", ultimo: "2026-02-15", proximo: "2026-08-15", tecnico: "C. Martínez", estado: "Programado", actividades: "Limpieza interna y externa, actualización SO y antivirus, revisión de disco y RAM", observaciones: "" },
        { id: "PR-003", equipo: "PC-ARJ-022", dependencia: "Talento Humano", frecuencia: "Semestral", ultimo: "2026-02-20", proximo: "2026-08-20", tecnico: "J. Rodríguez", estado: "Realizado", actividades: "Limpieza interna y externa, actualización SO, revisión de antivirus", observaciones: "Se recomienda cambio a SSD para mejorar rendimiento" }
    ],
    dependencias: [],
    tecnicos: [
        { nombre: "Jairo Simancas Cogollo", cargo: "Técnico TI", correo: "jsimancasc14@gmail.com", telefono: "3006051812", activo: true },
        { nombre: "Juan Diaz Pardo", cargo: "Técnico TI", correo: "juancadg007@gmail.com", telefono: "3002018036", activo: true }
    ],
    repuestos: [
        { id: "REP-001", nombre: "Disco SSD 240 GB", descripcion: "Disco sólido SATA 2.5 240 GB", unidad: "Unidad", costo: 120000, proveedor: "Proveedor XYZ SAS", existencia: 0 },
        { id: "REP-002", nombre: "Memoria RAM 8 GB DDR4", descripcion: "Módulo 8 GB DDR4 2666 MHz", unidad: "Unidad", costo: 150000, proveedor: "Proveedor ABC Ltda", existencia: 0 },
        { id: "REP-003", nombre: "Pasta térmica", descripcion: "Pasta térmica para CPU", unidad: "Unidad", costo: 15000, proveedor: "Varios", existencia: 0 }
    ]
};

// ======================================================
// SISTEMA DE PERSISTENCIA — Datos versionados y recuperables
// ======================================================
const DB_STORAGE_KEY = 'MantTI_Arjona_DB';
const DB_STORAGE_VERSION = 2;
let csrfToken = '';

function cargarDB() {
    const guardado = localStorage.getItem(DB_STORAGE_KEY);
    if (!guardado) return;

    try {
        const parsed = JSON.parse(guardado);
        const datos = parsed?.data && typeof parsed.data === 'object' ? parsed.data : parsed;
        Object.keys(DB).forEach(clave => {
            if (Array.isArray(datos?.[clave])) DB[clave] = datos[clave];
        });
    } catch (error) {
        console.warn('No se pudo leer la base local; se conservaron los datos iniciales.', error);
    }
}

function guardarDB() {
    const paquete = {
        version: DB_STORAGE_VERSION,
        updatedAt: new Date().toISOString(),
        data: DB
    };
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(paquete));
}

window.addEventListener('storage', event => {
    if (event.key !== DB_STORAGE_KEY || !event.newValue) return;
    cargarDB();
    cargarDashboard();
    cargarCatalogos();
});

// ======================================================
// LOGIN / SESIÓN
// ======================================================
function actualizarSidebarUsuario() {
    const user = JSON.parse(localStorage.getItem('MantTI_User') || '{}');
    const userCard = document.querySelector('.user-card strong');
    if (userCard) {
        userCard.textContent = user.name || 'Admin TIC';
    }

    const roleButtons = document.querySelectorAll('.module-btn');
    if (!roleButtons.length) return;

    const role = user.role || 'administrador';
    const effectiveRole = ['director','supervisor'].includes(role) ? 'administrador' : role;
    const targetButton = document.querySelector(`.module-btn[data-role="${effectiveRole}"]`);
    if (targetButton) {
        document.querySelectorAll('.module-btn').forEach(b => b.classList.toggle('active', b === targetButton));
        document.getElementById('panel-ordenes-administrador')?.classList.toggle('active', effectiveRole === 'administrador');
        document.getElementById('panel-ordenes-tecnico')?.classList.toggle('active', effectiveRole === 'tecnico');
    }

    if (effectiveRole === 'tecnico') {
        document.getElementById('panel-ordenes-tecnico')?.classList.add('active');
        document.getElementById('panel-ordenes-administrador')?.classList.remove('active');
    }
}

async function mostrarApp() {
    await cargarSesionSegura();
    await Promise.all([
        cargarInventarioDesdeBackend(),
        cargarOperacionesDesdeBackend()
    ]);
    document.getElementById('login-screen')?.classList.add('hidden');
    document.getElementById('app-shell')?.classList.remove('hidden');
    actualizarSidebarUsuario();
    cargarInventario(document.getElementById('buscar-equipo')?.value || '');
    cargarOrdenes();
    cargarPreventivos();
    cargarDashboard();
}

async function cargarSesionSegura() {
    const response = await fetch('backend/api.php?action=session', { credentials: 'same-origin' });
    const result = await response.json();
    if (!response.ok || !result.ok || !result.csrf_token) {
        throw new Error(result.error || 'No se pudo validar la sesión con el servidor.');
    }
    csrfToken = result.csrf_token;
}

function cambiarUsuario() {
    localStorage.removeItem('MantTI_User');
    csrfToken = '';
    document.getElementById('login-screen')?.classList.remove('hidden');
    document.getElementById('app-shell')?.classList.add('hidden');
    document.getElementById('login-form')?.reset();
}

function manejarSesionNoAutenticada(response) {
    if (response.status !== 401) return false;
    cambiarUsuario();
    alert('Tu sesión venció o ya no está activa. Inicia sesión nuevamente y vuelve a enviar la operación; no se guardó.');
    return true;
}

function cerrarSesion() {
    fetch('backend/api.php?action=logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'X-CSRF-Token': csrfToken }
    }).catch(() => {});
    cambiarUsuario();
}

async function iniciarSesion(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const usuario = String(form.get('usuario') || '').trim().toLowerCase();
    const password = String(form.get('password') || '').trim();

    if (!usuario || !password) {
        alert('Usuario y contraseña son obligatorios.');
        return;
    }

    try {
        const response = await fetch('backend/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
            credentials: 'same-origin',
            body: JSON.stringify({ username: usuario, password })
        });
        const result = await response.json();
        if (!response.ok || !result.ok) {
            alert(result.error || 'Usuario o contraseña incorrectos.');
            return;
        }

        localStorage.setItem('MantTI_User', JSON.stringify(result.user));
        csrfToken = result.csrf_token || '';
    } catch (error) {
        alert('No se pudo conectar con el servidor.');
        return;
    }

    try {
        await mostrarApp();
    } catch (error) {
        localStorage.removeItem('MantTI_User');
        cambiarUsuario();
        alert(error.message || 'No se pudo cargar la información de PostgreSQL. Verifica la conexión y que la base tenga el esquema importado.');
    }
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', iniciarSesion);
}

// ======================================================
// TEMA OSCURO / CLARO
// ======================================================
function aplicarTema() {
    const storedTheme = localStorage.getItem('MantTI_Theme');
    const darkMode = storedTheme === 'dark';
    document.body.classList.toggle('dark-mode', darkMode);
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.textContent = darkMode ? '☀️' : '🌙';
    }
}

const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const darkMode = document.body.classList.toggle('dark-mode');
        localStorage.setItem('MantTI_Theme', darkMode ? 'dark' : 'light');
        themeToggle.textContent = darkMode ? '☀️' : '🌙';
    });
}

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        cerrarSesion();
    });
}

const switchUserBtn = document.getElementById('switch-user-btn');
if (switchUserBtn) {
    switchUserBtn.addEventListener('click', () => {
        cambiarUsuario();
    });
}

const backupBtn = document.getElementById('backup-btn');
if (backupBtn) {
    backupBtn.addEventListener('click', async () => {
        const response = await fetch('backend/api.php?action=backup', { credentials: 'same-origin' });
        if (!response.ok) return alert('No se pudo generar el respaldo.');
        const blob = await response.blob();
        const enlace = document.createElement('a');
        enlace.href = URL.createObjectURL(blob);
        enlace.download = `mantenti-backup-${hoy()}.json`;
        enlace.click();
        URL.revokeObjectURL(enlace.href);
    });
}

// ======================================================
// NAVEGACIÓN DE PESTAÑAS
// ======================================================
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
        if(btn.dataset.tab === 'inicio') cargarDashboard();
        if(btn.dataset.tab === 'inventario') cargarInventario();
        if(btn.dataset.tab === 'ordenes') cargarOrdenes();
        if(btn.dataset.tab === 'preventivos') cargarPreventivos();
        if(btn.dataset.tab === 'catalogos') cargarCatalogos();
        if(btn.dataset.tab === 'reportes') cargarReportes();
    });
});
document.querySelectorAll('.module-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.module-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('panel-ordenes-administrador').classList.toggle('active', btn.dataset.role === 'administrador');
        document.getElementById('panel-ordenes-tecnico').classList.toggle('active', btn.dataset.role === 'tecnico');
        cargarOrdenes();
    });
});
document.getElementById('tecnico-asignado')?.addEventListener('change', cargarOrdenes);
document.querySelectorAll('.pestana-int').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.pestana-int').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.cat-contenido').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`cat-${btn.dataset.cat}`).classList.add('active');
    });
});

// ======================================================
// FUNCIONES AUXILIARES
// ======================================================
function hoy() { return new Date().toISOString().split('T')[0]; }
function sumarMeses(fecha, meses) {
    const [año, mes, dia] = fecha.split('-').map(Number);
    const destino = new Date(año, mes - 1 + meses, 1);
    const ultimoDia = new Date(destino.getFullYear(), destino.getMonth() + 1, 0).getDate();
    destino.setDate(Math.min(dia, ultimoDia));
    return `${destino.getFullYear()}-${String(destino.getMonth() + 1).padStart(2, '0')}-${String(destino.getDate()).padStart(2, '0')}`;
}
function mesesPorFrecuencia(frecuencia) {
    return { Mensual: 1, Trimestral: 3, Semestral: 6, Anual: 12 }[frecuencia] || 3;
}
function diasEntre(fecha) {
    if(!fecha) return null;
    const f = new Date(fecha);
    const h = new Date();
    return Math.ceil((f - h) / (1000*60*60*24));
}
function generarIDOrden() {
    const año = new Date().getFullYear();
    const secuencia = String(DB.ordenes.length + 1).padStart(5, '0');
    return `OT-${año}-${secuencia}`;
}
function getEquipo(id) { return DB.inventario.find(e => e.id === id); }
function etiquetaEstado(estado) {
    const clases = {
        'Operativo': 'operativo',
        'En reparación': 'reparacion',
        'En espera de repuesto': 'reparacion',
        'Programado': 'programado',
        'En proceso': 'proceso',
        'Cerrado': 'cerrado',
        'Vencido': 'vencido',
        'Realizado': 'cerrado'
    };
    return `<span class="etiqueta ${clases[estado] || ''}">${estado}</span>`;
}

// ======================================================
// DASHBOARD / INICIO
// ======================================================
function cargarDashboard() {
    document.getElementById('total-equipos').textContent = DB.inventario.length;
    const abiertas = DB.ordenes.filter(o => o.estado !== 'Cerrado').length;
    document.getElementById('ordenes-abiertas').textContent = abiertas;
    const prox = DB.preventivos.filter(p => {
        const d = diasEntre(p.proximo);
        return p.estado === 'Programado' && d !== null && d >= 0 && d <= 30;
    }).length;
    document.getElementById('preventivos-prox').textContent = prox;
    const noOp = DB.inventario.filter(e => ['En reparación','En espera de repuesto','Obsoleto'].includes(e.estado)).length;
    document.getElementById('no-operativos').textContent = noOp;

    // Órdenes activas
    const listaActivas = DB.ordenes.filter(o => o.estado !== 'Cerrado');
    document.getElementById('lista-ordenes-activas').innerHTML = listaActivas.length ? listaActivas.map(o => `
        <div style="padding:0.7rem; border-bottom:1px solid #eee;">
            <strong>${o.id}</strong> — ${o.equipo} — ${etiquetaEstado(o.estado)}<br>
            <small>Técnico: ${o.tecnico} | Falla: ${o.falla.substring(0,40)}...</small>
        </div>`).join('') : '<p>Sin órdenes abiertas</p>';

    // Preventivos próximos
    const listaPre = DB.preventivos.filter(p => {
        const d = diasEntre(p.proximo);
        return p.estado === 'Programado' && d !== null && d >= 0 && d <= 30;
    });
    document.getElementById('lista-preventivos-prox').innerHTML = listaPre.length ? listaPre.map(p => {
        const d = diasEntre(p.proximo);
        return `<div style="padding:0.7rem; border-bottom:1px solid #eee;">
            <strong>${p.id}</strong> — ${p.equipo}<br>
            <small>Próximo: ${p.proximo} (${d} días) | Técnico: ${p.tecnico}</small>
        </div>`;
    }).join('') : '<p>Sin mantenimientos próximos</p>';

    cargarGraficaEstados();
}

function cargarGraficaEstados() {
    const contenedor = document.getElementById('grafica-estados');
    const dona = document.getElementById('grafica-dona');
    const totalTexto = document.getElementById('grafica-total');
    if (!contenedor || !dona || !totalTexto) return;

    const estados = [
        { nombre: 'Operativos', clase: 'operativo', total: DB.inventario.filter(e => e.estado === 'Operativo').length },
        { nombre: 'En reparación', clase: 'reparacion', total: DB.inventario.filter(e => ['En reparación', 'En espera de repuesto'].includes(e.estado)).length },
        { nombre: 'Obsoletos o de baja', clase: 'baja', total: DB.inventario.filter(e => ['Obsoleto', 'Baja'].includes(e.estado)).length }
    ];
    const total = DB.inventario.length || 1;
    const porcentajes = estados.map(estado => Math.round((estado.total / total) * 100));
    const operativo = porcentajes[0];
    const reparacion = porcentajes[1];
    dona.style.setProperty('--operativo', `${operativo}%`);
    dona.style.setProperty('--reparacion', `${reparacion}%`);
    dona.style.setProperty('--fin-reparacion', `${operativo + reparacion}%`);
    totalTexto.textContent = DB.inventario.length;

    contenedor.innerHTML = estados.map(estado => {
        const porcentaje = Math.round((estado.total / total) * 100);
        return `<div class="chart-row">
            <div class="chart-label"><span>${estado.nombre}</span><strong>${estado.total}</strong></div>
            <div class="chart-track" role="presentation"><span class="chart-bar ${estado.clase}" style="width:${porcentaje}%"></span></div>
            <small>${porcentaje}% del inventario</small>
        </div>`;
    }).join('');
}

// ======================================================
// INVENTARIO
// ======================================================
async function cargarInventarioDesdeBackend() {
    const response = await fetch('backend/api.php?action=inventario', {
        credentials: 'same-origin'
    });
    const result = await response.json();
    if (!response.ok || !result.ok || !Array.isArray(result.data)) {
        throw new Error(result.error || 'No se pudo leer el inventario de PostgreSQL.');
    }

    DB.inventario = result.data.map(equipo => ({
        id: equipo.codigo,
        tipo: equipo.tipo,
        marca: equipo.marca,
        modelo: equipo.modelo,
        serial: equipo.serial,
        interno: equipo.numero_interno,
        adquisicion: equipo.created_at?.slice(0, 10) || '',
        proveedor: '',
        valor: 0,
        dependencia: equipo.dependencia,
        responsable: equipo.responsable,
        ubicacion: equipo.ubicacion,
        estado: equipo.estado,
        procesador: equipo.procesador || '',
        ram: equipo.ram || '',
        disco: equipo.disco || '',
        so: equipo.sistema_operativo || '',
        office: equipo.office || '',
        programas: equipo.programas || '',
        observaciones: equipo.observaciones || ''
    }));
    guardarDB();
    cargarInventario(document.getElementById('buscar-equipo')?.value || '');
    cargarDashboard();
}

async function cargarOperacionesDesdeBackend() {
    const [ordenesResponse, preventivosResponse, catalogosResponse] = await Promise.all([
        fetch('backend/api.php?action=ordenes', { credentials: 'same-origin' }),
        fetch('backend/api.php?action=preventivos', { credentials: 'same-origin' }),
        fetch('backend/api.php?action=catalogos', { credentials: 'same-origin' })
    ]);
    const [ordenesResult, preventivosResult, catalogosResult] = await Promise.all([
        ordenesResponse.json(),
        preventivosResponse.json(),
        catalogosResponse.json()
    ]);
    if (!ordenesResponse.ok || !ordenesResult.ok || !Array.isArray(ordenesResult.data) ||
        !preventivosResponse.ok || !preventivosResult.ok || !Array.isArray(preventivosResult.data) ||
        !catalogosResponse.ok || !catalogosResult.ok || !catalogosResult.data) {
        throw new Error('No se pudieron leer órdenes, mantenimientos o catálogos de PostgreSQL.');
    }
    DB.ordenes = ordenesResult.data.map(orden => ({
        id: orden.codigo,
        solicitud: orden.fecha_solicitud,
        programada: orden.fecha_programada,
        cierre: orden.fecha_cierre || '',
        equipo: orden.equipo_codigo,
        tipo: orden.tipo,
        prioridad: orden.prioridad,
        solicitante: orden.solicitante,
        dependenciaSol: orden.dependencia_solicitante,
        tecnico: orden.tecnico.trim().toLowerCase() === 'juan diaz' ? 'Juan Diaz Pardo' :
            orden.tecnico.trim().toLowerCase() === 'jairo jose simancas cogollo' ? 'Jairo Simancas Cogollo' : orden.tecnico,
        falla: orden.falla,
        diagnostico: orden.diagnostico_inicial || '',
        actividades: orden.actividades || '',
        repuestos: orden.repuestos || '',
        horas: Number(orden.horas || 0),
        costo: Number(orden.costo || 0),
        diagnosticoFinal: orden.diagnostico_final || '',
        estadoEquipoCierre: orden.estado_equipo_cierre || '',
        observaciones: orden.observaciones || '',
        estado: orden.estado
    }));
    DB.preventivos = preventivosResult.data.map(plan => ({
        id: plan.codigo,
        equipo: plan.equipo_codigo,
        dependencia: plan.dependencia,
        frecuencia: plan.frecuencia,
        ultimo: plan.ultimo_mantenimiento || '',
        proximo: plan.proximo_mantenimiento,
        tecnico: plan.tecnico,
        firma: plan.firma || 'No',
        estado: plan.estado,
        actividades: plan.actividades,
        observaciones: plan.observaciones || ''
    }));
    DB.dependencias = catalogosResult.data.dependencias;
    DB.tecnicos = catalogosResult.data.tecnicos
        .map(tecnico => ({
            ...tecnico,
            nombre: tecnico.nombre.trim().toLowerCase() === 'juan diaz' ? 'Juan Diaz Pardo' :
                tecnico.nombre.trim().toLowerCase() === 'jairo jose simancas cogollo' ? 'Jairo Simancas Cogollo' : tecnico.nombre,
            activo: Number(tecnico.activo) === 1
        }));
    cargarSelectorTecnicos();
    DB.repuestos = catalogosResult.data.repuestos.map(repuesto => ({
        ...repuesto,
        costo: Number(repuesto.costo || 0)
    }));
    guardarDB();
    cargarCatalogos();
    cargarDashboard();
    cargarOrdenes();
    cargarPreventivos();
}

function cargarInventario(filtro='') {
    let datos = DB.inventario;
    if(filtro) {
        const t = filtro.toLowerCase();
        datos = datos.filter(e => 
            e.id.toLowerCase().includes(t) || 
            e.marca.toLowerCase().includes(t) || 
            e.modelo.toLowerCase().includes(t) ||
            e.serial.toLowerCase().includes(t) ||
            e.ubicacion.toLowerCase().includes(t) ||
            e.dependencia.toLowerCase().includes(t));
    }
    document.getElementById('tabla-inventario').innerHTML = datos.map(e => `
        <tr>
            <td><strong>${e.id}</strong></td>
            <td>${e.marca}</td>
            <td>${e.modelo}</td>
            <td>${e.serial}</td>
            <td>${e.ubicacion}</td>
            <td>${e.dependencia}</td>
            <td>${e.responsable}</td>
            <td>${etiquetaEstado(e.estado)}</td>
            <td>
                <button class="btn-icon" onclick="verEquipo('${e.id}')" title="Ver Hoja de vida">👁️</button>
                <button class="btn-icon" onclick="nuevaOrdenDesdeEquipo('${e.id}')" title="Crear Orden">📝</button>
            </td>
        </tr>`).join('');
}

function escaparExcel(valor) {
    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function exportarInventarioExcel() {
    const columnas = [
        ['ID Equipo', 'id'],
        ['Tipo', 'tipo'],
        ['Marca', 'marca'],
        ['Modelo', 'modelo'],
        ['Serial', 'serial'],
        ['Número interno', 'interno'],
        ['Fecha de adquisición', 'adquisicion'],
        ['Proveedor', 'proveedor'],
        ['Valor', 'valor'],
        ['Dependencia', 'dependencia'],
        ['Responsable', 'responsable'],
        ['Ubicación', 'ubicacion'],
        ['Estado', 'estado'],
        ['Procesador', 'procesador'],
        ['Memoria RAM', 'ram'],
        ['Disco', 'disco'],
        ['Sistema operativo', 'so'],
        ['Suite ofimática', 'office'],
        ['Programas instalados', 'programas'],
        ['Observaciones', 'observaciones']
    ];
    const encabezados = columnas.map(([titulo]) => `<th>${escaparExcel(titulo)}</th>`).join('');
    const filas = DB.inventario.map(equipo => {
        const celdas = columnas.map(([, clave]) => {
            const valor = clave === 'valor' && equipo[clave] !== ''
                ? Number(equipo[clave] || 0).toLocaleString('es-CO')
                : equipo[clave];
            return `<td>${escaparExcel(valor)}</td>`;
        }).join('');
        return `<tr>${celdas}</tr>`;
    }).join('');
    const fecha = new Date().toISOString().slice(0, 10);
    const libro = `   <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="UTF-8"><style>
            table { border-collapse: collapse; } th { background: #087443; color: #ffffff; font-weight: bold; } th, td { border: 1px solid #c9d5ca; padding: 8px; } td { vertical-align: top; }
        </style></head><body><h2>Inventario técnico - ManténTI Arjona</h2>
        <p>Exportado: ${fecha}</p><table><thead><tr>${encabezados}</tr></thead><tbody>${filas}</tbody></table></body></html>`;
    const blob = new Blob([libro.replace(/^\u0000+/, '')], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = `inventario-tecnico-mantenti-${fecha}.xls`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
}

function filtrarInventario() {
    cargarInventario(document.getElementById('buscar-equipo').value);
}
function abrirFormEquipo() {
    document.getElementById('modal-cuerpo').innerHTML = `
        <h2>Registrar Nuevo Equipo</h2><form onsubmit="guardarEquipo(event)">
        <label>ID Equipo</label><input name="id" required placeholder="Ej: PC-ARJ-001">
        <label>Tipo</label><select name="tipo" required>
            <option>PC escritorio</option><option>Laptop</option><option>All-in-One</option>
            <option>Impresora</option><option>Monitor</option><option>Otro</option>
        </select>
        <label>Marca</label><input name="marca" required>
        <label>Modelo</label><input name="modelo">
        <label>Serial</label><input name="serial" required>
        <label>Número Interno</label><input name="interno" placeholder="INV-AAAA-NNN">
        <label>Dependencia</label><select name="dependencia" required>
            ${DB.dependencias.map(d=>`<option>${d.nombre}</option>`).join('')}
        </select>
        <label>Responsable</label><input name="responsable" required>
        <label>Ubicación</label><input name="ubicacion" required>
        <label>Estado</label><select name="estado" required>
            <option>Operativo</option><option>En reparación</option>
            <option>En espera de repuesto</option><option>Obsoleto</option><option>Baja</option>
        </select>
        <label>Procesador</label><input name="procesador">
        <label>RAM</label><input name="ram" placeholder="Ej: 8 GB DDR4">
        <label>Disco</label><input name="disco" placeholder="Ej: SSD 256 GB">
        <label>Sistema operativo</label><input name="sistema_operativo" placeholder="Ej: Windows 11 Pro">
        <label>Suite ofimática</label><input name="office" placeholder="Ej: Office 365">
        <label>Programas instalados</label><textarea name="programas" rows="2" placeholder="Ej: ORFEO, SIIGO, Excel avanzado"></textarea>
        <label>Observaciones</label><textarea name="observaciones"></textarea>
        <button type="submit" class="btn-primario">Guardar Equipo</button>
        </form>`;
    document.getElementById('modal').classList.add('active');
}
async function guardarEquipo(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    const eq = Object.fromEntries(f);
    if(DB.inventario.some(x => x.id === eq.id)) return alert('El ID ya existe');

    try {
        const response = await fetch('backend/api.php?action=inventario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
            credentials: 'same-origin',
            body: JSON.stringify({
                codigo: eq.id,
                tipo: eq.tipo,
                marca: eq.marca,
                modelo: eq.modelo,
                serial: eq.serial,
                numero_interno: eq.interno,
                dependencia: eq.dependencia,
                responsable: eq.responsable,
                ubicacion: eq.ubicacion,
                estado: eq.estado,
                procesador: eq.procesador,
                ram: eq.ram,
                disco: eq.disco,
                sistema_operativo: eq.sistema_operativo,
                office: eq.office,
                programas: eq.programas,
                observaciones: eq.observaciones
            })
        });
        const result = await response.json();
        if (!response.ok || !result.ok) {
            alert(result.error || 'No se pudo guardar el equipo.');
            return;
        }
    } catch (error) {
        alert('No se pudo conectar con el servidor.');
        return;
    }

    DB.inventario.push({...eq, valor:0});
    guardarDB(); cerrarModal(); cargarInventario();
}
async function verEquipo(id) {
    const e = getEquipo(id);
    const ordenes = DB.ordenes.filter(o => o.equipo === id);
    let historial = [];
    let documentos = [];
    try {
        const response = await fetch(`backend/api.php?action=historial&equipo=${encodeURIComponent(id)}`, { credentials: 'same-origin' });
        const result = await response.json();
        if (result.ok) historial = result.data || [];
    } catch (error) {
        console.warn('No se pudo cargar el historial del equipo.', error);
    }
    try {
        const response = await fetch(`backend/api.php?action=documentos&equipo=${encodeURIComponent(id)}`, { credentials: 'same-origin' });
        const result = await response.json();
        if (result.ok) documentos = result.data || [];
    } catch (error) {
        console.warn('No se pudieron cargar los documentos del equipo.', error);
    }
    document.getElementById('modal-cuerpo').innerHTML = `
        <h2>Hoja de Vida — ${e.id}</h2>
        <div style="columns:2; gap:2rem;">
        <div><p><strong>Marca/Modelo:</strong> ${e.marca} ${e.modelo}</p>
        <p><strong>Serial:</strong> ${e.serial}</p>
        <p><strong>Dependencia:</strong> ${e.dependencia}</p>
        <p><strong>Responsable:</strong> ${e.responsable}</p>
        <p><strong>Ubicación:</strong> ${e.ubicacion}</p>
        <p><strong>Estado:</strong> ${etiquetaEstado(e.estado)}</p></div>
        <div><p><strong>Procesador:</strong> ${e.procesador||'—'}</p>
        <p><strong>RAM:</strong> ${e.ram||'—'}</p>
        <p><strong>Disco:</strong> ${e.disco||'—'}</p>
        <p><strong>Sistema Operativo:</strong> ${e.so || e.sistema_operativo || '—'}</p>
        <p><strong>Office:</strong> ${e.office || '—'}</p>
        <p><strong>Programas instalados:</strong> ${e.programas || '—'}</p></div></div>
        <h3 style="margin-top:1.5rem;">Historial de Órdenes (${ordenes.length})</h3>
        ${ordenes.length ? `<table><thead><tr><th>N°</th><th>Fecha</th><th>Tipo</th><th>Estado</th></tr></thead>
        ${ordenes.map(o=>`<tr><td>${o.id}</td><td>${o.solicitud}</td><td>${o.tipo}</td><td>${etiquetaEstado(o.estado)}</td></tr>`).join('')}</table>` : '<p>Sin órdenes registradas</p>'}
        <h3 style="margin-top:1.5rem;">Trazabilidad del equipo</h3>
        ${historial.length ? `<div class="timeline-list">${historial.map(item => `<div class="timeline-item"><strong>${item.accion}</strong><span>${item.descripcion}</span><small>${item.created_at} · ${item.usuario}</small></div>`).join('')}</div>` : '<p>Sin movimientos registrados</p>'}
        <h3 style="margin-top:1.5rem;">Documentos y evidencias</h3>
        <form class="document-upload" onsubmit="subirDocumento(event, '${e.id}')"><input type="file" name="archivo" accept=".pdf,.jpg,.jpeg,.png,.xlsx" required><button class="btn-secundario" type="submit">Adjuntar documento</button></form>
        ${documentos.length ? `<div class="document-list">${documentos.map(doc => `<div><strong>${doc.nombre_archivo}</strong><small>${doc.tipo} · ${Math.ceil(doc.tamano / 1024)} KB · ${doc.created_at}</small></div>`).join('')}</div>` : '<p>Sin documentos adjuntos</p>'}
        <button class="btn-primario" onclick="cerrarModal()" style="margin-top:1rem;">Cerrar</button>`;
    document.getElementById('modal').classList.add('active');
}

async function subirDocumento(evento, equipo) {
    evento.preventDefault();
    const datos = new FormData(evento.target);
    datos.append('equipo', equipo);
    const response = await fetch('backend/api.php?action=documentos', { method: 'POST', headers: { 'X-CSRF-Token': csrfToken }, body: datos, credentials: 'same-origin' });
    const result = await response.json();
    if (!response.ok || !result.ok) return alert(result.error || 'No se pudo adjuntar el documento.');
    verEquipo(equipo);
}
function nuevaOrdenDesdeEquipo(id) {
    cerrarModal(); setTimeout(() => abrirFormOrden(id), 100);
}

// ======================================================
// ÓRDENES DE TRABAJO
// ======================================================
function getRolOrdenActual() {
    const activo = document.querySelector('.module-btn.active');
    return activo ? activo.dataset.role : 'administrador';
}
function cargarSelectorTecnicos() {
    const selector = document.getElementById('tecnico-asignado');
    if (!selector) return;
    const tecnicoAnterior = selector.value;
    const usuario = JSON.parse(localStorage.getItem('MantTI_User') || 'null');
    const tecnicosActivos = DB.tecnicos.filter(tecnico => tecnico.activo);
    selector.replaceChildren(...tecnicosActivos.map(tecnico => new Option(tecnico.nombre, tecnico.nombre)));
    const tecnicoUsuario = tecnicosActivos.find(tecnico => tecnico.nombre === usuario?.name);
    selector.value = tecnicosActivos.some(tecnico => tecnico.nombre === tecnicoAnterior)
        ? tecnicoAnterior
        : tecnicoUsuario?.nombre || tecnicosActivos[0]?.nombre || '';
}
function cargarOrdenes() {
    const rol = getRolOrdenActual();
    let datos = DB.ordenes;
    if(document.getElementById('filtro-cerradas')?.checked)
        datos = datos.filter(o => o.estado !== 'Cerrado');

    if (rol === 'tecnico') {
        const selectorTecnico = document.getElementById('tecnico-asignado');
        const usuario = JSON.parse(localStorage.getItem('MantTI_User') || 'null');
        if (selectorTecnico && !selectorTecnico.options.length) {
            cargarSelectorTecnicos();
        }
        const tecnicoActual = selectorTecnico?.value || usuario?.name || '';
        datos = datos.filter(o => o.tecnico === tecnicoActual);
        document.getElementById('tabla-ordenes-tecnico').innerHTML = datos.map(o => `
            <tr>
                <td><strong>${o.id}</strong><br><small>${o.solicitud}</small></td>
                <td>${o.equipo}</td>
                <td>${o.tipo}</td>
                <td><span class="etiqueta ${o.prioridad==='Alta'?'vencido':o.prioridad==='Media'?'programado':'cerrado'}">${o.prioridad}</span></td>
                <td>${o.falla.substring(0, 45)}${o.falla.length > 45 ? '...' : ''}</td>
                <td>${etiquetaEstado(o.estado)}</td>
                <td>
                    ${o.estado === 'Programado' ? `<button class="btn-icon" onclick="iniciarOrden('${o.id}')" title="Iniciar Orden">🔄</button>` : ''}
                    ${o.estado !== 'Cerrado' ? `<button class="btn-icon" onclick="cerrarOrden('${o.id}')" title="Cerrar Orden">✅</button>` : ''}
                </td>
            </tr>`).join('');
        document.getElementById('totales-tecnico').textContent = String(DB.ordenes.filter(o => o.tecnico === tecnicoActual).length);
        document.getElementById('pendientes-tecnico').textContent = String(DB.ordenes.filter(o => o.tecnico === tecnicoActual && o.estado !== 'Cerrado').length);
        return;
    }

    document.getElementById('tabla-ordenes').innerHTML = datos.map(o => `
        <tr>
            <td><strong>${o.id}</strong><br><small>${o.solicitud}</small></td>
            <td>${o.equipo}</td>
            <td>${o.tipo}</td>
            <td><span class="etiqueta ${o.prioridad==='Alta'?'vencido':o.prioridad==='Media'?'programado':'cerrado'}">${o.prioridad}</span></td>
            <td>${o.tecnico}</td>
            <td>${etiquetaEstado(o.estado)}</td>
            <td>
                ${o.estado!=='Cerrado'?`<button class="btn-icon" onclick="cerrarOrden('${o.id}')" title="Cerrar Orden">✅</button>`:''}
            </td>
        </tr>`).join('');
}
async function iniciarOrden(id) {
    const orden = DB.ordenes.find(x => x.id === id);
    if(!orden) return;
    const response = await fetch('backend/api.php?action=ordenes', { method: 'PUT', headers: {'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken}, credentials: 'same-origin', body: JSON.stringify({ codigo: id, estado: 'En proceso', fecha_cierre: '' }) });
    const result = await response.json();
    if (!response.ok || !result.ok) return alert(result.error || 'No se pudo iniciar la orden.');
    orden.estado = 'En proceso';
    guardarDB(); cargarOrdenes(); cargarDashboard();
}
function filtrarEquiposPorDependencia(dependencia, equipoPreseleccionado = '') {
    const selectorEquipo = document.getElementById('orden-equipo-seleccionado');
    if (!selectorEquipo) return;
    const equipos = DB.inventario.filter(equipo => equipo.dependencia === dependencia);
    selectorEquipo.replaceChildren(
        new Option('Seleccione un equipo...', ''),
        ...equipos.map(equipo => new Option(`${equipo.id} — ${equipo.marca} ${equipo.modelo}`, equipo.id))
    );
    if (equipos.some(equipo => equipo.id === equipoPreseleccionado)) {
        selectorEquipo.value = equipoPreseleccionado;
    }
}

function actualizarDependenciaEquipoSeleccionado(equipoId, campoId = 'preventivo-dependencia-equipo') {
    const textoDependencia = document.getElementById(campoId);
    if (!textoDependencia) return;
    textoDependencia.textContent = getEquipo(equipoId)?.dependencia || 'Seleccione un equipo';
}

async function cargarTecnicosDesdeBackend() {
    const response = await fetch('backend/api.php?action=catalogos', { credentials: 'same-origin' });
    if (manejarSesionNoAutenticada(response)) return null;
    const result = await response.json();
    if (!response.ok || !result.ok || !Array.isArray(result.data?.tecnicos)) {
        throw new Error(result.error || 'No se pudo cargar el catálogo de técnicos.');
    }
    DB.tecnicos = result.data.tecnicos;
    return DB.tecnicos.filter(tecnico => Number(tecnico.activo) === 1);
}

async function abrirFormOrden(equipoPreseleccionado='') {
    let tecnicosActivos;
    try {
        tecnicosActivos = await cargarTecnicosDesdeBackend();
    } catch (error) {
        alert(error.message || 'No se pudieron cargar los técnicos habilitados.');
        return;
    }
    if (!tecnicosActivos) return;
    if (!tecnicosActivos.length) {
        alert('No hay técnicos habilitados para asignar.');
        return;
    }

    const dependenciaPreseleccionada = getEquipo(equipoPreseleccionado)?.dependencia || '';
    const dependencias = [...new Set(DB.inventario.map(equipo => equipo.dependencia).filter(Boolean))];
    document.getElementById('modal-cuerpo').innerHTML = `
        <h2>Nueva Orden de Trabajo</h2><form onsubmit="guardarOrden(event)">
        <label>Dependencia</label><select id="orden-dependencia-seleccionada" required onchange="filtrarEquiposPorDependencia(this.value)">
            <option value="">Seleccione una dependencia...</option>
            ${dependencias.map(dependencia=>`<option value="${dependencia}" ${dependencia===dependenciaPreseleccionada?'selected':''}>${dependencia}</option>`).join('')}
        </select>
        <label>Equipo</label><select id="orden-equipo-seleccionado" name="equipo" required>
            <option value="">Seleccione primero una dependencia...</option>
        </select>
        <label>Tipo de Mantenimiento</label><select name="tipo" required>
            <option>Correctivo</option><option>Preventivo</option><option>Mejora / actualización</option>
        </select>
        <label>Prioridad</label><select name="prioridad" required>
            <option>Alta</option><option selected>Media</option><option>Baja</option>
        </select>
        <label>Fecha Programada</label><input type="date" name="programada" required value="${hoy()}">
        <label>Técnico Asignado</label><select name="tecnico" required>
            ${tecnicosActivos.map(t=>`<option>${t.nombre}</option>`).join('')}
        </select>
        <label>Falla / Motivo</label><textarea name="falla" required rows="3"></textarea>
        <label>Diagnóstico Inicial</label><textarea name="diagnostico" rows="2"></textarea>
        <button type="submit" class="btn-primario">Crear Orden</button>
        </form>`;
    document.getElementById('modal').classList.add('active');
    filtrarEquiposPorDependencia(dependenciaPreseleccionada, equipoPreseleccionado);
}
async function guardarOrden(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    const nuevaOrden = {
        id: generarIDOrden(),
        solicitud: hoy(),
        programada: f.get('programada'),
        cierre: '',
        equipo: f.get('equipo'),
        tipo: f.get('tipo'),
        prioridad: f.get('prioridad'),
        solicitante: 'Usuario actual',
        dependenciaSol: getEquipo(f.get('equipo'))?.dependencia || '',
        tecnico: f.get('tecnico'),
        falla: f.get('falla'),
        diagnostico: f.get('diagnostico'),
        actividades: '',
        repuestos: '',
        horas: 0,
        costo: 0,
        diagnosticoFinal: '',
        estadoEquipoCierre: '',
        observaciones: '',
        estado: 'Programado'
    };
    try {
        const response = await fetch('backend/api.php?action=ordenes', {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken }, credentials: 'same-origin',
            body: JSON.stringify({
                codigo: nuevaOrden.id, equipo_codigo: nuevaOrden.equipo, tipo: nuevaOrden.tipo,
                prioridad: nuevaOrden.prioridad, solicitante: nuevaOrden.solicitante,
                dependencia_solicitante: nuevaOrden.dependenciaSol, tecnico: nuevaOrden.tecnico,
                falla: nuevaOrden.falla, diagnostico_inicial: nuevaOrden.diagnostico,
                fecha_solicitud: nuevaOrden.solicitud, fecha_programada: nuevaOrden.programada
            })
        });
        if (manejarSesionNoAutenticada(response)) return;
        const result = await response.json();
        if (!response.ok || !result.ok) return alert(result.error || 'No se pudo guardar la orden.');
    } catch (error) {
        return alert('No se pudo conectar con el servidor.');
    }
    DB.ordenes.unshift(nuevaOrden);
    guardarDB(); cerrarModal(); cargarOrdenes(); cargarDashboard();
}
function cerrarOrden(id) {
    const o = DB.ordenes.find(x => x.id === id);
    if(!o) return;
    document.getElementById('modal-cuerpo').innerHTML = `
        <h2>Cerrar Orden ${id}</h2><form onsubmit="confirmarCierre(event, '${id}')">
        <label>Actividades Realizadas</label><textarea name="actividades" required rows="3">${o.actividades}</textarea>
        <label>Repuestos / Materiales</label><textarea name="repuestos" rows="2"></textarea>
        <label>Tiempo Total (horas)</label><input type="number" step="0.5" name="horas" min="0">
        <label>Diagnóstico Final</label><textarea name="diagnosticoFinal" required rows="2"></textarea>
        <label>Estado del Equipo al Cierre</label><select name="estadoEquipo" required>
            <option>Operativo</option><option>En reparación</option><option>En espera de repuesto</option><option>Obsoleto</option>
        </select>
        <label>Observaciones / Recomendaciones</label><textarea name="observaciones" rows="2"></textarea>
        <button type="submit" class="btn-primario">Confirmar Cierre</button>
        </form>`;
    document.getElementById('modal').classList.add('active');
}
async function confirmarCierre(e, id) {
    e.preventDefault();
    const f = new FormData(e.target);
    const orden = DB.ordenes.find(x => x.id === id);
    const datos = {
        codigo: id, estado: 'Cerrado', fecha_cierre: hoy(), actividades: f.get('actividades'),
        repuestos: f.get('repuestos'), horas: parseFloat(f.get('horas')) || 0,
        diagnostico_final: f.get('diagnosticoFinal'), estado_equipo_cierre: f.get('estadoEquipo'), observaciones: f.get('observaciones')
    };
    const response = await fetch('backend/api.php?action=ordenes', { method: 'PUT', headers: {'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken}, credentials: 'same-origin', body: JSON.stringify(datos) });
    const result = await response.json();
    if (!response.ok || !result.ok) return alert(result.error || 'No se pudo cerrar la orden.');
    orden.estado = 'Cerrado';
    orden.cierre = hoy();
    orden.actividades = f.get('actividades');
    orden.repuestos = f.get('repuestos');
    orden.horas = parseFloat(f.get('horas')) || 0;
    orden.diagnosticoFinal = f.get('diagnosticoFinal');
    orden.estadoEquipoCierre = f.get('estadoEquipo');
    orden.observaciones = f.get('observaciones');
    const eq = getEquipo(orden.equipo);
    if(eq) eq.estado = f.get('estadoEquipo');
    guardarDB(); cerrarModal(); cargarOrdenes(); cargarDashboard();
}

// ======================================================
// PREVENTIVOS
// ======================================================
function cargarPreventivos() {
    document.getElementById('tabla-preventivos').innerHTML = DB.preventivos.map(p => {
        const equipo = getEquipo(p.equipo);
        const d = diasEntre(p.proximo);
        let claseDias = '';
        if(d === null || isNaN(d)) claseDias = '';
        else if(d < 0) claseDias = 'vencido';
        else if(d <= 7) claseDias = 'advertencia';
        return `<tr>
            <td><strong>${p.id}</strong></td>
            <td>${p.equipo}</td>
            <td>${equipo ? `${equipo.tipo} ${equipo.marca} ${equipo.modelo}`.trim() : '—'}</td>
            <td>${equipo?.dependencia || p.dependencia || '—'}</td>
            <td>${p.frecuencia}</td>
            <td>${p.ultimo||'—'}</td>
            <td>${p.proximo}</td>
            <td class="${claseDias}">${d===null||isNaN(d)?'—':d<0?`${d} días`:`${d} días`}</td>
            <td>${etiquetaEstado(d<0 && p.estado==='Programado'?'Vencido':p.estado)}</td>
            <td>
                <select aria-label="Firma del plan ${p.id}" data-firma="${p.firma || 'No'}" onchange="guardarFirmaPreventivo('${p.id}', this.value, this)">
                    <option value="Sí" ${(p.firma || 'No') === 'Sí' ? 'selected' : ''}>Sí firmó</option>
                    <option value="No" ${(p.firma || 'No') === 'No' ? 'selected' : ''}>No firmó</option>
                </select>
            </td>
            <td>
                ${p.estado==='Programado'?`<button class="btn-icon" onclick="marcarPreventivoRealizado('${p.id}')" title="Marcar Realizado">✅</button>`:''}
            </td>
        </tr>`;
    }).join('');
}
async function abrirFormPreventivo() {
    let tecnicosActivos;
    try {
        tecnicosActivos = await cargarTecnicosDesdeBackend();
    } catch (error) {
        alert(error.message || 'No se pudieron cargar los técnicos habilitados.');
        return;
    }
    if (!tecnicosActivos) return;
    if (!tecnicosActivos.length) {
        alert('No hay técnicos habilitados para asignar.');
        return;
    }

    document.getElementById('modal-cuerpo').innerHTML = `
        <h2>Nuevo Plan de Mantenimiento Preventivo</h2><form onsubmit="guardarPreventivo(event)">
        <label>Equipo o impresora</label><select id="preventivo-equipo-seleccionado" name="equipo" required onchange="actualizarDependenciaEquipoSeleccionado(this.value, 'preventivo-dependencia-equipo')">
            ${DB.inventario.map(e=>`<option value="${e.id}">${e.id} — ${e.tipo} — ${e.marca} ${e.modelo}</option>`).join('')}
        </select>
        <p>Dependencia: <strong id="preventivo-dependencia-equipo">${DB.inventario[0]?.dependencia || 'Seleccione un equipo'}</strong></p>
        <label>Frecuencia</label><select id="preventivo-frecuencia" name="frecuencia" required onchange="actualizarProximaFechaPreventivo()">
            <option>Mensual</option><option selected>Trimestral</option><option>Semestral</option><option>Anual</option>
        </select>
        <label>Fecha Último Mantenimiento</label><input id="preventivo-ultimo" type="date" name="ultimo" value="${hoy()}" required onchange="actualizarProximaFechaPreventivo()">
        <label>Próximo mantenimiento (fecha proyectada)</label><input id="preventivo-proximo" type="date" name="proximo" required readonly>
        <label>Técnico Responsable</label><select name="tecnico" required>
            ${tecnicosActivos.map(t=>`<option>${t.nombre}</option>`).join('')}
        </select>
        <label>Actividades Estándar</label><textarea name="actividades" required rows="3">Limpieza interna y externa, actualización SO y antivirus, revisión de disco y RAM</textarea>
        <button type="submit" class="btn-primario">Crear Plan</button>
        </form>`;
    document.getElementById('modal').classList.add('active');
    actualizarDependenciaEquipoSeleccionado(document.getElementById('preventivo-equipo-seleccionado')?.value || '', 'preventivo-dependencia-equipo');
    actualizarProximaFechaPreventivo();
}
function actualizarProximaFechaPreventivo() {
    const fechaUltimo = document.getElementById('preventivo-ultimo')?.value;
    const frecuencia = document.getElementById('preventivo-frecuencia')?.value || 'Trimestral';
    const campoProximo = document.getElementById('preventivo-proximo');
    if (campoProximo) campoProximo.value = fechaUltimo ? sumarMeses(fechaUltimo, mesesPorFrecuencia(frecuencia)) : '';
}
async function guardarPreventivo(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    const eq = getEquipo(f.get('equipo'));
    const nuevoPlan = {
        id: `PR-${String(DB.preventivos.length+1).padStart(3,'0')}`,
        equipo: f.get('equipo'),
        dependencia: eq?.dependencia || '',
        frecuencia: f.get('frecuencia'),
        ultimo: f.get('ultimo') || '',
        proximo: f.get('proximo'),
        tecnico: f.get('tecnico'),
        estado: 'Programado',
        firma: 'No',
        actividades: f.get('actividades'),
        observaciones: ''
    };
    try {
        const response = await fetch('backend/api.php?action=preventivos', {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken }, credentials: 'same-origin',
            body: JSON.stringify({
                codigo: nuevoPlan.id, equipo_codigo: nuevoPlan.equipo, dependencia: nuevoPlan.dependencia,
                frecuencia: nuevoPlan.frecuencia, ultimo_mantenimiento: nuevoPlan.ultimo,
                proximo_mantenimiento: nuevoPlan.proximo, tecnico: nuevoPlan.tecnico,
                actividades: nuevoPlan.actividades
            })
        });
        if (manejarSesionNoAutenticada(response)) return;
        const result = await response.json();
        if (!response.ok || !result.ok) return alert(result.error || 'No se pudo guardar el plan.');
    } catch (error) {
        return alert('No se pudo conectar con el servidor.');
    }
    DB.preventivos.unshift(nuevoPlan);
    guardarDB(); cerrarModal(); cargarPreventivos(); cargarDashboard();
}
async function guardarFirmaPreventivo(id, firma, selector) {
    const firmaAnterior = selector.dataset.firma || 'No';
    selector.disabled = true;
    try {
        const response = await fetch('backend/api.php?action=preventivos', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
            credentials: 'same-origin',
            body: JSON.stringify({ codigo: id, firma })
        });
        const result = await response.json();
        if (!response.ok || !result.ok) {
            selector.value = firmaAnterior;
            alert(result.error || 'No se pudo guardar la firma.');
            return;
        }
        const plan = DB.preventivos.find(item => item.id === id);
        if (plan) plan.firma = firma;
        selector.dataset.firma = firma;
        guardarDB();
    } catch (error) {
        selector.value = firmaAnterior;
        alert('No se pudo conectar con el servidor para guardar la firma.');
    } finally {
        selector.disabled = false;
    }
}
async function marcarPreventivoRealizado(id) {
    const p = DB.preventivos.find(x => x.id === id);
    if(!p) return;
    p.estado = 'Realizado';
    p.ultimo = hoy();
    p.proximo = sumarMeses(p.ultimo, mesesPorFrecuencia(p.frecuencia));
    const response = await fetch('backend/api.php?action=preventivos', { method: 'PUT', headers: {'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken}, credentials: 'same-origin', body: JSON.stringify({ codigo: id, estado: p.estado, ultimo_mantenimiento: p.ultimo, proximo_mantenimiento: p.proximo }) });
    const result = await response.json();
    if (!response.ok || !result.ok) return alert(result.error || 'No se pudo actualizar el preventivo.');
    guardarDB(); cargarPreventivos(); cargarDashboard();
}

// ======================================================
// CATÁLOGOS
// ======================================================
async function cargarCatalogos() {
    try {
        const response = await fetch('backend/api.php?action=tecnicos', { credentials: 'same-origin' });
        if (manejarSesionNoAutenticada(response)) return;
        const result = await response.json();
        if (!response.ok || !result.ok || !Array.isArray(result.data)) {
            throw new Error(result.error || 'No se pudo actualizar el catálogo de técnicos.');
        }
        DB.tecnicos = result.data;
    } catch (error) {
        alert(error.message || 'No se pudo actualizar el catálogo de técnicos.');
    }
    document.getElementById('tabla-dependencias').innerHTML = DB.dependencias.map(d => `
        <tr><td>${d.nombre}</td><td>${d.responsable}</td><td>${d.correo}</td><td>${d.telefono}</td><td>—</td></tr>`).join('');
    document.getElementById('tabla-tecnicos').innerHTML = DB.tecnicos.map(t => `
        <tr><td>${t.nombre}</td><td>${t.cargo}</td><td>${t.correo}</td><td>${Number(t.activo) === 1?'✅':'❌'}</td>
        <td><button class="btn-icon" type="button" onclick="cambiarEstadoTecnico(${Number(t.id)}, ${Number(t.activo) !== 1})" title="${Number(t.activo) === 1?'Deshabilitar':'Habilitar'} técnico">${Number(t.activo) === 1?'⛔':'✅'}</button></td></tr>`).join('');
    document.getElementById('tabla-repuestos').innerHTML = DB.repuestos.map(r => `
        <tr><td>${r.nombre}</td><td>${r.unidad}</td><td>$${r.costo.toLocaleString()}</td><td>${r.existencia}</td><td>—</td></tr>`).join('');
}

async function cambiarEstadoTecnico(id, activo) {
    try {
        const response = await fetch('backend/api.php?action=tecnicos', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
            credentials: 'same-origin',
            body: JSON.stringify({ id, activo })
        });
        const result = await response.json();
        if (!response.ok || !result.ok) {
            alert(result.error || 'No se pudo actualizar el estado del técnico.');
            return;
        }
        const index = DB.tecnicos.findIndex(tecnico => Number(tecnico.id) === Number(id));
        if (index !== -1) DB.tecnicos[index] = result.data;
        guardarDB();
        await cargarCatalogos();
    } catch (error) {
        alert('No se pudo conectar con el servidor para actualizar el técnico.');
    }
}

function cargarReportes() {
    const total = DB.inventario.length;
    const operativos = DB.inventario.filter(e => e.estado === 'Operativo').length;
    const noOperativos = DB.inventario.filter(e => ['En reparación','En espera de repuesto','Obsoleto'].includes(e.estado)).length;
    const pendientes = DB.ordenes.filter(o => o.estado !== 'Cerrado').length;
    const porVencer = DB.preventivos.filter(p => {
        const d = diasEntre(p.proximo);
        return p.estado === 'Programado' && d !== null && d >= 0 && d <= 15;
    }).length;
    const disponibilidad = total ? Math.round((operativos / total) * 100) : 0;

    document.getElementById('report-disponibilidad').textContent = `${disponibilidad}%`;
    document.getElementById('report-vencer').textContent = String(porVencer);
    document.getElementById('report-operativos').textContent = String(operativos);
    document.getElementById('report-no-operativos').textContent = String(noOperativos);

    document.getElementById('report-list').innerHTML = `
        <div class="report-item"><span>Equipos registrados</span><strong>${total}</strong></div>
        <div class="report-item"><span>Órdenes abiertas</span><strong>${pendientes}</strong></div>
        <div class="report-item"><span>Preventivos próximos</span><strong>${porVencer}</strong></div>
        <div class="report-item"><span>Inventario crítico</span><strong>${noOperativos}</strong></div>
    `;
}

function imprimirReporte() {
    const reporte = document.getElementById('reportes');
    if (!reporte) return;
    document.body.classList.add('printing-report');
    window.print();
    setTimeout(() => document.body.classList.remove('printing-report'), 500);
}
function abrirFormDependencia() {
    document.getElementById('modal-cuerpo').innerHTML = `
        <h2>Nueva Dependencia</h2>
        <form onsubmit="guardarDependencia(event)">
            <label>Nombre de la dependencia</label>
            <input type="text" name="nombre" required placeholder="Ej: Contraloría">
            <label>Responsable</label>
            <input type="text" name="responsable" required placeholder="Ej: Ana Gómez">
            <label>Correo institucional</label>
            <input type="email" name="correo" required placeholder="correo@arjona-bolivar.gov.co">
            <label>Teléfono</label>
            <input type="text" name="telefono" required placeholder="(605) 123 4567">
            <button type="submit" class="btn-primario">Guardar dependencia</button>
        </form>`;
    document.getElementById('modal').classList.add('active');
}

function guardarDependencia(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    const nombre = String(f.get('nombre') || '').trim();
    if (!nombre) return;
    if (DB.dependencias.some(d => d.nombre.toLowerCase() === nombre.toLowerCase())) {
        alert('La dependencia ya existe.');
        return;
    }
    DB.dependencias.push({
        nombre,
        responsable: String(f.get('responsable') || '').trim(),
        correo: String(f.get('correo') || '').trim(),
        telefono: String(f.get('telefono') || '').trim()
    });
    guardarDB(); cerrarModal(); cargarCatalogos();
}

function abrirFormTecnico() {
    document.getElementById('modal-cuerpo').innerHTML = `
        <h2>Nuevo Técnico</h2>
        <form onsubmit="guardarTecnico(event)">
            <label>Nombre completo</label>
            <input type="text" name="nombre" required placeholder="Ej: Laura Pérez">
            <label>Cargo</label>
            <input type="text" name="cargo" required placeholder="Ej: Técnico de soporte">
            <label>Correo</label>
            <input type="email" name="correo" required placeholder="tecnico@arjona-bolivar.gov.co">
            <label>Teléfono</label>
            <input type="text" name="telefono" required placeholder="310 000 0000">
            <label>Estado</label>
            <select name="activo">
                <option value="true" selected>Activo</option>
                <option value="false">Inactivo</option>
            </select>
            <button type="submit" class="btn-primario">Guardar técnico</button>
        </form>`;
    document.getElementById('modal').classList.add('active');
}

async function guardarTecnico(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    const nombre = String(f.get('nombre') || '').trim();
    if (!nombre) return;
    try {
        const response = await fetch('backend/api.php?action=tecnicos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
            credentials: 'same-origin',
            body: JSON.stringify({
                nombre,
                cargo: String(f.get('cargo') || '').trim(),
                correo: String(f.get('correo') || '').trim(),
                telefono: String(f.get('telefono') || '').trim(),
                activo: f.get('activo') === 'true'
            })
        });
        if (manejarSesionNoAutenticada(response)) return;
        const result = await response.json();
        if (!response.ok || !result.ok) {
            alert(result.error || 'No se pudo guardar el técnico.');
            return;
        }
        DB.tecnicos = [result.data, ...DB.tecnicos.filter(tecnico => tecnico.id !== result.data.id)];
        guardarDB();
        cerrarModal();
        await cargarCatalogos();
    } catch (error) {
        alert('No se pudo conectar con el servidor para guardar el técnico.');
    }
}

function abrirFormRepuesto() {
    document.getElementById('modal-cuerpo').innerHTML = `
        <h2>Nuevo Repuesto</h2>
        <form onsubmit="guardarRepuesto(event)">
            <label>Nombre del repuesto</label>
            <input type="text" name="nombre" required placeholder="Ej: Disco SSD 240 GB">
            <label>Descripción</label>
            <textarea name="descripcion" rows="2" required placeholder="Detalle técnico del insumo"></textarea>
            <label>Unidad</label>
            <select name="unidad" required>
                <option value="Unidad">Unidad</option>
                <option value="Caja">Caja</option>
                <option value="Kit">Kit</option>
                <option value="Paquete">Paquete</option>
            </select>
            <label>Costo unitario</label>
            <input type="number" name="costo" min="0" step="1000" required placeholder="120000">
            <label>Proveedor</label>
            <input type="text" name="proveedor" required placeholder="Nombre del proveedor">
            <label>Existencia inicial</label>
            <input type="number" name="existencia" min="0" step="1" required value="0">
            <button type="submit" class="btn-primario">Guardar repuesto</button>
        </form>`;
    document.getElementById('modal').classList.add('active');
}

function guardarRepuesto(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    const nombre = String(f.get('nombre') || '').trim();
    const costo = Number(f.get('costo')) || 0;
    const existencia = Number(f.get('existencia')) || 0;
    if (!nombre) return;
    if (DB.repuestos.some(r => r.nombre.toLowerCase() === nombre.toLowerCase())) {
        alert('El repuesto ya existe.');
        return;
    }
    DB.repuestos.push({
        id: `REP-${String(DB.repuestos.length + 1).padStart(3, '0')}`,
        nombre,
        descripcion: String(f.get('descripcion') || '').trim(),
        unidad: String(f.get('unidad') || 'Unidad'),
        costo,
        proveedor: String(f.get('proveedor') || '').trim(),
        existencia
    });
    guardarDB(); cerrarModal(); cargarCatalogos();
}

// ======================================================
// MODAL
// ======================================================
function cerrarModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.classList.remove('active');
}
document.getElementById('modal')?.addEventListener('click', e => {
    if(e.target === document.getElementById('modal')) cerrarModal();
});

// ======================================================
// INICIO — Carga automática al abrir
// ======================================================
aplicarTema();
cargarDB();
const usuarioGuardado = JSON.parse(localStorage.getItem('MantTI_User') || 'null');
if (usuarioGuardado) {
    mostrarApp().catch(() => {
        localStorage.removeItem('MantTI_User');
        cambiarUsuario();
        alert('No se pudo conectar con PostgreSQL. Revisa la configuración local y vuelve a iniciar sesión.');
    });
} else {
    document.getElementById('login-screen')?.classList.remove('hidden');
    document.getElementById('app-shell')?.classList.add('hidden');
}
console.log('✅ ManténTI Arjona cargado — Datos guardados automáticamente');