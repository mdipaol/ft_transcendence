const Error404 = {
  /**
   * Render the page content.
   */
  render: async () => {
    return /*html*/ `
      <section>
        <button class="neon-button">
        <div class="glow"></div>
        <span class="inner-button black">404 o 104?</span>
    </button>
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
export default Error404;
