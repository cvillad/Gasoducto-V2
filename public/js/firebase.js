

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

var current
//document.getElementById("login-btn").addEventListener("click",login)
function login(){
    email=document.getElementById('email').value
    password=document.getElementById('password').value
    firebase.auth().signInWithEmailAndPassword(email, password).then(()=> {
        current=window.location.search.split("==")[1]
        window.location.href=('./admin.html?employeeid'+current)
        }, function authUser() {
            const db=firebase.firestore()
            db.collection("Employees").where("email", "==", email).where("password","==",password)
            .where("state","==",true).get().then((querySnapshot)=> {
                querySnapshot.forEach((doc) =>{
                    currentEmployee=doc
                    console.log(currentEmployee+", "+doc.id)
                    window.location.href=("./operators.html?employeeid=="+doc.id)
                })
            }).catch(function(error) {
                console.log("Credenciales incorrectas: ", error);
            })
    })
}

function unlogged(){
    firebase.auth().onAuthStateChanged((user)=> {
        if (!user && !window.location.search) {
            window.location.href=("./index.html")
        }
    })
}

var image
function loadImage(event){
    image=event.target.files[0]
}

function createCompany(){
    // Get a reference to the database service
    event.preventDefault()
    var email=document.getElementById('email').value
    var password=document.getElementById('password').value
    if (validateEmail(email)){
        firebase.auth().createUserWithEmailAndPassword(email, password).then(()=> {
            alert('Usuario creado correctamente')
            const database = firebase.firestore();
            const company=firebase.auth().currentUser
            const ref=firebase.storage().ref("images/"+company.uid)
            ref.put(image)
            database.collection('Companies').add({
                id: company.uid,
                email: company.email,
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                docNumber: document.getElementById('docNum').value
            }).then(()=>window.location.href="./admin.html?employeeid"+current)
            .catch((err)=>console.log(err))
        }, (reason)=> {
            console.log(reason)
            alert('Registro fallido')
        })
    }
}

async function getCurrentUser(){
    uid=window.location.search.split("==")[1]
    console.log(uid)
    if(uid){
        const db=firebase.firestore()
        try{
            return await db.collection("Employees").doc(uid).get()
        }catch(err){
            console.log(err)
        }
       
    }
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
            if(firebase.auth().currentUser.uid==doc.data().company){
                console.log(doc.id)
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
    const database = firebase.firestore();
    email=document.querySelector('#email').value
    if(validateEmail(email)){
        database.collection('Employees').add({
            email: document.querySelector('#email').value,
            address: document.querySelector("#address").value,
            name: document.querySelector('#name').value,
            password: document.querySelector('#password').value,
            company: firebase.auth().currentUser.uid,
            state: true
        }).then((doc)=> {
            const ref=firebase.storage().ref("images/employees/"+doc.id)
            ref.put(image)
            cleanFormUser()
        })
        .catch((err)=>{
            console.log(err)
        }).finally(()=>document.querySelector(".accept-btn").removeEventListener("click",addEmployee)) 
    }
}

function cleanFormUser(){
    document.querySelector("#password").value=""
    document.querySelector("#email").value=""
    document.querySelector("#name").value=""
    document.querySelector("#address").value=""
}

function createEmployee(){
    document.querySelector("#modal-title").innerHTML="Crear empleado"
    document.querySelector(".accept-btn").addEventListener("click",addEmployee)
}

async function getEmployee(id){
    const db = firebase.firestore()
    const docRef = db.collection("Employees").doc(id)
    const employee = await docRef.get()
    return employee.data()
}

function edit(evt){
    const db=firebase.firestore()
    id=evt.currentTarget.ui
    db.collection("Employees").doc(id).update({
        email: document.querySelector('#email').value,
        name: document.querySelector('#name').value,
        address: document.querySelector("#address").value,
        password: document.querySelector('#password').value,
        state: document.querySelector("#inputActive").checked
    }).then(()=>{
        console.log("el ney: "+id)
        const ref=firebase.storage().ref("images/employees/"+id)
        ref.put(image)
        cleanFormUser()
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
        document.querySelector("#password").value=employee.password
        document.querySelector("#email").value=employee.email
        document.querySelector("#name").value=employee.name
        document.querySelector("#address").value=employee.address
        document.querySelector("#inputActive").checked=employee.state
        loadImageFromDB(id)
    }).catch((err)=>console.log("edit error: "+err))
}

function loadImageFromDB(id){
    firebase.storage().ref().child('images/employees/'+id).getDownloadURL().then(function(url) {
        // `url` is the download URL for 'images/stars.jpg'

        // Or inserted into an <img> element:
    var img = document.getElementById('op-img');
    img.src = url; 
    }).catch(function(error) {
    // Handle any errors
    });
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

function validateEmail(mail) 
{
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(document.querySelector("#email").value)){
    return (true)
  }
    alert("You have entered an invalid email address!")
    return (false)
}