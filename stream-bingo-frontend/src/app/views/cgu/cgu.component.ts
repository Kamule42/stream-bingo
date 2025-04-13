import { ViewportScroller } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { filter } from 'rxjs'

@Component({
  selector: 'app-cgu',
  imports: [],
  templateUrl: './cgu.component.html',
  styleUrl: './cgu.component.scss'
})
export class CGUComponent implements OnInit {
  private readonly route = inject(ActivatedRoute)
  private readonly viewportScroller = inject(ViewportScroller)

  ngOnInit(): void {
    this.route.fragment.pipe(
      filter(fragment => fragment != null),
    ).subscribe({
      next: fragment => this.viewportScroller.scrollToAnchor(fragment)
    })
  }

}
