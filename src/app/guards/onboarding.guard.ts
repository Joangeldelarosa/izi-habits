import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { UserState } from '../store/user.state';

@Injectable({
  providedIn: 'root',
})
export class OnboardingGuard {
  constructor(
    private store: Store,
    private router: Router,
  ) {}

  canActivate(): boolean {
    const hasCompletedOnboarding = this.store.selectSnapshot(
      UserState.hasCompletedOnboarding,
    );

    if (!hasCompletedOnboarding) {
      this.router.navigate(['/onboarding']);
      return false;
    }

    return true;
  }
}
