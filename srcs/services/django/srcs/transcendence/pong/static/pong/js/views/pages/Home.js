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
      const playOfflineButton = document.getElementById("play-offline-button");


      if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
          try {
            const response = await fetch(`https://${window.location.host}/logout/`);
            if (response.ok) {
          //  window.location.hash = '#/';
            triggerHashChange('/home/');
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
          const response = await fetch(`https://${window.location.host}/game/`)
          //eval(response);
          const text = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'text/html');
          const scripts = doc.head.querySelectorAll('script');
          scripts.forEach(script => {
              const newScript = document.createElement('script');
              for (let i = 0; i < script.attributes.length; i++) {
                  const attr = script.attributes[i];
                  newScript.setAttribute(attr.name, attr.value);
              }    
              if (script.src) {
                  newScript.src = script.src;
              } else {
                  newScript.textContent = script.textContent;
              }

              document.body.appendChild(newScript);
          });
      });
    }
  }
};
export default Home;