import React, { useEffect, useRef } from 'react';
import { createGame } from './game';
import PWABadge from './PWABadge.jsx'
import './App.css'
import { isMobileDevice } from "./utils/isMobileDevice.js";
import styled from 'styled-components';

const TitleHeight = 90;

const PageTitle = styled.h1`
    text-align: center;
    margin-top: 30px;
    margin-bottom: 0;
    height: ${TitleHeight-30}px;
    line-height: ${TitleHeight-30}px;
`;

const GameContainer = styled.div`
    width: 100%;
    height: ${({ $hasTitle }) =>
            $hasTitle ? `calc(100vh - ${TitleHeight}px)` : '100vh'};
    @media print {
        display: none;
    }
`;

const Instructions = styled.div`
    padding: 20px;
    background-color: #222;
    color: #ccc;

    h2 {
        margin-top: 0;
    }
`;

const PWABadgeWrapper = styled.div`
    @media print {
        display: none;
    }
`;

function App() {
    const gameContainerRef = useRef(null);
    const showTitle = !isMobileDevice();

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
            {showTitle && <PageTitle>FEI Jump</PageTitle>}
            <GameContainer ref={gameContainerRef} $hasTitle={showTitle} />

            <Instructions>
                <h2>Popis hry</h2>
                <p>
                    FEI Jump je jednoduchá skákacia hra. Cieľom hry je dostať sa na finálnu
                    platformu bez toho, aby ste spadli.
                </p>
                <p>
                    <strong>Ovládanie:</strong>
                </p>
                <ul>
                    <li>
                        <strong>Myš (desktop):</strong> Panáčik sa hýbe podľa pozície kurzora.
                    </li>
                    <li>
                        <strong>Klávesnica (desktop):</strong> Použite šípky vľavo/vpravo alebo
                        klávesy A/D na pohyb.
                    </li>
                    <li>
                        <strong>Gyroskop (mobil):</strong> Nakláňajte telefón, aby sa panáčik
                        pohyboval doľava či doprava.
                    </li>
                </ul>
            </Instructions>

            <PWABadgeWrapper>
                <PWABadge />
            </PWABadgeWrapper>
        </>
    );
}

export default App;