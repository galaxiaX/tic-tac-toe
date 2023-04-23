import { NextApiRequest, NextApiResponse } from "next";

type Board = (string | null)[];

interface BotResponse {
  move: number | null;
}

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

const calculateBestMove = (board: Board, player: string) => {
  const opponent = player === "X" ? "O" : "X";

  const isBoardFull = board.every((cell) => cell !== null);
  if (isBoardFull) {
    return null;
  }

  const minimax = (currentBoard: Board, currentPlayer: string): number => {
    const availableCells = currentBoard.reduce(
      (acc: number[], cell: string | null, index: number) =>
        cell === null ? acc.concat(index) : acc,
      []
    );

    if (isWinning(currentBoard, player)) {
      return 10;
    } else if (isWinning(currentBoard, opponent)) {
      return -10;
    } else if (availableCells.length === 0) {
      return 0;
    }

    const scores: number[] = [];
    for (let i = 0; i < availableCells.length; i++) {
      const index = availableCells[i];
      const newBoard = [...currentBoard];
      newBoard[index] = currentPlayer;
      const score = minimax(
        newBoard,
        currentPlayer === player ? opponent : player
      );
      scores.push(score);
    }

    if (currentPlayer === player) {
      return Math.max(...scores);
    } else {
      return Math.min(...scores);
    }
  };

  const emptyCells = board.reduce(
    (acc: number[], cell: string | null, index: number) =>
      cell === null ? acc.concat(index) : acc,
    []
  );
  const scores = emptyCells.map((index) => {
    const newBoard = [...board];
    newBoard[index] = player;
    return minimax(newBoard, opponent);
  });

  const maxScore = Math.max(...scores);
  const bestMoves = emptyCells.filter((_, index) => scores[index] === maxScore);
  const randomIndex = Math.floor(Math.random() * bestMoves.length);
  return bestMoves[randomIndex];
};

const isWinning = (board: Board, player: string) => {
  return winningCombinations.some(([a, b, c]) => {
    return board[a] === player && board[b] === player && board[c] === player;
  });
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<BotResponse>
) {
  const { board, player } = req.body;
  const bestMove = calculateBestMove(board, player);
  res.status(200).json({ move: bestMove });
}
