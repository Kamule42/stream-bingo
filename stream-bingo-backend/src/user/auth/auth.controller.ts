import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { AuthService } from './auth.service';
import { map, Observable } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('discord-url')
  public getDiscordUrl(): { url: string } {
    return {
      url: this.authService.getAuthUrl(),
    };
  }

  @Get('redirect/discord')
  @Redirect('/')
  public discordRedirect(
    @Query('code') code: string,
  ): Observable<{ url: string }> {
    return this.authService.validateDiscord(code).pipe(
      map(() => ({
        url: '/',
      })),
    );
  }
}
