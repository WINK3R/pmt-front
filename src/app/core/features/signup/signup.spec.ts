import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Signup } from './signup';
import { AuthService } from '../../services/auth/authService';
import { Router } from '@angular/router';
import { UserDTO } from '../../models/dtos/dto';
import {RouterTestingModule} from '@angular/router/testing';

describe('Signup', () => {
  let component: Signup;
  let fixture: ComponentFixture<Signup>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', ['register', 'login']);

    await TestBed.configureTestingModule({
      imports: [Signup, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(Signup);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should register, login and navigate on success', fakeAsync(() => {
    const mockUser: UserDTO = { id: 'u1', username: 'John' } as any;
    authSpy.register.and.returnValue(of(mockUser));
    authSpy.login.and.returnValue(of(mockUser));

    component.username = 'john';
    component.email = 'john@test.com';
    component.password = '1234';

    component.onSubmit();
    tick();

    expect(authSpy.register).toHaveBeenCalledWith('john', 'john@test.com', '1234');
    expect(authSpy.login).toHaveBeenCalledWith('john@test.com', '1234');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should log error if register fails', () => {
    const consoleSpy = spyOn(console, 'error');
    authSpy.register.and.returnValue(throwError(() => new Error('register fail')));

    component.onSubmit();

    expect(authSpy.register).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Sign Up failed', jasmine.any(Error));
    expect(authSpy.login).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should log error if login fails after register', fakeAsync(() => {
    const consoleSpy = spyOn(console, 'error');
    const mockUser: UserDTO = { id: 'u1', username: 'John' } as any;
    authSpy.register.and.returnValue(of(mockUser));
    authSpy.login.and.returnValue(throwError(() => new Error('login fail')));

    component.username = 'john';
    component.email = 'john@test.com';
    component.password = '1234';

    component.onSubmit();
    tick();

    expect(authSpy.register).toHaveBeenCalled();
    expect(authSpy.login).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Login failed', jasmine.any(Error));
    expect(router.navigate).not.toHaveBeenCalled();
  }));
});
