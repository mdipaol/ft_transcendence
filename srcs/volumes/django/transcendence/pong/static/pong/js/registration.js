function showRegistration() { 
	fetch('/registration/',{
		headers:{
			'x-requested-with': 'XMLHttpRequest',
		}
	})
	.then(response => response.text())
	.then(text => {
		console.log(text);
		document.querySelector('#form-section').innerHTML = text;
	});
}

document.addEventListener("DOMContentLoaded", function() {
	document.getElementById('registration-button').onclick = function() {
			showRegistration(this.dataset.section)
		}
})