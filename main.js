// Variables globales
let selectedTime = null;

// Inicialización de localStorage para citas
if (!localStorage.getItem('appointmentsArray')) {
    localStorage.setItem('appointmentsArray', '[]');
}

// Función para previsualizar imagen
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('preview');
            preview.src = e.target.result;
            preview.classList.remove('hidden');
        }
        reader.readAsDataURL(file);
    }
}

// Gestión de horarios disponibles
function loadTimeSlots(date) {
    const timeSlotsDiv = document.getElementById('timeSlots');
    timeSlotsDiv.innerHTML = '';

    if(blockedDays.includes(date)) {
        timeSlotsDiv.innerHTML = '<p class="error">Este día no está disponible para citas</p>';
        return;
    }

    const timeSlots = [
        '9:00', '9:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '16:00', '16:30', '17:00', '17:30',
        '18:00', '18:30'
    ];

    let appointmentsArray = JSON.parse(localStorage.getItem('appointmentsArray')) || [];

    timeSlots.forEach(time => {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.textContent = time;

        const isOccupied = appointmentsArray.some(app => 
            app.date === date && app.time === time
        );
        const isBlocked = blockedTimes[date]?.includes(time);

        if(isOccupied || isBlocked) {
            slot.classList.add('occupied');
            slot.title = 'Horario no disponible';
        } else {
            slot.onclick = function() {
                document.querySelectorAll('.time-slot.selected').forEach(s => 
                    s.classList.remove('selected')
                );
                slot.classList.add('selected');
                selectedTime = time;
            };
        }

        timeSlotsDiv.appendChild(slot);
    });
}

// Función para agendar cita
function makeAppointment() {
    const service = document.getElementById('service').value;
    const date = document.getElementById('date').value;
    const paymentFile = document.getElementById('payment').files[0];

    if(!date || !selectedTime || !paymentFile) {
        alert('Por favor completa todos los campos, selecciona un horario y sube el comprobante de pago');
        return;
    }

    // Verificar si el día está bloqueado
    if(blockedDays.includes(date)) {
        alert('Este día no está disponible para citas');
        return;
    }

    // Verificar si el horario está bloqueado
    if(blockedTimes[date]?.includes(selectedTime)) {
        alert('Este horario no está disponible');
        return;
    }

    let appointmentsArray = JSON.parse(localStorage.getItem('appointmentsArray')) || [];
    const username = localStorage.getItem('currentUser');

    // Verificar si el horario ya está ocupado
    const isTimeSlotTaken = appointmentsArray.some(app => 
        app.date === date && app.time === selectedTime
    );

    if(isTimeSlotTaken) {
        alert('Este horario ya no está disponible. Por favor selecciona otro.');
        loadTimeSlots(date);
        return;
    }

    // Convertir imagen a Base64
    const reader = new FileReader();
    reader.onload = function(e) {
        appointmentsArray.push({
            username: username,
            service: service,
            date: date,
            time: selectedTime,
            paymentProof: e.target.result
        });

        localStorage.setItem('appointmentsArray', JSON.stringify(appointmentsArray));
        alert('Cita agendada con éxito');
        showAppointments();
        
        // Limpiar formulario
        document.getElementById('payment').value = '';
        document.getElementById('preview').classList.add('hidden');
        selectedTime = null;
        loadTimeSlots(date);
    };
    reader.readAsDataURL(paymentFile);
}

// Mostrar citas del usuario
function showAppointments() {
    const username = localStorage.getItem('currentUser');
    let appointmentsArray = JSON.parse(localStorage.getItem('appointmentsArray')) || [];
    const appointmentsList = document.getElementById('appointmentsList');
    appointmentsList.innerHTML = '<h3>📋 Mis Citas</h3>';

    const userAppointments = appointmentsArray.filter(app => app.username === username);

    if(userAppointments.length === 0) {
        appointmentsList.innerHTML += '<p>No tienes citas agendadas</p>';
        return;
    }

    userAppointments.forEach(app => {
        appointmentsList.innerHTML += `
            <div class="appointment-card">
                <p><strong>Servicio:</strong> ${app.service}</p>
                <p><strong>Fecha:</strong> ${app.date}</p>
                <p><strong>Hora:</strong> ${app.time}</p>
                <img src="${app.paymentProof}" class="preview-image" alt="Comprobante">
            </div>
        `;
    });
}

// Event Listeners
document.getElementById('date').addEventListener('change', function(e) {
    const selectedDate = e.target.value;
    loadTimeSlots(selectedDate);
});

// Inicialización al cargar la página
window.onload = function() {
    const currentUser = localStorage.getItem('currentUser');
    if(currentUser) {
        if(currentUser === 'admin') {
            loginAdmin();
        } else {
            loginUser(currentUser);
        }
    }

    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    if(dateInput.value) {
        loadTimeSlots(dateInput.value);
    }
};