import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly STORAGE_PREFIX = 'IziHabits_';
  private readonly MAX_IMAGE_SIZE = 500 * 1024; // 500KB

  constructor() {}

  getPrefix(): string {
    return this.STORAGE_PREFIX;
  }

  setItem(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(this.STORAGE_PREFIX + key, serializedValue);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(this.STORAGE_PREFIX + key);
  }

  getAllKeys(): string[] {
    try {
      return Object.keys(localStorage)
        .filter((key) => key.startsWith(this.STORAGE_PREFIX))
        .map((key) => key.replace(this.STORAGE_PREFIX, ''));
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  // Método para limpiar imágenes antiguas
  private cleanOldImages(): void {
    try {
      const keys = Object.keys(localStorage);
      const imageKeys = keys.filter(
        (key) => key.startsWith(this.STORAGE_PREFIX) && key.includes('avatar_'),
      );

      // Mantener solo la imagen más reciente
      if (imageKeys.length > 1) {
        imageKeys
          .sort()
          .slice(0, -1)
          .forEach((key) => localStorage.removeItem(key));
      }
    } catch (error) {
      console.error('Error cleaning old images:', error);
    }
  }

  // Método para optimizar imagen base64
  private async optimizeImageData(imageData: string): Promise<string> {
    try {
      // Si la imagen es muy grande, reducir calidad
      if (imageData.length > this.MAX_IMAGE_SIZE) {
        const quality = Math.min(0.7, this.MAX_IMAGE_SIZE / imageData.length);
        return await this.reduceImageQuality(imageData, quality);
      }
      return imageData;
    } catch (error) {
      console.error('Error optimizing image:', error);
      return imageData;
    }
  }

  private reduceImageQuality(base64: string, quality: number): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(base64);
        }
      };
      img.src = base64;
    });
  }

  // Método específico para imágenes en base64
  async saveImage(imageData: string): Promise<string> {
    try {
      console.log('Saving image, input data type:', typeof imageData);

      // Validar que sea una imagen en base64
      if (!imageData.startsWith('data:image')) {
        console.error('Invalid image format. Must be base64');
        return '';
      }

      // Limpiar imágenes antiguas antes de guardar una nueva
      this.cleanOldImages();

      // Optimizar imagen si es necesario
      const optimizedImage = await this.optimizeImageData(imageData);

      const imageKey = `${this.STORAGE_PREFIX}avatar_${Date.now()}`;
      localStorage.setItem(imageKey, optimizedImage);
      console.log('Image saved successfully with key:', imageKey);

      return imageKey;
    } catch (error) {
      console.error('Error saving image:', error);
      return '';
    }
  }

  // Método para recuperar imágenes
  getImage(imageKey: string): string | null {
    try {
      console.log('Getting image with key:', imageKey);
      const imageData = localStorage.getItem(imageKey);

      if (!imageData) {
        console.log('No image data found for key:', imageKey);
        return null;
      }

      // Validar que sea una imagen en base64
      if (!imageData.startsWith('data:image')) {
        console.error('Invalid image format in storage. Must be base64');
        return null;
      }

      return imageData;
    } catch (error) {
      console.error('Error getting image:', error);
      return null;
    }
  }
}
