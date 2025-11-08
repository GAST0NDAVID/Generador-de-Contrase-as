import QRCode from "qrcode"

// Character sets with and without confusing characters
const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  uppercaseNoConfusing: "ABCDEFGHJKMNPQRSTUVWXYZ", // Removed I, L, O
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  lowercaseNoConfusing: "abcdefghjkmnpqrstuvwxyz", // Removed i, l, o
  numbers: "0123456789",
  numbersNoConfusing: "23456789", // Removed 0, 1
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  symbolsSafe: "!@#$%^&*_+-=", // Only symbols that work in most forms
}

// Wordlist for passphrase generation
const WORDLIST = [
  "aurora",
  "beacon",
  "crystal",
  "diamond",
  "eclipse",
  "forest",
  "galaxy",
  "horizon",
  "island",
  "journey",
  "kingdom",
  "liberty",
  "mountain",
  "nebula",
  "ocean",
  "phoenix",
  "quantum",
  "radiant",
  "stellar",
  "thunder",
  "universe",
  "valley",
  "wisdom",
  "zenith",
  "azure",
  "breeze",
  "cascade",
  "destiny",
  "eternal",
  "fortune",
  "gentle",
  "harmony",
  "infinite",
  "jubilant",
  "knight",
  "legacy",
  "marvel",
  "nobility",
  "optimal",
  "pioneer",
]

export interface PasswordStrength {
  entropy: number
  strength: "weak" | "fair" | "good" | "strong" | "very-strong"
  crackTime: string
}

export interface ComplianceBadges {
  nist: boolean
  owasp: boolean
  strong: boolean
  complex: boolean
}

// Generate cryptographically secure random password
export function generatePassword(
  length: number,
  options: {
    uppercase: boolean
    lowercase: boolean
    numbers: boolean
    symbols: boolean
    excludeConfusing: boolean
    excludeUnsafeSymbols: boolean
  },
): string {
  let charset = ""

  if (options.uppercase) {
    charset += options.excludeConfusing ? CHAR_SETS.uppercaseNoConfusing : CHAR_SETS.uppercase
  }
  if (options.lowercase) {
    charset += options.excludeConfusing ? CHAR_SETS.lowercaseNoConfusing : CHAR_SETS.lowercase
  }
  if (options.numbers) {
    charset += options.excludeConfusing ? CHAR_SETS.numbersNoConfusing : CHAR_SETS.numbers
  }
  if (options.symbols) {
    charset += options.excludeUnsafeSymbols ? CHAR_SETS.symbolsSafe : CHAR_SETS.symbols
  }

  if (!charset) {
    throw new Error("At least one character type must be selected")
  }

  const array = new Uint8Array(length)
  crypto.getRandomValues(array)

  let password = ""
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length]
  }

  return password
}

// Generate passphrase with random words
export function generatePassphrase(wordCount = 4, separator = "-"): string {
  const array = new Uint8Array(wordCount)
  crypto.getRandomValues(array)

  return Array.from(array)
    .map((val) => WORDLIST[val % WORDLIST.length])
    .join(separator)
}

// Calculate password entropy in bits
export function calculateEntropy(passwordLength: number, charsetSize: number): number {
  return passwordLength * Math.log2(charsetSize)
}

// Get character set size
export function getCharsetSize(options: {
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
  excludeConfusing: boolean
  excludeUnsafeSymbols: boolean
}): number {
  let size = 0

  if (options.uppercase) {
    size += options.excludeConfusing ? CHAR_SETS.uppercaseNoConfusing.length : CHAR_SETS.uppercase.length
  }
  if (options.lowercase) {
    size += options.excludeConfusing ? CHAR_SETS.lowercaseNoConfusing.length : CHAR_SETS.lowercase.length
  }
  if (options.numbers) {
    size += options.excludeConfusing ? CHAR_SETS.numbersNoConfusing.length : CHAR_SETS.numbers.length
  }
  if (options.symbols) {
    size += options.excludeUnsafeSymbols ? CHAR_SETS.symbolsSafe.length : CHAR_SETS.symbols.length
  }

  return size
}

