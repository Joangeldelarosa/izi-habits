import { Component, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Timer as TimerIcon,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
  ChevronDown,
  Check,
  Bell,
} from 'lucide-angular';
import { PomodoroService } from '../../services/pomodoro.service';

interface TimerMode {
  id: string;
  name: string;
  duration: number;
  color: string;
}

const TIMER_MODES: TimerMode[] = [
  { id: 'pomodoro', name: 'Pomodoro', duration: 25 * 60, color: '#7F56D9' },
  {
    id: 'short-break',
    name: 'Descanso Corto',
    duration: 5 * 60,
    color: '#12B76A',
  },
  {
    id: 'long-break',
    name: 'Descanso Largo',
    duration: 15 * 60,
    color: '#F79009',
  },
];

const NOTIFICATION_SOUND = 'assets/sounds/ring.mp3';

@Component({
  selector: 'app-timer',
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="header-main">
          <h1>Pomodoro Timer</h1>
          <div class="header-actions">
            <button class="icon-btn" (click)="toggleSound()">
              <lucide-icon
                [name]="soundEnabled() ? Volume2 : VolumeX"
              ></lucide-icon>
            </button>
            <button class="icon-btn" (click)="isSettingsOpen.set(true)">
              <lucide-icon [name]="Settings"></lucide-icon>
            </button>
          </div>
        </div>
      </header>

      <div class="content-area">
        <div class="timer-card" [style.--timer-color]="currentMode().color">
          <div class="timer-progress">
            <div class="timer-content">
              <div class="timer-modes">
                @for (mode of TIMER_MODES; track mode.id) {
                  <button
                    class="mode-btn"
                    [class.active]="currentMode().id === mode.id"
                    (click)="changeMode(mode)"
                    [disabled]="isRunning()"
                  >
                    {{ mode.name }}
                  </button>
                }
              </div>

              <div class="timer-display">
                <span class="time">{{ formattedTime() }}</span>
                <div class="timer-controls">
                  <button
                    class="control-btn"
                    [class.alarm-active]="isAlarmSounding()"
                    (click)="isAlarmSounding() ? stopAlarm() : toggleTimer()"
                  >
                    <lucide-icon
                      [name]="getButtonIcon()"
                      [class.alarm-icon-animation]="isAlarmSounding()"
                    ></lucide-icon>
                  </button>
                  @if (!isAlarmSounding()) {
                    <button
                      class="control-btn secondary"
                      (click)="resetTimer()"
                      [disabled]="!canReset()"
                    >
                      <lucide-icon [name]="RotateCcw"></lucide-icon>
                    </button>
                  }
                </div>
              </div>

              <div class="timer-stats">
                <div class="stat">
                  <span class="label">Pomodoros Completados</span>
                  <span class="value">{{ completedPomodoros() }}</span>
                </div>
                <div class="stat">
                  <span class="label">Tiempo Total</span>
                  <span class="value">{{ totalTimeFormatted() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    @if (isSettingsOpen()) {
      <div class="settings-overlay" (click)="isSettingsOpen.set(false)">
        <div class="settings-panel" (click)="$event.stopPropagation()">
          <div class="settings-header">
            <h2>Configuración</h2>
            <button class="close-btn" (click)="isSettingsOpen.set(false)">
              <lucide-icon [name]="ChevronDown"></lucide-icon>
            </button>
          </div>

          <div class="settings-content">
            <div class="setting-group">
              <h3>Duración (minutos)</h3>
              @for (mode of TIMER_MODES; track mode.id) {
                <div class="setting-item">
                  <label>{{ mode.name }}</label>
                  <input
                    type="number"
                    [value]="mode.duration / 60"
                    (change)="updateModeDuration(mode.id, $event)"
                    min="1"
                    max="60"
                  />
                </div>
              }
            </div>

            <div class="setting-group">
              <h3>Notificaciones</h3>
              <div class="setting-item">
                <label>Sonido al finalizar</label>
                <button
                  class="toggle-btn"
                  [class.active]="soundEnabled()"
                  (click)="toggleSound()"
                >
                  <div class="toggle-thumb">
                    <lucide-icon
                      [name]="Check"
                      *ngIf="soundEnabled()"
                    ></lucide-icon>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
    .page-container
      padding: 24px
      max-width: 800px
      margin: 0 auto

    .page-header
      margin-bottom: 32px
      
      .header-main
        display: flex
        justify-content: space-between
        align-items: center
        margin-bottom: 16px
        
        h1
          font-size: 24px
          font-weight: 600
          color: #101828
          margin: 0
          letter-spacing: -0.02em

        .header-actions
          display: flex
          gap: 12px

          .icon-btn
            background: none
            border: none
            color: #667085
            padding: 8px
            border-radius: 8px
            cursor: pointer
            transition: all 0.3s ease
            
            &:hover
              background: #F9FAFB
              color: #101828

    .timer-card
      background: white
      border-radius: 24px
      padding: 4px
      box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1)
      --timer-color: #7F56D9

      .timer-progress
        background: linear-gradient(135deg, var(--timer-color) 0%, rgba(127, 86, 217, 0.1) 100%)
        border-radius: 20px
        padding: 40px

      .timer-content
        display: flex
        flex-direction: column
        align-items: center
        gap: 32px

      .timer-modes
        display: flex
        justify-content: center
        gap: 12px
        width: 100%
        max-width: 480px

        .mode-btn
          flex: 1
          padding: 12px 20px
          border: 1px solid rgba(255, 255, 255, 0.2)
          border-radius: 12px
          background: rgba(255, 255, 255, 0.1)
          color: white
          font-size: 14px
          font-weight: 500
          cursor: pointer
          transition: all 0.3s ease
          
          &:hover:not(:disabled)
            background: rgba(255, 255, 255, 0.2)
          
          &.active
            background: white
            border-color: white
            color: var(--timer-color)
            font-weight: 600

          &:disabled
            opacity: 0.5
            cursor: not-allowed

      .timer-display
        text-align: center
        
        .time
          font-size: 96px
          font-weight: 600
          color: white
          font-family: monospace
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)
          display: block
          margin-bottom: 24px
          letter-spacing: -0.02em

      .timer-controls
        display: flex
        justify-content: center
        gap: 16px
        margin-top: 24px

      .control-btn
        background: white
        color: var(--timer-color)
        border: none
        border-radius: 50%
        width: 64px
        height: 64px
        display: flex
        align-items: center
        justify-content: center
        cursor: pointer
        transition: all 0.3s ease
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)
        
        &:hover:not(:disabled)
          transform: translateY(-2px)
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15)

        &.alarm-active
          color: #DC2626
          
          &:hover
            color: #B91C1C

        .alarm-icon-animation
          animation: ringBell 0.5s ease infinite
          transform-origin: top

      &.secondary
        background: rgba(255, 255, 255, 0.2)
        color: white
        width: 48px
        height: 48px

      &:disabled
        opacity: 0.5
        cursor: not-allowed
        transform: none

      .timer-stats
        display: flex
        gap: 32px
        margin-top: 16px

        .stat
          text-align: center
          color: white

          .label
            font-size: 14px
            opacity: 0.8
            display: block
            margin-bottom: 4px

          .value
            font-size: 24px
            font-weight: 600

    .settings-overlay
      position: fixed
      inset: 0
      background: rgba(16, 24, 40, 0.4)
      backdrop-filter: blur(4px)
      display: flex
      align-items: flex-end
      z-index: 100
      animation: fadeIn 0.3s ease

    .settings-panel
      background: white
      border-radius: 24px 24px 0 0
      width: 100%
      max-height: 80vh
      overflow-y: auto
      padding: 24px
      animation: slideUp 0.3s ease

      .settings-header
        display: flex
        justify-content: space-between
        align-items: center
        margin-bottom: 24px

        h2
          font-size: 20px
          font-weight: 600
          color: #101828
          margin: 0

        .close-btn
          background: none
          border: none
          color: #667085
          padding: 8px
          cursor: pointer
          border-radius: 8px
          transition: all 0.3s ease

          &:hover
            background: #F9FAFB
            color: #101828

      .settings-content
        display: flex
        flex-direction: column
        gap: 32px

      .setting-group
        h3
          font-size: 16px
          font-weight: 600
          color: #101828
          margin: 0 0 16px

      .setting-item
        display: flex
        justify-content: space-between
        align-items: center
        margin-bottom: 16px

        label
          font-size: 14px
          color: #344054

        input[type="number"]
          width: 80px
          padding: 8px 12px
          border: 1px solid #E4E7EC
          border-radius: 8px
          font-size: 14px
          color: #101828
          
          &:focus
            outline: none
            border-color: #7F56D9
            box-shadow: 0 0 0 4px rgba(127, 86, 217, 0.1)

        .toggle-btn
          background: #F2F4F7
          border: 1px solid #E4E7EC
          border-radius: 16px
          width: 44px
          height: 24px
          padding: 2px
          cursor: pointer
          transition: all 0.3s ease
          position: relative
          
          &.active
            background: #7F56D9
            border-color: #7F56D9

            .toggle-thumb
              transform: translateX(20px)
              background: white
              color: #7F56D9

          .toggle-thumb
            width: 18px
            height: 18px
            background: white
            border-radius: 50%
            display: flex
            align-items: center
            justify-content: center
            transition: all 0.3s ease
            box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1)

            lucide-icon
              width: 12px
              height: 12px

    @keyframes fadeIn
      from
        opacity: 0
      to
        opacity: 1

    @keyframes slideUp
      from
        transform: translateY(100%)
      to
        transform: translateY(0)

    @media (max-width: 640px)
      .timer-card
        .timer-progress
          padding: 24px

        .timer-display
          .time
            font-size: 72px

        .timer-modes
          .mode-btn
            padding: 8px 16px
            font-size: 13px

        .timer-stats
          flex-direction: column
          gap: 16px

    .alarm-btn
      background: #DC2626 !important
      color: white !important
      width: auto !important
      padding: 0 24px
      gap: 8px
      animation: pulse 1s infinite

    @keyframes pulse
      0%
        transform: scale(1)
      50%
        transform: scale(1.05)
      100%
        transform: scale(1)

    @keyframes ringBell
      0%
        transform: rotate(-10deg)
      50%
        transform: rotate(10deg)
      100%
        transform: rotate(-10deg)
  `,
  ],
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
})
export class TimerComponent {
  // Constants
  protected readonly TIMER_MODES = TIMER_MODES;
  protected readonly Play = Play;
  protected readonly Pause = Pause;
  protected readonly RotateCcw = RotateCcw;
  protected readonly Settings = Settings;
  protected readonly Volume2 = Volume2;
  protected readonly VolumeX = VolumeX;
  protected readonly ChevronDown = ChevronDown;
  protected readonly Check = Check;
  protected readonly Bell = Bell;

  // State
  private currentModeId = signal<string>('pomodoro');
  private timeLeft = signal<number>(TIMER_MODES[0].duration);
  readonly isRunning = signal(false);
  readonly completedPomodoros = signal(0);
  private totalTime = signal(0);
  private intervalId: number | null = null;
  private audio = new Audio(NOTIFICATION_SOUND);
  readonly isAlarmSounding = signal(false);

  // UI State
  isSettingsOpen = signal(false);
  soundEnabled = signal(true);

  // Computed values
  currentMode = computed(() => {
    return (
      TIMER_MODES.find((mode) => mode.id === this.currentModeId()) ||
      TIMER_MODES[0]
    );
  });

  formattedTime = computed(() => {
    const minutes = Math.floor(this.timeLeft() / 60);
    const seconds = this.timeLeft() % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  totalTimeFormatted = computed(() => {
    const hours = Math.floor(this.totalTime() / 3600);
    const minutes = Math.floor((this.totalTime() % 3600) / 60);
    return `${hours}h ${minutes}m`;
  });

  progressGradient = computed(() => {
    const progress = (this.timeLeft() / this.currentMode().duration) * 100;
    const color = this.currentMode().color;
    return `linear-gradient(135deg, ${color} 0%, ${color}40 ${progress}%, ${color}10 100%)`;
  });

  canReset = computed(() => {
    return this.timeLeft() < this.currentMode().duration || this.isRunning();
  });

  constructor(private pomodoroService: PomodoroService) {
    console.log('Inicializando audio con ruta:', NOTIFICATION_SOUND);
    this.audio = new Audio(NOTIFICATION_SOUND);
    this.audio.loop = true;

    // Verificar que el audio se cargó correctamente
    this.audio.addEventListener('canplaythrough', () => {
      console.log('Audio cargado y listo para reproducir');
    });

    this.audio.addEventListener('error', (e) => {
      console.error('Error cargando el audio:', e);
    });

    // Precargar el audio
    this.audio.load();
    this.loadSettings();

    // Cargar estadísticas del Pomodoro
    const stats = this.pomodoroService.getStats();
    this.completedPomodoros.set(stats.completedPomodoros);
    this.totalTime.set(stats.totalFocusTime);
  }

  private loadSettings() {
    const savedSound = localStorage.getItem('pomodoroSound');
    if (savedSound !== null) {
      this.soundEnabled.set(savedSound === 'true');
    }

    // Cargar duraciones personalizadas
    TIMER_MODES.forEach((mode) => {
      const savedDuration = localStorage.getItem(
        `pomodoro_${mode.id}_duration`,
      );
      if (savedDuration) {
        mode.duration = parseInt(savedDuration);
        if (mode.id === this.currentModeId()) {
          this.timeLeft.set(parseInt(savedDuration));
        }
      }
    });
  }

  private saveStats() {
    localStorage.setItem(
      'completedPomodoros',
      this.completedPomodoros().toString(),
    );
    localStorage.setItem('totalTime', this.totalTime().toString());
  }

  changeMode(mode: TimerMode) {
    if (this.isRunning()) return;
    this.currentModeId.set(mode.id);
    this.timeLeft.set(mode.duration);
  }

  toggleTimer() {
    if (this.isRunning()) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  private startTimer() {
    this.isRunning.set(true);
    this.intervalId = window.setInterval(() => {
      this.timeLeft.update((t) => {
        if (t <= 1) {
          this.onTimerComplete();
          return 0;
        }
        return t - 1;
      });
      this.totalTime.update((t) => {
        const newValue = t + 1;
        this.pomodoroService.addFocusTime(1);
        return newValue;
      });
    }, 1000);
  }

  private pauseTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning.set(false);
  }

  resetTimer() {
    this.pauseTimer();
    this.timeLeft.set(this.currentMode().duration);
  }

  private onTimerComplete() {
    this.pauseTimer();
    if (this.currentMode().id === 'pomodoro') {
      this.completedPomodoros.update((p) => {
        const newValue = p + 1;
        this.pomodoroService.incrementCompletedPomodoros();
        return newValue;
      });
    }

    if (this.soundEnabled()) {
      this.audio.play();
      this.isAlarmSounding.set(true);
    }

    if (Notification.permission === 'granted') {
      new Notification('Timer Completado', {
        body: `${this.currentMode().name} ha terminado!`,
        icon: '/public/icons/icon-192x192.png',
      });
    }
  }

  stopAlarm() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isAlarmSounding.set(false);
    this.resetTimer();
  }

  toggleSound() {
    this.soundEnabled.update((v) => !v);
    localStorage.setItem('pomodoroSound', this.soundEnabled().toString());
  }

  updateModeDuration(modeId: string, event: Event) {
    const minutes = parseInt((event.target as HTMLInputElement).value);
    if (isNaN(minutes) || minutes < 1 || minutes > 60) return;

    const mode = TIMER_MODES.find((m) => m.id === modeId);
    if (mode) {
      mode.duration = minutes * 60;
      localStorage.setItem(
        `pomodoro_${modeId}_duration`,
        (minutes * 60).toString(),
      );

      if (this.currentMode().id === modeId && !this.isRunning()) {
        this.timeLeft.set(mode.duration);
      }
    }
  }

  getButtonIcon() {
    if (this.isAlarmSounding()) {
      return Bell;
    }
    return this.isRunning() ? Pause : Play;
  }
}
