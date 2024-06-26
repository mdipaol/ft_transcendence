import { parseRequestUrl } from '../../services/utils.js';

const Home = {
  /**
   * Render the page content.
   */
  render: async () => {
    const response = await fetch(`https://${window.location.host}/tournament/`)
    return response.text();
  },
 /**
   * All DOM related interactions and controls are typically put in place once the DOM
   * is fully loaded. This is because any manipulations or interactions with the DOM elements
   * must be done after these elements have been fully rendered on the page.
   */
  after_render: async () => {
    document.addEventListener('DOMContentLoaded', function() {
      const tournamentListItems = document.querySelectorAll('#tournament-list li');
      const tournamentInfoDivs = document.querySelectorAll('.tournament-info');

      tournamentListItems.forEach(item => {
          item.addEventListener('click', function() {
              const tournamentId = this.getAttribute('data-tournament');

              // Hide all tournament info divs
              tournamentInfoDivs.forEach(div => {
                  div.style.display = 'none';
              });

              // Display the selected tournament info div
              const selectedTournamentDiv = document.getElementById(tournamentId);
              if (selectedTournamentDiv) {
                  selectedTournamentDiv.style.display = 'block';
              }
          });
      });
  });

  }
};
export default Home;
