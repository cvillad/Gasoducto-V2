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
function login(){
    email=document.getElementById('email').value
    password=document.getElementById('password').value
    firebase.auth().signInWithEmailAndPassword(email, password).then(()=> {
        current=window.location.search.split("==")[1]
        window.location.href=('./admin.html')
        }, function authUser() {
            const db=firebase.firestore()
            db.collection("Employees").where("email", "==", email).get().then((querySnapshot)=> {
                querySnapshot.forEach((doc) =>{
                    if(doc.data().password!=password){
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'Contraseña incorrecta',
                        })
                    }else if(!doc.data().state){
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'Ha sido bloqueado por el administrador',
                        })
                    }else window.location.href=("./employeeHome.html?employeeid=="+doc.id)
                })
            }).then(()=>{
                if(!doc){
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Credenciales incorrectas',
                    })
                }
            }).catch(function(error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Credenciales incorrectas',
                  })
            })
    })
}

function logout(){
    firebase.auth().signOut().then(()=>window.location.href="./index.html")
    .catch(function(error) {
        window.location.href="./index.html"
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
                docType: document.querySelector("#typeDoc").value,
                docNumber: document.getElementById('docNum').value,
                enterpriseName: document.querySelector("#enterprise").value
            }).then(()=>window.location.href=("./admin.html"))
            .catch(()=>{
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Registro fallido',
                })
            })
        }, ()=> {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Registro fallido',
            })
        })
    }
}

async function getCurrentUser(){
    uid=window.location.search.split("==")[1]
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

async function writeEmployees(){
    const db = firebase.firestore();
    let numEmployees = 0;
    await db.collection("Employees").onSnapshot((querySnapshot)=> {
        document.querySelector(".card-body").innerHTML = "";
        querySnapshot.forEach((doc)=> {
            if(firebase.auth().currentUser.uid==doc.data().company){
                numEmployees = numEmployees + 1;
                const row = document.createElement("div")
                row.classList.add("card")
                row.innerHTML=`
                <div class="card-body justify-content-between shown-tests">
                    <p>${doc.data().name}</p>
                    <div>
                        <button class="btn btn-outline-primary my-2 my-sm-0" data-toggle="modal" data-target="#user-results-modal" onclick=showUserResults("${doc.id}")>Ver resultados</button>
                        <button class="btn btn-outline-primary my-2 my-sm-0" data-toggle="modal" data-target="#edit-user-modal" onclick=showEmployee("${doc.id}")>Editar</button>
                        <button onclick=deleteEmployee("${doc.id}") class="btn btn-outline-danger my-2 my-sm-0" type="button"  >
                        <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>`
                document.querySelector(".card-body").appendChild(row)
            }
        })
        console.log(numEmployees)
        document.getElementById("operators-title").innerHTML=`<h4 id="operators-title">Operadores (${numEmployees})</h4>`
    })
}

async function showUserResults(employeeId){
    const db = firebase.firestore();
    const employee = await db.collection("Employees").doc(employeeId).get().then(function(doc) {
        if (doc.exists){
            return doc
        }
    })
    let array = employee.data().tests
    let div = document.createElement("div")
    document.getElementById("results-modal-body").innerHTML=""
    if (array.length == 0){
        div.innerHTML=`
        <div class="card-body justify-content-between shown-tests">
            <h2>No hay resultados disponibles</h2>
        </div>`
    } else {
        let ul = document.createElement("ul")
        ul.classList.add("nav")
        ul.classList.add("nav-tabs")
        let tab_content = document.createElement("div")
        tab_content.classList.add("tab-content")
        let first = true
        array.forEach(function(entry){
            let li = document.createElement("li")
            li.classList.add("nav-item")

            let tab = document.createElement("div")
            tab.classList.add("tab-pane")
            if(first){
                li.innerHTML = `<a class="nav-link active" data-toggle="tab" href="#${entry.testId}">${entry.testName}</a>`
                tab.classList.add("active");
                first = false;
            }else{
                li.innerHTML = `<a class="nav-link" data-toggle="tab" href="#${entry.testId}">${entry.testName}</a>`
                tab.classList.add("fade");
            }
            ul.appendChild(li)
            tab.id = `${entry.testId}`
            tab_content.appendChild(tab)
        })
        document.getElementById("results-modal-body").appendChild(ul)
        document.getElementById("results-modal-body").appendChild(tab_content)
        array.forEach(function(entry) {
            draw(entry.acum,entry.testId)
            let button = document.createElement("div")
            button.innerHTML=`<button onclick=deleteResults("${employeeId}","${entry.testId}")>Borrar</button>`
            document.getElementById(entry.testId).appendChild(button)
        })
    }
}

async function showTestResults(testId){
    const db = firebase.firestore();
    const test = await db.collection("Tests").doc(testId).get().then(function(doc) {
        if (doc.exists){
            return doc
        }
    })
    let array = test.data().employees
    let div = document.createElement("div")
    document.getElementById("result-users-body").innerHTML=""
    if (array.length == 0){
        div.innerHTML=`
        <div class="card-body justify-content-between shown-tests">
            <h2>No hay resultados disponibles</h2>
        </div>`
    } else {
        let ul = document.createElement("ul")
        ul.classList.add("nav")
        ul.classList.add("nav-tabs")
        let tab_content = document.createElement("div")
        tab_content.classList.add("tab-content")
        let first = true
        array.forEach(function(entry){
            let li = document.createElement("li")
            li.classList.add("nav-item")

            let tab = document.createElement("div")
            tab.classList.add("tab-pane")
            if(first){
                li.innerHTML = `<a class="nav-link active" data-toggle="tab" href="#${entry.employeeId}">${entry.employeeName}</a>`
                tab.classList.add("active");
                first = false;
            }else{
                li.innerHTML = `<a class="nav-link" data-toggle="tab" href="#${entry.employeeId}">${entry.employeeName}</a>`
                tab.classList.add("fade")
            }
            ul.appendChild(li)
            tab.id = `${entry.employeeId}`
            tab_content.appendChild(tab)
        })
        document.getElementById("result-users-body").appendChild(ul)
        document.getElementById("result-users-body").appendChild(tab_content)
        array.forEach(function(entry){
            draw(entry.acum,entry.employeeId)
            let button = document.createElement("div")
            button.innerHTML=`<button onclick=deleteResults("${entry.employeeId}","${testId}")>Borrar</button>`
            document.getElementById(entry.employeeId).appendChild(button)
        })

    }
}

async function deleteResults(employeeId, testId){
    const db = firebase.firestore();
    const test = await db.collection("Tests").doc(testId).get().then(function(doc) {
        if (doc.exists){
            return doc
        }
    })
    const employee = await db.collection("Employees").doc(employeeId).get().then(function(doc) {
        if (doc.exists){
            return doc
        }
    })
    let array = test.data().employees
    let temp = []
    array.forEach(function(entry) {
        if (entry.employeeId != employeeId){
            temp.push(entry)
        }
    })
    db.collection("Tests").doc(testId).update({
        employees: temp 
    }).catch(()=>{{
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Falló al editar test',
        })
    }}).then(()=>{
        console.log("User results erased from test successfully")
    })
    array = employee.data().tests
    temp = []
    array.forEach(function(entry) {
        if (entry.testId != testId){
            temp.push(entry)
        }
    })
    db.collection("Employees").doc(employeeId).update({
        tests: temp 
    }).catch(()=>{{
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Falló al editar empleado',
        })
    }}).then(()=>{
        console.log("Tests results erased from user successfully")
    })

}


