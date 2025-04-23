import { Component } from '@angular/core';
import { StreamListComponent } from "../../../components/stream-list/stream-list.component";
import { FindStreamComponent } from "../../../components/stream/find-stream/find-stream.component";

@Component({
  selector: 'app-home',
  imports: [StreamListComponent, FindStreamComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
