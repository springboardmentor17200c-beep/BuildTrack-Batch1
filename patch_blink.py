import os

filepath = 'frontend/buildtrack-frontend/src/app/features/shared/notification/notification-dropdown.component.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Import ChangeDetectorRef
if 'ChangeDetectorRef' not in content:
    content = content.replace('ElementRef, ViewChild, AfterViewInit', 'ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef')

# Inject ChangeDetectorRef
old_constructor = """  constructor(
    private notifService: NotificationService,
    private router: Router
  ) {}"""

new_constructor = """  constructor(
    private notifService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}"""

content = content.replace(old_constructor, new_constructor)

# Call detectChanges()
old_ngOnInit = """  ngOnInit() {
    this.sub = this.notifService.notifications$.subscribe(data => {
      this.notifications = data.map(n => ({ ...n }));
    });
  }"""

new_ngOnInit = """  ngOnInit() {
    this.sub = this.notifService.notifications$.subscribe(data => {
      this.notifications = data.map(n => ({ ...n }));
      this.cdr.detectChanges();
    });
  }"""

content = content.replace(old_ngOnInit, new_ngOnInit)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
