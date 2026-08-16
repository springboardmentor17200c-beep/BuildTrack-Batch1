PROCUREMENT MODULE — SETUP INSTRUCTIONS
========================================

1) COPY FOLDERS
----------------
Copy the entire "procurement" folder from this zip into:

  src/app/features/procurement

Your final structure should look like:

  src/app/features/procurement/
    models/
      procurement.model.ts
    procurement-hub/
      procurement-hub.component.ts
      procurement-hub.component.html
      procurement-hub.component.css
    vendor-management/
      vendor-management.component.ts
      vendor-management.component.html
      vendor-management.component.css
    purchase-orders/
      purchase-orders.component.ts
      purchase-orders.component.html
      purchase-orders.component.css
    invoice-tracking/
      invoice-tracking.component.ts
      invoice-tracking.component.html
      invoice-tracking.component.css
    procurement-data.service.ts
    procurement.routes.ts


2) WIRE UP ROUTING — src/app/app.routes.ts
--------------------------------------------
Add this import near your other feature route imports:

  import { PROCUREMENT_ROUTES } from './features/procurement/procurement.routes';

Add this route entry alongside your other role-restricted modules
(next to resources/inventory/workforce/analytics):

  { path: 'procurement', children: PROCUREMENT_ROUTES, canActivate: [roleGuard('procurement')] },


3) ADD MODULE ACCESS — src/app/features/auth/models/auth.model.ts
---------------------------------------------------------------------
Find MODULE_ACCESS and add:

  procurement: ['Administrator', 'Project Manager'],


4) ADD SIDEBAR NAV ITEM — app-sidebar.component.ts
-----------------------------------------------------
Add to the navItems array:

  { label: 'nav.procurement', route: '/procurement', icon: 'procurement', moduleKey: 'procurement' },


5) ADD SIDEBAR ICON — app-sidebar.component.html
-----------------------------------------------------
Find the line for the 'analytics' icon and add this right after it:

  <svg *ngIf="item.icon === 'procurement'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path><rect x="9" y="3" width="6" height="4" rx="1"></rect></svg>


6) ADD TRANSLATION KEY — src/app/features/shared/translations.ts
----------------------------------------------------------------------
Add 'nav.procurement' to all 5 language blocks, right after 'nav.analytics':

  en: 'nav.procurement': 'Procurement',
  hi: 'nav.procurement': 'खरीद',
  ta: 'nav.procurement': 'கொள்முதல்',
  te: 'nav.procurement': 'కొనుగోలు',
  bn: 'nav.procurement': 'ক্রয়',


7) RESTART CLEANLY
--------------------
  rmdir /s /q .angular\cache
  ng serve

Then hard refresh the browser (Ctrl+Shift+R) and visit /procurement/hub.


NOTE ON BACKEND
-----------------
This module currently uses mock/in-memory data in procurement-data.service.ts
(same pattern as the Workforce module before it was connected). Once your
teammate's real vendor/purchase-order/invoice backend tables and routes are
ready, swap the mock arrays in procurement-data.service.ts for real
HttpClient calls — same pattern used for the auth module integration.
