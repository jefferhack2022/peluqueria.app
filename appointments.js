function showAppointments() {
    const username = sessionStorage.getItem('currentUser');
    
    firebase.firestore().collection('appointments')
        .where('username', '==', username)
        .orderBy('date', 'asc')
        .get()
        .then((querySnapshot) => {
            const appointmentsList = document.getElementById('appointmentsList');
            appointmentsList.innerHTML = '<h3>📋 Mis Citas</h3>';

            if (querySnapshot.empty) {
                appointmentsList.innerHTML += '<p>No tienes citas agendadas</p>';
                return;
            }

            querySnapshot.forEach((doc) => {
                const appointment = doc.data();
                appointmentsList.innerHTML += `
                    <div class="appointment-card">
                        <p><strong>Servicio:</strong> ${appointment.service}</p>
                        <p><strong>Fecha:</strong> ${appointment.date}</p>
                        <p><strong>Hora:</strong> ${appointment.time}</p>
                        <img src="${appointment.paymentProofUrl}" class="preview-image" alt="Comprobante">
                    </div>
                `;
            });
        })
        .catch((error) => {
            console.error("Error:", error);
            alert('Error al cargar las citas');
        });
}

function makeAppointment() {
    const service = document.getElementById('service').value;
    const date = document.getElementById('date').value;
    const paymentFile = document.getElementById('payment').files[0];

    if(!date || !selectedTime || !paymentFile) {
        alert('Por favor completa todos los campos y sube el comprobante de pago');
        return;
    }

    const storageRef = firebase.storage().ref(`comprobantes/${firebase.auth().currentUser.uid}/${Date.now()}_${paymentFile.name}`);
    
    storageRef.put(paymentFile)
        .then(snapshot => snapshot.ref.getDownloadURL())
        .then(downloadURL => {
            return firebase.firestore().collection('appointments').add({
                userId: firebase.auth().currentUser.uid,
                username: sessionStorage.getItem('currentUser'),
                service: service,
                date: date,
                time: selectedTime,
                paymentProofUrl: downloadURL,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            alert('Cita agendada con éxito');
            document.getElementById('payment').value = '';
            document.getElementById('preview').classList.add('hidden');
            selectedTime = null;
            showAppointments();
            loadTimeSlots(date);
        })
        .catch((error) => {
            console.error("Error:", error);
            alert('Error al agendar la cita');
        });
}
