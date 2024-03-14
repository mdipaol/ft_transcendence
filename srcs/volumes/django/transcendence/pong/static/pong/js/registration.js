// AJAX call with fetch()

function showRegistration() { 
	fetch('/registration/',{
		headers:{'x-requested-with': 'XMLHttpRequest',}
	})
	.then(response => response.text())
	.then(text => {
		console.clear();
		console.log(text);
		document.querySelector('#form-section').innerHTML = text;
	});
}

// AJAX call with XMLHttpRequest object

function registrationXMLHttpRequest(){

	console.log('entro')

	let req = new XMLHttpRequest();

	let url = "/registration";

	req.open("GET", url, true);
	req.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); // Set the X-Requested-With header

	req.onreadystatechange = function(){
		if (req.status == 200){
			console.log(this.responseText);
			document.querySelector("#form-section").innerHTML = this.responseText;
		}
		else{
			console.log('Error:', req.status);
		}
	}
	req.send();
}

document.addEventListener("DOMContentLoaded", function() {
		element = document.getElementById('registration-button')
		if (element != null)
			element.onclick = function() {
				showRegistration(this.dataset.section);
			}
})