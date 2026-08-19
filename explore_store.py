import json

store_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/procurement_store.json'
with open(store_path, 'r', encoding='utf-8') as f:
    store = json.load(f)

print("=== POs (first 2) ===")
for i, (k, v) in enumerate(store.get('purchase_orders', {}).items()):
    print(json.dumps(v, indent=2))
    if i >= 1:
        break

print("\n=== Invoices (first 2) ===")
for i, (k, v) in enumerate(store.get('invoices', {}).items()):
    print(json.dumps(v, indent=2))
    if i >= 1:
        break
        
print("\n=== Requests (first 1) ===")
for i, (k, v) in enumerate(store.get('requests', {}).items()):
    print(json.dumps(v, indent=2))
    if i >= 0:
        break
