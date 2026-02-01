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
  styleUrl: './habits.component.sass',
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
