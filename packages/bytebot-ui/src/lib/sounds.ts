// System Sounds Manager
export class SoundManager {
  private static instance: SoundManager
  private audioContext: AudioContext | null = null
  private sounds: Map<string, AudioBuffer> = new Map()
  private isEnabled: boolean = true
  private volume: number = 0.5

  private constructor() {
    this.initializeAudioContext()
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager()
    }
    return SoundManager.instance
  }

  private async initializeAudioContext() {
    if (typeof window === 'undefined') return
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      await this.loadDefaultSounds()
    } catch (error) {
      console.warn('Audio context initialization failed:', error)
    }
  }

  private async loadDefaultSounds() {
    if (!this.audioContext) return

    // Generate synthetic sounds
    const soundTypes = {
      click: this.generateClickSound(),
      success: this.generateSuccessSound(),
      error: this.generateErrorSound(),
      notification: this.generateNotificationSound(),
      hover: this.generateHoverSound(),
      typing: this.generateTypingSound(),
      startup: this.generateStartupSound(),
      shutdown: this.generateShutdownSound()
    }

    for (const [name, soundData] of Object.entries(soundTypes)) {
      try {
        const buffer = this.audioContext.createBuffer(1, soundData.length, this.audioContext.sampleRate)
        buffer.copyToChannel(new Float32Array(soundData), 0)
        this.sounds.set(name, buffer)
      } catch (error) {
        console.warn(`Failed to create sound buffer for ${name}:`, error)
      }
    }
  }

  // Generate synthetic sound waveforms
  private generateClickSound(): Float32Array {
    const sampleRate = 44100
    const duration = 0.1
    const samples = Math.floor(sampleRate * duration)
    const buffer = new Float32Array(samples)

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate
      const frequency = 800 + Math.sin(t * 100) * 200
      const envelope = Math.exp(-t * 20)
      buffer[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3
    }

    return buffer
  }

  private generateSuccessSound(): Float32Array {
    const sampleRate = 44100
    const duration = 0.5
    const samples = Math.floor(sampleRate * duration)
    const buffer = new Float32Array(samples)

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate
      const frequency1 = 523.25 // C5
      const frequency2 = 659.25 // E5
      const frequency3 = 783.99 // G5
      
      const envelope = Math.exp(-t * 3)
      const note1 = Math.sin(2 * Math.PI * frequency1 * t) * envelope
      const note2 = Math.sin(2 * Math.PI * frequency2 * t) * envelope * 0.7
      const note3 = Math.sin(2 * Math.PI * frequency3 * t) * envelope * 0.5
      
      buffer[i] = (note1 + note2 + note3) * 0.2
    }

    return buffer
  }

  private generateErrorSound(): Float32Array {
    const sampleRate = 44100
    const duration = 0.3
    const samples = Math.floor(sampleRate * duration)
    const buffer = new Float32Array(samples)

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate
      const frequency = 200 + Math.sin(t * 50) * 100
      const envelope = Math.exp(-t * 8)
      buffer[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.4
    }

    return buffer
  }

  private generateNotificationSound(): Float32Array {
    const sampleRate = 44100
    const duration = 0.4
    const samples = Math.floor(sampleRate * duration)
    const buffer = new Float32Array(samples)

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate
      const frequency = 1000 + Math.sin(t * 30) * 200
      const envelope = Math.exp(-t * 5)
      buffer[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3
    }

    return buffer
  }

  private generateHoverSound(): Float32Array {
    const sampleRate = 44100
    const duration = 0.05
    const samples = Math.floor(sampleRate * duration)
    const buffer = new Float32Array(samples)

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate
      const frequency = 1200
      const envelope = Math.exp(-t * 30)
      buffer[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.1
    }

    return buffer
  }

  private generateTypingSound(): Float32Array {
    const sampleRate = 44100
    const duration = 0.08
    const samples = Math.floor(sampleRate * duration)
    const buffer = new Float32Array(samples)

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate
      const frequency = 800 + Math.random() * 400
      const envelope = Math.exp(-t * 25)
      buffer[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.15
    }

    return buffer
  }

  private generateStartupSound(): Float32Array {
    const sampleRate = 44100
    const duration = 1.0
    const samples = Math.floor(sampleRate * duration)
    const buffer = new Float32Array(samples)

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate
      const frequency = 220 + t * 200 // Rising frequency
      const envelope = Math.exp(-t * 2)
      buffer[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3
    }

    return buffer
  }

  private generateShutdownSound(): Float32Array {
    const sampleRate = 44100
    const duration = 0.8
    const samples = Math.floor(sampleRate * duration)
    const buffer = new Float32Array(samples)

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate
      const frequency = 440 - t * 200 // Falling frequency
      const envelope = Math.exp(-t * 3)
      buffer[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3
    }

    return buffer
  }

  public async playSound(soundName: string, volume: number = this.volume): Promise<void> {
    if (!this.isEnabled || !this.audioContext || !this.sounds.has(soundName)) {
      return
    }

    try {
      const buffer = this.sounds.get(soundName)!
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()

      source.buffer = buffer
      gainNode.gain.value = volume

      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      source.start()
    } catch (error) {
      console.warn(`Failed to play sound ${soundName}:`, error)
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  public getVolume(): number {
    return this.volume
  }

  public isSoundEnabled(): boolean {
    return this.isEnabled
  }

  // Convenience methods for common sounds
  public async playClick(): Promise<void> {
    await this.playSound('click', 0.3)
  }

  public async playSuccess(): Promise<void> {
    await this.playSound('success', 0.4)
  }

  public async playError(): Promise<void> {
    await this.playSound('error', 0.5)
  }

  public async playNotification(): Promise<void> {
    await this.playSound('notification', 0.4)
  }

  public async playHover(): Promise<void> {
    await this.playSound('hover', 0.2)
  }

  public async playTyping(): Promise<void> {
    await this.playSound('typing', 0.2)
  }

  public async playStartup(): Promise<void> {
    await this.playSound('startup', 0.6)
  }

  public async playShutdown(): Promise<void> {
    await this.playSound('shutdown', 0.6)
  }
}

// Export singleton instance
export const soundManager = SoundManager.getInstance()

// React hook for using sounds
export const useSounds = () => {
  // Return safe defaults during SSR
  if (typeof window === 'undefined') {
    return {
      playClick: () => {},
      playSuccess: () => {},
      playError: () => {},
      playNotification: () => {},
      playHover: () => {},
      playTyping: () => {},
      playStartup: () => {},
      playShutdown: () => {},
      setEnabled: () => {},
      setVolume: () => {},
      isEnabled: false,
      volume: 0.5
    }
  }

  return {
    playClick: () => soundManager.playClick(),
    playSuccess: () => soundManager.playSuccess(),
    playError: () => soundManager.playError(),
    playNotification: () => soundManager.playNotification(),
    playHover: () => soundManager.playHover(),
    playTyping: () => soundManager.playTyping(),
    playStartup: () => soundManager.playStartup(),
    playShutdown: () => soundManager.playShutdown(),
    setEnabled: (enabled: boolean) => soundManager.setEnabled(enabled),
    setVolume: (volume: number) => soundManager.setVolume(volume),
    isEnabled: soundManager.isSoundEnabled(),
    volume: soundManager.getVolume()
  }
}
