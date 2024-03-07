function showLogin() {   
	fetch('/login/')
	.then(response => response.text())
	.then(text => {
		console.log(text);
		document.querySelector('#login').innerHTML = text;
	});
}

document.addEventListener("DOMContentLoaded", function() {
	document.getElementById('login-button').onclick = function() {
			showLogin(this.dataset.section)
		}
})