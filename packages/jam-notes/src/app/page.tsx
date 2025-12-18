'use client';

import { useState, useCallback } from 'react';

type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
type PieceColor = 'white' | 'black';

interface Piece {
  type: PieceType;
  color: PieceColor;
}

interface Position {
  row: number;
  col: number;
}

const initialBoard: (Piece | null)[][] = [
  [
    { type: 'rook', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'queen', color: 'black' },
    { type: 'king', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'rook', color: 'black' }
  ],
  Array(8).fill(null).map(() => ({ type: 'pawn', color: 'black' })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: 'pawn', color: 'white' })),
  [
    { type: 'rook', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'queen', color: 'white' },
    { type: 'king', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'rook', color: 'white' }
  ]
];

const pieceSymbols: Record<PieceType, Record<PieceColor, string>> = {
  king: { white: '♔', black: '♚' },
  queen: { white: '♕', black: '♛' },
  rook: { white: '♖', black: '♜' },
  bishop: { white: '♗', black: '♝' },
  knight: { white: '♘', black: '♞' },
  pawn: { white: '♙', black: '♟' }
};

export default function ChessGame() {
  const [board, setBoard] = useState<(Piece | null)[][]>(initialBoard);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('white');
  const [gameStatus, setGameStatus] = useState<string>('White to move');

  const isValidMove = useCallback((from: Position, to: Position, piece: Piece): boolean => {
    const { row: fromRow, col: fromCol } = from;
    const { row: toRow, col: toCol } = to;
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    // Can't capture own piece
    const targetPiece = board[toRow][toCol];
    if (targetPiece && targetPiece.color === piece.color) {
      return false;
    }

    switch (piece.type) {
      case 'pawn':
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        
        // Forward move
        if (fromCol === toCol && !targetPiece) {
          if (toRow === fromRow + direction) return true;
          if (fromRow === startRow && toRow === fromRow + 2 * direction) return true;
        }
        // Diagonal capture
        if (colDiff === 1 && toRow === fromRow + direction && targetPiece) {
          return true;
        }
        return false;

      case 'rook':
        return (fromRow === toRow || fromCol === toCol) && isPathClear(from, to);

      case 'bishop':
        return rowDiff === colDiff && isPathClear(from, to);

      case 'queen':
        return (fromRow === toRow || fromCol === toCol || rowDiff === colDiff) && isPathClear(from, to);

      case 'king':
        return rowDiff <= 1 && colDiff <= 1;

      case 'knight':
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

      default:
        return false;
    }
  }, [board]);

  const isPathClear = useCallback((from: Position, to: Position): boolean => {
    const { row: fromRow, col: fromCol } = from;
    const { row: toRow, col: toCol } = to;
    
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
    
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    
    while (currentRow !== toRow || currentCol !== toCol) {
      if (board[currentRow][currentCol] !== null) {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }
    
    return true;
  }, [board]);

  const handleSquareClick = useCallback((row: number, col: number) => {
    const clickedPiece = board[row][col];
    
    if (selectedSquare) {
      const { row: fromRow, col: fromCol } = selectedSquare;
      const selectedPiece = board[fromRow][fromCol];
      
      if (selectedPiece && isValidMove(selectedSquare, { row, col }, selectedPiece)) {
        // Make the move
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = selectedPiece;
        newBoard[fromRow][fromCol] = null;
        
        setBoard(newBoard);
        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
        setGameStatus(`${currentPlayer === 'white' ? 'Black' : 'White'} to move`);
        setSelectedSquare(null);
      } else if (clickedPiece && clickedPiece.color === currentPlayer) {
        // Select new piece
        setSelectedSquare({ row, col });
      } else {
        // Invalid move or empty square
        setSelectedSquare(null);
      }
    } else if (clickedPiece && clickedPiece.color === currentPlayer) {
      // Select piece
      setSelectedSquare({ row, col });
    }
  }, [board, selectedSquare, currentPlayer, isValidMove]);

  const resetGame = () => {
    setBoard(initialBoard);
    setSelectedSquare(null);
    setCurrentPlayer('white');
    setGameStatus('White to move');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Chess Game</h1>
          <p className="text-white/80 text-lg">{gameStatus}</p>
          <button
            onClick={resetGame}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            New Game
          </button>
        </div>
        
        <div className="grid grid-cols-8 gap-0 border-4 border-amber-800 rounded-lg overflow-hidden shadow-lg">
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const isLight = (rowIndex + colIndex) % 2 === 0;
              const isSelected = selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex;
              
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    w-16 h-16 flex items-center justify-center cursor-pointer text-4xl
                    transition-all duration-200 hover:scale-105
                    ${isLight ? 'bg-amber-100' : 'bg-amber-800'}
                    ${isSelected ? 'ring-4 ring-blue-500 ring-inset' : ''}
                    ${piece && piece.color === currentPlayer ? 'hover:bg-green-300' : ''}
                  `}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                >
                  {piece && (
                    <span className={`select-none ${piece.color === 'white' ? 'text-white drop-shadow-lg' : 'text-black'}`}>
                      {pieceSymbols[piece.type][piece.color]}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
        
        <div className="mt-6 text-center">
          <div className="flex justify-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <span className="text-2xl">♔</span>
              <span>White</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">♚</span>
              <span>Black</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


