import { Injectable, signal, computed, effect } from '@angular/core';
import { Store } from '@ngxs/store';
import { StorageService } from './storage.service';
import { AvatarService } from './avatar.service';
import { IUser } from '../shared/interfaces/user.interface';
import { SetUser, UpdateUser, ClearUser } from '../store/user.actions';
import { Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { DialogService } from './dialog.service';
import { HabitService } from './habit.service';
import { PomodoroService } from './pomodoro.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly userSignal = signal<IUser | null>(null);
  readonly user = computed(() => this.userSignal());

  constructor(
    private store: Store,
    private storageService: StorageService,
    private avatarService: AvatarService,
    private router: Router,
    private dialogService: DialogService,
    private habitService: HabitService,
    private pomodoroService: PomodoroService,
  ) {
    this.initializeUser();

    // Un solo efecto para manejar los cambios del usuario
    effect(() => {
      const user = this.userSignal();
      if (user?.avatar) {
        this.avatarService.loadAvatar(user.avatar);
      }
    });

    // Suscripción al store
    this.store
      .select((state) => state.user.user)
      .subscribe((user) => {
        this.userSignal.set(user);
      });
  }

  private initializeUser(): void {
    const userData = this.storageService.getItem<IUser>('userData');
    if (userData) {
      this.store.dispatch(new SetUser(userData));
    }
  }

  getUser() {
    return toObservable(this.user);
  }

  async updateUserAvatar(imageData: string): Promise<void> {
    try {
      const imageKey = await this.avatarService.updateAvatar(imageData);
      if (imageKey) {
        const currentUser = this.userSignal();
        if (currentUser) {
          const updatedUser = { ...currentUser, avatar: imageKey };
          await this.store.dispatch(new UpdateUser(updatedUser)).toPromise();
          this.storageService.setItem('userData', updatedUser);
        }
      }
    } catch (error) {
      console.error('Error updating user avatar:', error);
    }
  }

  async updateUser(userData: Partial<IUser>): Promise<void> {
    const currentUser = this.userSignal();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      await this.store.dispatch(new UpdateUser(updatedUser)).toPromise();
      this.storageService.setItem('userData', updatedUser);
    }
  }

  async updateUserName(newName: string): Promise<void> {
    try {
      const currentUser = this.userSignal();
      if (currentUser) {
        const updatedUser = { ...currentUser, name: newName };
        await this.store.dispatch(new UpdateUser(updatedUser)).toPromise();
        this.storageService.setItem('userData', updatedUser);
      }
    } catch (error) {
      console.error('Error updating user name:', error);
      throw error;
    }
  }

  async deleteAccount(): Promise<void> {
    const confirmed = await this.dialogService.confirm(
      '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.',
    );

    if (!confirmed) return;

    try {
      // Limpiar los stores
      await this.store.dispatch(new ClearUser()).toPromise();
      this.userSignal.set(null);
      this.habitService.clearAllHabits();
      this.pomodoroService.clearAllStats();

      // Limpiar el avatar
      this.avatarService.clearAvatar();

      // Eliminar todos los datos del localStorage que empiecen con nuestro prefijo
      const allKeys = Object.keys(localStorage);
      const prefix = this.storageService.getPrefix();

      allKeys.forEach((key) => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });

      // Redirigir a la página de despedida
      this.router.navigate(['/goodbye']);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }
}
