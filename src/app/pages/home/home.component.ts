import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  Timer,
  CheckCircle2,
  TrendingUp,
  Star,
  ChevronRight,
} from 'lucide-angular';
import { HabitService } from '../../services/habit.service';
import { UserService } from '../../services/user.service';
import { PomodoroService } from '../../services/pomodoro.service';
import { IUser } from '../../shared/interfaces/user.interface';
import { UserAvatarComponent } from '../../shared/components/atoms/user-avatar/user-avatar.component';
import { IHabit } from '../../shared/interfaces/habit.interface';

interface ActivitySummary {
  completedPomodoros: number;
  totalFocusTime: number;
  activeHabits: number;
  completedToday: number;
  currentStreak: number;
  bestStreak: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UserAvatarComponent],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="header-main">
          <div class="user-info">
            <app-user-avatar [size]="48"></app-user-avatar>
            <div class="user-welcome">
              <span class="greeting">¡Hola!</span>
              <h1>{{ userName() }}</h1>
            </div>
          </div>
        </div>
      </header>

      <div class="content-area">
        <div class="summary-cards">
          <!-- Pomodoro Card -->
          <div class="card pomodoro-card" (click)="router.navigate(['/timer'])">
            <div class="card-content">
              <div class="card-header">
                <lucide-icon [name]="Timer"></lucide-icon>
                <h2>Pomodoro</h2>
              </div>
              <div class="stats">
                <div class="stat">
                  <span class="value">{{ summary().completedPomodoros }}</span>
                  <span class="label">Completados</span>
                </div>
                <div class="stat">
                  <span class="value">{{
                    formatTime(summary().totalFocusTime)
                  }}</span>
                  <span class="label">Tiempo Total</span>
                </div>
              </div>
            </div>
            <lucide-icon class="arrow" [name]="ChevronRight"></lucide-icon>
          </div>

          <!-- Habits Card -->
          <div class="card habits-card" (click)="router.navigate(['/habits'])">
            <div class="card-content">
              <div class="card-header">
                <lucide-icon [name]="CheckCircle2"></lucide-icon>
                <h2>Hábitos</h2>
              </div>
              <div class="stats">
                <div class="stat">
                  <span class="value">{{ summary().activeHabits }}</span>
                  <span class="label">Activos</span>
                </div>
                <div class="stat">
                  <span class="value">{{ summary().completedToday }}</span>
                  <span class="label">Hoy</span>
                </div>
              </div>
            </div>
            <lucide-icon class="arrow" [name]="ChevronRight"></lucide-icon>
          </div>

          <!-- Streaks Card -->
          <div class="card streaks-card">
            <div class="card-content">
              <div class="card-header">
                <lucide-icon [name]="TrendingUp"></lucide-icon>
                <h2>Rachas</h2>
              </div>
              <div class="stats">
                <div class="stat">
                  <span class="value">{{ summary().currentStreak }}</span>
                  <span class="label">Actual</span>
                </div>
                <div class="stat">
                  <span class="value">{{ summary().bestStreak }}</span>
                  <span class="label">Mejor</span>
                </div>
              </div>
            </div>
            @if (summary().currentStreak > 0) {
              <div class="streak-badge">
                <lucide-icon [name]="Star" [size]="16"></lucide-icon>
                {{ summary().currentStreak }}d
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container
        padding: clamp(16px, 5vw, 24px)
        max-width: min(1200px, 90vw)
        margin: 0 auto
        width: 100%

        @media (max-width: 480px)
          padding: 16px

      .page-header
        margin-bottom: clamp(24px, 5vh, 32px)
        
        .header-main
          .user-info
            display: flex
            align-items: center
            gap: clamp(12px, 3vw, 16px)

            .user-welcome
              .greeting
                color: #667085
                font-size: clamp(12px, 3vw, 14px)
              
              h1
                color: #101828
                font-size: clamp(20px, 5vw, 24px)
                font-weight: 600
                margin: 0
                letter-spacing: -0.02em

      .summary-cards
        display: grid
        gap: clamp(16px, 4vw, 24px)
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr))

        @media (min-width: 1024px)
          grid-template-columns: repeat(3, 1fr)

        .card
          background: white
          border-radius: clamp(12px, 2vw, 16px)
          padding: clamp(20px, 4vw, 24px)
          box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1)
          cursor: pointer
          transition: all 0.3s ease
          display: flex
          align-items: center
          gap: clamp(12px, 3vw, 16px)
          min-height: clamp(140px, 20vh, 160px)
          
          &:hover
            transform: translateY(-2px)
            box-shadow: 0 4px 8px rgba(16, 24, 40, 0.12)

          .card-content
            flex: 1

          .card-header
            display: flex
            align-items: center
            gap: clamp(8px, 2vw, 12px)
            margin-bottom: clamp(12px, 3vw, 16px)

            lucide-icon
              width: clamp(20px, 5vw, 24px)
              height: clamp(20px, 5vw, 24px)
              color: #7F56D9

            h2
              margin: 0
              font-size: clamp(14px, 4vw, 16px)
              font-weight: 600
              color: #101828

          .stats
            display: flex
            gap: clamp(16px, 4vw, 24px)

            .stat
              .value
                display: block
                font-size: clamp(20px, 5vw, 24px)
                font-weight: 600
                color: #101828
                line-height: 1.2

              .label
                font-size: clamp(12px, 3vw, 14px)
                color: #667085

          .arrow
            color: #667085
            width: clamp(16px, 4vw, 20px)
            height: clamp(16px, 4vw, 20px)

          &.pomodoro-card
            border-left: 4px solid #7F56D9

          &.habits-card
            border-left: 4px solid #12B76A

          &.streaks-card
            border-left: 4px solid #F79009
            position: relative

            .streak-badge
              position: absolute
              top: -8px
              right: 16px
              background: #F79009
              color: white
              padding: 4px 8px
              border-radius: 12px
              font-size: 12px
              font-weight: 600
              display: flex
              align-items: center
              gap: 4px
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)

              lucide-icon
                width: 14px
                height: 14px

              @media (max-width: 480px)
                top: -6px
                right: 12px
                padding: 3px 6px
                font-size: 10px
                border-radius: 8px

                lucide-icon
                  width: 12px
                  height: 12px
    `,
  ],
})
export class HomeComponent {
  // Icons
  protected readonly Timer = Timer;
  protected readonly CheckCircle2 = CheckCircle2;
  protected readonly TrendingUp = TrendingUp;
  protected readonly Star = Star;
  protected readonly ChevronRight = ChevronRight;

  private habitService = inject(HabitService);
  private userService = inject(UserService);
  private pomodoroService = inject(PomodoroService);
  protected router = inject(Router);

  private readonly activitySummarySignal = signal<ActivitySummary>({
    completedPomodoros: 0,
    totalFocusTime: 0,
    activeHabits: 0,
    completedToday: 0,
    currentStreak: 0,
    bestStreak: 0,
  });

  readonly activitySummary = computed(() => {
    const habits = Object.values(this.habitService.habits());
    const today = new Date().toISOString().split('T')[0];

    const activeHabits = habits.filter((habit) => habit.isActive).length;
    const completedToday = habits.filter(
      (habit) => habit.progress[today]?.completed,
    ).length;

    const stats = this.pomodoroService.getStats();

    // Si no hay hábitos, las rachas son 0
    const streaks =
      habits.length > 0
        ? {
            currentStreak: Math.max(...habits.map((h) => h.currentStreak)),
            bestStreak: Math.max(...habits.map((h) => h.bestStreak)),
          }
        : { currentStreak: 0, bestStreak: 0 };

    return {
      completedPomodoros: stats.completedPomodoros,
      totalFocusTime: stats.totalFocusTime,
      activeHabits,
      completedToday,
      ...streaks,
    };
  });

  readonly summary = computed(() => this.activitySummary());
  readonly userName = computed(() => {
    const user = this.userService.user();
    return user?.name || 'Usuario';
  });

  constructor() {
    this.loadSummary();
  }

  private loadSummary(): void {
    const pomodoroStats = this.pomodoroService.getStats();
    const habits = Object.values(this.habitService.habits()) as IHabit[];
    const today = new Date().toISOString().split('T')[0];

    const activeHabits = habits.filter(
      (habit: IHabit) => habit.isActive,
    ).length;
    const completedToday = habits.filter(
      (habit: IHabit) => habit.progress[today]?.completed,
    ).length;
    const currentStreak = Math.max(
      ...habits.map((h: IHabit) => h.currentStreak),
    );
    const bestStreak = Math.max(...habits.map((h: IHabit) => h.bestStreak));

    this.activitySummarySignal.set({
      completedPomodoros: pomodoroStats.completedPomodoros,
      totalFocusTime: pomodoroStats.totalFocusTime,
      activeHabits,
      completedToday,
      currentStreak,
      bestStreak,
    });
  }

  formatTime(seconds: number): string {
    return this.pomodoroService.formatTime(seconds);
  }
}
