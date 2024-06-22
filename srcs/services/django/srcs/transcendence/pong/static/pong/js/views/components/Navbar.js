const Navbar = {
  /**
   * Render the component content.
   * <img src="https://cdn4.vectorstock.com/i/1000x1000/40/23/ping-pong-neon-sign-vector-27134023.jpg" width="70" height="70" alt="PONG">
   */
  render: async () => {
    const response = await fetch(`https://${window.location.host}/navbar/`)
    return response.text();
  },
  /**
   * All DOM related interactions and controls are typically put in place once the DOM 
   * is fully loaded. This is because any manipulations or interactions with the DOM elements 
   * must be done after these elements have been fully rendered on the page.
   */
  after_render: async () => {
    // document.addEventListener('DOMContentLoaded', function() {
      const navbarToggle = document.querySelector('.navbar-toggler');
      // console.log(navbarToggle);
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
