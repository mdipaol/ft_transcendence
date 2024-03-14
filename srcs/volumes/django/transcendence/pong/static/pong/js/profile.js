function profile() {
    fetch('/profile/', {
        headers:{
            'X-Requested-With': 'XMLHttpRequest',
        }
    })
    .then(response => response.text)
    .then(text => {
        console.log(text);
    })
}

document.addEventListener("DOMContentLoaded", function() {
	element = document.getElementById('profile-button')
		if (element != null)
			element.onclick = function() {
				profile(this.dataset.section);
			}
})