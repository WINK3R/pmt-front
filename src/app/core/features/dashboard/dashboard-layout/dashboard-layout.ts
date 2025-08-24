import {Component, inject} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {LucideAngularModule, Box, DoorOpen} from 'lucide-angular';
import {SquareIconButton} from '../../../components/buttons/square-icon-button/square-icon-button';
import {AuthService} from '../../../services/auth/authService';
import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'app-dashboard-layout',
  imports: [
    RouterOutlet,
    LucideAngularModule,
    SquareIconButton
  ],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css'
})
export class DashboardLayout {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly BoxIcon = Box;
  protected readonly DoorOpen = DoorOpen;

  logout() {
    this.auth.logout();
  }

  goProjects() : void {
    this.router.navigate(['/dashboard/projects']);
  }

  getProfileImage() : string | undefined {
    return this.auth.currentUser?.profileImageUrl
  }

  protected readonly environment = environment;
}
