import { Component, Input } from '@angular/core';
import {LucideAngularModule, LucideIconData} from 'lucide-angular';

@Component({
  selector: 'app-square-icon-button',
  imports: [
    LucideAngularModule
  ],
  templateUrl: './square-icon-button.html',
  styleUrl: './square-icon-button.css'
})
export class SquareIconButton {
  @Input() icon!: LucideIconData;
}
