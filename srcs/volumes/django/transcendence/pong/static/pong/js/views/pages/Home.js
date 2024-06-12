import { parseRequestUrl } from '../../services/utils.js';

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
    console.log(response);
    console.log(response.text);
    return response.text();
  },
 /**
   * All DOM related interactions and controls are typically put in place once the DOM 
   * is fully loaded. This is because any manipulations or interactions with the DOM elements 
   * must be done after these elements have been fully rendered on the page.
   */
  after_render: async () => 
    {
      const button = document.getElementById("logout-button");
      if (button) {
        button.addEventListener('click', async () => {
          try {
            const response = await fetch(`https://${window.location.host}/logout/`);
            if (response.ok) {
             window.location.hash = '#/home/';
            //  await Home.renderContent();
            } else {
              console.error('Logout failed.');
            }
          } catch (error) {
            console.error('An error occurred during logout:', error);
          }
        });
    }
  }
};
export default Home;
