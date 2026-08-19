import {
  Component, OnInit, OnDestroy,
  HostListener, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService, AppNotification } from '../../../core/services/notification.service';

const NOTIFICATION_ROUTES: Record<string, string> = {
  'New PR Pending':     '/procurement/requests',
  'PR Approved':        '/procurement/workflow',
  'New Purchase Order': '/procurement/vendor-dashboard',
  'Invoice Received':   '/procurement/workflow',
  'Payment Processed':  '/procurement/vendor-dashboard',
  'Material Delivered': '/procurement/requests',
};

interface AnimatedNotification extends AppNotification {
  _removing?: boolean;
}

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Bell button stays inside the sidebar -->
    <button
      #bellBtn
      class="nw-bell"
      [class.nw-bell--active]="hasNotifications"
      (click)="toggle($event)"
      title="Notifications"
    >
      <svg
        class="nw-bell__icon"
        [class.nw-bell__icon--ring]="hasNotifications"
        width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      >
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span class="nw-badge" *ngIf="hasNotifications">
        {{ notifications.length > 9 ? '9+' : notifications.length }}
      </span>
    </button>

    <!--
      The panel is rendered here but IMMEDIATELY teleported to <body>
      inside ngAfterViewInit, so it escapes all parent stacking contexts.
      Angular still tracks and updates all bindings because it holds
      the view reference — only the DOM location changes.
    -->
    <div #panel class="nw-panel" [class.nw-panel--open]="isOpen"
         [style.top.px]="panelTop" [style.left.px]="panelLeft"
         (click)="$event.stopPropagation()">

      <!-- Glass card -->
      <div class="nw-panel__card" [class.nw-panel__card--visible]="isOpen">

        <!-- Header -->
        <div class="nw-hdr">
          <div class="nw-hdr__left">
            <span class="nw-hdr__title">Tasks</span>
            <span class="nw-hdr__badge" *ngIf="notifications.length > 0">{{ notifications.length }} pending</span>
          </div>
          <button class="nw-hdr__clear" *ngIf="notifications.length > 0" (click)="clearAll()">
            Clear all
          </button>
        </div>

        <!-- Body -->
        <div class="nw-body">
          <div class="nw-empty" *ngIf="notifications.length === 0">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1" opacity="0.2">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span>All caught up!</span>
          </div>

          <div
            class="nw-item"
            *ngFor="let n of notifications; let i = index"
            [class.nw-item--unread]="!n.is_read"
            [class.nw-item--removing]="n._removing"
            [style.animation-delay]="n._removing ? (i * 45) + 'ms' : '0ms'"
            (click)="onItemClick(n)"
          >
            <div class="nw-item__stripe" [class.nw-item__stripe--read]="n.is_read"></div>
            <div class="nw-item__body">
              <div class="nw-item__head">
                <span class="nw-item__title">{{ n.title }}</span>
                <span class="nw-item__time">{{ n.created_at | date:'d MMM · h:mm a' }}</span>
              </div>
              <div class="nw-item__msg">{{ n.message }}</div>
              <div class="nw-item__cta" *ngIf="getRoute(n)">Tap to view →</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* ── Bell button ────────────────────────── */
    :host { display: flex; align-items: center; }

    .nw-bell {
      background: transparent; border: none; cursor: pointer;
      padding: 6px; border-radius: 8px; position: relative;
      color: #475569; display: flex; align-items: center; justify-content: center;
      transition: background .15s, color .15s;
    }
    .nw-bell:hover { background: rgba(255,255,255,.07); color: #94a3b8; }
    .nw-bell--active { color: #ef4444 !important; }
    .nw-bell--active:hover { background: rgba(239,68,68,.1); }

    @keyframes ring {
      0%,55%,100% { transform: rotate(0) scale(1); }
      8%  { transform: rotate(-18deg) scale(1.2); }
      16% { transform: rotate(15deg)  scale(1.15); }
      24% { transform: rotate(-12deg) scale(1.1); }
      32% { transform: rotate(9deg)   scale(1.05); }
      40% { transform: rotate(-5deg)  scale(1); }
      48% { transform: rotate(3deg)   scale(1); }
    }
    .nw-bell__icon--ring {
      animation: ring 2.2s ease-in-out infinite;
      transform-origin: 50% 2px; color: #ef4444;
    }

    .nw-badge {
      position: absolute; top: -1px; right: -1px;
      background: #ef4444; color: #fff;
      font-size: 9px; font-weight: 700;
      min-width: 15px; height: 15px; border-radius: 99px;
      display: flex; align-items: center; justify-content: center;
      padding: 0 3px; border: 1.5px solid #0f172a;
    }

    /* ── Panel wrapper (teleported to <body>) ── */
    .nw-panel {
      position: fixed;
      /* coordinates set dynamically via [style.top/left] */
      z-index: 2147483647;   /* max possible z-index */
      pointer-events: none;  /* invisible when closed */
      width: 320px;
    }
    .nw-panel--open { pointer-events: auto; }

    /* ── Glass card ── */
    .nw-panel__card {
      position: relative;
      width: 320px;
      background: rgba(13, 20, 33, 0.82);
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 16px;
      box-shadow:
        0 24px 48px -8px rgba(0,0,0,0.7),
        0 0 0 0.5px rgba(255,255,255,0.04) inset;
      overflow: hidden;
      /* entrance animation */
      opacity: 0;
      transform: translateY(6px) scale(.97);
      transition: opacity .18s cubic-bezier(.22,1,.36,1), transform .18s cubic-bezier(.22,1,.36,1);
    }
    .nw-panel__card--visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    /* ── Header ── */
    .nw-hdr {
      display: flex; align-items: center; justify-content: space-between;
      padding: 13px 16px 11px;
      border-bottom: 1px solid rgba(255,255,255,.07);
      background: rgba(0,0,0,.25);
    }
    .nw-hdr__left { display: flex; align-items: center; gap: 8px; }
    .nw-hdr__title {
      font-size: 11px; font-weight: 700; letter-spacing: .09em;
      text-transform: uppercase; color: rgba(255,255,255,.4);
    }
    .nw-hdr__badge {
      background: rgba(239,68,68,.2); color: #f87171;
      font-size: 10px; font-weight: 600;
      padding: 1px 8px; border-radius: 99px;
    }
    .nw-hdr__clear {
      background: none; border: none;
      color: rgba(255,255,255,.3); font-size: 11px; font-weight: 500;
      cursor: pointer; padding: 3px 8px; border-radius: 6px;
      transition: color .15s, background .15s;
    }
    .nw-hdr__clear:hover { color: #f87171; background: rgba(239,68,68,.12); }

    /* ── Body ── */
    .nw-body {
      max-height: 360px; overflow-y: auto;
      scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.08) transparent;
    }
    .nw-body::-webkit-scrollbar { width: 3px; }
    .nw-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 3px; }

    /* ── Empty ── */
    .nw-empty {
      padding: 40px 16px; text-align: center;
      color: rgba(255,255,255,.2); font-size: 13px;
      display: flex; flex-direction: column; align-items: center; gap: 10px;
    }

    /* ── Item ── */
    .nw-item {
      display: flex; align-items: stretch;
      cursor: pointer; overflow: hidden;
      border-bottom: 1px solid rgba(255,255,255,.04);
      transition: background .15s;
    }
    .nw-item:last-child { border-bottom: none; }
    .nw-item:hover { background: rgba(255,255,255,.06); }
    .nw-item--unread { background: rgba(239,68,68,.06); }
    .nw-item--unread:hover { background: rgba(239,68,68,.1); }

    @keyframes swipeOut {
      0%   {
        transform: scaleX(1);
        opacity: 1;
        max-height: 90px;
        padding-top: 11px;
        padding-bottom: 11px;
      }
      45%  {
        transform: scaleX(0);
        opacity: 0;
        max-height: 90px;
        padding-top: 11px;
        padding-bottom: 11px;
      }
      100% {
        transform: scaleX(0);
        opacity: 0;
        max-height: 0;
        padding-top: 0;
        padding-bottom: 0;
        border-bottom-width: 0;
      }
    }
    .nw-item--removing {
      transform-origin: left center;
      animation: swipeOut .42s ease-in forwards;
    }

    .nw-item__stripe {
      width: 3px; flex-shrink: 0;
      background: linear-gradient(180deg, #ef4444, #f97316);
      transition: background .3s;
    }
    .nw-item__stripe--read { background: rgba(255,255,255,.08); }

    .nw-item__body { flex: 1; padding: 11px 14px; min-width: 0; }
    .nw-item__head {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;
    }
    .nw-item__title { font-size: 12px; font-weight: 600; color: rgba(255,255,255,.75); }
    .nw-item--unread .nw-item__title { color: #fff; }
    .nw-item__time { font-size: 10px; color: rgba(255,255,255,.22); flex-shrink: 0; margin-left: 8px; }
    .nw-item__msg {
      font-size: 12px; color: rgba(255,255,255,.38);
      line-height: 1.45; margin-bottom: 5px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .nw-item--unread .nw-item__msg { color: rgba(255,255,255,.5); }
    .nw-item__cta { font-size: 10px; font-weight: 600; color: #3b82f6; opacity: 0; transition: opacity .15s; }
    .nw-item:hover .nw-item__cta { opacity: 1; }
  `]
})
export class NotificationDropdownComponent implements OnInit, AfterViewInit, OnDestroy {
  notifications: AnimatedNotification[] = [];
  isOpen = false;
  panelTop = 0;
  panelLeft = 0;

  get hasNotifications(): boolean {
    return this.notifications.length > 0;
  }

  @ViewChild('bellBtn') bellBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('panel')   panelEl!: ElementRef<HTMLDivElement>;

  private sub?: Subscription;

  constructor(
    private notifService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.sub = this.notifService.notifications$.subscribe(data => {
      this.notifications = data.map(n => ({ ...n }));
      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit() {
    // ★ Teleport panel to <body> so it escapes every stacking context in the sidebar
    document.body.appendChild(this.panelEl.nativeElement);
  }

  ngOnDestroy() {
    // Clean up the teleported element
    const el = this.panelEl?.nativeElement;
    if (el && el.parentNode === document.body) {
      document.body.removeChild(el);
    }
    this.sub?.unsubscribe();
  }

  private updatePos() {
    const rect = this.bellBtn.nativeElement.getBoundingClientRect();
    // Anchor to the right of sidebar, vertically above the bell
    this.panelLeft = rect.right + 10;
    // Clamp so panel never goes above viewport
    const panelHeight = 380;
    this.panelTop = Math.max(8, rect.bottom - panelHeight);
  }

  toggle(event: Event) {
    event.stopPropagation();
    if (!this.isOpen) {
      this.updatePos();
      this.isOpen = true;
    } else {
      this.isOpen = false;
    }
  }

  @HostListener('document:click')
  onDocClick() { if (this.isOpen) this.isOpen = false; }

  @HostListener('window:resize')
  onResize() { if (this.isOpen) this.updatePos(); }

  getRoute(n: AppNotification): string | null {
    const t = (n.title || '').toLowerCase();
    const m = (n.message || '').toLowerCase();
    
    if (t.includes('pr') || t.includes('purchase request') || m.includes('purchase request')) return '/procurement/requests';
    if (t.includes('order') || t.includes('po ') || m.includes('purchase order')) return '/procurement/vendor-dashboard';
    if (t.includes('invoice') || t.includes('payment') || t.includes('approved')) return '/procurement/workflow';
    if (t.includes('material') || t.includes('delivery')) return '/inventory/tracking';
    if (t.includes('milestone') || t.includes('project')) return '/projects';
    if (t.includes('budget') || t.includes('expense')) return '/analytics';
    
    // Fallback to the hardcoded map if none of the above match, or just return analytics hub
    return NOTIFICATION_ROUTES[n.title] ?? '/analytics';
  }

  onItemClick(n: AnimatedNotification) {
    // Automatically wipe off (delete) when clicked/completed
    this.notifications = this.notifications.filter(x => x.id !== n.id);
    this.notifService.deleteNotification(n.id).subscribe();
    
    const route = this.getRoute(n);
    if (route) {
      this.isOpen = false;
      this.router.navigateByUrl(route);
    }
  }

  clearAll() {
    this.notifications.forEach((n, i) => {
      setTimeout(() => { n._removing = true; }, i * 45);
    });
    const delay = this.notifications.length * 45 + 420;
    setTimeout(() => {
      this.notifications = [];
      this.notifService.deleteAll().subscribe();
    }, delay);
  }
}
