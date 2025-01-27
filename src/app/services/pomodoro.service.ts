import { Injectable, signal, computed } from '@angular/core';
import { StorageService } from './storage.service';

export interface PomodoroStats {
  completedPomodoros: number;
  totalFocusTime: number;
}

@Injectable({
  providedIn: 'root',
})
export class PomodoroService {
  private readonly POMODORO_STATS_KEY = 'pomodoro_stats';

  private statsSignal = signal<PomodoroStats>({
    completedPomodoros: 0,
    totalFocusTime: 0,
  });

  readonly stats = computed(() => this.statsSignal());

  constructor(private storageService: StorageService) {
    this.loadStats();
  }

  private loadStats() {
    const savedStats = this.storageService.getItem<PomodoroStats>(
      this.POMODORO_STATS_KEY,
    );
    if (savedStats) {
      this.statsSignal.set(savedStats);
    }
  }

  private saveStats() {
    this.storageService.setItem(this.POMODORO_STATS_KEY, this.statsSignal());
  }

  incrementCompletedPomodoros() {
    this.statsSignal.update((stats) => ({
      ...stats,
      completedPomodoros: stats.completedPomodoros + 1,
    }));
    this.saveStats();
  }

  addFocusTime(seconds: number) {
    this.statsSignal.update((stats) => ({
      ...stats,
      totalFocusTime: stats.totalFocusTime + seconds,
    }));
    this.saveStats();
  }

  getStats(): PomodoroStats {
    return this.statsSignal();
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  clearAllStats(): void {
    // Resetear el signal a valores iniciales
    this.statsSignal.set({
      completedPomodoros: 0,
      totalFocusTime: 0,
    });

    // Eliminar datos del almacenamiento
    this.storageService.removeItem(this.POMODORO_STATS_KEY);
  }
}
