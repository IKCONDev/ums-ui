import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoPermissionComponent } from './no-permission.component';

describe('NoPermissionComponent', () => {
  let component: NoPermissionComponent;
  let fixture: ComponentFixture<NoPermissionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NoPermissionComponent]
    });
    fixture = TestBed.createComponent(NoPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
