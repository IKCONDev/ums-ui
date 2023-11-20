import { Component, OnInit,Output } from '@angular/core';

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.css']
})
export class PermissionComponent implements OnInit{
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  @Output() title = 'Permissions';

}
