import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppMenuItemsComponent } from './app-menu-item.component';

describe('AppMenuItemsComponent', () => {
  let component: AppMenuItemsComponent;
  let fixture: ComponentFixture<AppMenuItemsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AppMenuItemsComponent]
    });
    fixture = TestBed.createComponent(AppMenuItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
