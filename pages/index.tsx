import axios from "axios";
import Head from "next/head";
import { useState } from "react";
import Swal from "sweetalert2";

const Home = () => {
  const [board, setBoard] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ]);
  const [player, setPlayer] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<string | null>(null);

  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setPlayer("X");
    setWinner(null);
  };

  const handleClick = async (index: number) => {
    if (winner || board[index] !== null) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = player;
    setBoard(newBoard);

    for (let i = 0; i < winningCombinations.length; i++) {
      const [a, b, c] = winningCombinations[i];
      if (
        newBoard[a] !== null &&
        newBoard[a] === newBoard[b] &&
        newBoard[b] === newBoard[c]
      ) {
        Swal.fire("You win!");
        setWinner(player);
        setTimeout(handleReset, 2000);
        return;
      }
    }

    if (newBoard.filter((cell) => cell === null).length === 0) {
      Swal.fire("Draw!");
      setWinner("draw");
      setTimeout(handleReset, 2000);
      return;
    }

    const nextPlayer = player === "X" ? "O" : "X";
    setPlayer(nextPlayer);

    const { data } = await axios.post("/api/bot", {
      board: newBoard,
      player: nextPlayer,
    });
    const botIndex = data.move;

    setTimeout(() => {
      const botBoard = [...newBoard];
      botBoard[botIndex] = nextPlayer;
      setBoard(botBoard);

      for (let i = 0; i < winningCombinations.length; i++) {
        const [a, b, c] = winningCombinations[i];
        if (
          botBoard[a] !== null &&
          botBoard[a] === botBoard[b] &&
          botBoard[b] === botBoard[c]
        ) {
          Swal.fire("Bot win!");
          setWinner("Bot");
          setTimeout(handleReset, 2000);
          return;
        }
      }

      if (botBoard.filter((cell) => cell === null).length === 0) {
        Swal.fire("Draw!");
        setWinner("draw");
        setTimeout(handleReset, 2000);
        return;
      }

      const nextBotPlayer = nextPlayer === "X" ? "O" : "X";
      setPlayer(nextBotPlayer);
    }, 500);
  };

  return (
    <>
      <Head>
        <title>Tic Tac Toe</title>
      </Head>
      <div className="content">
        <h1>Tic Tac Toe</h1>
        <div className="board">
          {board.map((cell, index) => (
            <div key={index} onClick={() => handleClick(index)}>
              {cell}
            </div>
          ))}
        </div>
        <button onClick={handleReset}>Reset Board</button>
      </div>
    </>
  );
};

export default Home;
