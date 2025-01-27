import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, X, Plus } from 'lucide-angular';
import { HabitService } from '../../../../services/habit.service';
import {
  HabitTagTypeEnum,
  IHabitTag,
} from '../../../../shared/interfaces/habit.interface';

@Component({
  selector: 'app-habit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="habit-form-container">
      <header class="form-header">
        <h1>{{ isEditing ? 'Editar' : 'Nuevo' }} Hábito</h1>
        <button class="close-btn" (click)="goBack()">
          <lucide-icon [name]="X"></lucide-icon>
        </button>
      </header>

      <form [formGroup]="habitForm" (ngSubmit)="onSubmit()" class="habit-form">
        <div class="form-group">
          <label for="name">Nombre del hábito</label>
          <input
            id="name"
            type="text"
            formControlName="name"
            placeholder="Ej: Hacer ejercicio"
            class="form-input"
          />
          @if (
            habitForm.get('name')?.errors?.['required'] &&
            habitForm.get('name')?.touched
          ) {
            <span class="error-message">El nombre es requerido</span>
          }
        </div>

        <div class="form-group">
          <label for="description">Descripción (opcional)</label>
          <textarea
            id="description"
            formControlName="description"
            placeholder="Describe tu hábito..."
            class="form-input"
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="targetDays">Objetivo (días consecutivos)</label>
          <input
            id="targetDays"
            type="number"
            formControlName="targetDays"
            [min]="1"
            class="form-input"
          />
          @if (
            habitForm.get('targetDays')?.errors?.['required'] &&
            habitForm.get('targetDays')?.touched
          ) {
            <span class="error-message">El objetivo es requerido</span>
          }
          @if (habitForm.get('targetDays')?.errors?.['min']) {
            <span class="error-message"
              >El objetivo debe ser al menos 1 día</span
            >
          }
        </div>

        <div class="form-group">
          <label>Etiquetas</label>
          <div class="tags-section">
            <div class="tags-container">
              @for (tagType of tagTypes; track tagType) {
                <div class="tag-list">
                  @for (tag of getTagsByType(tagType); track tag.id) {
                    <div
                      class="tag-item"
                      [class.selected]="isTagSelected(tag)"
                      (click)="toggleTag(tag)"
                      [style.background-color]="tag.color + '20'"
                      [style.color]="tag.color"
                      [style.border-color]="
                        isTagSelected(tag) ? tag.color : 'transparent'
                      "
                    >
                      {{ tag.name }}
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="color">Color del hábito</label>
          <div class="color-selection">
            <input
              id="color"
              type="color"
              formControlName="color"
              class="color-input"
            />
            <span
              class="color-preview"
              [style.background-color]="habitForm.get('color')?.value"
            ></span>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="secondary-btn" (click)="goBack()">
            Cancelar
          </button>
          <button
            type="submit"
            class="primary-btn"
            [disabled]="habitForm.invalid || habitForm.pristine"
          >
            {{ isEditing ? 'Guardar cambios' : 'Crear hábito' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
    .habit-form-container
      max-width: 600px
      margin: 0 auto
      padding: 24px

    .form-header
      display: flex
      justify-content: space-between
      align-items: center
      margin-bottom: 32px
      
      h1
        font-size: 24px
        font-weight: 600
        color: #101828
        margin: 0
        letter-spacing: -0.02em

    .close-btn
      background: none
      border: none
      padding: 8px
      cursor: pointer
      color: #667085
      border-radius: 8px
      transition: all 0.3s ease
      
      &:hover
        background: #F9FAFB
        color: #101828

    .habit-form
      background: white
      border-radius: 16px
      padding: 24px
      box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05)

    .form-group
      margin-bottom: 24px
      
      label
        display: block
        font-size: 14px
        font-weight: 500
        color: #344054
        margin-bottom: 8px

    .form-input
      width: 100%
      padding: 12px 16px
      border: 1px solid #E4E7EC
      border-radius: 12px
      font-size: 16px
      color: #101828
      transition: all 0.3s ease
      
      &:focus
        outline: none
        border-color: #7F56D9
        box-shadow: 0 0 0 4px rgba(127, 86, 217, 0.1)
      
      &::placeholder
        color: #98A2B3

    .error-message
      color: #F04438
      font-size: 14px
      margin-top: 6px

    .tags-section
      background: #F9FAFB
      border-radius: 12px
      padding: 16px
      margin-top: 8px

    .tags-container
      display: flex
      flex-direction: row
      flex-wrap: wrap
      gap: 10px

    .tag-group
      h4
        font-size: 14px
        color: #344054
        margin: 0 0 8px
        font-weight: 500

    .tag-list
      display: flex
      flex-wrap: wrap
      gap: 8px

    .tag-item
      padding: 6px 12px
      border-radius: 8px
      font-size: 12px
      cursor: pointer
      transition: all 0.3s ease
      border: 1px solid transparent
      
      &:hover
        transform: translateY(-1px)
      
      &.selected
        font-weight: 500

    .color-selection
      display: flex
      align-items: center
      gap: 12px

    .color-input
      width: 48px
      height: 48px
      padding: 2px
      border: none
      border-radius: 8px
      cursor: pointer
      background: none
      
      &::-webkit-color-swatch-wrapper
        padding: 0
      
      &::-webkit-color-swatch
        border: none
        border-radius: 6px

    .color-preview
      width: 32px
      height: 32px
      border-radius: 8px

    .form-actions
      display: flex
      justify-content: flex-end
      gap: 12px
      margin-top: 32px

    .primary-btn
      background: #7F56D9
      color: white
      border: none
      padding: 12px 24px
      border-radius: 12px
      font-weight: 600
      cursor: pointer
      transition: all 0.3s ease
      
      &:hover:not(:disabled)
        background: #6941C6
      
      &:disabled
        opacity: 0.5
        cursor: not-allowed

    .secondary-btn
      background: white
      color: #344054
      border: 1px solid #D0D5DD
      padding: 12px 24px
      border-radius: 12px
      font-weight: 600
      cursor: pointer
      transition: all 0.3s ease
      
      &:hover
        background: #F9FAFB
        border-color: #98A2B3
    `,
  ],
})
export class HabitFormComponent {
  private fb = inject(FormBuilder);
  private habitService = inject(HabitService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  protected readonly X = X;
  protected readonly Plus = Plus;

  isEditing = false;
  tagTypes: IHabitTag['type'][] = [
    HabitTagTypeEnum.HEALTH,
    HabitTagTypeEnum.BUSINESS,
    HabitTagTypeEnum.PERSONAL,
    HabitTagTypeEnum.LEARNING,
    HabitTagTypeEnum.FITNESS,
  ];

  selectedTags = signal<IHabitTag[]>([]);

  habitForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: [''],
    targetDays: [1, [Validators.required, Validators.min(1)]],
    tags: [[]],
    color: ['#7F56D9'],
  });

  ngOnInit() {
    const habitId = this.route.snapshot.paramMap.get('id');
    if (habitId) {
      this.isEditing = true;
      const habit = this.habitService.getHabitById(habitId);
      if (habit) {
        this.habitForm.patchValue({
          name: habit.name,
          description: habit.description || '',
          targetDays: habit.targetDays,
          color: habit.color || '#7F56D9',
        });
        this.selectedTags.set(habit.tags);
      }
    }
  }

  getTagTypeLabel(type: IHabitTag['type']): string {
    const labels: Record<IHabitTag['type'], string> = {
      health: 'Salud',
      business: 'Negocios',
      personal: 'Personal',
      learning: 'Aprendizaje',
      fitness: 'Fitness',
    };
    return labels[type];
  }

  getTagsByType(type: IHabitTag['type']): IHabitTag[] {
    return this.habitService.getTagsByType(type);
  }

  isTagSelected(tag: IHabitTag): boolean {
    return this.selectedTags().some((t) => t.id === tag.id);
  }

  toggleTag(tag: IHabitTag): void {
    const currentTags = this.selectedTags();
    if (this.isTagSelected(tag)) {
      this.selectedTags.set(currentTags.filter((t) => t.id !== tag.id));
    } else {
      this.selectedTags.set([...currentTags, tag]);
    }
    this.habitForm.patchValue({ tags: this.selectedTags() });
    this.habitForm.markAsDirty();
  }

  onSubmit(): void {
    if (this.habitForm.valid) {
      const formValue = this.habitForm.value;
      const habitData = {
        ...formValue,
        tags: this.selectedTags(),
      };

      if (this.isEditing) {
        const habitId = this.route.snapshot.paramMap.get('id');
        if (habitId) {
          this.habitService.updateHabit(habitId, habitData);
        }
      } else {
        this.habitService.createHabit(habitData);
      }

      this.router.navigate(['/habits']);
    }
  }

  goBack(): void {
    this.router.navigate(['/habits']);
  }
}
