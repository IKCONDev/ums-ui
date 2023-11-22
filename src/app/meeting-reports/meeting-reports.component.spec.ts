import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingReportsComponent } from './meeting-reports.component';

describe('MeetingReportsComponent', () => {
  let component: MeetingReportsComponent;
  let fixture: ComponentFixture<MeetingReportsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MeetingReportsComponent]
    });
    fixture = TestBed.createComponent(MeetingReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
