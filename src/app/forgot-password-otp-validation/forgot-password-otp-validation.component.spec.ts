import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotPasswordOtpValidationComponent } from './forgot-password-otp-validation.component';

describe('ForgotPasswordOtpValidationComponent', () => {
  let component: ForgotPasswordOtpValidationComponent;
  let fixture: ComponentFixture<ForgotPasswordOtpValidationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ForgotPasswordOtpValidationComponent]
    });
    fixture = TestBed.createComponent(ForgotPasswordOtpValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
