function showLogin() {   
	fetch('/login/', {
		headers:{
			'x-requested-with': 'XMLHttpRequest',
		}
	})
	.then(response => response.text())
	.then(text => {
		console.clear();
		console.log(text);
		document.querySelector('#form-section').innerHTML = text;
	});
}

document.addEventListener("DOMContentLoaded", function() {
	element = document.getElementById('login-button')
		if (element != null)
			element.onclick = function() {
				showLogin(this.dataset.section);
			}
})