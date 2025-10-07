const entriesList = document.getElementById('entriesList');
const entries = JSON.parse(localStorage.getItem('userEntries') || '[]');

if (entries.length === 0) {
entriesList.innerHTML = '<p>No hay entradas guardadas.</p>';
return;
}

entriesList.innerHTML = entries.map(entry => `
<div class="entry">
<div class="timestamp">
<strong>ID:</strong> ${entry.id} |
<strong>Fecha:</strong> ${entry.timestamp} |
<strong>Dispositivo:</strong> ${getDeviceType(entry.userAgent)}
</div>
<div class="text">${escapeHtml(entry.text)}</div>
<button onclick="deleteEntry(${entry.id})" style="background-color: #dc3545; width: auto; margin-top: 5px;">
Eliminar
</button>
</div>
`).join('');
}

// Detectar tipo de dispositivo
function getDeviceType(userAgent) {
if (/Android/.test(userAgent)) return 'Android';
if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS';
if (/Windows/.test(userAgent)) return 'Windows';
if (/Mac/.test(userAgent)) return 'Mac';
return 'Otro';
}

// Eliminar entrada específica
function deleteEntry(id) {
if (confirm('¿Estás seguro de que quieres eliminar esta entrada?')) {
let entries = JSON.parse(localStorage.getItem('userEntries') || '[]');
entries = entries.filter(entry => entry.id !== id);
localStorage.setItem('userEntries', JSON.stringify(entries));
loadEntries();
}
}

// Eliminar todas las entradas
function clearAll() {
if (confirm('¿Estás seguro de que quieres eliminar TODAS las entradas?')) {
localStorage.removeItem('userEntries');
loadEntries();
}
}

// Función auxiliar para escapar HTML
function escapeHtml(text) {
const div = document.createElement('div');
div.textContent = text;
return div.innerHTML;
}

// Guardar entrada cuando se presiona Ctrl+Enter
document.getElementById('userInput').addEventListener('keydown', function(e) {
if (e.ctrlKey && e.key === 'Enter') {
saveEntry();
}
});