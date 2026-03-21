"use client"

import React, { useState, useCallback } from 'react'
import Cropper, { Area, Point } from 'react-easy-crop'
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface ImageCropperProps {
    image: string
    onCropComplete: (croppedBlob: Blob) => void
    onCancel: () => void
    aspect?: number
}

const ImageCropper = ({ image, onCropComplete, onCancel, aspect = 1 }: ImageCropperProps) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

    const onCropAreaComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleConfirm = async () => {
        try {
            if (!croppedAreaPixels) return
            const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels)
            if (croppedImageBlob) {
                onCropComplete(croppedImageBlob)
            }
        } catch (e) {
            console.error('Cropping error:', e)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <h3 className="text-lg font-bold">Crop Image</h3>
                    <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                
                {/* Cropper Area */}
                <div className="relative h-[300px] sm:h-[400px] bg-gray-900">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onCropComplete={onCropAreaComplete}
                        onZoomChange={setZoom}
                    />
                </div>

                {/* Controls */}
                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <ZoomOut className="h-4 w-4 text-gray-400" />
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <ZoomIn className="h-4 w-4 text-gray-400" />
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" className="flex-1 h-11" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="button" className="flex-1 h-11 bg-primary" onClick={handleConfirm}>
                            <Check className="h-4 w-4 mr-2" /> Confirm Crop
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Helper function to create the cropped image
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob | null> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) return null

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    )

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob)
        }, 'image/jpeg', 0.9)
    })
}

const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.setAttribute('crossOrigin', 'anonymous')
        image.src = url
    })

export default ImageCropper
