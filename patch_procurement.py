import os

proc_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/routes/procurement.py'
with open(proc_path, 'r', encoding='utf-8') as f:
    proc_content = f.read()

old_logic = """        if accepted > 0:
            if mat in db_inventory:
                db_inventory[mat]["stock"] += accepted
            else:
                db_inventory[mat] = {"id": generate_id(), "material": mat, "stock": accepted}"""

new_logic = """        if accepted > 0:
            if mat in db_inventory:
                db_inventory[mat]["stock"] += accepted
            else:
                db_inventory[mat] = {"id": generate_id(), "material": mat, "stock": accepted}
            
            # Update PostgreSQL database to sync with Inventory Dashboard
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

proc_content = proc_content.replace(old_logic, new_logic)

with open(proc_path, 'w', encoding='utf-8') as f:
    f.write(proc_content)
