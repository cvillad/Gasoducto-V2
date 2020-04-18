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
        window.location.href=('./operators.html')
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
                docNumber: document.getElementById('docNum').value
            }).catch(function(err){
                console.log(err)
            });  
        }, function (reason) {
            console.log(reason)
            alert('Registro fallido')
    });
}


function createEmployee(){
    // Get a reference to the database service
    
    const database = firebase.firestore();
    database.collection('Employees').add({
        email: document.getElementById('email').value,
        name: document.getElementById('name').value,
        password: document.getElementById('password').value,
        company: firebase.currentUser().uid
    }).then(function(val){
        document.querySelector(".card-body").innerHTML = "";
        getEmployees()
    })
    .catch(function(err){
        console.log(err)
    });  
}

function createEmployee(){
    // Get a reference to the database service
   
    const database = firebase.firestore();
    database.collection('Employees').add({
        email: document.getElementById('email').value,
        name: document.getElementById('name').value,
        password: document.getElementById('password').value,
    }).then(function(val){
        document.querySelector(".card-body").innerHTML = "";
        getEmployees()
    })
    .catch(function(err){
        console.log(err)
    });  

    var washingtonRef = db.collection("cities").doc("DC");
// Atomically add a new region to the "regions" array field.
washingtonRef.update({
    regions: firebase.firestore.FieldValue.arrayUnion("greater_virginia")
});
// Atomically remove a region from the "regions" array field.
washingtonRef.update({
    regions: firebase.firestore.FieldValue.arrayRemove("east_coast")
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

function writeEmployees(){
    const db = firebase.firestore();
    db.collection("Employees").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            var row = document.createElement("div")
            row.classList.add("row")
            row.innerHTML=`<div class="col">${doc.data().name}</div>
            <div class="col text-right"><button onclick=getEmployee(${doc.id}) type="button" class="btn btn-primary" data-toggle="modal" data-target="#edit-user-modal">
            Editar
            </button></div>`
            document.querySelector(".card-body").appendChild(row)
        });
    });
}

function getEmployee(id){
    const db = firebase.firestore();
    var docRef = db.collection("cities").doc(id);
    docRef.get().then(function(doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data());
        } else {
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}