import { useState, useRef } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const ACCEPTED = '.pdf,.docx,.txt,.png,.jpg,.jpeg,.webp,.gif'

export default function FileUploadModal({ onFileProcessed, selectedModel, onClose }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  const VISION_MODELS = ['gemini-flash']
  const modelSupportsImages = VISION_MODELS.includes(selectedModel)

  const handleFile = e => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = ev => setPreview(ev.target.result)
      reader.readAsDataURL(f)
    } else {
      setPreview('')
    }
  }

  const upload = async () => {
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await api.post('/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (res.data.type === 'image' && !modelSupportsImages) {
        toast('⚠ Ce modèle ne supporte pas les images. Contenu ignoré.')
        onClose()
        return
      }
      onFileProcessed(res.data)
      onClose()
    } catch (err) {
      toast.error('Erreur lors du téléchargement du fichier')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold">Joindre un fichier</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
        </div>

        {!modelSupportsImages && (
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 mb-4 text-sm text-yellow-300">
            ⚠ Ce modèle ne supporte pas les images. Seuls PDF, DOCX et TXT sont disponibles.
          </div>
        )}

        <div
          className="border-2 border-dashed border-surface-border rounded-xl p-8 text-center cursor-pointer hover:border-brand transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="preview" className="max-h-40 mx-auto rounded-lg object-contain" />
          ) : file ? (
            <div>
              <p className="text-4xl mb-2">📄</p>
              <p className="text-gray-300 text-sm">{file.name}</p>
              <p className="text-gray-500 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <p className="text-4xl mb-2">📎</p>
              <p className="text-gray-400 text-sm">Cliquez ou glissez un fichier ici</p>
              <p className="text-gray-600 text-xs mt-1">PDF, DOCX, TXT, Images</p>
            </div>
          )}
          <input ref={inputRef} type="file" accept={ACCEPTED} onChange={handleFile} className="hidden" />
        </div>

        {file && (
          <div className="flex gap-3 mt-4">
            <button onClick={onClose} className="btn-secondary flex-1">Annuler</button>
            <button onClick={upload} disabled={uploading} className="btn-primary flex-1">
              {uploading ? 'Envoi...' : 'Confirmer'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
