import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('https://super-global-bet-server.onrender.com');

export default function HeadsOrTailsGame() {
  const [coins, setCoins] = useState(100);
  const [betAmount, setBetAmount] = useState(10);
  const [choice, setChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [gameStatus, setGameStatus] = useState('home');
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

  if (gameStatus === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b132b] to-[#1c2541] text-white flex flex-col items-center justify-center p-6">
        <img src="/logo.png" alt="Logo Super Global Bet" className="w-32 mb-4" />
        <h1 className="text-4xl font-extrabold text-yellow-400 drop-shadow mb-2">SUPER GLOBAL BET</h1>
        <p className="text-lg text-white/80 mb-6">Juega, gana COINS, canjea premios</p>
        <button onClick={() => setGameStatus('waiting')} className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-2xl shadow-lg">Empezar</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b132b] text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-extrabold text-yellow-400 mb-6 tracking-wide drop-shadow">SUPER GLOBAL BET</h1>

      <div className="bg-white/10 p-6 rounded-2xl w-full max-w-md shadow-xl">
        <p className="text-center mb-4 text-lg">Saldo actual: <strong className="text-yellow-300">{coins} COINS</strong></p>

        {gameStatus === 'waiting' && (
          <>
            <label className="block mb-2">Selecciona apuesta:</label>
            <select value={betAmount} onChange={e => setBetAmount(Number(e.target.value))} className="w-full p-2 mb-4 rounded bg-white text-black">
              {[10, 20, 50, 100].map(value => (
                <option key={value} value={value}>{value} COINS</option>
              ))}
            </select>

            <div className="flex justify-around mb-4">
              <button onClick={() => setChoice('heads')} className={`px-6 py-2 rounded-xl font-bold ${choice === 'heads' ? 'bg-blue-600 text-white' : 'bg-white text-black'}`}>Cara</button>
              <button onClick={() => setChoice('tails')} className={`px-6 py-2 rounded-xl font-bold ${choice === 'tails' ? 'bg-blue-600 text-white' : 'bg-white text-black'}`}>Sello</button>
            </div>

            <button onClick={playGame} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-xl transition">Jugar</button>
          </>
        )}

        {gameStatus === 'searching' && <p className="text-center text-yellow-300 animate-pulse">Buscando oponente...</p>}
        {gameStatus === 'matched' && <p className="text-center text-green-300">¡Partida encontrada! Jugando contra {opponent?.name || 'otro jugador'}...</p>}
        {gameStatus === 'finished' && (
          <div className="text-center">
            <p className="text-2xl font-semibold text-yellow-400">Resultado: {result?.flip === 'heads' ? 'Cara' : 'Sello'}</p>
            <p className="text-xl mt-2 font-bold text-green-400">{result?.winner === socket.id ? '¡Ganaste!' : 'Perdiste'}</p>
            <button onClick={() => { setResult(null); setGameStatus('waiting'); }} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl">Volver</button>
          </div>
        )}
      </div>
    </div>
  );
}
