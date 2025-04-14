// Manejo de citas
const appointments = JSON.parse(localStorage.getItem('appointments')) || [];

function createAppointment(data) {
    const appointment = {
        id: Date.now(),
        service: data.service,
        date: data.date,
        time: data.time,
        clientName: data.fullName,
        paymentProof: data.paymentProof,
        userId: JSON.parse(localStorage.getItem('currentUser')).name
    };

    appointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    return true;
}

function getAvailableHours(date) {
    const hours = [];
    const bookedHours = appointments
        .filter(app => app.date === date)
        .map(app => app.time);

    for (let i = 8; i <= 20; i++) {
        if (i !== 12) { // Excluir hora de almuerzo
            const hour = `${i}:00`;
            const halfHour = `${i}:30`;
            
            if (!bookedHours.includes(hour)) hours.push(hour);
            if (!bookedHours.includes(halfHour)) hours.push(halfHour);
        }
    }

    return hours;
}