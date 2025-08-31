import crypto from "crypto"

const ALGO = "aes-256-cbc"
const KEY = process.env.QR_ENCRYPTION_KEY
const IV_LENGTH = 16

export async function encryptJSON(obj) {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGO, Buffer.from(KEY, "hex"), iv)
  let encrypted = cipher.update(JSON.stringify(obj))
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString("hex") + ":" + encrypted.toString("hex")
}

export async function decryptJSON(str) {
  const [ivHex, encryptedHex] = str.split(":")
  const iv = Buffer.from(ivHex, "hex")
  const encryptedText = Buffer.from(encryptedHex, "hex")
  const decipher = crypto.createDecipheriv(ALGO, Buffer.from(KEY, "hex"), iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return JSON.parse(decrypted.toString())
}
