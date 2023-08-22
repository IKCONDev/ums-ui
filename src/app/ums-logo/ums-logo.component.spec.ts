import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UmsLogoComponent } from './ums-logo.component';

describe('UmsLogoComponent', () => {
  let component: UmsLogoComponent;
  let fixture: ComponentFixture<UmsLogoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UmsLogoComponent]
    });
    fixture = TestBed.createComponent(UmsLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