function draw(acum,divId) {
    var chart = new CanvasJS.Chart(divId, {
        animationEnabled: true,
        width:475,
        data: [{
            type: "pie",
            startAngle: 240,
            yValueFormatString: "#: 0 punto/s",
            indexLabel: "{label} {y}",
            dataPoints: [
                {y: acum, label: "Correcto"},
                {y: 5-acum, label: "Incorrecto"}
            ]
        }]
    });
    chart.render();
    
    }

var exist
async function emailExists(){
    const db=firebase.firestore()
    exist=false
    querySnapshot=await db.collection('Employees').where("email","==",email).get()
    querySnapshot.forEach(function(doc) {
        exist=true
    })
}

async function addEmployee(event){
    event.preventDefault()
    const db = firebase.firestore();
    email=document.querySelector('#email').value
    await emailExists()
    if(validateEmail(email) && !exist){
        db.collection('Employees').add({
            email: document.querySelector('#email').value,
            address: document.querySelector("#address").value,
            name: document.querySelector('#name').value,
            password: document.querySelector('#password').value,
            company: firebase.auth().currentUser.uid,
            state: true,
            tests: []
        }).catch((err)=>{
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Falló al crear empleado',
            })
        }).then((doc)=> {
            const ref=firebase.storage().ref("images/employees/"+doc.id)
            ref.put(image)
        }).finally(()=>$('#create-user-modal').modal('hide'))
    }else if(exist){
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Ya existe un empleado con esta dirección de correo electrónico',
        })
    }
}

function cleanFormUser(){
    document.querySelector("#password").value=""
    document.querySelector("#email").value=""
    document.querySelector("#name").value=""
    document.querySelector("#address").value=""
    document.querySelector("#image").value=""
}

async function getEmployee(id){
    const db = firebase.firestore()
    const docRef = db.collection("Employees").doc(id)
    const employee = await docRef.get()
    return employee.data()
}

