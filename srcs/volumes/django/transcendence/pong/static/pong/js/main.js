function showRegistration() {   
	fetch('/registration/')
	.then(response => response.text())
	.then(text => {
		console.log(text);
		document.querySelector('#content').innerHTML = text;
	});
}

document.addEventListener("DOMContentLoaded", function() {
	document.querySelectorAll('button').forEach(button => {
		button.onclick = function() {
			showRegistration(this.dataset.section)
		}
	})
});