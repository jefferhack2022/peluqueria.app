// auth.js
function handleAuth() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if(!username || !password) {
        alert('Por favor completa todos los campos');
        return;
    }

    // Asegúrate de que el email tenga el formato correcto
    const email = `${username.toLowerCase()}@barberia-app.com`;

    console.log('Intentando autenticar:', email); // Log para debugging

    if(username.toLowerCase() === 'admin' && password === 'admin123') {
        console.log('Intentando login como admin');
        
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('Admin login exitoso:', userCredential.user.uid);
                return firebase.firestore().collection('users').doc(userCredential.user.uid).set({
                    username: 'admin',
                    role: 'admin',
                    email: email
                }, { merge: true });
            })
            .then(() => {
                loginAdmin();
            })
            .catch((error) => {
                console.log('Error en login admin:', error.code);
                
                if(error.code === 'auth/user-not-found') {
                    console.log('Creando cuenta de admin');
                    
                    return firebase.auth().createUserWithEmailAndPassword(email, password)
                        .then((userCredential) => {
                            console.log('Admin creado:', userCredential.user.uid);
                            return firebase.firestore().collection('users').doc(userCredential.user.uid).set({
                                username: 'admin',
                                role: 'admin',
                                email: email,
                                createdAt: firebase.firestore.FieldValue.serverTimestamp()
                            });
                        })
                        .then(() => {
                            loginAdmin();
                        });
                }
                console.error('Error en autenticación admin:', error);
                alert(error.message);
            });
        return;
    }

    console.log('Intentando login como usuario normal');

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('Usuario login exitoso:', userCredential.user.uid);
            return firebase.firestore().collection('users').doc(userCredential.user.uid).set({
                username: username,
                role: 'user',
                email: email
            }, { merge: true });
        })
        .then(() => {
            loginUser(username);
        })
        .catch((error) => {
            console.log('Error en login usuario:', error.code);
            
            if(error.code === 'auth/user-not-found') {
                console.log('Creando nueva cuenta de usuario');
                
                return firebase.auth().createUserWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        console.log('Usuario creado:', userCredential.user.uid);
                        return firebase.firestore().collection('users').doc(userCredential.user.uid).set({
                            username: username,
                            role: 'user',
                            email: email,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    })
                    .then(() => {
                        loginUser(username);
                    });
            }
            console.error('Error en autenticación usuario:', error);
            alert(error.message);
        });
}

function loginUser(username) {
    console.log('Login usuario:', username);
    sessionStorage.setItem('currentUser', username);
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('mainSection').classList.remove('hidden');
    document.getElementById('userWelcome').textContent = username;
    showAppointments();
}

function loginAdmin() {
    console.log('Login admin');
    sessionStorage.setItem('currentUser', 'admin');
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('adminSection').classList.remove('hidden');
    loadAdminPanel();
}

function logout() {
    console.log('Cerrando sesión');
    firebase.auth().signOut()
        .then(() => {
            console.log('Sesión cerrada exitosamente');
            sessionStorage.removeItem('currentUser');
            document.getElementById('mainSection').classList.add('hidden');
            document.getElementById('adminSection').classList.add('hidden');
            document.getElementById('authSection').classList.remove('hidden');
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        })
        .catch((error) => {
            console.error('Error en logout:', error);
            alert('Error al cerrar sesión: ' + error.message);
        });
}

// Verificar estado de autenticación
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log('Usuario autenticado:', user.uid);
        firebase.firestore().collection('users').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    console.log('Datos de usuario:', doc.data());
                    if (doc.data().role === 'admin') {
                        loginAdmin();
                    } else {
                        loginUser(doc.data().username);
                    }
                } else {
                    console.log('No se encontraron datos del usuario');
                    logout();
                }
            })
            .catch((error) => {
                console.error('Error obteniendo datos del usuario:', error);
                logout();
            });
    } else {
        console.log('No hay usuario autenticado');
    }
});
