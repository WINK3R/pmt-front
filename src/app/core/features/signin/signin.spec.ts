import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Signin } from './signin';
import { AuthService } from '../../services/auth/authService';
import { Router } from '@angular/router';
import { UserDTO } from '../../models/dtos/dto';
import {RouterTestingModule} from '@angular/router/testing';

describe('Signin', () => {
  let component: Signin;
  let fixture: ComponentFixture<Signin>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [Signin, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(Signin);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call AuthService.login and navigate on success', fakeAsync(() => {
    const mockUser: UserDTO = { id: 'u1', username: 'John' } as any;
    authSpy.login.and.returnValue(of(mockUser));

    component.email = 'test@test.com';
    component.password = '1234';

    component.onSubmit();
    tick(); // laisse le subscribe s’exécuter

    expect(authSpy.login).toHaveBeenCalledWith('test@test.com', '1234');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should log error when login fails', () => {
    const consoleSpy = spyOn(console, 'error');
    authSpy.login.and.returnValue(throwError(() => new Error('bad credentials')));

    component.email = 'wrong@test.com';
    component.password = 'bad';

    component.onSubmit();

    expect(authSpy.login).toHaveBeenCalledWith('wrong@test.com', 'bad');
    expect(consoleSpy).toHaveBeenCalledWith('Login failed', jasmine.any(Error));
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
