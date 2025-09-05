import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SquareIconButton } from './square-icon-button';
import {LucideAngularModule, Trash} from 'lucide-angular';

describe('SquareIconButton', () => {
  let component: SquareIconButton;
  let fixture: ComponentFixture<SquareIconButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SquareIconButton, LucideAngularModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SquareIconButton);
    component = fixture.componentInstance;
    component.icon = Trash;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
