import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotPasswordEmailVerificationComponent } from './forgot-password-email-verification.component';

describe('ForgotPasswordEmailVerificationComponent', () => {
  let component: ForgotPasswordEmailVerificationComponent;
  let fixture: ComponentFixture<ForgotPasswordEmailVerificationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ForgotPasswordEmailVerificationComponent]
    });
    fixture = TestBed.createComponent(ForgotPasswordEmailVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
