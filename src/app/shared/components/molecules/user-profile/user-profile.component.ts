import { Component, Input, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IUser } from '../../../interfaces/user.interface';
import { UserAvatarComponent } from '../../atoms/user-avatar/user-avatar.component';
import { StorageService } from '../../../../services/storage.service';

@Component({
  selector: 'app-user-profile',
  template: `
    @if (user) {
      <div class="user-profile" [class.compact]="compact">
        <app-user-avatar
          [src]="avatarSrc() || ''"
          [alt]="user.name"
          [clickable]="true"
        />
        <div class="user-info">
          @if (!compact) {
            <h1>¡Hola! 👋</h1>
            <p>{{ user.greeting || 'Bienvenido a tu espacio personal' }}</p>
          }
          @if (compact) {
            <span class="username">{{ user.name }}</span>
            <span class="email">{{ user.email }}</span>
          }
        </div>
      </div>
    } @else {
      <div class="user-profile-placeholder">
        <app-user-avatar
          [src]="''"
          alt="Usuario no encontrado"
          [clickable]="false"
        />
        <div class="user-info">
          @if (!compact) {
            <h1>¡Bienvenido!</h1>
            <p>Por favor, inicia sesión</p>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
    .user-profile, .user-profile-placeholder
      display: flex
      align-items: center
      gap: 16px

      &.compact
        gap: 12px
        padding: 12px
        border-radius: 12px
        transition: all 0.3s ease
        cursor: pointer

        &:hover
          background: #F4F3FF

      .user-info
        h1
          font-size: 22px
          color: #101828
          margin: 0
          font-weight: 600
          letter-spacing: -0.02em
        p
          font-size: 14px
          color: #667085
          margin: 4px 0 0
          font-weight: 400
          letter-spacing: -0.01em
        
        .username
          font-size: 14px
          color: #101828
          font-weight: 600
          letter-spacing: -0.01em
        
        .email
          font-size: 12px
          color: #667085
          margin-top: 2px
          display: block
  `,
  ],
  standalone: true,
  imports: [CommonModule, UserAvatarComponent],
})
export class UserProfileComponent {
  @Input() set user(value: IUser | null) {
    this._user = value;
    if (value?.avatar) {
      const imageData = this.storageService.getImage(value.avatar);
      this.currentAvatarKey.set(value.avatar);
      this.currentAvatarData.set(imageData);
    } else {
      this.currentAvatarKey.set(null);
      this.currentAvatarData.set(null);
    }
  }
  get user(): IUser | null {
    return this._user;
  }
  @Input() compact = false;

  private _user: IUser | null = null;
  private currentAvatarKey = signal<string | null>(null);
  private currentAvatarData = signal<string | null>(null);

  avatarSrc = computed(() => {
    const user = this.user;
    if (!user?.avatar) return null;

    if (user.avatar !== this.currentAvatarKey()) {
      const imageData = this.storageService.getImage(user.avatar);
      this.currentAvatarKey.set(user.avatar);
      this.currentAvatarData.set(imageData);
    }

    return this.currentAvatarData();
  });

  constructor(private storageService: StorageService) {}
}
