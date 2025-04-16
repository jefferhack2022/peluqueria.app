// Variables globales para el admin
let blockedDays = [];

function loadAdminPanel() {
    Promise.all([
        showAllAppointments(),
        loadBlockedDays(),
        loadAdminTimeSlots()
    ]).catch(error => {
        console.error("Error loading admin panel:", error);
        alert('Error al cargar el panel de administrador');
    });
}

function showAllAppointments() {
    const appointmentsList = document.getElementById('allAppointmentsList');
    appointmentsList.innerHTML = '<h3>📋 Todas las Citas</h3>';

    return firebase.firestore().collection('appointments')
        .orderBy('date', 'asc')
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                appointmentsList.innerHTML += '<p>No hay citas programadas</p>';
                return;
            }

            querySnapshot.forEach((doc) => {
                const appointment = doc.data();
                appointmentsList.innerHTML += `
                    <div class="appointment-card">
                        <p><strong>Cliente:</strong> ${appointment.username}</p>
                        <p><strong>Servicio:</strong> ${appointment.service}</p>
                        <p><strong>Fecha:</strong> ${appointment.date}</p>
                        <p><strong>Hora:</strong> ${appointment.time}</p>
                        <img src="${appointment.paymentProofUrl}" class="preview-image" alt="Comprobante">
                        <button onclick="deleteAppointment('${doc.id}')" class="delete-btn">
                            Cancelar Cita
                        </button>
                    </div>
                `;
            });
        });
}

function deleteAppointment(appointmentId) {
    if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
        return;
    }

    firebase.firestore().collection('appointments').doc(appointmentId).delete()
        .then(() => {
            alert('Cita cancelada exitosamente');
            showAllAppointments();
        })
        .catch((error) => {
            console.error("Error:", error);
            alert('Error al cancelar la cita');
        });
}

function toggleBlockedDay() {
    const date = document.getElementById('adminDate').value;
    if (!date) {
        alert('Por favor selecciona una fecha');
        return;
    }

    const blockedDaysRef = firebase.firestore().collection('blockedDays').doc('days');
    
    blockedDaysRef.get()
        .then((doc) => {
            let blockedDays = doc.exists ? doc.data().days : [];
            
            if (blockedDays.includes(date)) {
                blockedDays = blockedDays.filter(d => d !== date);
            } else {
                blockedDays.push(date);
            }

            return blockedDaysRef.set({ days: blockedDays });
        })
        .then(() => {
            loadBlockedDays();
            alert('Día actualizado exitosamente');
        })
        .catch((error) => {
            console.error("Error:", error);
            alert('Error al actualizar el día');
        });
}

function loadBlockedDays() {
    return firebase.firestore().collection('blockedDays').doc('days').get()
        .then((doc) => {
            blockedDays = doc.exists ? doc.data().days : [];
            
            const list = document.getElementById('blockedDaysList');
            list.innerHTML = '<h4>Días Bloqueados:</h4>';

            if (blockedDays.length === 0) {
                list.innerHTML += '<p>No hay días bloqueados</p>';
                return;
            }

            blockedDays.forEach(day => {
                list.innerHTML += `
                    <div class="blocked-day">
                        <span>${day}</span>
                        <button onclick="removeBlockedDay('${day}')" class="delete-btn">
                            Eliminar
                        </button>
                    </div>
                `;
            });
        });
}

function removeBlockedDay(day) {
    const blockedDaysRef = firebase.firestore().collection('blockedDays').doc('days');
    
    blockedDaysRef.get()
        .then((doc) => {
            let blockedDays = doc.exists ? doc.data().days : [];
            blockedDays = blockedDays.filter(d => d !== day);
            return blockedDaysRef.set({ days: blockedDays });
        })
        .then(() => {
            loadBlockedDays();
            alert('Día desbloqueado exitosamente');
        })
        .catch((error) => {
            console.error("Error:", error);
            alert('Error al desbloquear el día');
        });
}

function loadAdminTimeSlots() {
    const date = document.getElementById('adminTimeDate').value;
    if (!date) return;

    const timeSlotsDiv = document.getElementById('adminTimeSlots');
    timeSlotsDiv.innerHTML = '';

    const timeSlots = [
        '9:00', '9:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '16:00', '16:30', '17:00', '17:30',
        '18:00', '18:30'
    ];

    firebase.firestore().collection('blockedTimes').doc(date).get()
        .then((doc) => {
            const blockedTimes = doc.exists ? doc.data().times : [];

            timeSlots.forEach(time => {
                const slot = document.createElement('div');
                slot.className = 'time-slot';
                slot.textContent = time;

                if (blockedTimes.includes(time)) {
                    slot.classList.add('blocked');
                } else {
                    slot.classList.add('available');
                }

                slot.onclick = () => toggleTimeSlot(date, time, slot);
                timeSlotsDiv.appendChild(slot);
            });
        })
        .catch((error) => {
            console.error("Error:", error);
            alert('Error al cargar los horarios');
        });
}

function toggleTimeSlot(date, time, element) {
    const blockedTimesRef = firebase.firestore().collection('blockedTimes').doc(date);
    
    blockedTimesRef.get()
        .then((doc) => {
            let blockedTimes = doc.exists ? doc.data().times : [];
            
            if (blockedTimes.includes(time)) {
                blockedTimes = blockedTimes.filter(t => t !== time);
                element.classList.remove('blocked');
                element.classList.add('available');
            } else {
                blockedTimes.push(time);
                element.classList.remove('available');
                element.classList.add('blocked');
            }

            return blockedTimesRef.set({ times: blockedTimes });
        })
        .catch((error) => {
            console.error("Error:", error);
            alert('Error al actualizar el horario');
        });
}

// Event Listeners
document.getElementById('adminTimeDate')?.addEventListener('change', loadAdminTimeSlots);
