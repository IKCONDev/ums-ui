import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskReportsComponent } from './task-reports.component';

describe('TaskReportsComponent', () => {
  let component: TaskReportsComponent;
  let fixture: ComponentFixture<TaskReportsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TaskReportsComponent]
    });
    fixture = TestBed.createComponent(TaskReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
