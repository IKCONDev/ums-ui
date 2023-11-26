import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionItemsReportsComponent } from './action-item-reports.component';

describe('ActionItemsReportsComponent', () => {
  let component: ActionItemsReportsComponent;
  let fixture: ComponentFixture<ActionItemsReportsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ActionItemsReportsComponent]
    });
    fixture = TestBed.createComponent(ActionItemsReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
