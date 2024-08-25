import triggerHashChange, { parseRequestUrl } from '../../services/utils.js';
import MyWebsocket from '../../services/MyWebsocket.js';

const Register = {
  /**
   * Render the page content.
   */
  render: async () => {
    const params = parseRequestUrl();
    // Get destructured data from API based on id provided.
    // const { name, nickname, img, score, level } = await getItem(
    //   params.id
    // );
    const response = await fetch(`https://${window.location.host}/registration/`)
    return response.text();
  },
  /**
   * All DOM related interactions and controls are typically put in place once the DOM 
   * is fully loaded. This is because any manipulations or interactions with the DOM elements 
   * must be done after these elements have been fully rendered on the page.
   */
  after_render: async () => {
    const form = document.getElementById('registration-form');

    if (form){
        form.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent the form's default submit behavior
    
            const formData = new FormData(form);
            const csrfToken = formData.get('csrfmiddlewaretoken');

            const response = await fetch(`https://${window.location.host}/registration/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken
                },
                body: formData
            });

            if (response.ok) {
                triggerHashChange('/home/');
            } else {
                const jsonResponse = await response.json();
                console.log(jsonResponse);
                const error = document.getElementById('registration-error');
                if (error && jsonResponse.status === 'error') {
                    error.innerHTML = jsonResponse.message;
                    error.classList.add('visible');
                }
            }
        });
    }
  }
};
export default Register;