import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionWatcherComponent } from './session-watcher.component';

describe('SessionWatcherComponent', () => {
  let component: SessionWatcherComponent;
  let fixture: ComponentFixture<SessionWatcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionWatcherComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionWatcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
