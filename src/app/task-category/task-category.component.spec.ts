import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskCategoryComponent } from './task-category.component';

describe('TaskCategoryComponent', () => {
  let component: TaskCategoryComponent;
  let fixture: ComponentFixture<TaskCategoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TaskCategoryComponent]
    });
    fixture = TestBed.createComponent(TaskCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
