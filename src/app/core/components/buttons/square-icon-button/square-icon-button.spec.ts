import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SquareIconButton } from './square-icon-button';

describe('SquareIconButton', () => {
  let component: SquareIconButton;
  let fixture: ComponentFixture<SquareIconButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SquareIconButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SquareIconButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
