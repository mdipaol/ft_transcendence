
import triggerHashChange from "../../services/utils.js";

import {startGame} from "../../game/game.js";
import {stopGame} from "../../game/game.js";

import { Player } from '../../game/Player.js';
import { Ball } from '../../game/Ball.js';
import { Match } from '../../game/Match.js';
import { World } from '../../game/World.js';
import { OnlineMatch } from '../../game/OnlineMatch.js';

const Play = {

    world : null,

    render: async () => {
        const response = await fetch(`https://${window.location.host}/play/`);
        const menu = await response.text();
        return (menu);
    },

    startLocalGame: async () => {
        await startGame('local', 'underground');
        document.addEventListener('keydown', function(event){
            if (event.key === 'Escape' || event.code === 'Escape'){
                stopGame();
                triggerHashChange('/home/');
            }
        })
    },

    startRemoteGame: async () => {
        await startGame('remote', 'underground');
        document.addEventListener('keydown', function(event){
            if (event.key === 'Escape' || event.code === 'Escape'){
                stopGame();
                triggerHashChange('/home/');
            }
        })
    },

    startBotGame: async () => {
        await startGame('bot', 'underground');
        document.addEventListener('keydown', function(event){
            if (event.key === 'Escape' || event.code === 'Escape'){
                stopGame();
                triggerHashChange('/home/');
            }
        })
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
