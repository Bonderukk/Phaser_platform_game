import React, { useEffect, useRef } from 'react';
import { createGame } from './game';
import PWABadge from './PWABadge.jsx'
import './App.css'

function App() {
    const gameContainerRef = useRef(null);

    useEffect(() => {
        // Keď je komponent mounted, spustíme Phaser hru
        const game = createGame(gameContainerRef.current);

        // Pri unmounte hru odstránime
        return () => {
            game.destroy(true);
        };
    }, []);

    return (
        <>
            <div>
              <div id="game-container" ref={gameContainerRef}/>
            </div>
            <PWABadge/>
        </>
    )
}

export default App
