import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { InputTextModule } from 'primeng/inputtext'
import { PopoverModule } from 'primeng/popover'
import { UsersService } from '../../../services/users/users.service'
import { AuthService } from '../../../services/auth'
import { toSignal } from '@angular/core/rxjs-interop'
import { InputGroupModule } from 'primeng/inputgroup'
import { InputGroupAddonModule } from 'primeng/inputgroupaddon'
import { tap } from 'rxjs'
import { MessageService } from 'primeng/api'
import { ProviderIconComponent } from "../../../components/provider-icon/provider-icon.component";

@Component({
  selector: 'app-profile',
  imports: [
    ButtonModule, PopoverModule, InputTextModule,
    InputGroupModule, InputGroupAddonModule,
    FormsModule,
    ProviderIconComponent
],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private readonly userService = inject(UsersService)
  private readonly authService = inject(AuthService)
  private readonly messageService = inject(MessageService)

  readonly providers = ['discord', 'google']

  readonly activeProvider = signal<string>('')

  readonly valueToDelete = 'supprimer'
  readonly check = signal<string>('')

  readonly username$ = signal<string>('')
  readonly session$ = toSignal(this.authService.session$.pipe(
    tap(val => {
      if(!val){
        return
      }
      this.username$.set(val?.username)
      this.activeProvider.set(val?.providers.find(({active}) => active)?.provider ?? '')
    })
  ))
  readonly editUsername$ = signal(false)
  readonly activeProviders$ = computed(() => {
    const session = this.session$()
    if(!session){
      return []
    }
    return session.providers
  })
  readonly inactiveProviders$ = computed(() => {
    const activeProviders = this.activeProviders$()
    return this.providers.filter(provider => activeProviders.find(p => p.provider === provider) == null)
  })


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

  public updateUsername(){
    const username = this.username$()
    if(username.trim().length === 0){
      this.messageService.add({
        severity: 'error',
        summary: 'Votre pseudo ne peut être vide'
      })
      return
    }
    this.userService.updateUsername(username)
    this.editUsername$.set(false)
  }

  public cancelUsernameEdit(){
    this.editUsername$.set(false)
    this.username$.set(this.session$()?.username ?? '')
  }

  formatLabel(provider: string): string{
    return provider.charAt(0).toLocaleUpperCase() + provider.slice(1)
  }

  setActive(provider: string){
    this.userService.setActiveIcon(provider)
    this.activeProvider.set(provider)
  }
}
