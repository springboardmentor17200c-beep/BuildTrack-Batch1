import os

proc_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/routes/procurement.py'
with open(proc_path, 'r', encoding='utf-8') as f:
    proc_content = f.read()

old_logic = """            # Update PostgreSQL database to sync with Inventory Dashboard
            try:
                from app.models.inventory import Material, Inventory
                from sqlalchemy import func
                material_db = db.query(Material).filter(func.lower(Material.material_name) == mat.lower()).first()
                if material_db:
                    inv_db = db.query(Inventory).filter(Inventory.material_id == material_db.material_id).first()
                    if inv_db:
                        inv_db.available_quantity = float(inv_db.available_quantity) + float(accepted)
                        db.commit()
            except Exception as e:
                print("Failed to sync inventory to DB:", e)"""

new_logic = """            # Update PostgreSQL database to sync with Inventory Dashboard
            try:
                from app.models.inventory import Material, Inventory
                from sqlalchemy import func
                material_db = db.query(Material).filter(func.lower(Material.material_name) == mat.lower()).first()
                
                # If material doesn't exist, create it
                if not material_db:
                    material_db = Material(
                        company_id=current_user.company_id if current_user else 1,
                        material_name=mat,
                        unit="Units",
                        description="Auto-created from Procurement Delivery",
                        is_active=True
                    )
                    db.add(material_db)
                    db.commit()
                    db.refresh(material_db)
                
                # Find or create inventory record
                inv_db = db.query(Inventory).filter(Inventory.material_id == material_db.material_id).first()
                if inv_db:
                    inv_db.available_quantity = float(inv_db.available_quantity) + float(accepted)
                else:
                    inv_db = Inventory(
                        company_id=current_user.company_id if current_user else 1,
                        material_id=material_db.material_id,
                        available_quantity=float(accepted),
                        minimum_stock_level=10,
                        storage_location="Main Site"
                    )
                    db.add(inv_db)
                
                db.commit()
            except Exception as e:
                print("Failed to sync inventory to DB:", e)"""

proc_content = proc_content.replace(old_logic, new_logic)

with open(proc_path, 'w', encoding='utf-8') as f:
    f.write(proc_content)
