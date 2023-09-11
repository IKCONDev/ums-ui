import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingActionitemsComponent } from './meeting-actionitems.component';

describe('MeetingActionitemsComponent', () => {
  let component: MeetingActionitemsComponent;
  let fixture: ComponentFixture<MeetingActionitemsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MeetingActionitemsComponent]
    });
    fixture = TestBed.createComponent(MeetingActionitemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
