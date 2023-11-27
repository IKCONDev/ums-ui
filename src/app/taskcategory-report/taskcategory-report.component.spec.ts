import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskcategoryReportComponent } from './taskcategory-report.component';

describe('TaskcategoryReportComponent', () => {
  let component: TaskcategoryReportComponent;
  let fixture: ComponentFixture<TaskcategoryReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TaskcategoryReportComponent]
    });
    fixture = TestBed.createComponent(TaskcategoryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
