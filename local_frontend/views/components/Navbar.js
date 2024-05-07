const Navbar = {
  /**
   * Render the component content.
   */
  render: async () => {
    // Define a list of navbar links.
    const links = ['Home', 'Pong', 'Account', 'AboutUs', 'Contact'];
    // Build html with navigation links.
    const navLinks = links
      .map(
        link =>
          /*html*/ `<li class="nav-item"><a class="neonbar" href="/#/${link.toLowerCase()}">${link}</a></li>`
      )
      .join('\n');
    return /*html*/ `
      <nav class="navbar navbar-expand-md navbar-light bg-white">
        <a class="navbar-brand" href="/#">
          <img src="https://cdn4.vectorstock.com/i/1000x1000/40/23/ping-pong-neon-sign-vector-27134023.jpg" width="70" height="70" alt="PONG">
        </a>
        <ul class="navbar-nav">
          ${navLinks}
        </ul>
      </nav>
    `;
  },
  /**
   * All DOM related interactions and controls are typically put in place once the DOM 
   * is fully loaded. This is because any manipulations or interactions with the DOM elements 
   * must be done after these elements have been fully rendered on the page.
   */
  after_render: async () => {}
};

export default Navbar;
