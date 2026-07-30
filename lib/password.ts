import { randomBytes, scrypt, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)
const KEY_LENGTH = 64

export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex')
    const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer
    return `${salt}:${derived.toString('hex')}`
}

export async function verifyPassword(
    password: string,
    storedHash: string
): Promise<boolean> {
    const [salt, keyHex] = storedHash.split(':')
    if (!salt || !keyHex) return false

    const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer
    const keyBuffer = Buffer.from(keyHex, 'hex')
    if (derived.length !== keyBuffer.length) return false
    return timingSafeEqual(derived, keyBuffer)
}
