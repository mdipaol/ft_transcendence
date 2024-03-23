document.getElementById("registration-button").addEventListener("click", function() {
	fetch("/registration/", {headers: {'X-Requested-With' : 'XMLHttpRequest'}})
	.then(response => response.text())
	.then(html => {
		document.getElementById("form-container").innerHTML = html;
		var form = document.getElementById("form-container");
		form.addEventListener("submit", function(event) {
			event.preventDefault();

			var formhtml = document.getElementById("registration-form");
			var formData = new FormData(formhtml);
			console.log(Object.fromEntries(formData));
			// Call a function to perform a POST request with the form data
			postData(formData)
			.then(response => {
				// Handle response
				console.log("Response.success: ", response.success)
				if (response.success)
					window.location.replace(window.location.protocol + "//" + window.location.host)
				else
				{
					console.log(response.form_html)
					document.getElementById("form-container").innerHTML = response.form_html;
				}
			})
			.catch(error => {
				console.error("POST request failed:", error);
				// Handle error if needed
			});
		});
	})
	.catch(error => console.error("Error fetching form:", error));
});
  
  function postData(formData) {
	return new Promise((resolve, reject) => {
	  // Example: Perform a POST request using Fetch API
	  toSend = new URLSearchParams(Object.fromEntries(formData))
	  console.log("🚀 ~ returnnewPromise ~ toSend:", toSend)
	  fetch("/registration/", {
		method: "POST",
		body: toSend,
		headers: {
		  "Content-Type": 'application/x-www-form-urlencoded',
		  'X-Requested-With' : 'XMLHttpRequest',
		}
	  })
	  .then(response => {
		if (!response.ok) {
		  throw new Error("POST request failed");
		}
		return response.json();
	  })
	  .then(data => {
		resolve(data);
	  })
	  .catch(error => {
		reject(error);
	  });
	});
  }