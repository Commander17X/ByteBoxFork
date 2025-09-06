'use client'

import React, { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Send, Paperclip, X } from 'lucide-react'

interface FileWithBase64 {
  name: string
  base64: string
  type: string
  size: number
}

interface ChatInputProps {
  input: string
  isLoading: boolean
  onInputChange: (value: string) => void
  onSend: () => void
  onFileUpload: (files: FileWithBase64[]) => void
  minLines?: number
}

export function ChatInput({
  input,
  isLoading,
  onInputChange,
  onSend,
  onFileUpload,
  minLines = 1
}: ChatInputProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileWithBase64[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isLoading && input.trim()) {
        onSend()
      }
    }
  }

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        const fileData: FileWithBase64 = {
          name: file.name,
          base64: base64.split(',')[1], // Remove data:type;base64, prefix
          type: file.type,
          size: file.size
        }
        
        setUploadedFiles(prev => [...prev, fileData])
        onFileUpload([...uploadedFiles, fileData])
      }
      reader.readAsDataURL(file)
    })
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [uploadedFiles, onFileUpload])

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)
    onFileUpload(newFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="w-full">
      {/* File Upload Area */}
      {uploadedFiles.length > 0 && (
        <div className="mb-3 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-lg text-sm"
              >
                <span className="text-white/80 truncate max-w-32">{file.name}</span>
                <span className="text-white/60 text-xs">({formatFileSize(file.size)})</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-white/60 hover:text-white/80 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want ByteBot to do..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            rows={minLines}
            disabled={isLoading}
          />
        </div>

        {/* File Upload Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors"
          disabled={isLoading}
        >
          <Paperclip className="w-5 h-5 text-white/80" />
        </motion.button>

        {/* Send Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSend}
          disabled={!input.trim() || isLoading}
          className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl transition-colors"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5 text-white" />
          )}
        </motion.button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.csv,.xlsx,.xls"
      />
    </div>
  )
}
