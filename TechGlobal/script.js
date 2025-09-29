// ⚠️ IMPORTANTE: Reemplaza esta URL con la URL real de tu API Gateway
const API_CONFIG = {
    baseUrl: 'https://h3xldcd04d.execute-api.us-east-2.amazonaws.com/dev',
    endpoints: {
        rds: {
            create: '/rds/trabajadores',
            get: '/rds/trabajadores'
        },
        mongo: {
            create: '/mongo/trabajadores',
            get: '/mongo/trabajadores'
        }
    }
};
// Función para mostrar notificaciones
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Función para validar datos del formulario
function validarDatos(nombre, cargo, salario) {
    if (!nombre.trim()) {
        showNotification('El nombre es requerido', 'error');
        return false;
    }
    if (!cargo.trim()) {
        showNotification('El cargo es requerido', 'error');
        return false;
    }
    if (!salario || salario <= 0) {
        showNotification('El salario debe ser mayor a 0', 'error');
        return false;
    }
    return true;
}

// Función para crear trabajador
async function crearTrabajador(database) {
    const nombre = document.getElementById('nombre').value.trim();
    const cargo = document.getElementById('cargo').value.trim();
    const salario = document.getElementById('salario').value;

    if (!validarDatos(nombre, cargo, salario)) return;

    const trabajador = { nombre, cargo, salario: parseFloat(salario) };
    const btnClicked = event.target;

    try {
        btnClicked.classList.add('loading');
        btnClicked.disabled = true;

        const inicio = performance.now(); // medir inicio
        const response = await fetch(
            `${API_CONFIG.baseUrl}${API_CONFIG.endpoints[database].create}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(trabajador)
            }
        );
        const fin = performance.now(); // medir fin
        const tiempoMs = (fin - inicio).toFixed(2);

        const data = await response.json();

        if (response.ok) {
            showNotification(
                `Trabajador "${nombre}" creado en ${database.toUpperCase()} (${tiempoMs} ms)`, 
                'success'
            );

            document.getElementById('trabajadorForm').reset();

            // Mostrar resultado como JSON con tiempo
            mostrarJSON({ ...data, tiempoConsultaMs: tiempoMs }, database, "POST");

            // Auto-consultar
            setTimeout(() => consultarTrabajadores(database), 1000);
        } else {
            throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error creando trabajador:', error);
        showNotification(
            `Error al crear trabajador en ${database.toUpperCase()}: ${error.message}`, 
            'error'
        );
    } finally {
        btnClicked.classList.remove('loading');
        btnClicked.disabled = false;
    }
}

// Función para consultar trabajadores
async function consultarTrabajadores(database) {
    try {
        const inicio = performance.now(); // medir inicio
        const response = await fetch(
            `${API_CONFIG.baseUrl}${API_CONFIG.endpoints[database].get}`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }
        );
        const fin = performance.now(); // medir fin
        const tiempoMs = (fin - inicio).toFixed(2);

        const data = await response.json();

        if (response.ok) {
            mostrarJSON({ ...data, tiempoConsultaMs: tiempoMs }, database, "GET");
            showNotification(
                `${data.total || 0} trabajadores encontrados en ${database.toUpperCase()} (${tiempoMs} ms)`, 
                'success'
            );
        } else {
            throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error consultando trabajadores:', error);
        showNotification(
            `Error al consultar en ${database.toUpperCase()}: ${error.message}`, 
            'error'
        );
        mostrarJSON({ error: error.message }, database, "GET");
    }
}

// ✅ Función para mostrar resultados en formato JSON con tiempo
function mostrarJSON(data, database, metodo) {
    const resultadosSection = document.getElementById('resultados');
    const dbTypeBadge = document.getElementById('dbType');
    const trabajadoresList = document.getElementById('trabajadoresList');

    dbTypeBadge.textContent = `${database.toUpperCase()} - ${metodo}`;
    dbTypeBadge.className = `badge ${database}`;

    trabajadoresList.innerHTML = `
        <h3>Respuesta en JSON (${database.toUpperCase()} - ${metodo})</h3>
        <pre class="json-output">${JSON.stringify(data, null, 2)}</pre>
    `;

    resultadosSection.style.display = 'block';
    setTimeout(() => {
        resultadosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Verificar configuración al cargar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 TechGlobal S.A.S - Sistema iniciado');
    console.log('📡 API Configuration:', API_CONFIG);

    if (API_CONFIG.baseUrl.includes('TU-API-GATEWAY-ID')) {
        showNotification('⚠️ Configura la URL del API Gateway en script.js', 'error');
    }

    const form = document.getElementById('trabajadorForm');
    form.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') e.preventDefault();
    });
});

// Manejar errores globales
window.addEventListener('error', function(e) {
    console.error('Error global:', e);
    showNotification('Error inesperado en la aplicación', 'error');
});