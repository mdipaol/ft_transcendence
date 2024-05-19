const About = {
  /**
   * Render the page content.
   */
  render: async () => {
    return /*html*/ `
      <section class=slider>
      <div id="textbox">
      <h4 class="neon flicker" data-text="U">"E<span class="flicker-slow">D</span>D<span class="flicker-fast">A</span>I.<span class="flicker-slow">.</span>."</h1>
    </div>
      <div id="slider">

       <img src="../../styles/images/alegreci.jpeg" alt="Image 1">
       <img src="../../styles/images/damia.jpeg" alt="Image 2">
       <img src="../../styles/images/manue.png" alt="Image 3">
       <img src="../../styles/images/vic.jpg" alt="Image 2">
       <img src="../../styles/images/nelly.jpeg" alt="Image 5">
       <img src="../../styles/images/fogli.jpeg" alt="Image 6">
      </div>
      <div id="textbox">
        <h3 class="neonbar shadow">Yo dude! Who do you think made this crazy, epic site?
        Yup, these guys up top, so go ahead and smash that "outstanding project" button for them!</h1>
      </div>
      <div id="textbox">
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
export default About;
