'use client'

import { useRef, useState } from 'react'

export default function DropZone() {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    console.log('Выбран файл:', file.name, file.size)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleFile(file)
          }
        }}
      />

      <svg
        className="w-12 h-12 text-gray-400 mx-auto"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
        />
      </svg>

      <p className="text-lg font-semibold text-gray-700 mt-4">
        Перетащи CSV файл сюда
      </p>
      <p className="text-sm text-gray-500 mt-2">
        или нажми кнопку, чтобы выбрать файл
      </p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mt-4"
      >
        Выбрать файл
      </button>

      <p className="text-xs text-gray-400 mt-6">
        🔒 Данные не покидают твой браузер
      </p>
    </div>
  )
}