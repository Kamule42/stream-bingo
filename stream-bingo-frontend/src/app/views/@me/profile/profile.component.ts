import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { InputTextModule } from 'primeng/inputtext'
import { PopoverModule } from 'primeng/popover'
import { UsersService } from '../../../services/users/users.service'
import { AuthService } from '../../../services/auth'

@Component({
  selector: 'app-profile',
  imports: [
    ButtonModule, PopoverModule, InputTextModule,
    FormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private readonly userService = inject(UsersService)
  private readonly authService = inject(AuthService)

  readonly valueToDelete = 'supprimer'
  readonly check = signal<string>('')


  ngOnInit(): void {
    this.userService.accountDeleted$.subscribe({
      next: () => this.authService.logout()
    })
  }

  public deleteAccount(){
    this.userService.delete()
    this.authService.logout()
  }
  
  public logout(){
    this.authService.logout()
  }
}
