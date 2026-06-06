/**
 * Image processing and validation utilities
 * Provides functions for image compression and form validation
 */

/**
 * Compression configuration
 */
const COMPRESSION_CONFIG = {
  MAX_SIZE: 800,
  DEFAULT_QUALITY: 0.8,
  OUTPUT_FORMAT: 'image/webp' as const,
} as const

/**
 * Validation patterns
 */
const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(\+62|62|0)[0-9]{9,13}$/,
} as const

/**
 * Compresses an image file to WebP format with specified quality
 * @param file - The image file to compress
 * @param quality - Compression quality (0-1), defaults to 0.8
 * @returns Promise resolving to compressed File
 */
export const compressImageToWebP = (
  file: File, 
  quality: number = COMPRESSION_CONFIG.DEFAULT_QUALITY
): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Validate input
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Invalid file type. Please provide an image file.'))
      return
    }

    if (quality < 0 || quality > 1) {
      reject(new Error('Quality must be between 0 and 1'))
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      try {
        // Calculate new dimensions maintaining aspect ratio
        const { width: newWidth, height: newHeight } = calculateDimensions(
          img.width, 
          img.height, 
          COMPRESSION_CONFIG.MAX_SIZE
        )

        canvas.width = newWidth
        canvas.height = newHeight

        // Draw and compress
        ctx.drawImage(img, 0, 0, newWidth, newHeight)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const fileName = `${file.name.split('.')[0]}.webp`
              const compressedFile = new File([blob], fileName, {
                type: COMPRESSION_CONFIG.OUTPUT_FORMAT,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          COMPRESSION_CONFIG.OUTPUT_FORMAT,
          quality
        )
      } catch (error) {
        reject(new Error(`Compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Calculates new dimensions while maintaining aspect ratio
 * @param width - Original width
 * @param height - Original height
 * @param maxSize - Maximum allowed dimension
 * @returns New dimensions object
 */
function calculateDimensions(width: number, height: number, maxSize: number) {
  if (width <= maxSize && height <= maxSize) {
    return { width, height }
  }

  const aspectRatio = width / height

  if (width > height) {
    return {
      width: maxSize,
      height: Math.round(maxSize / aspectRatio)
    }
  } else {
    return {
      width: Math.round(maxSize * aspectRatio),
      height: maxSize
    }
  }
}

/**
 * Validates email address format
 * @param email - Email address to validate
 * @returns True if email is valid
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false
  return VALIDATION_PATTERNS.EMAIL.test(email.trim())
}

/**
 * Validates Indonesian phone number format
 * Accepts formats: +62xxx, 62xxx, 0xxx
 * @param phone - Phone number to validate
 * @returns True if phone number is valid
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false
  const cleanPhone = phone.replace(/\s|-/g, '')
  return VALIDATION_PATTERNS.PHONE.test(cleanPhone)
}

/**
 * Formats phone number to standard Indonesian format
 * @param phone - Phone number to format
 * @returns Formatted phone number or original if invalid
 */
export const formatPhone = (phone: string): string => {
  if (!validatePhone(phone)) return phone
  
  const cleanPhone = phone.replace(/\s|-/g, '')
  
  // Convert to +62 format
  if (cleanPhone.startsWith('0')) {
    return `+62${cleanPhone.slice(1)}`
  } else if (cleanPhone.startsWith('62')) {
    return `+${cleanPhone}`
  } else if (cleanPhone.startsWith('+62')) {
    return cleanPhone
  }
  
  return phone
}
