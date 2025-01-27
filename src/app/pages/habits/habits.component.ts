import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  LucideAngularModule,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Edit,
  Filter,
} from 'lucide-angular';
import { HabitService } from '../../services/habit.service';
import { IHabit } from '../../shared/interfaces/habit.interface';
import { FormsModule } from '@angular/forms';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
  template: `
    <div class="habits-container">
      <div class="page-header">
        <h1>Mis Hábitos</h1>
        <div class="header-actions">
          <button class="btn-icon" (click)="toggleFilters()">
            <lucide-icon [name]="Filter" [size]="20" />
          </button>
          <button class="btn-primary" (click)="router.navigate(['habits/new'])">
            <lucide-icon [name]="Plus" [size]="20" class="icon" />
            <span>Nuevo Hábito</span>
          </button>
        </div>
      </div>

      <div class="filters" [class.show]="showFilters()">
        <div class="tags-filter">
          <button
            *ngFor="let tag of tags()"
            class="tag"
            [class.active]="selectedTags().includes(tag.id)"
            (click)="toggleTag(tag.id)"
            [style.background-color]="tag.color + '20'"
            [style.color]="tag.color"
          >
            {{ tag.name }}
          </button>
        </div>
      </div>

      <ng-container *ngIf="filteredHabits().length === 0">
        <div class="empty-state">
          <p>No tienes hábitos creados aún</p>
          <button class="btn-primary" (click)="router.navigate(['habits/new'])">
            <lucide-icon [name]="Plus" [size]="20" class="icon" />
            <span>Crear mi primer hábito</span>
          </button>
        </div>
      </ng-container>

      <div class="habits-list" *ngIf="filteredHabits().length > 0">
        <div *ngFor="let habit of filteredHabits()" class="habit-card">
          <div class="habit-info">
            <div class="habit-header">
              <div class="habit-main">
                <button
                  class="complete-btn"
                  (click)="toggleHabitCompletion(habit)"
                  [style.color]="habit.color || '#7F56D9'"
                >
                  <lucide-icon
                    [name]="
                      isHabitCompletedToday(habit) ? CheckCircle2 : Circle
                    "
                    [size]="24"
                  />
                </button>
                <div class="habit-details">
                  <h3>{{ habit.name }}</h3>
                  <p class="description" *ngIf="habit.description">
                    {{ habit.description }}
                  </p>
                </div>
              </div>
              <div class="habit-actions">
                <button
                  class="btn-icon"
                  (click)="router.navigate(['habits/edit', habit.id])"
                >
                  <lucide-icon [name]="Edit" [size]="20" />
                </button>
                <button class="btn-icon" (click)="deleteHabit(habit)">
                  <lucide-icon [name]="Trash2" [size]="20" />
                </button>
              </div>
            </div>
            <div class="habit-footer">
              <div class="habit-tags">
                <span
                  *ngFor="let tag of habit.tags"
                  class="tag"
                  [style.background-color]="tag.color + '20'"
                  [style.color]="tag.color"
                >
                  {{ tag.name }}
                </span>
              </div>
              <div class="habit-progress">
                <span class="streak-badge" *ngIf="habit.currentStreak > 0">
                  {{ habit.currentStreak }}d 🔥
                </span>
                <div class="progress-text">
                  {{
                    isHabitCompletedToday(habit)
                      ? habit.targetDays - 1
                      : habit.targetDays
                  }}
                  días restantes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    :host
      --primary-color: #7F56D9
      --primary-dark: #6941C6
      --hover-color: #F9FAFB
      --text-color: #667085
      --card-bg: white
      --card-shadow: 0 1px 3px rgba(16, 24, 40, 0.1), 0 1px 2px rgba(16, 24, 40, 0.06)

    .habits-container
      padding: 1rem
      max-width: 800px
      margin: 0 auto
      @media (max-width: 768px)
        padding: 1rem 0.5rem

    .page-header
      display: flex
      justify-content: space-between
      align-items: center
      margin-bottom: 1rem
      h1
        margin: 0
        font-size: 1.5rem
      .header-actions
        display: flex
        gap: 0.5rem
        align-items: center

    .btn-icon
      background: none
      border: none
      padding: 0.5rem
      cursor: pointer
      display: flex
      align-items: center
      justify-content: center
      color: var(--text-color)
      border-radius: 0.5rem
      transition: all 0.2s ease
      &:hover
        background: var(--hover-color)
        transform: translateY(-1px)

    .btn-primary
      display: flex
      align-items: center
      gap: 0.5rem
      background: var(--primary-color)
      color: white
      border: none
      padding: 0.75rem 1rem
      border-radius: 0.5rem
      cursor: pointer
      font-weight: 500
      transition: all 0.2s ease
      white-space: nowrap
      &:hover
        background: var(--primary-dark)
        transform: translateY(-1px)
      .icon
        width: 1.25rem
        height: 1.25rem
      @media (max-width: 768px)
        padding: 0.5rem 0.75rem
        font-size: 0.875rem

    .filters
      margin-bottom: 1rem
      display: none
      &.show
        display: block

    .tags-filter
      display: flex
      flex-wrap: wrap
      gap: 0.5rem
      margin-bottom: 1rem

    .tag
      padding: 0.25rem 0.75rem
      border-radius: 1rem
      border: none
      font-size: 0.875rem
      cursor: pointer
      &.active
        font-weight: 500

    .habits-list
      display: flex
      flex-direction: column
      gap: 16px

    .habit-card
      background: var(--card-bg)
      border-radius: 0.75rem
      padding: 1rem
      box-shadow: var(--card-shadow)

    .habit-info
      .habit-header
        display: flex
        justify-content: space-between
        align-items: flex-start
        margin-bottom: 0.75rem
        .habit-main
          display: flex
          gap: 0.75rem
          align-items: flex-start
        .habit-details
          h3
            margin: 0
            font-size: 1rem
            font-weight: 600
            color: #101828
          .description
            margin: 0.25rem 0 0
            font-size: 0.875rem
            color: var(--text-color)
        .habit-actions
          display: flex
          gap: 0.25rem

    .complete-btn
      background: none
      border: none
      padding: 0.25rem
      cursor: pointer
      display: flex
      align-items: center
      justify-content: center
      border-radius: 0.5rem
      transition: all 0.2s ease
      &:hover
        background: var(--hover-color)
        transform: translateY(-1px)

    .habit-footer
      display: flex
      justify-content: space-between
      align-items: center
      margin-top: 0.75rem

    .habit-tags
      display: flex
      flex-wrap: wrap
      gap: 0.25rem
      .tag
        padding: 0.25rem 0.75rem
        border-radius: 1rem
        font-size: 0.75rem
        font-weight: 500

    .habit-progress
      display: flex
      align-items: center
      gap: 0.75rem
      .streak-badge
        padding: 0.25rem 0.5rem
        background: #FEF3F2
        color: #B42318
        border-radius: 1rem
        font-size: 0.75rem
        font-weight: 600
      .progress-text
        font-size: 0.875rem
        color: var(--text-color)

    .empty-state
      display: flex
      flex-direction: column
      align-items: center
      justify-content: center
      padding: 3rem 1rem
      text-align: center
      background: var(--card-bg)
      border-radius: 1rem
      box-shadow: var(--card-shadow)
      margin: 2rem auto
      max-width: 400px
      p
        color: var(--text-color)
        margin-bottom: 1.5rem
        font-size: 1rem
    `,
  ],
})
export class HabitsComponent {
  protected habitService = inject(HabitService);
  protected router = inject(Router);
  private dialogService = inject(DialogService);
  protected readonly Filter = Filter;
  protected readonly Plus = Plus;
  protected readonly CheckCircle2 = CheckCircle2;
  protected readonly Circle = Circle;
  protected readonly Trash2 = Trash2;
  protected readonly Edit = Edit;

