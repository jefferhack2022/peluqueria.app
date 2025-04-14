// Inicialización de localStorage
if (!localStorage.getItem('usersArray')) {
    localStorage.setItem('usersArray', '[]');
}

// Función de autenticación principal
function handleAuth() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if(!username || !password) {
        alert('Por favor completa todos los campos');
        return;
    }

    // Verificar si es admin
    if(username === 'admin' && password === 'admin123') {
        loginAdmin();
        return;
    }

    let usersArray = JSON.parse(localStorage.getItem('usersArray'));
    let userFound = false;
    let isValidUser = false;

    for(let i = 0; i < usersArray.length; i++) {
        if(usersArray[i].username === username) {
            userFound = true;
            if(usersArray[i].password === password) {
                isValidUser = true;
            }
            break;
        }
    }

    if(userFound && !isValidUser) {
        alert('Contraseña incorrecta');
        return;
    }

    if(!userFound) {
        usersArray.push({
            username: username,
            password: password
        });
        localStorage.setItem('usersArray', JSON.stringify(usersArray));
        alert('Usuario registrado exitosamente');
    }

    loginUser(username);
}

// Login de usuario normal
function loginUser(username) {
    localStorage.setItem('currentUser', username);
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('mainSection').classList.remove('hidden');
    document.getElementById('userWelcome').textContent = username;
    showAppointments();
}

// Login de administrador
function loginAdmin() {
    localStorage.setItem('currentUser', 'admin');
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('adminSection').classList.remove('hidden');
    loadAdminPanel();
}

// Función de cierre de sesión
function logout() {
    localStorage.removeItem('currentUser');
    document.getElementById('mainSection').classList.add('hidden');
    document.getElementById('adminSection').classList.add('hidden');
    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}