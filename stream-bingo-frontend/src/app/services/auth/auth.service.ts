import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { BehaviorSubject, Observable, Subject, map, tap } from 'rxjs'
import { jwtDecode, } from 'jwt-decode'
import { Router } from '@angular/router'
import { ISession, IValidateCodeResponse } from './interfaces'

const AUTHORIZATION_KEY = 'authorization'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient)
  private readonly router = inject(Router)
  private readonly authorization$$: Subject<string | null | undefined>
    = new BehaviorSubject<string | null | undefined>(undefined)
  public readonly session$ = this.authorization$$.pipe(
    map(authorization => authorization ? jwtDecode<ISession>(authorization) : null),
    tap(session => {
      if(session && session.exp < new Date().getTime()/1000){
        this.authorization$ = null
      }
    })
  )

  constructor(){
    this.authorization$$.next(localStorage.getItem(AUTHORIZATION_KEY) ?? null)
  }

  public rawAuthorization$ = this.authorization$$.asObservable()

  public get authorization$(): Observable<string | null>{
    return this.authorization$$.pipe(
      tap(val => {
        if(val){
          localStorage.setItem(AUTHORIZATION_KEY, val)
        }
        else{
          localStorage.removeItem(AUTHORIZATION_KEY)
        }
      }),
      map(authorization => `Bearer ${authorization}`),
    );
  }

  public set authorization$(authorization: string | null){
    this.authorization$$.next(authorization)
  }

  public validateCode(code: string, provider: string): Observable<IValidateCodeResponse>{
    return this.http
      .get<IValidateCodeResponse>(`/api/auth/${provider}`, { params: { code }})
      .pipe(
        tap(({access_token}) => this.authorization$ = access_token)
      )
  }

  public logout(){
    this.authorization$ = null
    this.http.get('/api/auth/logout').subscribe()
    const url = this.router.url
    this.router.navigate(['/']).then(() => {
      this.router.navigate([url])
    })
  }

  public hasRight(r: string): Observable<boolean>{
    return this.session$.pipe(
      map(session => session?.rights.find(({right}) => r === right) !== undefined)
    )
  }

  public get isAdmin(): Observable<boolean>{
    return this.hasRight('a')
  }
}
