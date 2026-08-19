import os
import re

filepath = 'frontend/buildtrack-frontend/src/app/features/shared/notification/notification-dropdown.component.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace getRoute
old_getRoute = """  getRoute(n: AppNotification): string | null {
    return NOTIFICATION_ROUTES[n.title] ?? null;
  }"""

new_getRoute = """  getRoute(n: AppNotification): string | null {
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
  }"""

content = content.replace(old_getRoute, new_getRoute)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
