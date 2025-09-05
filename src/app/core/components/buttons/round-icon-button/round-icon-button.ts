import {Component, Input} from '@angular/core';
import {LucideAngularModule, LucideIconData} from "lucide-angular";
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-round-icon-button',
  imports: [
    NgClass,
    LucideAngularModule
  ],
  templateUrl: './round-icon-button.html',
  styleUrl: './round-icon-button.css'
})
export class RoundIconButton {
  @Input() icon!: LucideIconData;
  @Input() disabled = false;
  @Input() colorClass = 'bg-white';
}
