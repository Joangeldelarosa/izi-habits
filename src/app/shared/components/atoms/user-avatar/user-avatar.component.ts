import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarPlaceholderComponent } from '../avatar-placeholder/avatar-placeholder.component';
import { AvatarService } from '../../../../services/avatar.service';

@Component({
  selector: 'app-user-avatar',
  template: `
    <div
      class="avatar"
      [class.clickable]="clickable"
      [class.loading]="isLoading"
      [class.has-error]="hasError"
      [style.width]="size + 'px'"
      [style.height]="size + 'px'"
    >
      <div
        class="image-container"
        [style.opacity]="hasError || !currentSrc() ? '0' : '1'"
      >
        <img
          *ngIf="currentSrc()"
          [src]="currentSrc()"
          [alt]="alt"
          (error)="onImageError()"
          (load)="onImageLoad()"
        />
      </div>
      <div
        class="placeholder-container"
        [class.visible]="hasError || !currentSrc() || isLoading"
      >
        <app-avatar-placeholder [size]="size"></app-avatar-placeholder>
      </div>
    </div>
  `,
  styles: [
    `
    .avatar
      position: relative
      border-radius: 50%
      overflow: hidden
      background: #F9FAFB
      border: 2px solid #F4F3FF
      box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05)
      transition: all 0.3s ease
      
      &.clickable
        cursor: pointer
        &:hover
          transform: scale(1.05)
          border-color: #7F56D9
      
      &.loading
        .image-container
          opacity: 0
      
      &.has-error
        .placeholder-container
          opacity: 1

    .image-container
      position: absolute
      inset: 0
      display: flex
      align-items: center
      justify-content: center
      transition: opacity 0.3s ease
      
      img
        width: 100%
        height: 100%
        object-fit: cover
        transition: transform 0.3s ease

    .placeholder-container
      position: absolute
      inset: 0
      display: flex
      align-items: center
      justify-content: center
      opacity: 0
      transition: opacity 0.3s ease
      
      &.visible
        opacity: 1
  `,
  ],
  standalone: true,
  imports: [CommonModule, AvatarPlaceholderComponent],
})
export class UserAvatarComponent {
  @Input() src: string | null = '';
  @Input() alt = 'User avatar';
  @Input() clickable = false;
  @Input() size = 48;

  isLoading = false;
  hasError = false;

  readonly currentSrc = computed(() => {
    if (this.src === null) return '';
    return this.src || this.avatarService.getAvatarData();
  });

  constructor(private avatarService: AvatarService) {}

  onImageError() {
    console.error('Error loading avatar image');
    this.hasError = true;
    this.isLoading = false;
  }

  onImageLoad() {
    console.log('Avatar image loaded successfully');
    this.hasError = false;
    this.isLoading = false;
  }
}
