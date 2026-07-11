import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { Event, Router, NavigationStart, NavigationEnd } from '@angular/router';
import { PageLoaderComponent } from './layout/page-loader/page-loader.component';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-root',
    imports: [RouterModule, PageLoaderComponent],
    providers: [],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    private cdr = inject(ChangeDetectorRef);
  _router = inject(Router);

  currentUrl!: string;
  constructor() {
    this._router.events.pipe(takeUntilDestroyed()).subscribe((routerEvent: Event) => {
      if (routerEvent instanceof NavigationStart) {
        this.currentUrl = routerEvent.url.substring(
          routerEvent.url.lastIndexOf('/') + 1
        );
      }
      if (routerEvent instanceof NavigationEnd) {
        /* empty */
      }
      window.scrollTo(0, 0);
        this.cdr.markForCheck();
    });
  }
}
