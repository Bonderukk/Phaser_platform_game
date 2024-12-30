import React, { useEffect, useRef } from 'react';
import { createGame } from './game';
import PWABadge from './PWABadge.jsx'
import './App.css'
import { isMobileDevice } from "./utils/isMobileDevice.js";
import styled from 'styled-components';
import { FaMouse, FaKeyboard } from 'react-icons/fa';
import { MdScreenRotation } from 'react-icons/md';

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
    padding: 40px;
    background-color: #000;
    color: #ccc;
    width: 100%;
    margin: 0;
    box-sizing: border-box;
    overflow-x: hidden;

    h2 {
        margin-top: 0;
        text-align: center;
        color: #fff;
        font-size: 2em;
        margin-bottom: 20px;
    }

    p {
        text-align: center;
        line-height: 1.6;
        margin-bottom: 20px;
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
    }

    ul {
        max-width: 600px;
        margin: 0 auto;
        list-style: none;
        padding-left: 0;
    }

    li {
        margin-bottom: 20px;
        text-align: left;
        padding: 10px 20px;
        display: flex;
        align-items: center;
        gap: 15px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        transition: background 0.2s ease;

        &:hover {
            background: rgba(255, 255, 255, 0.1);
        }
    }

    .icon {
        font-size: 24px;
        color: #fff;
        min-width: 24px;
    }

    strong {
        color: #fff;
        margin-right: 10px;
    }

    @media (max-width: 768px) {
        padding: 20px;
        
        h2 {
            font-size: 1.5em;
        }

        li {
            padding: 8px 15px;
        }

        .icon {
            font-size: 20px;
        }
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
            {showTitle && <PageTitle></PageTitle>}
            <GameContainer ref={gameContainerRef} $hasTitle={showTitle} />

            <Instructions>
                <h2>Popis hry</h2>
                <p>
                    FEI Jump je jednoduchá skákacia hra. Cieľom hry je dostať sa na finálnu
                    platformu bez toho, aby ste spadli. Po ceste budete zbierať boostery, ktoré vám pomôžu
                    zdolať jednotlivé semestre našej školy až kým sa nedostanete na vrchol.
                </p>
                <p>
                    <strong>Ovládanie:</strong>
                </p>
                <ul>
                    <li>
                        <FaMouse className="icon" />
                        <div>
                            <strong>Myš (desktop):</strong> Panáčik sa hýbe podľa pozície kurzora.
                        </div>
                    </li>
                    <li>
                        <FaKeyboard className="icon" />
                        <div>
                            <strong>Klávesnica (desktop):</strong> Použite šípky vľavo/vpravo alebo
                            klávesy A/D na pohyb.
                        </div>
                    </li>
                    <li>
                        <MdScreenRotation className="icon" />
                        <div>
                            <strong>Gyroskop (mobil):</strong> Nakláňajte telefón, aby sa panáčik
                            pohyboval doľava či doprava.
                        </div>
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