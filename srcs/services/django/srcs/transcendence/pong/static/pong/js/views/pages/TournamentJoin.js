import { parseRequestUrl } from '../../services/utils.js';
import triggerHashChange from '../../services/utils.js';

const TournamentJoin = {
  /**
   * Render the page content.
   */
  render: async () => {
    const response = await fetch(`https://${window.location.host}/tournaments_list/`)
    return response.text();
  },
 /**
   * All DOM related interactions and controls are typically put in place once the DOM
   * is fully loaded. This is because any manipulations or interactions with the DOM elements
   * must be done after these elements have been fully rendered on the page.
   */
  after_render: async () => {
    const createButton = document.getElementById("create");
    const tournamentVisualization = document.querySelectorAll("#tournament-visualization");
    const joinTournament = document.querySelectorAll("#join-tournament-button");

    if (createButton) {
      createButton.addEventListener('click', async () => {
        triggerHashChange('/tournament_create');
      });
    }
    if (tournamentVisualization) {
      tournamentVisualization.forEach(tournamentVisualization => {
        if (tournamentVisualization) { tournamentVisualization.addEventListener('dblclick', async (event) => {
          alert('Tournament visualization'); // AGGIUNGERE VISUALIZZAZIONE TORNEO
        });
        }
      });
    }
    if (joinTournament) {
      joinTournament.forEach(joinTournament => {
        if (joinTournament) { joinTournament.addEventListener('dblclick', async (event) => {

          const buttonName = event.target.innerText;
          console.log(buttonName);

          const response = await fetch( '/tournament_join/' + buttonName + '/' , {
            method: 'POST'
        });
        if (response.ok) {
          // PARSARE ERRORI E VISUALIZZARE TORNEO
          console.log(response);
          const div = document.getElementById('tournament');
          div.replaceChildren();

          const JsonResponse = await response.json();
          const html = JsonResponse.html;

          div.innerHTML = html;
        }
        });
      }});
     };
    }
};

function reattachEventListeners() {
  const tournamentDiv = document.getElementById("tournament");

  tournamentDiv.addEventListener('dblclick', (event) => {
    if (event.target && event.target.id === 'join-tournament-button') {
      alert('Joined tournament successfully');
    }
  });
}
export default TournamentJoin;
