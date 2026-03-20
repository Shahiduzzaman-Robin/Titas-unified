"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import './Slider.css'

export default function Slider() {
    const t = useTranslations('public.landing.slider')
    const [currentIndex, setCurrentIndex] = useState(1)
    const [isTransitioning, setIsTransitioning] = useState(true)
    const [isPaused, setIsPaused] = useState(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const slides = [
        {
            id: 1,
            title: t('slide1.title'),
            description: t('slide1.description'),
            image: '/images/slider/slider-1.JPG',
        },
        {
            id: 2,
            title: t('slide2.title'),
            description: t('slide2.description'),
            image: '/images/slider/slider-2.JPG',
        },
        {
            id: 3,
            title: t('slide3.title'),
            description: t('slide3.description'),
            image: '/images/slider/slider-3.JPG',
        },
        {
            id: 4,
            title: t('slide4.title'),
            description: t('slide4.description'),
            image: '/images/slider/slider-4.JPG',
        },
        {
            id: 5,
            title: t('slide5.title'),
            description: t('slide5.description'),
            image: '/images/slider/slider-5.JPG',
        },
        {
            id: 6,
            title: t('slide6.title'),
            description: t('slide6.description'),
            image: '/images/slider/slider-6.JPG',
        },
    ]

    // Extend slides for infinite loop: [Last, 1, 2, 3, 4, 5, 6, First]
    const extendedSlides = [slides[slides.length - 1], ...slides, slides[0]]

    const nextSlide = useCallback(() => {
        if (currentIndex >= extendedSlides.length - 1) return
        setIsTransitioning(true)
        setCurrentIndex((prev) => prev + 1)
    }, [currentIndex, extendedSlides.length])

    const prevSlide = () => {
        if (currentIndex <= 0) return
        setIsTransitioning(true)
        setCurrentIndex((prev) => prev - 1)
    }

    const goToSlide = (index: number) => {
        setIsTransitioning(true)
        setCurrentIndex(index + 1)
    }

    const handleTransitionEnd = () => {
        if (currentIndex === 0) {
            setIsTransitioning(false)
            setCurrentIndex(slides.length)
        } else if (currentIndex === extendedSlides.length - 1) {
            setIsTransitioning(false)
            setCurrentIndex(1)
        }
    }

    useEffect(() => {
        if (!isPaused) {
            timerRef.current = setInterval(nextSlide, 5000)
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [nextSlide, isPaused])

    const activeIndicator = 
        currentIndex === 0 ? slides.length - 1 : 
        currentIndex === extendedSlides.length - 1 ? 0 : 
        currentIndex - 1

    return (
        <div 
            className="slider-container"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div 
                className="slider-wrapper"
                onTransitionEnd={handleTransitionEnd}
                style={{ 
                    transform: `translateX(-${currentIndex * 100}%)`,
                    transition: isTransitioning ? 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
                }}
            >
                {extendedSlides.map((slide, index) => (
                    <div 
                        key={`${slide.id}-${index}`} 
                        className={`slide ${index === currentIndex ? 'active' : ''}`}
                    >
                        <Image 
                            src={slide.image} 
                            alt={slide.title} 
                            className="slide-image"
                            fill
                            priority={index === 1}
                            loading={index === 1 ? undefined : 'lazy'}
                            quality={80}
                            sizes="(max-width: 1200px) 100vw, 1920px"
                        />
                        <div className="slide-overlay"></div>
                        <div className="slide-content">
                            <h2>{slide.title}</h2>
                            <p>{slide.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="slider-nav">
                <button className="nav-btn prev" onClick={prevSlide} aria-label="Previous slide">
                    <ChevronLeft />
                </button>
                <button className="nav-btn next" onClick={nextSlide} aria-label="Next slide">
                    <ChevronRight />
                </button>
            </div>

            <div className="slider-indicators">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`indicator ${index === activeIndicator ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}
