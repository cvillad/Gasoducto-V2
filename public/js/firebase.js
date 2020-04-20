

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


function createQuestionObject(question){
    if (document.getElementById(`radios${question}o1`).checked){
        correct = document.getElementById(`radios${question}o1`).value
    } else if (document.getElementById(`radios${question}o2`).checked){
        correct = document.getElementById(`radios${question}o2`).value
    } else {
        correct = document.getElementById(`radios${question}o3`).value
    }
    let temp = {
      description: document.getElementById(`question${question}Desc`).value,
      option1: document.getElementById(`q${question}o1`).value,
      option2: document.getElementById(`q${question}o2`).value,
      option3: document.getElementById(`q${question}o3`).value,
      weight: document.getElementById(`weight${question}`).value,
      correct: correct
    }
    return temp
  }
  

  function createTest(){
    const db = firebase.firestore()
    const company = firebase.auth().currentUser
    db.collection('Tests').add({
      companyId: company.uid,
      testName: document.getElementById("testName").value,
      question1: createQuestionObject(1),
      question2: createQuestionObject(2),
      question3: createQuestionObject(3),
      question4: createQuestionObject(4),
      question5: createQuestionObject(5)
    }).catch(function(err) {
        alert("No se pudo crear la prueba, revise todos los campos")
        console.log(err)
    })
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

function getEnterprise(){
    const user = firebase.auth().currentUser
    const db = firebase.firestore()
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            db.collection("Companies").where("id", "==", user.uid).get()
            .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                console.log(user.uid, " => ", doc.data().id);
                if(user.uid==doc.data().id){
                    name = doc.data().name
                    console.log(name)

                }
            });
        }).catch( (err) => {
            console.log("Error getting doc")
        })
         console.log(name);
          console.log(user.uid)
          return name
        } else {
          // User not logged in or has just logged out.
        }
    });
}

function getTests(){
    const db = firebase.firestore()
    const company = "2OCZqqf4SseTUtN06Uh9GIDfBSg2"
    db.collection("Tests").where("companyId","==",company).get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            testListTemplate(doc)
        })
    })

}

function testListTemplate(doc){
    var div = document.createElement("div")
    div.classList.add("card")
    div.innerHTML=`
            <div class="card-body justify-content-between shown-tests">
                <p>${doc.data().testName}</p>
                <button class="btn btn-outline-primary my-2 my-sm-0" onclick=openTest("${doc.id}")>Realizar</button>
            </div>`
    document.getElementById("tests-card").appendChild(div)
}

function openTest(docID){
   window.location.href=(`test.html?id=${docID}`)
}

function showTest(){
   url = window.location.href
   params = url.split('?')[1]
   id = params.split('=')[1]
   console.log(id)
   const db = firebase.firestore()
   db.collection("Tests").doc(id).get().then(function(doc) {
        if (doc.exists){
            addToDocument(1,doc)
            addToDocument(2,doc)
            addToDocument(3,doc)
            addToDocument(4,doc)
            addToDocument(5,doc)
            let button = document.createElement("div")
            button.classList.add("row")
            button.classList.add("row-padding")
            button.innerHTML=`<a href="results.html" type="button" class="btn btn-primary" onclick=sendTest(${doc.id})>Enviar</a>`
            document.getElementById("test-body").appendChild(button)

        }else{
            console.log("doc does not exist")
        }
   })
}

function addToDocument(number,doc){
    document.getElementById("test-body").appendChild(testTemplate(number,doc))
    document.getElementById("test-body").appendChild(createHr())
}

function createHr(){
    let hr = document.createElement("hr")
    return hr
}

function checkURL(){
    console.log(document.location.href)
}

function testTemplate(number,doc){
    let div = document.createElement("div")
    let temp = `doc.data().question${number}`
    div.classList.add("row")
    div.classList.add("row-padding")
    div.innerHTML=`
    <div class="block">
        <h3>Pregunta ${number}</h3>
        <article>${eval(temp).description}</article>
    </div>
    <div class="form-check form-check-inline radio-padding">
        <input class="form-check-input" type="radio" name="radios${number}" id="radios${number}o1" value="option1">
        <label class="form-check-label" for="inlineRadio1">${eval(temp).option1}</label>
    </div>
    <div class="form-check form-check-inline radio-padding">
        <input class="form-check-input" type="radio" name="radios${number}" id="radios${number}o2" value="option2">
        <label class="form-check-label" for="inlineRadio2">${eval(temp).option2}</label>
    </div>
    <div class="form-check form-check-inline radio-padding">
        <input class="form-check-input" type="radio" name="radios${number}" id="radios${number}o3" value="option3">
        <label class="form-check-label" for="inlineRadio3">${eval(temp).option3}</label>
    </div>`
    
    return div
}