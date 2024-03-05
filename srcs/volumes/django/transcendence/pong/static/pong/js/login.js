function showLogin() {   
	fetch('/login/')
	.then(response => response.text())
	.then(text => {
		console.log(text);
		document.querySelector('#login').innerHTML = text;
	});
}

function logout(){
	fetch('/logout/')
	.then(response => response.text())
	.then(text=> {
		console.log(text);
		location.reload();
	})
}

document.addEventListener("DOMContentLoaded", function() {
	document.getElementById('login-button').onclick = function() {
			showLogin(this.dataset.section)
		}
})

document.addEventListener("DOMContentLoaded", function(){
	document.getElementById('logout-button').onclick = function(){
		logout(this.dataset.section)
	}
})
