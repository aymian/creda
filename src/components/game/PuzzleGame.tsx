"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface PuzzleGameProps {
    onComplete: (score: number, logs: any) => void
}

export function PuzzleGame({ onComplete }: PuzzleGameProps) {
    const [grid, setGrid] = useState<number[]>([])
    const [moves, setMoves] = useState(0)
    const [startTime] = useState(performance.now())
    const [isWon, setIsWon] = useState(false)
    const [logs, setLogs] = useState<any[]>([])

    // Initialize an 8-puzzle (3x3)
    useEffect(() => {
        const initialGrid = [1, 2, 3, 4, 5, 6, 7, 8, 0] // 0 is the empty slot
        // Shuffle logic (ensuring it's solvable)
        let shuffled = [...initialGrid]
        for (let i = 0; i < 100; i++) {
            const emptyIndex = shuffled.indexOf(0)
            const neighbors = getNeighbors(emptyIndex)
            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)]
            shuffled[emptyIndex] = shuffled[randomNeighbor]
            shuffled[randomNeighbor] = 0
        }
        setGrid(shuffled)
    }, [])

    const getNeighbors = (index: number) => {
        const neighbors = []
        const row = Math.floor(index / 3)
        const col = index % 3

        if (row > 0) neighbors.push(index - 3) // Up
        if (row < 2) neighbors.push(index + 3) // Down
        if (col > 0) neighbors.push(index - 1) // Left
        if (col < 2) neighbors.push(index + 1) // Right
        return neighbors
    }

    const handleTileClick = (index: number) => {
        if (isWon) return
        const emptyIndex = grid.indexOf(0)
        const neighbors = getNeighbors(index)

        if (neighbors.includes(emptyIndex)) {
            const newGrid = [...grid]
            newGrid[emptyIndex] = grid[index]
            newGrid[index] = 0
            setGrid(newGrid)
            setMoves(m => m + 1)
            setLogs(prev => [...prev, { move: moves + 1, tile: grid[index], time: performance.now() - startTime }])

            // Check Win Condition
            const winState = [1, 2, 3, 4, 5, 6, 7, 8, 0]
            if (newGrid.every((val, i) => val === winState[i])) {
                setIsWon(true)
                const endTime = performance.now()
                const totalTime = (endTime - startTime) / 1000
                onComplete(parseFloat(totalTime.toFixed(2)), logs)
            }
        }
    }

    return (
        <div className="flex flex-col items-center gap-8">
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black italic uppercase text-cyber-pink">Logic Puzzle Race</h3>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Sort the grid: 1 to 8</p>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-white/5 p-4 rounded-[32px] border border-white/10 shadow-2xl">
                {grid.map((tile, i) => (
                    <motion.button
                        key={i}
                        layout
                        onClick={() => handleTileClick(i)}
                        className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-2xl font-black transition-all ${tile === 0
                                ? "bg-transparent border-2 border-dashed border-white/5 cursor-default"
                                : "bg-[#111] border border-white/10 text-white hover:border-cyber-pink hover:shadow-[0_0_20px_rgba(255,45,108,0.2)]"
                            }`}
                    >
                        {tile !== 0 && tile}
                    </motion.button>
                ))}
            </div>

            <div className="flex gap-8">
                <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-white/20">Moves</p>
                    <p className="text-2xl font-black italic">{moves}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-white/20">Time</p>
                    <p className="text-2xl font-black italic text-cyber-pink">{((performance.now() - startTime) / 1000).toFixed(1)}s</p>
                </div>
            </div>
        </div>
    )
}
