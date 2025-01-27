import { Injectable, computed, signal } from '@angular/core';
import { StorageService } from './storage.service';
import {
  IHabit,
  IHabitProgress,
  IHabitTag,
  DEFAULT_TAGS,
} from '../shared/interfaces/habit.interface';

@Injectable({
  providedIn: 'root',
})
export class HabitService {
  private readonly HABITS_KEY = 'habits';
  private readonly TAGS_KEY = 'habit_tags';

  private habitsSignal = signal<{ [key: string]: IHabit }>({});
  private tagsSignal = signal<IHabitTag[]>([]);
  private selectedHabitIdSignal = signal<string | null>(null);

  constructor(private storageService: StorageService) {
    this.loadInitialData();
    this.setupDailyReset();
  }

  private loadInitialData(): void {
    // Cargar hábitos
    const savedHabits = this.storageService.getItem<{ [key: string]: IHabit }>(
      this.HABITS_KEY,
    );
    if (savedHabits) {
      this.habitsSignal.set(this.cleanOldProgress(savedHabits));
    }

    // Cargar o inicializar tags
    const savedTags = this.storageService.getItem<IHabitTag[]>(this.TAGS_KEY);
    if (savedTags && savedTags.length > 0) {
      this.tagsSignal.set(savedTags);
    } else {
      // Inicializar con tags predefinidos
      const defaultTags = DEFAULT_TAGS.map((tag) => ({
        ...tag,
        id: this.generateId(),
      }));
      this.tagsSignal.set(defaultTags);
      this.persistTags();
    }
  }

