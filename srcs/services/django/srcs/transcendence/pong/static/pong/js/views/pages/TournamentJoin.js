import { parseRequestUrl, getCookie } from '../../services/utils.js';
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
            method: 'POST',
            headers : {
              'X-CSRFToken' : getCookie('csrftoken')
            },
        });
        if (response.ok) {
          // PARSARE ERRORI E VISUALIZZARE TORNEO
          console.log(response);
          const div = document.getElementById('tournament');
          div.replaceChildren();

          const JsonResponse = await response.json();
          const html = JsonResponse.html;

          div.innerHTML = html;
          updateEventListeners(buttonName);
        }
        else{
          triggerHashChange('/tournament_join/')
        }
        });
      }});
     };
    }
};

function updateEventListeners(buttonName) {
  const backButton = document.getElementById("backButton");
  const joinButton = document.getElementById("joinButton");
  const leaveButton = document.getElementById("leaveButton");

  if (backButton) {
    backButton.addEventListener('click', async () => {
      triggerHashChange('/tournament_join');
    });
  }
  if (joinButton) {
    joinButton.addEventListener('click', async () => {
      alert("ciao");
    });
  }
  if (leaveButton) {
    leaveButton.addEventListener('click', async () => {

      const response = await fetch(`https://${window.location.host}/tournament_leave/` + buttonName + `/`, {
        method: 'POST',
        headers:  {
          'X-CSRFToken' : getCookie('csrftoken')
        },
      });

    if (response.ok) {
      // console.log(response);
      // const div = document.getElementById('tournament');
      // div.replaceChildren();

      // // const JsonResponse = await response.json();
      // // const html = JsonResponse.html;
      // const html = await response.text();
      // div.innerHTML = html;
      triggerHashChange('/tournament_join/')
    }
    });
  }
}


function reattachEventListeners() {
  const tournamentDiv = document.getElementById("tournament");

  tournamentDiv.addEventListener('dblclick', (event) => {
    if (event.target && event.target.id === 'join-tournament-button') {
      alert('Joined tournament successfully');
    }
  });
}
export default TournamentJoin;
