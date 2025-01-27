import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PwaService {
  constructor(private swUpdate: SwUpdate) {
    // Suscribirse a actualizaciones disponibles
    if (swUpdate.isEnabled) {
      swUpdate.versionUpdates
        .pipe(
          filter(
            (evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY',
          ),
        )
        .subscribe(() => {
          if (
            confirm('Hay una nueva versión disponible. ¿Deseas actualizar?')
          ) {
            window.location.reload();
          }
        });

      // Verificar actualizaciones cada 6 horas
      setInterval(
        () => {
          this.checkForUpdate();
        },
        6 * 60 * 60 * 1000,
      );
    }
  }

  async checkForUpdate(): Promise<void> {
    if (this.swUpdate.isEnabled) {
      try {
        await this.swUpdate.checkForUpdate();
      } catch (err) {
        console.error('Error checking for updates:', err);
      }
    }
  }

  async promptUpdate(): Promise<void> {
    if (this.swUpdate.isEnabled) {
      try {
        await this.swUpdate.activateUpdate();
        window.location.reload();
      } catch (err) {
        console.error('Error activating update:', err);
      }
    }
  }
}
