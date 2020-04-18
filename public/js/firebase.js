function firebaseconfig(){
    var firebaseConfig = {
        apiKey: "AIzaSyDESlho9GRNb0Zw4ILaae-gyND9oWZ7G5I",
        authDomain: "gasoducto-386db.firebaseapp.com",
        databaseURL: "https://gasoducto-386db.firebaseio.com",
        projectId: "gasoducto-386db",
        storageBucket: "gasoducto-386db.appspot.com",
        messagingSenderId: "260996596783",
        appId: "1:260996596783:web:78865a4ac637aaaa3672da"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
}

//document.getElementById("login-btn").addEventListener("click",login)
function login(){
    email=document.getElementById('email').value
    password=document.getElementById('password').value
    console.log(email)
    firebase.auth().signInWithEmailAndPassword(email, password).then(function (val) {
        window.location.href=('../operators.html')
        }, function (reason) {
            alert('Credenciales incorrectas')
    });
}

function unlogged(){
    var user = firebase.auth().currentUser;
    console.log(user)
    if (!user) {
        window.location.href=('index.html')
    }
}

function createCompany(){
    // Get a reference to the database service
    var email=document.getElementById('email').value
    var password=document.getElementById('password').value
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function (val) {
            alert('Usuario creado correctamente')
            var database = firebase.firestore();
            var company=firebase.auth().currentUser
            database.collection('Companies').add({
                id: company.uid,
                email: company.email,
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                typeDoc: document.getElementById('typeDoc').value,
                docNumber: document.getElementById('docNum').value,
                enterpriseName: document.getElementById('enterprise').value
            })
                .then(function (docRef) {
                    
                    console.log("Document written with ID: ", docRef.id);
                    window.location.href = "index.html";
                })
                .catch(function(err){
                    console.log(err)
                });  
        }, function (reason) {
            console.log(reason)
            alert('Registro fallido')
    });
}

function recoverPassword(){
    var email = document.getElementById('email').value
    var auth = firebase.auth()
    auth.sendPasswordResetEmail(email)
    .then( function() {
        console.log('Email sent')
    }).catch(function (e) {
        console.log(e)
    });
}