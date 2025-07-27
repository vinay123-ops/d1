import { useRef, useState } from 'react'
import { UploadCloud, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface VideoUploadProps {
  cameraId?: string
  location?: string
  zoneId?: string
}

const DEFAULT_CAMERA_ID = 'CAM-1'
const DEFAULT_LOCATION = 'HQ'
const DEFAULT_ZONE_ID = 'ZONE-1'

export default function VideoUpload({
  cameraId = DEFAULT_CAMERA_ID,
  location = DEFAULT_LOCATION,
  zoneId = DEFAULT_ZONE_ID,
}: VideoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a video file (mp4, avi, etc.).',
        variant: 'destructive',
      })
      return
    }

    // Max 500 MB safeguard
    if (file.size > 500 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a video smaller than 500 MB.',
        variant: 'destructive',
      })
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('video', file)
      formData.append('camera_id', cameraId)
      formData.append('location', location)
      formData.append('zone_id', zoneId)

      const apiBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      const resp = await fetch(`${apiBase}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!resp.ok) {
        throw new Error(await resp.text())
      }

      const data = await resp.json()

      toast({
        title: 'Upload complete',
        description: `Extracted ${data.frames?.length || 0} motion frames`,
      })
    } catch (err: any) {
      toast({
        title: 'Upload failed',
        description: err.message || 'Unable to process video',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
      // reset input so selecting same file again triggers change
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleButtonClick}
        className="h-10 w-10 hover:bg-primary/10"
        disabled={uploading}
      >
        {uploading ? (
          <Loader2 className="animate-spin h-5 w-5" />
        ) : (
          <UploadCloud className="h-5 w-5" />
        )}
        <span className="sr-only">Upload surveillance video</span>
      </Button>
    </>
  )
} 