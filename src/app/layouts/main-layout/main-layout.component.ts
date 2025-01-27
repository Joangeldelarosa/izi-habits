import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterOutlet,
  RouterModule,
  Router,
  NavigationEnd,
} from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { UserProfileComponent } from '../../shared/components/molecules/user-profile/user-profile.component';
import { UserAvatarComponent } from '../../shared/components/atoms/user-avatar/user-avatar.component';
import { INavItem } from '../../shared/interfaces/navigation.interface';
import { IUser } from '../../shared/interfaces/user.interface';
import { Home, CheckSquare, Timer, User as UserIcon } from 'lucide-angular';
import { UserService } from '../../services/user.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  template: `
    <!-- Main Container -->
    <div class="app-container">
      <!-- Mobile Header -->
      <header class="mobile-header">
        <div class="header-content">
          <h1 class="app-logo">IziHabits</h1>
          <app-user-profile [user]="currentUser()" [compact]="true" />
        </div>
      </header>

      <!-- Desktop Sidebar -->
      <aside class="desktop-sidebar">
        <div class="sidebar-header">
          <div class="app-logo">
            <h2>IziHabits</h2>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a
            *ngFor="let item of navItems"
            [class.active]="item.active"
            [routerLink]="item.route"
            class="nav-item"
          >
            <div class="nav-icon">
              <lucide-icon [name]="item.icon"></lucide-icon>
            </div>
            <span>{{ item.label }}</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <app-user-profile [user]="currentUser()" [compact]="true" />
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Mobile Bottom Navigation -->
      <nav class="bottom-nav">
        <a
          *ngFor="let item of navItems"
          [class.active]="item.active"
          [routerLink]="item.route"
          class="nav-item"
        >
          <div class="nav-icon">
            <lucide-icon [name]="item.icon"></lucide-icon>
          </div>
          <span>{{ item.label }}</span>
        </a>
      </nav>
    </div>
  `,
  styleUrl: './main-layout.component.sass',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    LucideAngularModule,
    UserProfileComponent,
    UserAvatarComponent,
  ],
})
export class MainLayoutComponent implements OnInit {
  currentUser = computed(() => this.userService.user());

  navItems: INavItem[] = [
    { icon: Home, label: 'Inicio', route: '/home', active: false },
    { icon: CheckSquare, label: 'Hábitos', route: '/habits', active: false },
    { icon: Timer, label: 'Timer', route: '/timer', active: false },
    { icon: UserIcon, label: 'Perfil', route: '/profile', active: false },
  ];

  constructor(
    public router: Router,
    private userService: UserService,
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveRoute();
      });
  }

  ngOnInit() {
    this.updateActiveRoute();
  }

  private updateActiveRoute(): void {
    const currentRoute = this.router.url;
    this.navItems.forEach((item) => {
      item.active = currentRoute.startsWith(item.route);
    });
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
