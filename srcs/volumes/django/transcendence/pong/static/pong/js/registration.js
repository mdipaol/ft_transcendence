function showRegistration() { 
	fetch('/registration/')
	.then(response => response.text())
	.then(text => {
		console.log(text);
		document.querySelector('#registration').innerHTML = text;
	});
}

document.addEventListener("DOMContentLoaded", function() {
	document.getElementById('registration-button').onclick = function() {
			showRegistration(this.dataset.section)
		}
})