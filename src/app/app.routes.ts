import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { HabitsComponent } from './pages/habits/habits.component';
import { HabitFormComponent } from './pages/habits/components/habit-form/habit-form.component';
import { TimerComponent } from './pages/timer/timer.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { OnboardingComponent } from './pages/onboarding/onboarding.component';
import { GoodbyeComponent } from './pages/goodbye/goodbye.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { OnboardingGuard } from './guards/onboarding.guard';

export const routes: Routes = [
  {
    path: 'onboarding',
    component: OnboardingComponent,
  },
  {
    path: 'goodbye',
    component: GoodbyeComponent,
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [OnboardingGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        component: HomeComponent,
        title: 'Inicio',
      },
      {
        path: 'habits',
        children: [
          {
            path: '',
            component: HabitsComponent,
            title: 'Hábitos',
          },
          {
            path: 'new',
            component: HabitFormComponent,
            title: 'Nuevo Hábito',
          },
          {
            path: 'edit/:id',
            component: HabitFormComponent,
            title: 'Editar Hábito',
          },
        ],
      },
      {
        path: 'timer',
        component: TimerComponent,
        title: 'Timer',
      },
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'Perfil',
      },
    ],
  },
];