  private showFiltersSignal = signal(false);
  private selectedTagsSignal = signal<string[]>([]);

  protected readonly showFilters = computed(() => this.showFiltersSignal());
  protected readonly selectedTags = computed(() => this.selectedTagsSignal());

  protected readonly filteredHabits = computed(() => {
    const habits = Object.values(this.habitService.habits());
    const selectedTags = this.selectedTagsSignal();

    if (selectedTags.length === 0) {
      return habits;
    }

    return habits.filter((habit) =>
      habit.tags.some((tag) => selectedTags.includes(tag.id)),
    );
  });

  protected readonly tags = computed(() => this.habitService.tags());

  toggleFilters(): void {
    this.showFiltersSignal.update((show) => !show);
  }

  toggleTag(tagId: string): void {
    const currentTags = this.selectedTagsSignal();
    if (currentTags.includes(tagId)) {
      this.selectedTagsSignal.set(currentTags.filter((id) => id !== tagId));
    } else {
      this.selectedTagsSignal.set([...currentTags, tagId]);
    }
  }

  toggleHabitCompletion(habit: IHabit): void {
    this.habitService.toggleHabitCompletion(habit.id);
  }

  async deleteHabit(habit: IHabit): Promise<void> {
    const confirmed = await this.dialogService.confirm(
      '¿Estás seguro de que deseas eliminar este hábito?',
    );
    if (confirmed) {
      this.habitService.deleteHabit(habit.id);
    }
  }

  isHabitCompletedToday(habit: IHabit): boolean {
    const today = new Date().toISOString().split('T')[0];
    return habit.progress[today]?.completed || false;
  }

  editHabit(habitId: string): void {
    this.router.navigate(['/habits/edit', habitId]);
  }
}
