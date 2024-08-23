import { getCookie, parseRequestUrl } from '../../services/utils.js';
import triggerHashChange from '../../services/utils.js';
import MyWebsocket from '../../services/MyWebsocket.js';

const Home = {
  /**
   * Render the page content.
   */
  render: async () => {

    const response = await fetch(`https://${window.location.host}/home/`);
    const home = await response.text();
    
    return home;
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
    const friendRequestFornm = document.getElementById("friend-request-form");
    const loginForm = document.getElementById("login-form");
    const acceptRequestButtons = document.querySelectorAll("#accept-request-btn");
    const rejectRequestButtons = document.querySelectorAll("#reject-request-btn");
    const removeFriendButtons = document.querySelectorAll("#remove-friend-btn");
 
    
    if (loginForm){
      loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(loginForm);
        const response = await fetch(`https://${window.location.host}/login_view/`, {
          method : 'POST',
          // headers : {
          //   'X-CSRFToken': csrfTokens
          //   },
          body : formData,
          });
          if (response.ok) {
            triggerHashChange('/home/');
          }
      });
      }

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
    }
      
    if (notificationButton){
        notificationButton.addEventListener('click', async () => {
          const response = await fetch(`https://${window.location.host}/notification/mdi-paol/`);
          console.log(await response.text());
        })
      }

      if (friendRequestFornm){
        friendRequestFornm.addEventListener('submit', async (event) => {
          event.preventDefault()

          console.log('Request sent');
          const formData = new FormData(friendRequestFornm);

          const csrfToken = getCookie('csrftoken');
          const username = formData.get('username');

          const response = await fetch('/send_friend_request/' + username + '/' , {
            method : 'POST',
            headers : {
              'X-CSRFToken': csrfToken
            }
          })
          if (response.ok){
            triggerHashChange('/home/');
          }
          else{
            const jsonResponse = await response.json();
            const error = document.getElementById('request-username-error');
            if (error && jsonResponse.status == 'error'){
              error.innerHTML = jsonResponse.message;
              error.classList.add('visible');
            }
          }
        })
      }

      if (acceptRequestButtons) {
        acceptRequestButtons.forEach(acceptButton => {
          acceptButton.addEventListener('click', async (event) => {
            event.preventDefault();
            const response = await fetch('/accept_friend_request/' + acceptButton.getAttribute('data-username') + '/', {
              method : 'POST',
              headers : {
                'X-CSRFToken' : getCookie('csrftoken')
              }
            })
            triggerHashChange('/home/');
          })
        })
      }

      if (rejectRequestButtons){
        rejectRequestButtons.forEach(rejectButton => {
          rejectButton.addEventListener('click', async (event) => {
            event.preventDefault();
            const response = await fetch('/reject_friend_request/' + rejectButton.getAttribute('data-username') + '/', {
              method : 'POST',
              headers : {
                'X-CSRFToken' : getCookie('csrftoken')
              }
            })
            triggerHashChange('/home/');
          })
        })
      }

      if (removeFriendButtons){
        removeFriendButtons.forEach(removeButton => {
          removeButton.addEventListener('click', async (event) => {
            event.preventDefault();
            const response = await fetch('/remove_friend/' + removeButton.getAttribute('data-username') + '/', {
              method : 'DELETE',
              headers : {
                'X-CSRFToken' : getCookie('csrftoken')
              }
            })
            triggerHashChange('/home/');
          })
        })
      }
  }
};
export default Home;