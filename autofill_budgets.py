"""
Auto-fill allocated_budget for existing projects (where allocated_budget = 0).

Strategy:
  1. Calculate actual labour cost (shifts × pay_rate) per project
  2. Calculate actual material cost (procurement requests × avg unit price) per project
  3. allocated_budget = (labour + material) × 1.25  (25% overhead buffer)
     If no spend data exists, fallback to a reasonable estimate based on project duration:
     duration_days × 50000 (₹50k per day)
"""

from sqlalchemy import create_engine, text
from decimal import Decimal
import json, os

engine = create_engine(
    'postgresql://postgres:1234@localhost:5432/buildtrack_db',
    connect_args={'options': '-csearch_path=buildtrack,public'}
)

# ── Load procurement store for material unit prices ──────────────────
store_path = os.path.join(os.path.dirname(__file__), 'backend', 'procurement_store.json')
with open(store_path, 'r', encoding='utf-8') as f:
    store = json.load(f)

db_requests = store.get('requests', {})
db_pos = store.get('purchase_orders', {})

# Build avg unit price per material
material_unit_prices: dict = {}
for po in db_pos.values():
    unit_price = po.get('unitPrice', 0)
    for mat in po.get('materials', []):
        key = mat.lower().strip()
        material_unit_prices.setdefault(key, [])
        if unit_price and unit_price > 0:
            material_unit_prices[key].append(float(unit_price))

avg_unit_price = {k: sum(v)/len(v) for k, v in material_unit_prices.items() if v}

with engine.connect() as conn:
    projects = conn.execute(text(
        'SELECT project_id, project_name, start_date, expected_end_date, allocated_budget FROM projects'
    )).fetchall()

    updated = 0
    for proj in projects:
        pid = proj[0]
        pname = proj[1]
        start = proj[2]
        end = proj[3]
        current_budget = float(proj[4] or 0)

        if current_budget > 0:
            print(f"[SKIP] {pname} (P-{pid}) -- already has budget Rs{current_budget:,.0f}")
            continue

        # ── Labour cost ──────────────────────────────────────────────
        labour_rows = conn.execute(text("""
            SELECT ep.pay_rate, ep.payment_type
            FROM shifts s
            JOIN employee_profiles ep ON s.employee_id = ep.employee_id
            WHERE s.project_id = :pid
        """), {"pid": pid}).fetchall()

        labour_cost = 0.0
        for row in labour_rows:
            pay_rate = float(row[0] or 0)
            payment_type = row[1] or 'Daily'
            if payment_type == 'Monthly':
                labour_cost += pay_rate / 26
            elif payment_type == 'Hourly':
                labour_cost += pay_rate * 8
            else:
                labour_cost += pay_rate

        # ── Material cost ─────────────────────────────────────────────
        proj_id_str = f'P-{pid}'
        material_cost = 0.0
        for req in db_requests.values():
            if req.get('projectId') == proj_id_str:
                mat_name = (req.get('material') or '').lower().strip()
                qty = float(req.get('receivedQuantity') or req.get('quantity') or 0)
                material_cost += qty * avg_unit_price.get(mat_name, 0)

        total_spend = labour_cost + material_cost

        if total_spend > 0:
            # 25% buffer on top of actual spend
            auto_budget = round(total_spend * 1.25)
        else:
            # Fallback: duration-based estimate (₹50k per working day)
            duration_days = max(1, (end - start).days) if start and end else 30
            auto_budget = round(duration_days * 50000)

        conn.execute(text(
            'UPDATE projects SET allocated_budget = :budget WHERE project_id = :pid'
        ), {'budget': auto_budget, 'pid': pid})

        print(f"[SET] {pname} (P-{pid}) -> Rs{auto_budget:,.0f}  "
              f"(labour=Rs{labour_cost:,.0f}, material=Rs{material_cost:,.0f}, spend=Rs{total_spend:,.0f})")
        updated += 1

    conn.commit()
    print(f"\n✅ Updated {updated} projects.")
