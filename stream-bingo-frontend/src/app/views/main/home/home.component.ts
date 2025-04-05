import { Component } from '@angular/core';
import { StreamListComponent } from "../../../components/stream-list/stream-list.component";

@Component({
  selector: 'app-home',
  imports: [StreamListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
