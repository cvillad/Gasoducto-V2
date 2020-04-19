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
    document.querySelector(".card-body").innerHTML = "";
    const db = firebase.firestore();
    db.collection("Employees").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            var row = document.createElement("div")
            row.classList.add("row")
            row.innerHTML=`<div class="col">${doc.data().name}</div>
            <div class="col text-right"><button onclick=editEmployee("${doc.id}") type="button" class="btn btn-primary edit-btn" data-toggle="modal" data-target="#create-user-modal">
            Editar
            </button><button onclick=deleteEmployee("${doc.id}") type="button" class="btn btn-danger delete-btn">
            </button></div>`
            
            document.querySelector(".card-body").appendChild(row)
        });
    });
}

function addEmployee(){
        // Get a reference to the database service
    const database = firebase.firestore();
    database.collection('Employees').add({
        email: document.querySelector('#email').value,
        name: document.querySelector('#name').value,
        password: document.querySelector('#password').value,
        company: firebase.auth().currentUser.uid,
        state: true
    }).then(function(val){
        writeEmployees()
    })
    .catch(function(err){
        console.log(err)
    }); 
    document.querySelector(".accept-btn").removeEventListener("click",addEmployee)
}

function createEmployee(){
    document.querySelector("#password").value=""
    document.querySelector("#email").value=""
    document.querySelector("#name").value=""
    document.querySelector("#address").value=""
    document.querySelector("#inputActive").checked=""
    document.querySelector("#modal-title").innerHTML="Crear empleado"
    document.querySelector(".accept-btn").addEventListener("click",addEmployee)
}

function updateEmployee(userid){
    const db = firebase.firestore()
    console.log("careverga" +userid)
    db.collection("Employees").doc(userid).update({
        email: document.querySelector('#email').value,
        name: document.querySelector('#name').value,
        password: document.querySelector('#password').value,
        state: document.querySelector("#inputActive").checked
    })
    console.log("careverga" +userid)
    document.querySelector(".accept-btn").removeEventListener("click",updateEmployee)
    writeEmployees()
}

function editEmployee(userid){
    document.querySelector(".accept-btn").addEventListener("click",updateEmployee.bind(null,userid))
    document.querySelector("#modal-title").innerHTML="Editar empleado"
    const db = firebase.firestore()
    var docRef = db.collection("Employees").doc(userid)
    docRef.get().then( (doc)=>{
        if (doc.exists) {
            document.querySelector("#password").value=doc.data().password
            document.querySelector("#email").value=doc.data().email
            document.querySelector("#name").value=doc.data().name
            document.querySelector("#address").value=doc.data().address
            document.querySelector("#inputActive").checked=doc.data().state
        }else {
            console.log("No such document!");
        }
    }).catch((error)=> {
        console.log("Error getting document:", error);
    })

}

function deleteEmployee(userid){
    const db=firebase.firestore()
    db.collection("Employees").doc(userid).delete().then(()=>{
        console.log("Document successfully deleted!");
    }).then(()=>writeEmployees())
    .catch((error)=> {
        console.error("Error removing document: ", error);
    })
    
}