// Variables globales para el admin
let blockedDays = JSON.parse(localStorage.getItem('blockedDays')) || [];
let blockedTimes = JSON.parse(localStorage.getItem('blockedTimes')) || {};

// Inicialización de localStorage para el admin
if (!localStorage.getItem('blockedDays')) {
    localStorage.setItem('blockedDays', '[]');
}
if (!localStorage.getItem('blockedTimes')) {
    localStorage.setItem('blockedTimes', '{}');
}

// Cargar panel de administrador
function loadAdminPanel() {
    showBlockedDays();
    loadAdminTimeSlots();
    showAllAppointments();
}

// Gestión de días bloqueados
function toggleBlockedDay() {
    const date = document.getElementById('adminDate').value;
    if(!date) {
        alert('Por favor selecciona una fecha');
        return;
    }

    const index = blockedDays.indexOf(date);
    if(index === -1) {
        blockedDays.push(date);
    } else {
        blockedDays.splice(index, 1);
    }

    localStorage.setItem('blockedDays', JSON.stringify(blockedDays));
    showBlockedDays();
}

function showBlockedDays() {
    const list = document.getElementById('blockedDaysList');
    list.innerHTML = '<h4>Días Bloqueados:</h4>';

    blockedDays.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'blocked-day';
        dayElement.innerHTML = `
            <span>${day}</span>
            <button onclick="removeBlockedDay('${day}')" class="delete-btn">Eliminar</button>
        `;
        list.appendChild(dayElement);
    });
}

function removeBlockedDay(day) {
    blockedDays = blockedDays.filter(d => d !== day);
    localStorage.setItem('blockedDays', JSON.stringify(blockedDays));
    showBlockedDays();
}

// Gestión de horarios del admin
function loadAdminTimeSlots() {
    const date = document.getElementById('adminTimeDate').value;
    if(!date) return;

    const timeSlotsDiv = document.getElementById('adminTimeSlots');
    timeSlotsDiv.innerHTML = '';

    const timeSlots = [
        '9:00', '9:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '16:00', '16:30', '17:00', '17:30',
        '18:00', '18:30'
    ];

    timeSlots.forEach(time => {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.textContent = time;

        const isBlocked = blockedTimes[date]?.includes(time);
        if(isBlocked) {
            slot.classList.add('blocked');
        } else {
            slot.classList.add('available');
        }

        slot.onclick = () => toggleTimeSlot(date, time, slot);
        timeSlotsDiv.appendChild(slot);
    });
}

function toggleTimeSlot(date, time, element) {
    if(!blockedTimes[date]) {
        blockedTimes[date] = [];
    }

    const index = blockedTimes[date].indexOf(time);
    if(index === -1) {
        blockedTimes[date].push(time);
        element.classList.remove('available');
        element.classList.add('blocked');
    } else {
        blockedTimes[date].splice(index, 1);
        element.classList.remove('blocked');
        element.classList.add('available');
    }

    localStorage.setItem('blockedTimes', JSON.stringify(blockedTimes));
}

// Gestión de todas las citas
function showAllAppointments() {
    const appointments = JSON.parse(localStorage.getItem('appointmentsArray')) || [];
    const list = document.getElementById('allAppointmentsList');
    list.innerHTML = '';

    appointments.forEach(app => {
        const card = document.createElement('div');
        card.className = 'appointment-card';
        card.innerHTML = `
            <p><strong>Cliente:</strong> ${app.username}</p>
            <p><strong>Servicio:</strong> ${app.service}</p>
            <p><strong>Fecha:</strong> ${app.date}</p>
            <p><strong>Hora:</strong> ${app.time}</p>
            <img src="${app.paymentProof}" class="preview-image" alt="Comprobante">
            <button onclick="deleteAppointment('${app.date}', '${app.time}')" class="delete-btn">
                Cancelar Cita
            </button>
        `;
        list.appendChild(card);
    });
}

function deleteAppointment(date, time) {
    if(confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
        let appointments = JSON.parse(localStorage.getItem('appointmentsArray')) || [];
        appointments = appointments.filter(app => 
            !(app.date === date && app.time === time)
        );
        localStorage.setItem('appointmentsArray', JSON.stringify(appointments));
        showAllAppointments();
    }
}

// Event Listener para el cambio de fecha en el admin
document.getElementById('adminTimeDate').addEventListener('change', loadAdminTimeSlots);