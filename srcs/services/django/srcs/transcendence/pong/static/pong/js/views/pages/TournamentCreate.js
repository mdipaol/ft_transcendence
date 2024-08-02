import { parseRequestUrl } from '../../services/utils.js';
import { updateEventListeners } from './TournamentList.js';
import triggerHashChange from '../../services/utils.js';

const TournamentCreate = {
  /**
   * Render the page content.
   */
  render: async () => {
    const response = await fetch(`https://${window.location.host}/tournament_create/`)
    return response.text();
  },
 /**
   * All DOM related interactions and controls are typically put in place once the DOM
   * is fully loaded. This is because any manipulations or interactions with the DOM elements
   * must be done after these elements have been fully rendered on the page.
   */
  after_render: async () => {
    const listButton = document.getElementById("list");
    const createButton = document.getElementById("create");

    if (listButton) {
      listButton.addEventListener('click', async () => {
        triggerHashChange('/tournament_join/');
      });
    }
    if (createButton) {
      createButton.addEventListener('click', async () => {
        triggerHashChange('/tournament_create/');
      });
    }
    const form = document.getElementById('tournament-form');
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
              console.log(response);
              const div = document.getElementById('tournament');
              div.replaceChildren();
    
              const JsonResponse = await response.json();
              const html = JsonResponse.html;
              const name = JsonResponse.name;

              div.innerHTML = html;
              updateEventListeners(name);
            } else {
                const errorData = await response.json();
                errorMessageDiv.textContent = errorData.message || 'Si è verificato un errore. Riprova.';
            }
        } catch (error) {
            console.log(error);
        }
    });
    function reattachEventListeners() {
      const tournamentDiv = document.getElementById("tournament");
    
      tournamentDiv.addEventListener('dblclick', (event) => {
        if (event.target && event.target.id === 'join-tournament-button') {
          alert('Joined tournament successfully');
        }
      });
    }
   }
};

export default TournamentCreate;
