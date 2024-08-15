
import { startGame } from "../../game/game.js";
import { World } from "../../game/World.js";

const Play = {
    world: null,
    match: null,
    bool: null,

    render: async () => {
        const response = await fetch(`https://${window.location.host}/play/`);
        const menu = await response.text();
        return (menu);
    },

    getMatch : async (matchType) =>{
        Play.match = matchType
        return Play.matchType
    },

    getWorld : async (world) =>{
        Play.world = world
        return Play.world
    },

    getBool : async (bool) =>{
        Play.bool = bool
        return Play.bool
    },

    after_render: async () => {
        const form = document.getElementById('setting-Mach');

        if (!form) {
            console.error("Il form 'setting-Mach' non è stato trovato.");
            return;
        }

        const Buttonlocal = document.getElementById('btn-local-game'); // 1 vs 1
        const ButtonBot = document.getElementById('btn-local-game-bot'); // AI
        const ButtonOnline = document.getElementById('btn-remote-game'); // Online Match
        const ButtonON = document.getElementById('btn-power-up-active'); // ON
        const ButtonOFF = document.getElementById('btn-power-up-off'); // OFF
        const ButtonThefinals = document.getElementById('W1'); // TheFinals
        const ButtonUnderground = document.getElementById('W2'); // Underground
        const ButtonSTART = document.getElementById('Start');

        form.addEventListener('submit', async (event) => {
            event.preventDefault(); // Previeni l'invio del form di default

            // Controlla quale radio button è selezionato
            let matchType, powerType, selectedWorld;
            
            if(Buttonlocal.checked){
                matchType = 'local';
            } 
            else if(ButtonBot.checked){
                matchType = 'bot';
            } 
            else if(ButtonOnline.checked){
                matchType = 'remote';
            }
            else
                matchType = 'bot';   

            if(ButtonON.checked){
                powerType = true;
            } 
            else if(ButtonOFF.checked){
                powerType = false;
            }
            else
                powerType = false;

            //selezione mondo
            if (ButtonThefinals.checked){
                selectedWorld = 'finals';
            } 
            else if (ButtonUnderground.checked){
                selectedWorld = 'underground';
            }
            else{
                let worldR = Math.random();
                if(worldR < 0.5)
                    selectedWorld = 'underground';
                else
                    selectedWorld = 'finals';
            }
            Play.getMatch(matchType);
            Play.getWorld(selectedWorld);
            Play.getBool(powerType);
            await startGame(Play.match, Play.world , Play.bool);
        });
        if (ButtonSTART) {
            ButtonSTART.addEventListener('click', async (event) => {
            }, { once: true }); // Assicura che l'evento venga gestito solo una volta
        }
    }
};

export default Play;
