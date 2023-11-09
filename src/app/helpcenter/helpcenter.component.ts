import { Component,Output } from '@angular/core';

@Component({
  selector: 'app-helpcenter',
  templateUrl: './helpcenter.component.html',
  styleUrls: ['./helpcenter.component.css']
})
export class HelpcenterComponent {
  @Output() title: string = 'Help';

}