async function editEmployee(event,id){
    event.preventDefault()
    email=document.querySelector('#edit-email').value
    await emailExists()
    if(validateEmail(email)){
        const db=firebase.firestore()
        db.collection("Employees").doc(id).update({
            email: email,
            name: document.querySelector('#edit-name').value,
            address: document.querySelector("#edit-address").value,
            password: document.querySelector('#edit-password').value,
            state: document.querySelector("#inputActive").checked
        }).catch(()=>{{
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Falló al editar empleado',
            })
        }}).then(()=>{
            firebase.storage().ref("images/employees/"+id).put(image)
        }).finally(()=>{$("#edit-user-modal").modal("hide")})
    }
}

function showEmployee(id){
    getEmployee(id).then((employee)=>{
        document.querySelector("#edit-password").value=employee.password
        document.querySelector("#edit-email").value=employee.email
        document.querySelector("#edit-name").value=employee.name
        document.querySelector("#edit-address").value=employee.address
        document.querySelector("#inputActive").checked=employee.state
        loadEmployeeImage(id)
        document.querySelector("#edit-form").onsubmit=function(){editEmployee(event,id)}
        document.querySelector(".edit-footer").innerHTML=`<button class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
        <button class="btn btn-primary" type=submit>Aceptar</button>`
    })
    
}

function loadEmployeeImage(id){
    try{
        const img = document.getElementById('op-img');
        firebase.storage().ref().child('images/employees/'+id).getDownloadURL().then(function(url) {
            img.style.display="block"
            img.src = url; 
        }).catch(function(error) {
            img.style.display="none"
            img.src=""
        })
    }catch(err){
    } 
}

async function loadProfileImage(id){
    storage=firebase.storage()
    if (!window.location.search[0]) {
        url=await storage.ref().child('images/'+id).getDownloadURL()
            
    }else{
        let split = document.location.search.split("?")[1];
        let employeeId = split.split("==")[1]
        url = await storage.ref().child('images/employees/'+employeeId).getDownloadURL()
    }
    const img = document.querySelector('.profile-img');
    img.src = url;
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
  

 async function createTest(){
    const db = firebase.firestore()
    const company = firebase.auth().currentUser
    await db.collection('Tests').add({
      companyId: company.uid,
      testName: document.getElementById("testName").value,
      question1: createQuestionObject(1),
      question2: createQuestionObject(2),
      question3: createQuestionObject(3),
      question4: createQuestionObject(4),
      question5: createQuestionObject(5),
      employees: []
    }).catch(function(err) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'No se pudo f la prueba, revise todos los campos',
        })

        console.log(err)
    })
    window.location.href = "./tests.html"
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

function validateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)){
        return true
    }else{
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: mail+' Dirección de correo inválida',
        })
        return false
    }
    
}

async function getCompanyName(){
    const db = firebase.firestore()
    //console.log(document.getElementById("navbar-title"))
    if(!document.location.search) {
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                const companyId = firebase.auth().currentUser.uid
                db.collection("Companies").where("id","==",companyId).get().then(function(querySnapshot){
                    querySnapshot.forEach(function(doc) {
                    if(doc.exists){
                        let div = document.createElement("div")
                        div.innerHTML = `<img class="profile-img">
                        <a class="navbar-brand">${doc.data().enterpriseName}</a>`
                        nav=document.getElementById("navbar-title")
                        nav.appendChild(div)
                        loadProfileImage(doc.data().id)
                      }
                    })
                })
              // User is signed in.
            }
        });
    }else{
        let split = document.location.search.split("?")[1];
        let id = split.split("==")[1];
        employee = await db.collection("Employees").doc(id).get().then(function(doc) {
            if(doc.exists){
                return doc
            }
        })
        await db.collection("Companies").where("id","==",employee.data().company).get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                if (doc.exists){
                    let div = document.createElement("div")
                        div.innerHTML = `<img class="profile-img">
                        <a class="navbar-brand">${doc.data().enterpriseName+" - "+employee.data().name}</a>`
                        nav=document.getElementById("navbar-title")
                        nav.appendChild(div)
                        loadProfileImage(employee.id)
                }
            })
        })
    }
}

async function getTests(){
    const db = firebase.firestore()
    const isEmployee = (document.location.search != "")
    if(isEmployee){
        let id = document.location.search.split("==")[1];
        let companyId = await db.collection("Employees").doc(id).get().then(function(doc) {
            if(doc.exists){
                return doc.data().company
            }
        })
        let companyName = await db.collection("Tests").where("companyId","==",companyId).get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                testListTemplate(doc,isEmployee)
            })
        })
    }else {
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                company = firebase.auth().currentUser.uid
                db.collection("Tests").where("companyId","==",company).onSnapshot((querySnapshot) => {
                    document.getElementById("tests-card").innerHTML=""
                    querySnapshot.forEach(function(doc) {
                        testListTemplate(doc, isEmployee)
                    })
                })
            }
        })
    }
}

