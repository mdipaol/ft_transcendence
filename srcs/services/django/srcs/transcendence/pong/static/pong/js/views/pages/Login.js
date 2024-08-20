import { parseRequestUrl } from '../../services/utils.js';
import triggerHashChange from '../../services/utils.js';
import MyWebsocket from '../../services/MyWebsocket.js';

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

                // if (response.ok) {

                //     triggerHashChange('/home/');

                // } else {
                //     const errorForm = await response.text();
                //     document.getElementById('page_root').innerHTML = errorForm;
                //     await Login.after_render();
                // }
                triggerHashChange('/home/');
            } catch (error) {
                console.log(error);
            }
        });
    }
};

export default Login;
