import { parseRequestUrl } from '../../services/utils.js';
import triggerHashChange from '../../services/utils.js';

const Home = {
  /**
   * Render the page content.
   */
  render: async () => {
    const params = parseRequestUrl();
    // Get destructured data from API based on id provided.
    // const { name, nickname, img, score, level } = await getItem(
    //   params.id
    // );
    const response = await fetch(`https://${window.location.host}/home/`)
    return response.text();
  },
 /**
   * All DOM related interactions and controls are typically put in place once the DOM 
   * is fully loaded. This is because any manipulations or interactions with the DOM elements 
   * must be done after these elements have been fully rendered on the page.
   */

 

  after_render: async () => 
    {
      const logoutButton = document.getElementById("logout-button");
      const playOnlineButton = document.getElementById("play-online-button");
      const playOfflineButton = document.getElementById("play-offline-button")

      console.log(playOfflineButton)

      if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
          try {
            const response = await fetch(`https://${window.location.host}/logout/`);
            if (response.ok) {
          //  window.location.hash = '#/';
            triggerHashChange('/home/');
            console.log(response);
            //await Home.renderContent();
            } else {
              console.error('Logout failed.');
            }
          } catch (error) {
            console.error('An error occurred during logout:', error);
          }
        });
    }

    if (playOnlineButton) {
      playOnlineButton.addEventListener('click', async () => {
          const response = await fetch(`https://${window.location.host}/game/`)
          return response.text();
      });
    }
    
    if (playOfflineButton) {
        playOfflineButton.addEventListener('click', async () => {
          const response = await fetch(`https://${window.location.host}/script_game/`)
          const scripts = await response.text()
          document.body.appendChild(scripts)
      });
    }
  }
};
export default Home;
