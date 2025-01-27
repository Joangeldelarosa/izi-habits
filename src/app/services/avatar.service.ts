import { Injectable, signal, computed } from '@angular/core';
import { StorageService } from './storage.service';

export interface AvatarData {
  key: string | null;
  imageData: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AvatarService {
  private readonly avatarSignal = signal<AvatarData>({
    key: null,
    imageData: null,
  });

  readonly avatar = computed(() => this.avatarSignal());

  constructor(private storageService: StorageService) {}

  async updateAvatar(imageData: string): Promise<string | null> {
    try {
      const imageKey = await this.storageService.saveImage(imageData);
      if (imageKey) {
        this.avatarSignal.set({
          key: imageKey,
          imageData: imageData,
        });
        return imageKey;
      }
      return null;
    } catch (error) {
      console.error('Error updating avatar:', error);
      return null;
    }
  }

  loadAvatar(imageKey: string | null) {
    if (!imageKey) {
      this.avatarSignal.set({ key: null, imageData: null });
      return;
    }

    const imageData = this.storageService.getImage(imageKey);
    this.avatarSignal.set({
      key: imageKey,
      imageData: imageData,
    });
  }

  clearAvatar() {
    const currentAvatar = this.avatarSignal();
    if (currentAvatar.key) {
      this.storageService.removeItem(currentAvatar.key);
    }
    this.avatarSignal.set({ key: null, imageData: null });
  }

  getAvatarData(): string | null {
    return this.avatarSignal().imageData;
  }
}
