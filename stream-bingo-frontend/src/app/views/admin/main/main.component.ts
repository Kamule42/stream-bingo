import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminMenuComponent } from "../../../components/admin/admin-menu/admin-menu.component";

@Component({
  selector: 'app-main',
  imports: [RouterOutlet, AdminMenuComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

}
