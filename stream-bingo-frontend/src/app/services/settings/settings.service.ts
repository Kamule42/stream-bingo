import { Injectable } from '@angular/core';
import { BehaviorSubject, map, shareReplay, tap } from 'rxjs';
import { BingoMode, CheckType, ISaveParams } from './setting.types';
import { enumFromStringValue } from '../../shared/helpers/enum.helper';


const SETTINGS_BASE_KEY = '@SETTINGS_' 
const SETTINGS_CHECK = SETTINGS_BASE_KEY + 'CHECK'
const SETTINGS_CHECK_COLOR = SETTINGS_BASE_KEY + 'CHECK_COLOR'
const SETTINGS_STRIPE_COLOR = SETTINGS_BASE_KEY + 'STRIPE_COLOR'

const SETTINGS_BINGO_MODE = SETTINGS_BASE_KEY + 'BINGO_MODE'

const MAIN_COLOR =  window.getComputedStyle(document.body).getPropertyValue('--main-color') ?? '#097679'
const SECONDARY_COLOR =  window.getComputedStyle(document.body).getPropertyValue('--secondary-color') ?? '#ffc000'


@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly _check$ = new BehaviorSubject<CheckType>(CheckType.BRUSH_CIRCLE)

  private readonly _checkColor$ = new BehaviorSubject<string>(MAIN_COLOR)
  private readonly _stripeColor$ = new BehaviorSubject<string>(SECONDARY_COLOR)
  private readonly _bingoMode$ = new BehaviorSubject<BingoMode>(BingoMode.AUTO_COMPLETE)


  constructor() {
    this._check$.next(enumFromStringValue(
      CheckType, localStorage.getItem(SETTINGS_CHECK)
    ) ?? CheckType.DISC)
    this._checkColor$.next(localStorage.getItem(SETTINGS_CHECK_COLOR) ?? MAIN_COLOR)
    this._stripeColor$.next(localStorage.getItem(SETTINGS_STRIPE_COLOR) ?? SECONDARY_COLOR)
    this._bingoMode$.next(enumFromStringValue(
      BingoMode, localStorage.getItem(SETTINGS_BINGO_MODE)
    ) ?? BingoMode.AUTO_COMPLETE)
  }

  public check$ = this._check$.pipe(
    map(val => val ?? null),
    tap(val => val ? 
      localStorage.setItem(SETTINGS_CHECK, `${val}`) :
      localStorage.removeItem(SETTINGS_CHECK)),
    shareReplay(1),
  )
  public set check(val: CheckType){
    this._check$.next(val)
  }

  public checkColor$ = this._checkColor$.pipe(
    map(val => val ?? null),
    tap(val => val ? 
      localStorage.setItem(SETTINGS_CHECK_COLOR, `${val}`) :
      localStorage.removeItem(SETTINGS_CHECK_COLOR)),
    shareReplay(1),
  )
  public set checkColor(val: string | null){
    this._checkColor$.next(val ?? MAIN_COLOR)
  }

  public stripeColor$ = this._stripeColor$.pipe(
    map(val => val ?? null),
    tap(val => val ? 
      localStorage.setItem(SETTINGS_STRIPE_COLOR, `${val}`) :
      localStorage.removeItem(SETTINGS_STRIPE_COLOR)),
    shareReplay(1),
  )
  public set stripeColor(val: string | null){
    this._stripeColor$.next(val ?? SECONDARY_COLOR)
  }

  
  public bingoMode$ = this._bingoMode$.pipe(
    tap(val => localStorage.setItem(SETTINGS_BINGO_MODE, `${val}`)),
    shareReplay(1),
  )
  public set bingoMode(val: BingoMode){
    this._bingoMode$.next(val)
  }
  
  save(toSave: ISaveParams) {
    if(toSave.check !== undefined){
      this.check = toSave.check
    }
    if(toSave.checkColor !== undefined){
      this.checkColor = toSave.checkColor
    }
    if(toSave.stripeColor !== undefined){
      this.stripeColor = toSave.stripeColor
    }
    if(toSave.bingoMode !== undefined){
      this.bingoMode = toSave.bingoMode
    }
  }
}
