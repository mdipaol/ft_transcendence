
import {startGame} from "../../game/game.js";

const Play = {

    world : null,

    render: async () => {
        const response = await fetch(`https://${window.location.host}/play/`);
        const menu = await response.text();
        return (menu);
    },

    startLocalGame: async () => {
        await startGame('local', 's', true);
    },

    startRemoteGame: async () => {
        await startGame('remote', 's', true);
    },

    startBotGame: async () => {
        await startGame('bot', 'underground', false);
    },

    after_render: async () => {
        const localGameButton = document.getElementById('btn-local-game');
        const remoteGameButton = document.getElementById('btn-remote-game');
        const botGameButton = document.getElementById('btn-local-game-bot');
        if (localGameButton)
            localGameButton.addEventListener('click' , Play.startLocalGame);
        if (remoteGameButton)
            remoteGameButton.addEventListener('click' , Play.startRemoteGame);
        if (botGameButton)
            botGameButton.addEventListener('click' , Play.startBotGame);
    },

};
export default Play;
