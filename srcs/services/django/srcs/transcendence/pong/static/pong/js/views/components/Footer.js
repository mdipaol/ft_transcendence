const Footer = {
  /**
   * Render the component content.
   */
  render: async () => {
    return /*html*/ `
      <h8><p class="text-center mt-4"><em>Questo è il footer che appare in ogni pagina, ho pensato per privacy etc, po verimm</em></p>  
      <p class="text-center"><em>Tutti i diritti, non riservati, sono sul quaderno di Vic</a></em></p>  
      <p class="text-center ">ne avevamo bisogno? probabilmente no---->  <em id="time"></em></p><h8>
    `;
  },
  /**
   * All DOM related interactions and controls are typically put in place once the DOM 
   * is fully loaded. This is because any manipulations or interactions with the DOM elements 
   * must be done after these elements have been fully rendered on the page.
   */
  after_render: async () => {
    // Select a node that will contain the clock and date.
    const time = document.querySelector('#time');

    /**
     * Set inner html of selected node to current time and update it every second.
     */
    const updateTime = () => {
      // Get current time and format a clock and date.
      const newDate = new Date();
      const clock = newDate.toTimeString().slice(0, 8);
      const date = newDate.toLocaleDateString().slice(0, 8);
      // Insert formatted clock and date into footer inner html.
      time.innerHTML = `${clock} ${date}`;
    };

    // Set node content and update it every second.bbhb bbbbbbbb
    updateTime();
    setInterval(updateTime, 1000);
  }
};

export default Footer;
