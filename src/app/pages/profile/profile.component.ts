import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  User,
  Mail,
  Camera,
  Edit2,
  Trash2,
} from 'lucide-angular';
import { UserAvatarComponent } from '../../shared/components/atoms/user-avatar/user-avatar.component';
import { IUser } from '../../shared/interfaces/user.interface';
import { UserService } from '../../services/user.service';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-profile',
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="header-main">
          <h1>Mi Perfil</h1>
        </div>
      </header>

      <div class="content-area">
        <div class="profile-card">
          <div class="profile-header">
            <div class="avatar-section">
              <div class="avatar-container">
                <app-user-avatar
                  [src]="avatarSrc() || ''"
                  [alt]="currentUser()?.name || 'Usuario'"
                  [size]="128"
                  [clickable]="true"
                />
                <button class="camera-button" (click)="fileInput.click()">
                  <lucide-icon [name]="Camera"></lucide-icon>
                </button>
                <input
                  #fileInput
                  type="file"
                  accept="image/*"
                  (change)="onFileSelected($event)"
                  class="hidden"
                />
              </div>
            </div>
          </div>

          <div class="profile-info">
            <div class="info-group">
              <label>
                <lucide-icon [name]="User"></lucide-icon>
                <span>Nombre</span>
              </label>
              <div class="editable-field" [class.editing]="isEditingName()">
                <p *ngIf="!isEditingName()">
                  {{ currentUser()?.name || 'Sin nombre' }}
                </p>
                <input
                  *ngIf="isEditingName()"
                  #nameInput
                  type="text"
                  [value]="editingNameValue()"
                  (input)="editingNameValue.set($any($event.target).value)"
                  (keyup.enter)="updateName()"
                  (keyup.escape)="cancelNameEdit()"
                  (blur)="updateName()"
                />
                <button class="edit-btn" (click)="toggleNameEdit()">
                  <lucide-icon [name]="Edit2"></lucide-icon>
                </button>
              </div>
            </div>

            <div class="info-group">
              <label>
                <lucide-icon [name]="Mail"></lucide-icon>
                <span>Email</span>
              </label>
              <div class="editable-field" [class.editing]="isEditingEmail()">
                <p *ngIf="!isEditingEmail()">
                  {{ currentUser()?.email || 'Sin email' }}
                </p>
                <input
                  *ngIf="isEditingEmail()"
                  #emailInput
                  type="email"
                  [value]="editingEmailValue()"
                  (input)="editingEmailValue.set($any($event.target).value)"
                  (keyup.enter)="updateEmail()"
                  (keyup.escape)="cancelEmailEdit()"
                  (blur)="updateEmail()"
                />
                <button class="edit-btn" (click)="toggleEmailEdit()">
                  <lucide-icon [name]="Edit2"></lucide-icon>
                </button>
              </div>
            </div>

            <button
              class="delete-account-btn"
              (click)="deleteAccount()"
              [disabled]="isDeletingAccount()"
            >
              <lucide-icon [name]="Trash2"></lucide-icon>
              <span>{{
                isDeletingAccount() ? 'Eliminando...' : 'Eliminar Cuenta'
              }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .page-container
      padding: clamp(16px, 5vw, 24px)
      max-width: min(800px, 90vw)
      margin: 0 auto
      width: 100%

      @media (max-width: 480px)
        padding: 16px

    .page-header
      margin-bottom: clamp(24px, 5vh, 32px)
      
      .header-main
        display: flex
        justify-content: space-between
        align-items: center
        margin-bottom: 16px
        
        h1
          font-size: clamp(20px, 5vw, 24px)
          font-weight: 600
          color: #101828
          margin: 0
          letter-spacing: -0.02em

    .profile-card
      background: white
      border-radius: clamp(8px, 2vw, 12px)
      padding: clamp(24px, 5vw, 32px)
      box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1)

      @media (max-width: 480px)
        padding: 20px

      .profile-header
        margin-bottom: clamp(24px, 5vh, 32px)
        text-align: center

        .avatar-section
          display: flex
          flex-direction: column
          align-items: center
          gap: clamp(12px, 3vw, 16px)

          .avatar-container
            position: relative
            width: fit-content

            .camera-button
              position: absolute
              bottom: 0
              right: 0
              display: flex
              align-items: center
              justify-content: center
              width: clamp(32px, 8vw, 40px)
              height: clamp(32px, 8vw, 40px)
              background: white
              border: 1px solid #E4E7EC
              border-radius: 50%
              color: #667085
              cursor: pointer
              transition: all 0.3s ease
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05)
              
              &:hover
                background: #F9FAFB
                border-color: #D0D5DD
                transform: scale(1.05)

              lucide-icon
                width: clamp(16px, 4vw, 20px)
                height: clamp(16px, 4vw, 20px)

      .profile-info
        .info-group
          margin-bottom: clamp(20px, 4vh, 24px)
          
          label
            display: flex
            align-items: center
            gap: 8px
            color: #667085
            font-size: clamp(12px, 3vw, 14px)
            margin-bottom: 8px

            lucide-icon
              width: clamp(16px, 4vw, 20px)
              height: clamp(16px, 4vw, 20px)
          
          p
            color: #101828
            font-size: clamp(14px, 3.5vw, 16px)
            margin: 0
            padding: clamp(10px, 3vw, 12px) clamp(12px, 3vw, 16px)
            background: #F9FAFB
            border-radius: 8px

          .editable-field
            display: flex
            align-items: center
            gap: 8px
            
            input
              flex: 1
              padding: clamp(10px, 3vw, 12px) clamp(12px, 3vw, 16px)
              background: #F9FAFB
              border: 1px solid #E4E7EC
              border-radius: 8px
              font-size: clamp(14px, 3.5vw, 16px)
              color: #101828
              outline: none
              width: 100%
              
              &:focus
                border-color: #D0D5DD
                box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05)

            .edit-btn
              background: none
              border: none
              color: #667085
              cursor: pointer
              padding: 8px
              border-radius: 6px
              transition: all 0.3s ease
              
              &:hover
                background: #F9FAFB
                color: #101828

              lucide-icon
                width: clamp(16px, 4vw, 20px)
                height: clamp(16px, 4vw, 20px)

      .delete-account-btn
        display: flex
        align-items: center
        justify-content: center
        gap: 8px
        width: 100%
        padding: clamp(10px, 3vw, 12px) clamp(16px, 4vw, 20px)
        background: #FEF3F2
        border: 1px solid #FEE4E2
        border-radius: 8px
        color: #B42318
        font-size: clamp(12px, 3.5vw, 14px)
        font-weight: 500
        cursor: pointer
        transition: all 0.3s ease
        margin-top: clamp(24px, 5vh, 32px)
        
        &:hover:not(:disabled)
          background: #FEE4E2
          border-color: #FDA29B
          transform: translateY(-1px)

        &:disabled
          opacity: 0.6
          cursor: not-allowed

        lucide-icon
          width: clamp(16px, 4vw, 20px)
          height: clamp(16px, 4vw, 20px)

    .hidden
      display: none
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    UserAvatarComponent,
  ],
})
export class ProfileComponent implements OnInit {
  currentUser = computed(() => this.userService.user());
  isEditingName = signal(false);
  isEditingEmail = signal(false);
  avatarPreview = signal<string | null>(null);
  editingNameValue = signal('');
  editingEmailValue = signal('');
  isDeletingAccount = signal(false);

