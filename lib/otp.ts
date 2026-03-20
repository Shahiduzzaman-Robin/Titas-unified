import crypto from 'crypto'

export function generateOTP(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let otp = ''
    for (let i = 0; i < 4; i++) {
        const randomIndex = crypto.randomInt(0, chars.length)
        otp += chars[randomIndex]
    }
    return otp
}

export function generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&'
    let password = ''
    for (let i = 0; i < 8; i++) {
        const randomIndex = crypto.randomInt(0, chars.length)
        password += chars[randomIndex]
    }
    return password
}
