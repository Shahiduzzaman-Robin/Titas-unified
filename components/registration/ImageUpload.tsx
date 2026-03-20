"use client"

import { useState } from "react"
import Image from "next/image"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useTranslations } from 'next-intl'
import ImageCropper from "./ImageCropper"

interface ImageUploadProps {
    value?: string
    onChange: (file: File | null) => void
    label?: string
    required?: boolean
}

export function ImageUpload({ value, onChange, label, required }: ImageUploadProps) {
    const t = useTranslations('public.register')
    const [preview, setPreview] = useState<string | null>(value || null)
    
    // Cropper State
    const [isCropping, setIsCropping] = useState(false)
    const [rawImage, setRawImage] = useState<string | null>(null)
    const [fileName, setFileName] = useState<string>("image.jpg")

    // Default label if not provided
    const displayLabel = label || t('uploadImage')

    const [isDragging, setIsDragging] = useState(false)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) {
            initCrop(file)
        }
    }

    const initCrop = (file: File) => {
        setFileName(file.name)
        const reader = new FileReader()
        reader.onloadend = () => {
            setRawImage(reader.result as string)
            setIsCropping(true)
        }
        reader.readAsDataURL(file)
    }

    const handleCropComplete = (croppedBlob: Blob) => {
        const croppedFile = new File([croppedBlob], fileName, { type: 'image/jpeg' })
        onChange(croppedFile)
        
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
            setIsCropping(false)
            setRawImage(null)
        }
        reader.readAsDataURL(croppedFile)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            initCrop(file)
        }
    }

    const handleRemove = () => {
        setPreview(null)
        onChange(null)
    }

    return (
        <div className="space-y-2">
            <Label>{displayLabel} {required && <span className="text-red-500">*</span>}</Label>

            {preview ? (
                <div className="relative w-full max-w-xs">
                    <Image
                        src={preview}
                        alt="Preview"
                        width={300}
                        height={300}
                        className="rounded-lg border object-cover aspect-square"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 rounded-full"
                        onClick={handleRemove}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <label
                    className={`flex flex-col items-center justify-center w-full max-w-xs h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className={`w-10 h-10 mb-3 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
                        <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">{t('clickToUpload')}</span> {t('orDragAndDrop')}
                        </p>
                        <p className="text-xs text-gray-400">{t('fileLimits')}</p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        required={required}
                    />
                </label>
            )}

            {isCropping && rawImage && (
                <ImageCropper
                    image={rawImage}
                    onCropComplete={handleCropComplete}
                    onCancel={() => {
                        setIsCropping(false)
                        setRawImage(null)
                    }}
                    aspect={1}
                />
            )}
        </div>
    )
}
