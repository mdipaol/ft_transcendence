import { parseRequestUrl } from '../../services/utils.js';

const Login = {
    /**
     * Render the page content.
     */
    render: async () => {
        const params = parseRequestUrl();
        // Fetch the login page content
        const response = await fetch(`https://${window.location.host}/login/`);
        return response.text();
    },
    /*
     * All DOM related interactions and controls are typically put in place once the DOM 
     * is fully loaded. This is because any manipulations or interactions with the DOM elements 
     * must be done after these elements have been fully rendered on the page.
     */
    after_render: async () => {
        const form = document.getElementById('login-form');
        const errorMessageDiv = document.getElementById('error-message');

        form.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent the form's default submit behavior

            const formData = new FormData(form);
            const csrfToken = formData.get('csrfmiddlewaretoken');

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrfToken 
                    },
                    body: formData
                });

                if (response.ok) {
                    form.style.display = 'none';
                    // triggerHashChange('/home/');
                    window.location.hash = '#/home/';
                    // await Home.renderContent();
                } else {
                    const errorData = await response.json();
                    errorMessageDiv.textContent = errorData.message || 'Si è verificato un errore. Riprova.';
                }
            } catch (error) {
                errorMessageDiv.textContent = 'Errore di rete. Riprova.';
            }
        });
    }
};

export default Login;
