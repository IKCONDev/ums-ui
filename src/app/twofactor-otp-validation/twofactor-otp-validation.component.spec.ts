import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwofactorOtpValidationComponent } from './twofactor-otp-validation.component';

describe('TwofactorOtpValidationComponent', () => {
  let component: TwofactorOtpValidationComponent;
  let fixture: ComponentFixture<TwofactorOtpValidationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TwofactorOtpValidationComponent]
    });
    fixture = TestBed.createComponent(TwofactorOtpValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
