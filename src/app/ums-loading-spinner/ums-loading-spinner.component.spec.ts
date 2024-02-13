import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UmsLoadingSpinnerComponent } from './ums-loading-spinner.component';

describe('UmsLoadingSpinnerComponent', () => {
  let component: UmsLoadingSpinnerComponent;
  let fixture: ComponentFixture<UmsLoadingSpinnerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UmsLoadingSpinnerComponent]
    });
    fixture = TestBed.createComponent(UmsLoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
