import { parseRequestUrl, getCookie, sleep } from '../../services/utils.js';
import triggerHashChange from '../../services/utils.js';
import { startGame, startTournamentGame } from '../../game/game.js';


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
    const createButton = document.getElementById("tournament-create");
    const listButton = document.getElementById("tournament-list");
    const tournamentVisualization = document.querySelectorAll("#tournament-visualization");
    const joinTournament = document.querySelectorAll("#join-tournament-button");
    const leaveButtons = document.querySelectorAll("#tournament-leave");
    const joinedButtons = document.querySelectorAll("#tournament-join");
    const updateButton = document.getElementById("tournament-update");

    if (updateButton){
      updateButton.addEventListener('click', async () =>{
        triggerHashChange('/tournament_join/');
      })
    }
    if (createButton) {
      createButton.addEventListener('click', async () => {
        triggerHashChange('/tournament_create');
      });
    }
    if (listButton) {
      listButton.addEventListener('click', async () => {
        triggerHashChange('/tournament_join');
      });
    }
    if (tournamentVisualization) {
      tournamentVisualization.forEach(tournamentVisualization => {
        if (tournamentVisualization) { tournamentVisualization.addEventListener('click', async (event) => {
          const response = await fetch('/tournament_join/' + tournamentVisualization.getAttribute('data-id') + '/', {method: 'GET'})
          if (response.ok){
            const div = document.getElementById('tournament');
            div.replaceChildren();

            const JsonResponse = await response.json();
            const html = JsonResponse.html;

            div.innerHTML = html;
            updateEventListeners(tournamentVisualization.getAttribute('data-id'));
          }
          else
            triggerHashChange('/tournament_join/');
        });
        }
      });
    }
    if (joinTournament) {
      joinTournament.forEach(joinTournament => {
        if (joinTournament) { joinTournament.addEventListener('dblclick', async (event) => {

          const tournamentName = event.target.innerText;

          const alias = await fetch('/tournament_join/alias/' + tournamentName + '/');
          if (!alias.ok){
            if (alias.status == 400){
              const response = await fetch( '/tournament_join/' + tournamentName + '/' , {
                method: 'GET',
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
                updateEventListeners(tournamentName);
                return;
              }
              else
                triggerHashChange('/tournament_join/');
            }
          }
          else {
            const aliasOverlayHtml = await alias.text();
            document.getElementById('tournament').innerHTML += aliasOverlayHtml;
            displayOverlay(aliasOverlayHtml, tournamentName);
          }
        });
      }});
     };

     if (leaveButtons){
      leaveButtons.forEach(leave => {
        leave.addEventListener('click', async (event) => {

          const response = await fetch('/tournament_leave/' + leave.getAttribute('data-id') + '/', {
            method: 'POST',
            headers : {
              'X-CSRFToken' : getCookie('csrftoken')
            },
          });
          triggerHashChange('/tournament_join/')
        })
      })
    }

    if (joinedButtons){
      joinedButtons.forEach(join => {
        join.addEventListener('click', async (event) => {

          const tournamentName = join.getAttribute('data-id');

          const alias = await fetch('/tournament_join/alias/' + tournamentName + '/');
          if (!alias.ok){
            if (alias.status == 400){
              const response = await fetch( '/tournament_join/' + tournamentName + '/' , {
                method: 'GET',
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
                updateEventListeners(tournamentName);
                return;
              }
              else
                triggerHashChange('/tournament_join/');
            }
          }
          else {
            const aliasOverlayHtml = await alias.text();
            document.getElementById('tournament').innerHTML += aliasOverlayHtml;
            displayOverlay(aliasOverlayHtml, tournamentName);
          }
        })
      })
    }
  }
};


/**
 * Event listner for buttons in the tournament info view
 *
 * @param {String} tournamentName The name of the tournament to be called with /tournament_join/tournamentName
 *
 */
export function updateEventListeners(tournamentName) {
  const backButton = document.getElementById("backButton");
  const joinButton = document.getElementById("joinButton");
  const leaveButton = document.getElementById("leaveButton");
  const playGame = document.getElementById("playGame");

  if (backButton) {
    backButton.addEventListener('click', async () => {
      triggerHashChange('/tournament_join');
    });
  }
  if (joinButton) {
    joinButton.addEventListener('click', async () => {

      const alias = await fetch('/tournament_join/alias/' + tournamentName + '/');
      if (!alias.ok){
        if (alias.status == 400){
          const response = await fetch( '/tournament_join/' + tournamentName + '/' , {
            method: 'GET',
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
            updateEventListeners(tournamentName);
            return;
          }
          else
            triggerHashChange('/tournament_join/');
        }
      }
      else {
        const aliasOverlayHtml = await alias.text();
        document.getElementById('tournament').innerHTML += aliasOverlayHtml;
        displayOverlay(aliasOverlayHtml, tournamentName);
      }
    });
  }
  if (leaveButton) {
    leaveButton.addEventListener('click', async () => {

      const response = await fetch(`https://${window.location.host}/tournament_leave/` + tournamentName + `/`, {
        method: 'POST',
        headers:  {
          'X-CSRFToken' : getCookie('csrftoken')
        },
      });

      triggerHashChange('/tournament_join/')
    });
  }
  if (playGame) {
    playGame.addEventListener('click', async () => {
      await startTournamentGame(playGame.getAttribute('data-id'), 
      playGame.getAttribute('data-alias1'),
      playGame.getAttribute('data-alias2'));
    });
  }
}
//
/**
 * This is to be called before a join in a tournament for checking the alias
 * @param {String} content HTML alias form
 * @param {String} tournamentName Name of the tournament used for fetch call to '/tournament_join/tournamentName'
 * @return {null}
 *
 */
export function displayOverlay(content, tournamentName) {
  const overlay = document.getElementById('alias-overlay');

  overlay.style.display = 'flex';

  const aliasForm = document.getElementById('alias-form');
  aliasForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(aliasForm);

    const response = await fetch( '/tournament_join/' + tournamentName + '/' , {
      method: 'POST',
      headers : {
        'X-CSRFToken' : getCookie('csrftoken')
      },
      body: formData,
    });
    if (response.ok) {
      // PARSARE ERRORI E VISUALIZZARE TORNEO
      console.log(response);
      const div = document.getElementById('tournament');

      const JsonResponse = await response.json();
      const error = JsonResponse.error;
      if (error){
        const errorElement = document.getElementById("alias-error");
        if (errorElement){
          errorElement.innerHTML = error;
          errorElement.classList.add('visible');
        }
        return ;
      }
      overlay.style.display = 'none';
      div.replaceChildren();
      const html = JsonResponse.html;
      div.innerHTML = html;
      updateEventListeners(tournamentName);
    }
    else{
      triggerHashChange('/tournament_join/')
    }
  });
}

export default TournamentJoin;
