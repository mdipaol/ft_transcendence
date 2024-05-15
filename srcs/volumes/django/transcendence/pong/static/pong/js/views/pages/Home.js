const Home = {
  /**
   * Render the page content.
   */
  render: async () => {
    return /*html*/ `
      <section>
        <h1 class="text-center"><a href="#login">Sign in!</a></h1>
        <h1 class="text-center">or</a></h1>
        <h1 class="text-center"><a href="#register">Register!</a></h1>
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
