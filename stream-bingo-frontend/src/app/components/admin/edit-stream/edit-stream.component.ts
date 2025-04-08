import { Component, inject, model, OnInit } from '@angular/core';
import { IStream } from '../../../services/streams/stream.interface';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../services/users/users.service';

@Component({
  selector: 'app-edit-stream',
  imports: [FormsModule],
  templateUrl: './edit-stream.component.html',
  styleUrl: './edit-stream.component.scss'
})
export class EditStreamComponent implements OnInit {
  private readonly usersService = inject(UsersService)
  readonly stream = model.required<Partial<IStream>>()

  ngOnInit(): void {
    this.usersService.searchByName('kam')
  }
}