function testListTemplate(doc, isEmployee){
    var div = document.createElement("div")
    div.classList.add("card")
    let employeeId = document.location.search.split("==")[1];
    if(isEmployee){
        console.log(doc.id)
        div.innerHTML=`
        <div class="card-body justify-content-between shown-tests">
            <p>${doc.data().testName}</p>
            <button class="btn btn-outline-primary my-2 my-sm-0" onclick=openTest("${doc.id}","${employeeId}")>Realizar</button>
        </div>`
    }else{
        div.innerHTML=`
        <div class="card-body justify-content-between shown-tests">
            <p>${doc.data().testName}</p>
            <div>
                <button class="btn btn-outline-primary my-2 my-sm-0" data-toggle="modal" data-target="#result-users-modal" onclick=showTestResults("${doc.id}")>Resultados</button>
                <button class="btn btn-outline-danger my-2 my-sm-0" onclick=deleteTest("${doc.id}")><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>`
    }
    document.getElementById("tests-card").appendChild(div)
}


function deleteTest(docID){
    const db = firebase.firestore();
    db.collection("Tests").doc(docID).delete().then(()=>{
        console.log("Test successfully deleted!");
    })
    .catch((error)=> {
        console.error("Error removing document: ", error);
    })
}

function openTest(docID, employeeId){
   window.location.href=(`test.html?employeeid==${employeeId}?id==${docID}`)
}

function showTest(){
   employeeId = window.location.href.split('?')[1].split('==')[1]
   testId = window.location.href.split('?')[2].split('==')[1]
   const db = firebase.firestore()
   db.collection("Tests").doc(testId).get().then(function(doc) {
        if (doc.exists){
            addToDocument(1,doc)
            addToDocument(2,doc)
            addToDocument(3,doc)
            addToDocument(4,doc)
            addToDocument(5,doc)
            let button = document.createElement("div")
            button.classList.add("row")
            button.classList.add("row-padding")
            button.innerHTML=`<button type="button"  class="btn btn-primary" onclick=sendTest("${employeeId}","${doc.id}")>Enviar</button>`
            document.getElementById("test-body").appendChild(button)
        }else{
            console.log("doc does not exist")
        }
   })
}

async function sendTest(employeeId, docId){
    const db = firebase.firestore()
    const testDoc = await db.collection("Tests").doc(docId).get().then(function(doc) {
        if (doc.exists){
            return doc
        }
    })
    const employeeDoc = await db.collection("Employees").doc(employeeId).get().then(function(doc) {
        if (doc.exists){
            return doc
        }
    })
    let acum = calculateResult(testDoc)

    let div = document.createElement("div")
    div.innerHTML=`<h1>${acum} de 5 puntos</h1>`
    document.getElementById("points").appendChild(div)
    $('#results-modal').modal('show');
    let temp = employeeDoc.data().tests
    temp.push(createTestObject(testDoc,acum))
    console.log(temp)
    await db.collection("Employees").doc(employeeId).update({
        tests: temp
    }).then(function(doc) {
        console.log("added test to employee")
    })
    
    let temp2 = testDoc.data().employees
    temp2.push(createEmployeeObject(employeeDoc,acum))
    db.collection("Tests").doc(testId).update({
        employees: temp2
    }).then(function (doc) {
        console.log("added employee to test")
    })
}

function createTestObject(testDoc,acum){
    let temp = {
        testId: testDoc.id,
        testName: testDoc.data().testName,
        acum: acum
    }
    return temp
}

function createEmployeeObject(employeeDoc,acum){
    let temp = {
        employeeId: employeeDoc.id,
        employeeName: employeeDoc.data().name,
        acum: acum
    }
    return temp
}

function calculateResult(testDoc){
    let acum = 0;
    acum = acum + calculateQuestionResult(testDoc,1)
    acum = acum + calculateQuestionResult(testDoc,2)
    acum = acum + calculateQuestionResult(testDoc,3)
    acum = acum + calculateQuestionResult(testDoc,4)
    acum = acum + calculateQuestionResult(testDoc,5)
    return acum
}

function calculateQuestionResult(doc,number){
    let acum = 0
    let temp = `doc.data().question${number}`
    if ((document.getElementById(`radios${number}o1`).checked == true) && (document.getElementById(`radios${number}o1`).value == eval(temp).correct)){
        acum = eval(temp).weight
    } else if ((document.getElementById(`radios${number}o2`).checked == true) && (document.getElementById(`radios${number}o2`).value == eval(temp).correct)){
        acum = eval(temp).weight
    } else if ((document.getElementById(`radios${number}o3`).checked == true) && (document.getElementById(`radios${number}o3`).value == eval(temp).correct)){
        acum = eval(temp).weight
    } else{
        acum = 0
    }
    return parseFloat(acum)
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