import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {LucideAngularModule, Box, House} from 'lucide-angular';
import {TopBarDashboard} from '../../../components/layout/top-bar-dashboard/top-bar-dashboard';
import {SquareIconButton} from '../../../components/buttons/square-icon-button/square-icon-button';

@Component({
  selector: 'app-dashboard-layout',
  imports: [
    RouterOutlet,
    LucideAngularModule,
    TopBarDashboard,
    SquareIconButton
  ],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css'
})
export class DashboardLayout {
  readonly BoxIcon = Box;
  protected readonly House = House;
}
