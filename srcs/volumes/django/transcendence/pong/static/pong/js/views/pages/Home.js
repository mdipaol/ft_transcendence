const Home = {
  /**
   * Render the page content.
   */
  render: async () => {
    return /*html*/ `
      <section class="flex-container">
        <h1><a class="neongreen" href="/#/login">SIGN IN!</a></h1>
        <h1 class="neonbar">OR</h1>
        <h1><a class="neonpink" href="/#/">REGISTER!</a></h1>
        <div class="neon-button-wrapper">
    </div>
      </section>
    `;
  },
 /**
   * All DOM related interactions and controls are typically put in place once the DOM 
   * is fully loaded. This is because any manipulations or interactions with the DOM elements 
   * must be done after these elements have been fully rendered on the page.
   */
  after_render: async () => {}
};
export default Home;
