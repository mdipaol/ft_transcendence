import { parseRequestUrl } from '../../services/utils.js';
import triggerHashChange from '../../services/utils.js';
import MyWebsocket from '../../services/MyWebsocket.js';

const Home = {
  /**
   * Render the page content.
   */
  render: async () => {

    const authenticatedResponse = await fetch(`https://${window.location.host}/authenticated/`);
    const jsonData = await authenticatedResponse.json();

    if (jsonData.authenticated == true)
      MyWebsocket.startConnection();


    console.log(`https://${window.location.host}/online_users/`);
    const onlineUsersResponse = await fetch(`https://${window.location.host}/online_users/`);
    const onlineUsers = await onlineUsersResponse.text();


    const response = await fetch(`https://${window.location.host}/home/`);
    const home = await response.text();
    
    return home + onlineUsers;
  },

  /*
   * All DOM related interactions and controls are typically put in place once the DOM 
   * is fully loaded. This is because any manipulations or interactions with the DOM elements 
   * must be done after these elements have been fully rendered on the page.
   */
  after_render: async () => 
    {
      const logoutButton = document.getElementById("logout-button");
      const notificationButton = document.getElementById("notification-button");
  
      if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
          try {
            const response = await fetch(`https://${window.location.host}/logout/`);
            if (response.ok) {
              MyWebsocket.removeConnection();
              triggerHashChange('/home/');
            } else {
              console.error('Logout failed.');
            }
          } catch (error) {
            console.error('An error occurred during logout:', error);
          }
        });

        if (notificationButton){
          notificationButton.addEventListener('click', async () => {
            const response = await fetch(`https://${window.location.host}/notification/mdi-paol/`);
            console.log(await response.text());
          })
        }
    }
  }
};
export default Home;