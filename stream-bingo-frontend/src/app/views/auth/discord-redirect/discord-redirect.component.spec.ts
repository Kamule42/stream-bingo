import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscordRedirectComponent } from './discord-redirect.component';

describe('DiscordRedirectComponent', () => {
  let component: DiscordRedirectComponent;
  let fixture: ComponentFixture<DiscordRedirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscordRedirectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscordRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
