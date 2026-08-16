import { Injectable } from '@angular/core';
import { filter, distinctUntilChanged } from 'rxjs/operators';
import { AuthDataService } from './features/auth/auth-data.service';
import { ProjectsDataService } from './features/projects/projects-data.service';
import { InventoryDataService } from './features/inventory/inventory-data.service';
import { WorkforceDataService } from './features/workforce/workforce-data.service';
import { AnalyticsDataService } from './features/analytics/analytics-data.service';
import { AppUser } from './features/auth/models/auth.model';

/**
 * AppDataService — single place that reloads all module data
 * whenever the authenticated user changes (login / re-login).
 *
 * Injected once in AppComponent so it starts listening immediately.
 */
@Injectable({ providedIn: 'root' })
export class AppDataService {

  constructor(
    private auth: AuthDataService,
    private projects: ProjectsDataService,
    private inventory: InventoryDataService,
    private workforce: WorkforceDataService,
    private analytics: AnalyticsDataService,
  ) {
    // Reload all data services whenever a user logs in.
    // distinctUntilChanged prevents double-reload on same user object ref.
    this.auth.currentUser$
      .pipe(
        // Only act when we have a logged-in user (not on logout)
        filter((user): user is AppUser => !!user),
        // Detect actual user change by userId so we reload on re-login too
        distinctUntilChanged((a, b) => a.userId === b.userId),
      )
      .subscribe(() => {
        this.projects.loadAll();
        this.inventory.loadAll();
        this.workforce.loadAll();
        this.analytics.loadAll();
      });
  }
}
