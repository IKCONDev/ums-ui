import { Component, Output } from '@angular/core';

@Component({
  selector: 'app-designation',
  templateUrl: './designation.component.html',
  styleUrls: ['./designation.component.css']
})
export class DesignationComponent {

  @Output() title:string='Designations';

}
