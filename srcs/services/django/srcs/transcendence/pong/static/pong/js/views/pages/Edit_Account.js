import triggerHashChange from '../../services/utils.js';
import { parseRequestUrl, getCookie } from '../../services/utils.js';

const Home = {
  /**
   * Render the page content.
   */
  render: async () => {
    const response = await fetch(`https://${window.location.host}/edit_account/`);
    const html = response.text();

    return html;
  },
  /**
   * All DOM related interactions and controls are typically put in place once the DOM
   * is fully loaded. This is because any manipulations or interactions with the DOM elements
   * must be done after these elements have been fully rendered on the page.
   */
  after_render: async () => {
        const buttonChangeImage = document.getElementById('change-image-btn');
        const buttonChangeUsername = document.getElementById('change-username-btn');
        const buttonChangePassword = document.getElementById('change-password-btn');
        const usernameForm = document.getElementById('username-form');
        const imageForm = document.getElementById('image-form');

        if (imageForm) {
        imageForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const response = await fetch(`https://${window.location.host}/change_image/`);
            if (response.ok) {
              triggerHashChange('/edit_account/');
            }
            
        });
        }
        if (usernameForm) {
          usernameForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(usernameForm);
            const response = await fetch(`https://${window.location.host}/change_username/`, {
              method: 'POST',
              headers : {
                'X-CSRFToken' : getCookie('csrftoken')
              },
              body: formData
            });
            if (response.ok){
              const data = await response.json();
              const success = data.status;
              if (success && success == 'success'){
                triggerHashChange('/edit_account/');
              }
            }
            else{
              const data = await response.json();
              const error = data.status.error;
              console.log(data)
              if (error){
                const errorElement = document.getElementById("username-error");
                if (errorElement){
                  errorElement.innerHTML = error;
                  errorElement.classList.add('visible');
                }
                return ;
              }
            }
        });
        }
        if (buttonChangePassword) {
        buttonChangePassword.addEventListener('click', async (event) => {
            event.preventDefault();
        });
        }
    }
}
export default Home;