  avatarSrc = computed(() => {
    const preview = this.avatarPreview();
    if (preview) return preview;

    const user = this.currentUser();
    if (user?.avatar) {
      return this.storageService.getImage(user.avatar);
    }
    return null;
  });

  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private userService: UserService,
    private router: Router,
    private storageService: StorageService,
  ) {
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.editingNameValue.set(user.name);
        this.editingEmailValue.set(user.email);
      }
    });
  }

  ngOnInit() {}

  handleAvatarChange() {
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      try {
        const base64 = await this.fileToBase64(file);
        this.avatarPreview.set(base64);
        await this.userService.updateUserAvatar(base64);
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }
  }

  toggleNameEdit() {
    if (!this.isEditingName()) {
      this.editingNameValue.set(this.currentUser()?.name || '');
    }
    this.isEditingName.update((v) => !v);
    if (this.isEditingName()) {
      setTimeout(() => {
        this.nameInput.nativeElement.focus();
        this.nameInput.nativeElement.select();
      });
    }
  }

  toggleEmailEdit() {
    if (!this.isEditingEmail()) {
      this.editingEmailValue.set(this.currentUser()?.email || '');
    }
    this.isEditingEmail.update((v) => !v);
    if (this.isEditingEmail()) {
      setTimeout(() => {
        this.emailInput.nativeElement.focus();
        this.emailInput.nativeElement.select();
      });
    }
  }

  async updateName() {
    const newName = this.editingNameValue().trim();
    if (
      this.isEditingName() &&
      newName &&
      newName !== this.currentUser()?.name
    ) {
      try {
        await this.userService.updateUserName(newName);
      } catch (error) {
        console.error('Error updating name:', error);
      }
    }
    this.isEditingName.set(false);
  }

  async updateEmail() {
    const newEmail = this.editingEmailValue().trim();
    if (
      this.isEditingEmail() &&
      newEmail &&
      newEmail !== this.currentUser()?.email
    ) {
      try {
        await this.userService.updateUser({ email: newEmail });
      } catch (error) {
        console.error('Error updating email:', error);
      }
    }
    this.isEditingEmail.set(false);
  }

  cancelNameEdit() {
    this.editingNameValue.set(this.currentUser()?.name || '');
    this.isEditingName.set(false);
  }

  cancelEmailEdit() {
    this.editingEmailValue.set(this.currentUser()?.email || '');
    this.isEditingEmail.set(false);
  }

  async deleteAccount(): Promise<void> {
    if (this.isDeletingAccount()) return;

    try {
      this.isDeletingAccount.set(true);
      await this.userService.deleteAccount();
    } catch (error) {
      console.error('Error deleting account:', error);
      this.isDeletingAccount.set(false);
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

  protected readonly User = User;
  protected readonly Mail = Mail;
  protected readonly Camera = Camera;
  protected readonly Edit2 = Edit2;
  protected readonly Trash2 = Trash2;
}
