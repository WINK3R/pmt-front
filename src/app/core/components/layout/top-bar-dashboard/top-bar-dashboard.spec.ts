import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopBarDashboard } from './top-bar-dashboard';

describe('TopBarDashboard', () => {
  let component: TopBarDashboard;
  let fixture: ComponentFixture<TopBarDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopBarDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopBarDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
