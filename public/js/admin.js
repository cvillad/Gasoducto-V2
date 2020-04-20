function openTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

function setOptionTemplate(question, option){
  var div1 = document.createElement("div")
  div1.classList.add("form-group")
  div1.innerHTML=`<div class="form-group">
  <div class="row">
      <div class="col-5">
          <input type="text" class="form-control option" id="q${question}o${option}" placeholder="Opción ${option}">
      </div>
      <div class="col-auto vert-cent">
          <input class="form-check-input" type="radio" name="radios${question}" id="radios${question}o${option}" value="option${option}" checked>
          <label class="form-check-label" for="radios${question}o${option}">
              Verdadera
          </label>
      </div>
  </div>
</div>`

document.getElementById(`question${question}`).appendChild(div1)
}

