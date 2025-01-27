import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { SetUser, CompleteOnboarding } from '../../store/user.actions';
import { UserAvatarComponent } from '../../shared/components/atoms/user-avatar/user-avatar.component';
import { StorageService } from '../../services/storage.service';
import { UserService } from '../../services/user.service';
import { Camera } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-onboarding',
  template: `
    <div class="onboarding-page">
      <div class="onboarding-content">
        <div class="logo-section">
          <h2>IziHabits</h2>
        </div>

        <div class="welcome-section">
          <h1>¡Bienvenido! 👋</h1>
          <p>Personaliza tu experiencia para comenzar</p>
        </div>

        <div class="avatar-section">
          <div class="avatar-container">
            <app-user-avatar
              [size]="128"
              [clickable]="true"
              (click)="openImageOptions()"
            />
            <button class="camera-button" (click)="openImageOptions()">
              <lucide-icon [name]="cameraIcon" [size]="24"></lucide-icon>
            </button>
          </div>
          <input
            #fileInput
            type="file"
            accept="image/*"
            capture="user"
            (change)="handleFileSelected($event)"
            style="display: none"
          />
          <p class="avatar-hint">Toca para tomar o subir una foto</p>
        </div>

        <div class="form-group">
          <label for="userName">Tu nombre</label>
          <input
            id="userName"
            type="text"
            [(ngModel)]="userName"
            placeholder="Ej: Juan Pérez"
            class="form-input"
            (keyup.enter)="completeSetup()"
          />
        </div>

        <button
          class="submit-button"
          [disabled]="!userName.trim()"
          (click)="completeSetup()"
        >
          Comenzar a usar IziHabits
        </button>
      </div>

      <div class="background-pattern"></div>
    </div>
  `,
  styles: [
    `
    .onboarding-page
      min-height: 100vh
      min-height: 100dvh
      width: 100vw
      display: flex
      align-items: center
      justify-content: center
      position: relative
      overflow: hidden
      background: linear-gradient(135deg, #F9FAFB 0%, #F4F3FF 100%)

    .background-pattern
      position: absolute
      inset: 0
      background-image: radial-gradient(#7F56D9 0.5px, transparent 0.5px)
      background-size: 24px 24px
      opacity: 0.1
      z-index: 0
      animation: fadeIn 1s ease-out

    .onboarding-content
      position: relative
      z-index: 1
      background: white
      padding: 40px
      border-radius: 24px
      box-shadow: 0 4px 24px -1px rgba(16, 24, 40, 0.1)
      width: 90%
      max-width: 440px
      text-align: center
      animation: slideInUp 0.5s ease-out

    .logo-section
      margin-bottom: 32px
      h2
        color: #7F56D9
        font-size: 36px
        font-weight: 700
        letter-spacing: -0.03em
        margin: 0
        font-family: 'Plus Jakarta Sans', sans-serif
        text-shadow: 0 2px 4px rgba(127, 86, 217, 0.1)

    .welcome-section
      margin-bottom: 40px
      h1
        font-size: 32px
        color: #101828
        margin-bottom: 8px
        font-weight: 600
        letter-spacing: -0.02em
      p
        color: #667085
        font-size: 16px

    .avatar-section
      margin: 32px 0
      display: flex
      flex-direction: column
      align-items: center
      gap: 12px

      .avatar-container
        position: relative
        width: 128px
        height: 128px

        .camera-button
          position: absolute
          right: 0
          bottom: 0
          width: 40px
          height: 40px
          border-radius: 50%
          background: #7F56D9
          border: 3px solid white
          display: flex
          align-items: center
          justify-content: center
          color: white
          cursor: pointer
          transition: all 0.3s ease
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)
          
          &:hover
            background: #6941C6
            transform: scale(1.05)

      .avatar-hint
        font-size: 14px
        color: #667085

    .form-group
      margin-bottom: 32px
      text-align: left

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

    .submit-button
      width: 100%
      padding: 14px 24px
      background: #7F56D9
      color: white
      border: none
      border-radius: 12px
      font-size: 16px
      font-weight: 600
      cursor: pointer
      transition: all 0.3s ease
      
      &:hover:not(:disabled)
        background: #6941C6
        transform: translateY(-1px)
      
      &:disabled
        opacity: 0.5
        cursor: not-allowed

    @keyframes fadeIn
      from
        opacity: 0
      to
        opacity: 1

    @keyframes slideInUp
      from
        transform: translateY(20px)
        opacity: 0
      to
        transform: translateY(0)
        opacity: 1

    @media (max-width: 480px)
      .onboarding-content
        padding: 32px 24px
        width: 100%
        height: 100vh
        height: 100dvh
        border-radius: 0
        display: flex
        flex-direction: column
        justify-content: center

      .logo-section
        margin-bottom: 48px

      .welcome-section
        h1
          font-size: 28px
  `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UserAvatarComponent,
    LucideAngularModule,
  ],
})
export class OnboardingComponent {
  userName = '';
  cameraIcon = Camera;
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private store: Store,
    private router: Router,
    private storageService: StorageService,
    private userService: UserService,
  ) {}

  openImageOptions() {
    // En dispositivos móviles, esto abrirá directamente la cámara
    // En desktop, mostrará el diálogo de selección de archivo/cámara
    this.fileInput.nativeElement.click();
  }

  async handleFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      try {
        const base64Data = await this.fileToBase64(file);
        if (base64Data) {
          await this.userService.updateUserAvatar(base64Data);
        }
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  async completeSetup() {
    if (this.userName.trim()) {
      const user = {
        name: this.userName.trim(),
        email: '', // Se puede agregar más tarde si se necesita
        hasCompletedOnboarding: true,
      };

      await this.store.dispatch(new SetUser(user));
      await this.store.dispatch(new CompleteOnboarding());
      this.router.navigate(['/home']);
    }
  }
}
