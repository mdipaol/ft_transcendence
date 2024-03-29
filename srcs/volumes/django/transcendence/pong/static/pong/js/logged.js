
let logoutButton = document.getElementById("logout-button")
if (logoutButton != null){
    logoutButton.addEventListener("click", () => {
        fetch("/logout/")
        .then(response => {
            if (response.redirected)
                window.location.href = response.url;
        })
        .catch(e => console.log("Error with logout request: ", e))
    })
}