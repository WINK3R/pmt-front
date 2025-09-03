import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundIconButton } from './round-icon-button';

describe('RoundIconButton', () => {
  let component: RoundIconButton;
  let fixture: ComponentFixture<RoundIconButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoundIconButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoundIconButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
