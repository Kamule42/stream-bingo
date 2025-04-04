import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs';
import { ValidateCodeResponse } from './interfaces';

const AUTHORIZATION_KEY = 'authorization'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient)
  private readonly authorization$$: Subject<string | null>
    = new BehaviorSubject<string | null>(null)

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
      })
    );
  }

  private set authorization$(authorization: string){
    this.authorization$$.next(authorization)
    sessionStorage.setItem(AUTHORIZATION_KEY, authorization)
  }

  public getDiscordUrl(): Observable<string>{
    return this.http.get<{url: string}>('/api/auth/discord-url').pipe(
      map(({url}) => url)
    )
  }

  public validateCode(code: string): Observable<ValidateCodeResponse>{
    return this.http
      .post<ValidateCodeResponse>('/api/auth/discord-validate', { code})
      .pipe(
        tap(({access_token}) => this.authorization$ = `Bearer ${access_token}`)
      )
  }
}
