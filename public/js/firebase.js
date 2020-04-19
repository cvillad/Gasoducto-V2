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
    firebase.auth().signInWithEmailAndPassword(email, password).then((val)=> {
        window.location.href=('./admin.html')
        }, function (reason) {
            alert('Credenciales incorrectas')
    })
}

function unlogged(){
    firebase.auth().onAuthStateChanged(function currentCompany(user) {
        if (user) {
          // User is signed in.
        } else {
          window.location.href=("./index.html")
        }
        return user
    });
}

function createCompany(){
    // Get a reference to the database service
    var email=document.getElementById('email').value
    var password=document.getElementById('password').value
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(()=> {
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
        }, (reason)=> {
            console.log(reason)
            alert('Registro fallido')
    }).then(()=>window.location.href=("./admin.html"))
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
    db.collection("Employees").onSnapshot((querySnapshot)=> {
        document.querySelector(".card-body").innerHTML = "";
        querySnapshot.forEach((doc)=> {
            console.log(doc.id, " => ", doc.data().company);
            console.log(firebase.auth().currentUser.uid==doc.data().company)
            if(firebase.auth().currentUser.uid==doc.data().company){
                const row = document.createElement("div")
                row.classList.add("row")
                row.innerHTML=`<div class="col">${doc.data().name}</div>
                <div class="col text-right"><button onclick=updateEmployee("${doc.id}") type="button" class="btn btn-primary edit-btn" data-toggle="modal" data-target="#create-user-modal">
                Editar
                </button><button onclick=deleteEmployee("${doc.id}") type="button" class="btn btn-danger delete-btn">
                </button></div>`
                document.querySelector(".card-body").appendChild(row)
            }
        })
    })
}

function addEmployee(){
        // Get a reference to the database service
    const database = firebase.firestore();
    database.collection('Employees').add({
        email: document.querySelector('#email').value,
        address: document.querySelector("#address").value,
        name: document.querySelector('#name').value,
        password: document.querySelector('#password').value,
        company: firebase.auth().currentUser.uid,
        state: true
    }) .catch((err)=>{
        console.log(err)
    }).finally(()=>document.querySelector(".accept-btn").removeEventListener("click",addEmployee)) 
    
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

async function getEmployee(id){
    const db = firebase.firestore()
    const docRef = db.collection("Employees").doc(id)
    const employee = await docRef.get()
    console.log("careverga  "+employee.data().name)
    return employee.data()
}

function edit(evt){
    const db=firebase.firestore()
    console.log(evt.currentTarget.ui)
    db.collection("Employees").doc(evt.currentTarget.ui).update({
        email: document.querySelector('#email').value,
        name: document.querySelector('#name').value,
        address: document.querySelector("#address").value,
        password: document.querySelector('#password').value,
        state: document.querySelector("#inputActive").checked
    })
    .catch((err)=>console.log("catch: "+ err))
    .finally(()=>document.querySelector(".accept-btn").removeEventListener("click",edit))
}

function updateEmployee(id){
    document.querySelector("#modal-title").innerHTML="Editar empleado"
    document.querySelector(".accept-btn").addEventListener("click",edit)
    document.querySelector(".accept-btn").ui=id
    const db = firebase.firestore()
    getEmployee(id).then((employee)=>{
        console.log("caremonda: "+employee)
        document.querySelector("#password").value=employee.password
        document.querySelector("#email").value=employee.email
        document.querySelector("#name").value=employee.name
        document.querySelector("#address").value=employee.address
        document.querySelector("#inputActive").checked=employee.state
    }).catch((err)=>console.log("edit error: "+err))
}

function deleteEmployee(userid){
    const db=firebase.firestore()
    db.collection("Employees").doc(userid).delete().then(()=>{
        console.log("Document successfully deleted!");
    })
    .catch((error)=> {
        console.error("Error removing document: ", error);
    })
    
}