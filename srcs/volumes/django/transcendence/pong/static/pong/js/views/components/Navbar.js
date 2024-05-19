const Navbar = {
  /**
   * Render the component content.
   * <img src="https://cdn4.vectorstock.com/i/1000x1000/40/23/ping-pong-neon-sign-vector-27134023.jpg" width="70" height="70" alt="PONG">
   */
  render: async () => {
    // Define a list of navbar links.
    const links = ['Home', 'Pong', 'Tournament', 'Account', 'AboutUs'];
    // Build html with navigation links.
    const navLinks = links
      .map(
        link =>
          `<li class="nav-item"><a class="neonbar" href="/#/${link.toLowerCase()}">${link}</a></li>`
      )
      .join('\n');
    return `
      <nav class="navbar navbar-expand-md navbar-light bg-white">
        <a class="navbar-brand" href="/#">
        <div class="field">
        <div class="ping"></div>
        <div>
        <h2 class="logo-text">42pong</h2>
      </div>
        <div class="pong"></div>
        <div class="ball"></div>
      </div>
        </a>
        <button class="navbar-toggler" type="button" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <svg class="navbar-toggler-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>  
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav">
            ${navLinks}
          </ul>
          <ul class="navbar-nav-mobile">
            ${navLinks}
          </ul>
        </div>
      </nav>
    `;
  },
  /**
   * All DOM related interactions and controls are typically put in place once the DOM 
   * is fully loaded. This is because any manipulations or interactions with the DOM elements 
   * must be done after these elements have been fully rendered on the page.
   */
  after_render: async () => {
    // document.addEventListener('DOMContentLoaded', function() {
      const navbarToggle = document.querySelector('.navbar-toggler');
      console.log(navbarToggle);
      const navbarCollapse = document.querySelector('.navbar-collapse');

      navbarToggle.addEventListener('click', function() {
        navbarCollapse.classList.toggle('show');
        console.log('clicked');
      });

      window.addEventListener('click', function(event) {
        if (!navbarToggle.contains(event.target) && !navbarCollapse.contains(event.target) && navbarCollapse.classList.contains('show')) {
          navbarCollapse.classList.remove('show');
        }
      });

      window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
          navbarCollapse.classList.remove('show');
        }
      });
    // });
  }
};

export default Navbar;
