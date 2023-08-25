import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwofactorAuthenticationComponent } from './twofactor-authentication.component';

describe('TwofactorAuthenticationComponent', () => {
  let component: TwofactorAuthenticationComponent;
  let fixture: ComponentFixture<TwofactorAuthenticationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TwofactorAuthenticationComponent]
    });
    fixture = TestBed.createComponent(TwofactorAuthenticationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