  private setupDailyReset(): void {
    // Calcular el tiempo hasta la próxima medianoche
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    // Configurar el reset diario
    setTimeout(() => {
      this.resetDailyProgress();
      // Reiniciar el timer para el siguiente día
      setInterval(this.resetDailyProgress.bind(this), 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
  }

  private resetDailyProgress(): void {
    const habits = this.habitsSignal();
    const today = new Date().toISOString().split('T')[0];
    let hasChanges = false;

    const updatedHabits = { ...habits };
    Object.keys(habits).forEach((habitId) => {
      const habit = habits[habitId];
      if (!habit.progress[today]) {
        // Actualizar rachas para hábitos no completados
        const { currentStreak, bestStreak } = this.calculateStreaks(habit);
        updatedHabits[habitId] = {
          ...habit,
          currentStreak,
          bestStreak,
        };
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.habitsSignal.set(updatedHabits);
      this.persistHabits();
    }
  }

  private cleanOldProgress(habits: { [key: string]: IHabit }): {
    [key: string]: IHabit;
  } {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return Object.keys(habits).reduce(
      (acc, habitId) => {
        const habit = habits[habitId];
        const cleanedProgress = Object.entries(habit.progress).reduce(
          (progressAcc, [date, progress]) => {
            if (new Date(date) >= thirtyDaysAgo) {
              progressAcc[date] = progress;
            }
            return progressAcc;
          },
          {} as { [key: string]: IHabitProgress },
        );

        const { currentStreak, bestStreak } = this.calculateStreaks({
          ...habit,
          progress: cleanedProgress,
        });

        acc[habitId] = {
          ...habit,
          progress: cleanedProgress,
          currentStreak,
          bestStreak,
        };
        return acc;
      },
      {} as { [key: string]: IHabit },
    );
  }

  private calculateStreaks(habit: IHabit): {
    currentStreak: number;
    bestStreak: number;
  } {
    const dates = Object.entries(habit.progress)
      .filter(([_, progress]) => progress.completed)
      .map(([date]) => date)
      .sort();

    if (dates.length === 0) {
      return { currentStreak: 0, bestStreak: habit.bestStreak };
    }

    let currentStreak = 0;
    let bestStreak = habit.bestStreak;
    let tempStreak = 0;

    // Obtener la fecha actual sin hora
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
      .toISOString()
      .split('T')[0];

    // Verificar si el último día completado es hoy o ayer
    const lastCompletedDate = dates[dates.length - 1];
    if (lastCompletedDate === today || lastCompletedDate === yesterday) {
      // Contar hacia atrás desde el último día completado
      let currentDate = new Date(lastCompletedDate);
      tempStreak = 1; // Comenzar con 1 por el último día completado

      for (let i = dates.length - 2; i >= 0; i--) {
        const prevDate = new Date(dates[i]);
        const diffDays = Math.floor(
          (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (diffDays === 1) {
          tempStreak++;
          currentDate = prevDate;
        } else {
          break;
        }
      }

      currentStreak = tempStreak;
      bestStreak = Math.max(tempStreak, bestStreak);
    } else {
      // Si el último día completado no es hoy ni ayer, la racha actual es 0
      currentStreak = 0;
    }

    return { currentStreak, bestStreak };
  }

  private persistHabits(): void {
    this.storageService.setItem(this.HABITS_KEY, this.habitsSignal());
  }

  private persistTags(): void {
    this.storageService.setItem(this.TAGS_KEY, this.tagsSignal());
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  createHabit(
    habitData: Omit<
      IHabit,
      'id' | 'createdAt' | 'progress' | 'currentStreak' | 'bestStreak'
    >,
  ): void {
    const id = this.generateId();
    const newHabit: IHabit = {
      ...habitData,
      id,
      createdAt: new Date().toISOString(),
      progress: {},
      currentStreak: 0,
      bestStreak: 0,
      isActive: true,
    };

    this.habitsSignal.update((habits) => ({
      ...habits,
      [id]: newHabit,
    }));
    this.persistHabits();
  }

  updateHabit(id: string, updates: Partial<IHabit>): void {
    this.habitsSignal.update((habits) => {
      if (!habits[id]) return habits;
      return {
        ...habits,
        [id]: { ...habits[id], ...updates },
      };
    });
    this.persistHabits();
  }

  deleteHabit(id: string): void {
    this.habitsSignal.update((habits) => {
      const { [id]: _, ...rest } = habits;
      return rest;
    });
    this.persistHabits();
  }

  toggleHabitCompletion(
    habitId: string,
    date: string = new Date().toISOString().split('T')[0],
  ): void {
    this.habitsSignal.update((habits) => {
      const habit = habits[habitId];
      if (!habit) return habits;

      const progress = habit.progress[date];
      const newProgress: IHabitProgress = {
        date,
        completed: progress ? !progress.completed : true,
      };

      const updatedHabit = {
        ...habit,
        progress: {
          ...habit.progress,
          [date]: newProgress,
        },
      };

      const { currentStreak, bestStreak } = this.calculateStreaks(updatedHabit);
      updatedHabit.currentStreak = currentStreak;
      updatedHabit.bestStreak = bestStreak;

      return {
        ...habits,
        [habitId]: updatedHabit,
      };
    });
    this.persistHabits();
  }

  // Computed values
  habits = computed(() => this.habitsSignal());
  tags = computed(() => this.tagsSignal());
  selectedHabit = computed(() => {
    const habitId = this.selectedHabitIdSignal();
    return habitId ? this.habitsSignal()[habitId] : null;
  });

  // Métodos públicos para tags
  getTagById(id: string): IHabitTag | undefined {
    return this.tagsSignal().find((tag) => tag.id === id);
  }

  getTagsByType(type: IHabitTag['type']): IHabitTag[] {
    return this.tagsSignal().filter((tag) => tag.type === type);
  }

  createTag(tag: Omit<IHabitTag, 'id'>): void {
    const newTag: IHabitTag = {
      ...tag,
      id: this.generateId(),
    };
    this.tagsSignal.update((tags) => [...tags, newTag]);
    this.persistTags();
  }

  updateTag(id: string, updates: Partial<IHabitTag>): void {
    this.tagsSignal.update((tags) =>
      tags.map((tag) => (tag.id === id ? { ...tag, ...updates } : tag)),
    );
    this.persistTags();
  }

  deleteTag(tagId: string): void {
    this.tagsSignal.update((tags) => tags.filter((tag) => tag.id !== tagId));
    // También eliminar el tag de todos los hábitos que lo tengan
    this.habitsSignal.update((habits) => {
      const updatedHabits = { ...habits };
      Object.keys(updatedHabits).forEach((habitId) => {
        updatedHabits[habitId] = {
          ...updatedHabits[habitId],
          tags: updatedHabits[habitId].tags.filter((tag) => tag.id !== tagId),
        };
      });
      return updatedHabits;
    });
    this.persistTags();
    this.persistHabits();
  }

  selectHabit(id: string | null): void {
    this.selectedHabitIdSignal.set(id);
  }

  // Método público para obtener un hábito por ID
  getHabitById(id: string): IHabit | undefined {
    const habits = this.habitsSignal();
    return habits[id];
  }

  // Método para calcular el progreso diario
  calculateDailyProgress(habit: IHabit): {
    completed: number;
    remaining: number;
    percentage: number;
  } {
    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = habit.progress[today]?.completed || false;

    return {
      completed: isCompletedToday ? 1 : 0,
      remaining: isCompletedToday ? habit.targetDays - 1 : habit.targetDays,
      percentage: isCompletedToday ? (1 / habit.targetDays) * 100 : 0,
    };
  }

  clearAllHabits(): void {
    // Limpiar los signals
    this.habitsSignal.set({});
    this.tagsSignal.set([]);
    this.selectedHabitIdSignal.set(null);

    // Limpiar el almacenamiento
    this.storageService.removeItem(this.HABITS_KEY);
    this.storageService.removeItem(this.TAGS_KEY);
  }
}
