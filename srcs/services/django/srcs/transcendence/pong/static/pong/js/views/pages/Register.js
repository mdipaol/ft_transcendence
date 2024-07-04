import { parseRequestUrl } from '../../services/utils.js';

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
                window.location.hash = '#/home/';
            } else {
                const errorForm = await response.text();
                document.getElementById('page_root').innerHTML = errorForm;
                await Register.after_render();
            }
        } catch (error) {
            console.log(error);
        }
    });
  }
};
export default Register;
