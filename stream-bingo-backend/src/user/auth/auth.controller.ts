import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('discord-url')
  public getDiscordUrl(): { url: string } {
    return {
      url: this.authService.getAuthUrl(),
    };
  }

  @Post('discord-validate')
  public discordRedirect(@Body() {code}: {code: string}): Observable<{access_token: string}> {
    return this.authService.validateDiscord(code)
  }
}
