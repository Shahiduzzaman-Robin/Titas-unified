import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}

/**
 * Specifically for migrating from PHP/MySQL system
 * PHP's password_hash uses $2y$ (blowfish), which bcryptjs can handle by 
 * replacing $2y$ with $2a$.
 */
export async function verifyLegacyPassword(password: string, legacyHash: string): Promise<boolean> {
    const normalizedHash = legacyHash.replace(/^\$2y\$/, '$2a$')
    return bcrypt.compare(password, normalizedHash)
}
