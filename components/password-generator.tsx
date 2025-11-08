"use client"

import { useState, useEffect, useCallback } from "react"
import { Copy, RotateCcw, Eye, EyeOff, Download, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip } from "@/components/tooltip"
import {
  generatePassword,
  generatePassphrase,
  analyzePasswordStrength,
  checkCompliance,
  generateQRCode,
  savePasswordToHistory,
  getPasswordHistory,
  clearPasswordHistory,
  deleteFromHistory,
  getCharsetSize,
  type PasswordRecord,
} from "@/lib/password-utils"

export default function PasswordGenerator() {
  const [password, setPassword] = useState("")
  const [length, setLength] = useState(16)
  const [useUppercase, setUseUppercase] = useState(true)
  const [useLowercase, setUseLowercase] = useState(true)
  const [useNumbers, setUseNumbers] = useState(true)
  const [useSymbols, setUseSymbols] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  const [mode, setMode] = useState<"password" | "passphrase">("password")
  const [wordCount, setWordCount] = useState(4)
  const [excludeConfusing, setExcludeConfusing] = useState(false)
  const [excludeUnsafeSymbols, setExcludeUnsafeSymbols] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [qrCode, setQrCode] = useState<string>("")
  const [showQR, setShowQR] = useState(false)
  const [clipboardTimer, setClipboardTimer] = useState<number | null>(null)
  const [history, setHistory] = useState<PasswordRecord[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    setHistory(getPasswordHistory())
  }, [])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "g") {
        e.preventDefault()
        generatePasswordHandler()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && password) {
        e.preventDefault()
        copyToClipboard()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "r") {
        e.preventDefault()
        handleReset()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [password])

  useEffect(() => {
    return () => {
      if (clipboardTimer) clearTimeout(clipboardTimer)
    }
  }, [clipboardTimer])

  const generatePasswordHandler = useCallback(() => {
    if (!useUppercase && !useLowercase && !useNumbers && !useSymbols) {
      setError("Selecciona al menos una categoría")
      return
    }

    setError("")

    try {
      let newPassword: string

      if (mode === "passphrase") {
        newPassword = generatePassphrase(wordCount)
      } else {
        newPassword = generatePassword(length, {
          uppercase: useUppercase,
          lowercase: useLowercase,
          numbers: useNumbers,
          symbols: useSymbols,
          excludeConfusing,
          excludeUnsafeSymbols,
        })
      }

      setPassword(newPassword)
      setCopied(false)
      setShowQR(false)

      const charsetSize = getCharsetSize({
        uppercase: useUppercase,
        lowercase: useLowercase,
        numbers: useNumbers,
        symbols: useSymbols,
        excludeConfusing,
        excludeUnsafeSymbols,
      })

      const strength = analyzePasswordStrength(newPassword, charsetSize)
      savePasswordToHistory(newPassword, strength.strength, newPassword.length)
      setHistory(getPasswordHistory())
    } catch (err) {
      setError("Error generando contraseña")
    }
  }, [
    mode,
    length,
    wordCount,
    useUppercase,
    useLowercase,
    useNumbers,
    useSymbols,
    excludeConfusing,
    excludeUnsafeSymbols,
  ])

  const copyToClipboard = async () => {
    if (!password) return

    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)

      if (clipboardTimer) clearTimeout(clipboardTimer)
      const timer = window.setTimeout(() => {
        navigator.clipboard.writeText("")
        setCopied(false)
        setClipboardTimer(null)
      }, 30000)

      setClipboardTimer(timer)

      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setError("Error al copiar")
    }
  }

  const handleDownloadQR = async () => {
    if (!password) return

    try {
      const qr = await generateQRCode(password)
      setQrCode(qr)
      setShowQR(true)

      if (qr) {
        const link = document.createElement("a")
        link.href = qr
        link.download = `password-qr-${Date.now()}.png`
        link.click()
      }
    } catch (err) {
      setError("Error generando QR")
    }
  }

  const handleDeleteFromHistory = (id: string) => {
    deleteFromHistory(id)
    setHistory(getPasswordHistory())
  }

  const handleClearHistory = () => {
    if (window.confirm("¿Borrar todo el historial?")) {
      clearPasswordHistory()
      setHistory([])
    }
  }

  const handleReset = () => {
    setPassword("")
    setLength(16)
    setUseUppercase(true)
    setUseLowercase(true)
    setUseNumbers(true)
    setUseSymbols(true)
    setError("")
    setCopied(false)
    setShowQR(false)
    setShowPassword(false)
    if (clipboardTimer) clearTimeout(clipboardTimer)
  }

  const charsetSize = getCharsetSize({
    uppercase: useUppercase,
    lowercase: useLowercase,
    numbers: useNumbers,
    symbols: useSymbols,
    excludeConfusing,
    excludeUnsafeSymbols,
  })

  const passwordAnalysis = password ? analyzePasswordStrength(password, charsetSize) : null
  const compliance = password
    ? checkCompliance(password, {
        uppercase: useUppercase,
        lowercase: useLowercase,
        numbers: useNumbers,
        symbols: useSymbols,
      })
    : null

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50 backdrop-blur-sm">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Generador de Contraseñas</h1>
          <p className="text-muted-foreground text-sm">Crea contraseñas seguras y personalizadas</p>
        </div>

        {/* Mode Selector */}
        <div className="mb-6 flex gap-2">
          <Button
            onClick={() => setMode("password")}
            variant={mode === "password" ? "default" : "outline"}
            className={mode === "password" ? "bg-primary hover:bg-primary/90" : ""}
          >
            Contraseña
          </Button>
          <Button
            onClick={() => setMode("passphrase")}
            variant={mode === "passphrase" ? "default" : "outline"}
            className={mode === "passphrase" ? "bg-primary hover:bg-primary/90" : ""}
          >
            Frase
          </Button>
        </div>

        {/* Password Display */}
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                readOnly
                placeholder="Tu contraseña aparecerá aquí"
                className="bg-secondary/20 border-secondary/30 text-foreground placeholder:text-muted-foreground/50 font-mono text-sm pr-10"
              />
              {password && (
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  title={showPassword ? "Ocultar" : "Mostrar"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )}
            </div>
            <Button
              onClick={copyToClipboard}
              disabled={!password}
              variant="outline"
              size="icon"
              className="bg-primary hover:bg-primary/90 text-primary-foreground border-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          {copied && (
            <p className="text-xs text-primary animate-pulse">
              ✓ Copiado • Se borrará del portapapeles en 30 segundos
              <Tooltip content="Es donde se guarda temporalmente lo que copias para pegarlo después." />
            </p>
          )}
        </div>

        {/* Mode-specific controls */}
        {mode === "password" ? (
          <>
            {/* Length Slider */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <label className="text-sm font-semibold text-foreground">
                  Longitud: <span className="text-primary ml-1">{length}</span> caracteres
                </label>
                <Tooltip content="Cuantos más caracteres, más segura será la contraseña." />
              </div>
              <input
                type="range"
                min="8"
                max="32"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full h-2 bg-secondary/30 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>8</span>
                <span>32</span>
              </div>
            </div>

            {/* Character Options */}
            <div className="mb-8 space-y-3">
              <label className="block text-sm font-semibold text-foreground mb-4">Incluir caracteres</label>

              {[
                {
                  id: "uppercase",
                  label: "Mayúsculas",
                  hint: "(A-Z)",
                  value: useUppercase,
                  onChange: setUseUppercase,
                  tooltip: "Usar ambas hace la contraseña más compleja.",
                },
                {
                  id: "lowercase",
                  label: "Minúsculas",
                  hint: "(a-z)",
                  value: useLowercase,
                  onChange: setUseLowercase,
                  tooltip: "Usar ambas hace la contraseña más compleja.",
                },
                {
                  id: "numbers",
                  label: "Números",
                  hint: "(0-9)",
                  value: useNumbers,
                  onChange: setUseNumbers,
                  tooltip: "Números que aumentan la complejidad de la contraseña.",
                },
                {
                  id: "symbols",
                  label: "Símbolos",
                  hint: "(!@#$%...)",
                  value: useSymbols,
                  onChange: setUseSymbols,
                  tooltip: "Caracteres especiales como @, #, $, % que aumentan la seguridad.",
                },
              ].map((option) => (
                <div
                  key={option.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/10 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    id={option.id}
                    checked={option.value}
                    onChange={(e) => {
                      option.onChange(e.target.checked)
                      setError("")
                    }}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                  <label
                    htmlFor={option.id}
                    className="cursor-pointer flex-1 text-sm font-medium flex items-center gap-1"
                  >
                    {option.label} <span className="text-muted-foreground">{option.hint}</span>
                  </label>
                  <Tooltip content={option.tooltip} />
                </div>
              ))}
            </div>

            {/* Advanced Options */}
            <div className="mb-8">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm font-semibold text-primary hover:underline"
              >
                {showAdvanced ? "▼" : "▶"} Opciones avanzadas
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-3 p-4 bg-secondary/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="confusing"
                      checked={excludeConfusing}
                      onChange={(e) => setExcludeConfusing(e.target.checked)}
                      className="w-4 h-4 rounded accent-primary cursor-pointer"
                    />
                    <label htmlFor="confusing" className="cursor-pointer flex-1 text-sm flex items-center gap-2">
                      Excluir caracteres confusos <span className="text-muted-foreground">(0/O, l/1, etc)</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="unsafe"
                      checked={excludeUnsafeSymbols}
                      onChange={(e) => setExcludeUnsafeSymbols(e.target.checked)}
                      className="w-4 h-4 rounded accent-primary cursor-pointer"
                    />
                    <label htmlFor="unsafe" className="cursor-pointer flex-1 text-sm flex items-center gap-2">
                      Solo símbolos seguros <span className="text-muted-foreground">(válidos en formularios)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Passphrase options */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <label className="text-sm font-semibold text-foreground">
                  Palabras: <span className="text-primary ml-1">{wordCount}</span>
                </label>
                <Tooltip content="Más palabras crean una frase más larga y segura, fácil de recordar." />
              </div>
              <input
                type="range"
                min="3"
                max="7"
                value={wordCount}
                onChange={(e) => setWordCount(Number(e.target.value))}
                className="w-full h-2 bg-secondary/30 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <p className="text-xs text-muted-foreground mt-2">Más palabras = más segura</p>
            </div>
          </>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 mb-8">
          <Button
            onClick={generatePasswordHandler}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 rounded-lg"
            title="Ctrl+G"
          >
            Generar
          </Button>
          <Button
            onClick={handleDownloadQR}
            disabled={!password}
            variant="outline"
            size="icon"
            className="h-11 w-11 bg-transparent"
            title="Descargar QR"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="icon"
            className="h-11 w-11 bg-transparent"
            title="Ctrl+R"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Password Strength Info */}
        {password && passwordAnalysis && (
          <div className="mb-8 space-y-4">
            {/* Entropy */}
            <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs font-semibold text-foreground">Análisis de seguridad</p>
                <Tooltip content="Información sobre la fortaleza y seguridad de tu contraseña." />
              </div>
              <div className="text-xs text-muted-foreground space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>Entropía</span>
                    <Tooltip content="Mide lo impredecible que es una contraseña. Cuanta más entropía, más difícil de adivinar." />
                  </div>
                  <span className="text-primary font-semibold">{passwordAnalysis.entropy} bits</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>Fortaleza</span>
                    <Tooltip content="Indica qué tan segura es tu contraseña frente a ataques comunes." />
                  </div>
                  <span
                    className={`font-semibold ${
                      passwordAnalysis.strength === "very-strong"
                        ? "text-green-600"
                        : passwordAnalysis.strength === "strong"
                          ? "text-blue-600"
                          : passwordAnalysis.strength === "good"
                            ? "text-accent"
                            : "text-orange-600"
                    }`}
                  >
                    {passwordAnalysis.strength === "very-strong"
                      ? "Muy fuerte"
                      : passwordAnalysis.strength === "strong"
                        ? "Fuerte"
                        : passwordAnalysis.strength === "good"
                          ? "Buena"
                          : passwordAnalysis.strength === "fair"
                            ? "Aceptable"
                            : "Débil"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tiempo de crackeo:</span>
                  <span className="text-primary font-semibold">{passwordAnalysis.crackTime}</span>
                </div>
              </div>
            </div>

            {/* Compliance */}
            {compliance && (
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-xs font-semibold text-foreground">Cumplimiento de criterios</p>
                  <Tooltip content="Badges que indican si tu contraseña cumple con estándares de seguridad reconocidos (NIST, OWASP)." />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "NIST", value: compliance.nist },
                    { name: "OWASP", value: compliance.owasp },
                    { name: "Fuerte", value: compliance.strong },
                    { name: "Compleja", value: compliance.complex },
                  ].map((badge) => (
                    <div
                      key={badge.name}
                      className={`text-xs font-medium px-2 py-1 rounded text-center ${
                        badge.value
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {badge.value ? "✓" : "✗"} {badge.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generación Local Notice */}
        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-center gap-2">
          <span className="text-primary text-sm font-semibold">Generación local</span>
          <Tooltip content="Tu contraseña se crea solo en tu navegador. No se envía a ningún servidor." />
        </div>

        {/* History */}
        <div className="border-t border-border/50 pt-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary mb-4"
          >
            {showHistory ? "▼" : "▶"} Historial ({history.length})
          </button>

          {showHistory && history.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-3 bg-secondary/10 rounded-lg text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <code className="block truncate font-mono text-xs">{item.password}</code>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(item.createdAt).toLocaleTimeString()} • {item.strength}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteFromHistory(item.id)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              {history.length > 0 && (
                <Button onClick={handleClearHistory} variant="outline" className="w-full text-xs mt-3 bg-transparent">
                  Borrar todo
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 text-xs text-muted-foreground space-y-1">
        <p>Seguridad garantizada • Generado localmente • Sin almacenamiento en la nube</p>
        <p className="text-xs">Atajos: Ctrl+G (generar) • Ctrl+C (copiar) • Ctrl+R (reset)</p>
      </div>
    </div>
  )
}
