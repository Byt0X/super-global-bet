import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('https://your-backend-url.com'); // reemplaza por tu backend real

export default function HeadsOrTailsGame() {
  const [coins, setCoins] = useState(100);
  const [betAmount, setBetAmount] = useState(10);
  const [choice, setChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [gameStatus, setGameStatus] = useState('waiting');
  const [opponent, setOpponent] = useState(null);

  useEffect(() => {
    socket.on('match_found', (opponentData) => {
      setOpponent(opponentData);
      setGameStatus('matched');
    });

    socket.on('coin_flip_result', (data) => {
      setResult(data);
      setGameStatus('finished');
      if (data.winner === socket.id) setCoins(prev => prev + betAmount);
      else setCoins(prev => prev - betAmount);
    });

    return () => {
      socket.off('match_found');
      socket.off('coin_flip_result');
    };
  }, [betAmount]);

  const playGame = () => {
    if (!choice || coins < betAmount) return alert('Selecciona una opción válida');
    setGameStatus('searching');
    socket.emit('join_game', { bet: betAmount, choice });
  };

  return (
    <div className="p-4 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">SUPER GLOBAL BET</h1>
      <p className="mb-2">Tus COINS: <strong>{coins}</strong></p>

      {gameStatus === 'waiting' && (
        <>
          <select value={betAmount} onChange={e => setBetAmount(Number(e.target.value))} className="mb-2">
            {[10, 20, 50, 100].map(value => <option key={value} value={value}>{value} COINS</option>)}
          </select>
          <div className="space-x-4 my-2">
            <button onClick={() => setChoice('heads')} className={`px-4 py-2 rounded ${choice === 'heads' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Heads</button>
            <button onClick={() => setChoice('tails')} className={`px-4 py-2 rounded ${choice === 'tails' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Tails</button>
          </div>
          <button onClick={playGame} className="mt-4 bg-green-500 text-white px-6 py-2 rounded">Jugar</button>
        </>
      )}

      {gameStatus === 'searching' && <p>Buscando oponente...</p>}
      {gameStatus === 'matched' && <p>¡Partida encontrada! Jugando contra {opponent?.name || 'otro jugador'}...</p>}
      {gameStatus === 'finished' && (
        <div className="mt-4">
          <p>Resultado: <strong>{result?.flip}</strong></p>
          <p>{result?.winner === socket.id ? '¡Ganaste!' : 'Perdiste'}</p>
          <button onClick={() => { setResult(null); setGameStatus('waiting'); }} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Volver</button>
        </div>
      )}
    </div>
  );
}
