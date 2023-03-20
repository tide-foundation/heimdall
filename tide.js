import SignIn  from "https://cdn.jsdelivr.net/gh/tide-foundation/Tide-h4x2-2@master/H4x2-Node/H4x2-Node/wwwroot/modules/H4x2-TideJS/Functions/SignIn.js";

async function signin() {
  var user = document.getElementById("username").value;
  var pass = document.getElementById("pass").value;

  var config = {
    simulatorUrl: 'https://new-simulator.australiaeast.cloudapp.azure.com/',
    vendorUrl: 'https://h4x-staging-vendor.azurewebsites.net/'
  } 
  var signin = new SignIn(config);
  var obj = await signin.return_UID_CVK(user, pass);

  heimdall(obj); // vendor function!
}

fetch('https://raw.githubusercontent.com/tide-foundation/heimdall/main/tide.html')
  .then(response => response.text())
  .then(html => {
    const div = document.createElement("div");
    div.innerHTML = html;
    div.id = "tide-div"
    document.body.appendChild(div);

    const btn = document.querySelector('.signinbtn');
    btn.addEventListener('click', signin);
  });
// do SRI checks


