
import {startGame} from "../../game/game.js";
import {stopGame} from "../../game/game.js";
import triggerHashChange from "../../services/utils.js";

const Play = {
    /**
     * Render the page content.
     */
    render: async () => {
        const response = await fetch(`https://${window.location.host}/play/`)
        return response.text();
    },
    /**
     * All DOM related interactions and controls are typically put in place once the DOM 
     * is fully loaded. This is because any manipulations or interactions with the DOM elements 
     * must be done after these elements have been fully rendered on the page.
     */
    after_render: async () => {
        const playButton = document.getElementById('playButton');
        playButton.addEventListener('click' , async () => {
            startGame();
            document.addEventListener('keydown', function(event){
                if (event.key === 'Escape' || event.code === 'Escape')
                {
                    stopGame();
                    triggerHashChange('/home/');
                }
            })
        })
    }
  };
  export default Play;
  