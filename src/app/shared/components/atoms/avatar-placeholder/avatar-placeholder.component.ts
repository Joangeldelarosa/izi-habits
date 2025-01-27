import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User as UserIcon, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-avatar-placeholder',
  template: `
    <div
      class="avatar-placeholder"
      [style.width]="size + 'px'"
      [style.height]="size + 'px'"
    >
      <lucide-icon
        [name]="UserIcon"
        [size]="iconSize"
        [strokeWidth]="1.8"
      ></lucide-icon>
    </div>
  `,
  styles: [
    `
    .avatar-placeholder
      position: relative
      background: linear-gradient(135deg, #F4F3FF 0%, #EBE9FE 100%)
      border-radius: 50%
      display: flex
      align-items: center
      justify-content: center
      color: #7F56D9
      border: 2px solid #F4F3FF
      box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05)
      box-sizing: border-box
      overflow: hidden
      transition: all 0.3s ease

      &::before
        content: ''
        position: absolute
        inset: 0
        background: linear-gradient(45deg, rgba(127, 86, 217, 0.1), transparent)
        opacity: 0.5

      ::ng-deep svg
        position: relative
        z-index: 1
        transition: all 0.3s ease
  `,
  ],
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
})
export class AvatarPlaceholderComponent {
  @Input() size = 48;
  UserIcon = UserIcon;

  get iconSize(): number {
    return Math.round(this.size * 0.55); // Proporción fija del 55% del tamaño total
  }
}