// Estimate crack time based on entropy
export function estimateCrackTime(entropy: number): string {
  const secondsPerAttempt = 0.000001 // 1 microsecond per guess
  const secondsToTry = (Math.pow(2, entropy) * secondsPerAttempt) / 2

  if (secondsToTry < 1) return "Menos de 1 segundo"
  if (secondsToTry < 60) return `${Math.round(secondsToTry)} segundos`
  if (secondsToTry < 3600) return `${Math.round(secondsToTry / 60)} minutos`
  if (secondsToTry < 86400) return `${Math.round(secondsToTry / 3600)} horas`
  if (secondsToTry < 31536000) return `${Math.round(secondsToTry / 86400)} días`

  const years = Math.round(secondsToTry / 31536000)
  if (years < 1000) return `${years} años`
  return `${(years / 1000).toFixed(1)}k años`
}

// Analyze password strength
export function analyzePasswordStrength(password: string, charsetSize: number): PasswordStrength {
  const entropy = calculateEntropy(password.length, charsetSize)
  let strength: PasswordStrength["strength"] = "weak"

  if (entropy >= 128) strength = "very-strong"
  else if (entropy >= 100) strength = "strong"
  else if (entropy >= 80) strength = "good"
  else if (entropy >= 60) strength = "fair"
  else strength = "weak"

  return {
    entropy: Math.round(entropy * 100) / 100,
    strength,
    crackTime: estimateCrackTime(entropy),
  }
}

// Check compliance badges
export function checkCompliance(
  password: string,
  options: {
    uppercase: boolean
    lowercase: boolean
    numbers: boolean
    symbols: boolean
  },
): ComplianceBadges {
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumbers = /[0-9]/.test(password)
  const hasSymbols = /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)

  return {
    nist: password.length >= 8 && !hasSequential(password),
    owasp: hasUppercase && hasLowercase && hasNumbers && hasSymbols,
    strong: password.length >= 12 && (hasUppercase || hasLowercase) && hasNumbers,
    complex: (hasUppercase ? 1 : 0) + (hasLowercase ? 1 : 0) + (hasNumbers ? 1 : 0) + (hasSymbols ? 1 : 0) >= 3,
  }
}

// Check for sequential patterns
function hasSequential(str: string): boolean {
  const patterns = ["abc", "012", "bcd", "123", "xyz", "789", "123456"]
  return patterns.some((pattern) => str.toLowerCase().includes(pattern))
}

// Generate QR code
export async function generateQRCode(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.95,
      margin: 1,
      width: 200,
    })
  } catch (err) {
    console.error("Error generating QR code:", err)
    return ""
  }
}

// Local storage helpers for password history
export interface PasswordRecord {
  id: string
  password: string
  createdAt: number
  strength: string
  length: number
}

const STORAGE_KEY = "password_history"
const MAX_HISTORY = 20

export function savePasswordToHistory(password: string, strength: string, length: number): void {
  try {
    const history = getPasswordHistory()
    const newRecord: PasswordRecord = {
      id: Date.now().toString(),
      password,
      createdAt: Date.now(),
      strength,
      length,
    }

    history.unshift(newRecord)
    if (history.length > MAX_HISTORY) {
      history.pop()
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (err) {
    console.error("Error saving to history:", err)
  }
}

export function getPasswordHistory(): PasswordRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (err) {
    console.error("Error reading history:", err)
    return []
  }
}

export function clearPasswordHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.error("Error clearing history:", err)
  }
}

export function deleteFromHistory(id: string): void {
  try {
    const history = getPasswordHistory()
    const filtered = history.filter((item) => item.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (err) {
    console.error("Error deleting from history:", err)
  }
}
