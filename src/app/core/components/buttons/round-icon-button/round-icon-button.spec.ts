import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundIconButton } from './round-icon-button';
import {LucideAngularModule, Trash} from 'lucide-angular';

describe('RoundIconButton', () => {
  let component: RoundIconButton;
  let fixture: ComponentFixture<RoundIconButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoundIconButton, LucideAngularModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoundIconButton);
    component = fixture.componentInstance;
    component.icon = Trash;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
