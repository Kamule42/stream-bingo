import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs'
import { ISession, IValidateCodeResponse } from './interfaces'
import { jwtDecode } from 'jwt-decode'

const AUTHORIZATION_KEY = 'authorization'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient)
  private readonly authorization$$: Subject<string | null | undefined>
    = new BehaviorSubject<string | null | undefined>(undefined)
  public readonly session$ = this.authorization$$.pipe(
    map(authorization => authorization ? jwtDecode<ISession>(authorization) : null)
  )

  constructor(){
    this.authorization$$.next(sessionStorage.getItem(AUTHORIZATION_KEY) ?? null)
  }

  public get authorization$(): Observable<string | null>{
    return this.authorization$$.pipe(
      tap(val => {
        if(val){
          sessionStorage.setItem(AUTHORIZATION_KEY, val)
        }
        else{
          sessionStorage.removeItem(AUTHORIZATION_KEY)
        }
      }),
      map(authorization => `Bearer ${authorization}`),
    );
  }

  private set authorization$(authorization: string | null){
    this.authorization$$.next(authorization)
    if(authorization){
      sessionStorage.setItem(AUTHORIZATION_KEY, authorization)
    }
    else{
      sessionStorage.removeItem(AUTHORIZATION_KEY)
    }
  }

  public getDiscordUrl(): Observable<string>{
    return this.http.get<{url: string}>('/api/auth/discord-url').pipe(
      map(({url}) => url)
    )
  }

  public validateCode(code: string): Observable<IValidateCodeResponse>{
    return this.http
      .post<IValidateCodeResponse>('/api/auth/discord-validate', { code})
      .pipe(
        tap(({access_token}) => this.authorization$ = access_token)
      )
  }

  public logout(){
    this.authorization$ = null
  }
}
