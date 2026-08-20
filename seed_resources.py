import os
import sys

# Add backend directory to sys.path to allow imports
sys.path.append(os.path.abspath('backend'))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.resource import ResourceCategory, Resource, ResourceAllocation, MaintenanceRecord
from datetime import datetime

def seed_data():
    db = SessionLocal()
    
    # Check if data already exists
    if db.query(ResourceCategory).first():
        print("Data already exists. Skipping seed.")
        return

    # Create Categories
    categories = [
        ResourceCategory(category_name='Excavators', description='Excavators, Cranes, Bulldozers'),
        ResourceCategory(category_name='Concrete Mixers', description='Mixers'),
        ResourceCategory(category_name='Cranes', description='Generators and Compressors'),
        ResourceCategory(category_name='Dump Trucks', description='Trucks, Dumpers, Loaders'),
        ResourceCategory(category_name='Generators', description='Power Equipment'),
        ResourceCategory(category_name='Safety Equipment', description='Helmets, Harnesses, PPE Kits')
    ]
    db.add_all(categories)
    db.commit()
    
    for c in categories:
        db.refresh(c)
    cat_map = {c.category_name: c.resource_category_id for c in categories}

    # Use first available company and project and user
    from app.models.company import Company
    from app.models.project import Project
    from app.models.user import User
    
    company = db.query(Company).first()
    project = db.query(Project).first()
    user = db.query(User).first()
    
    if not company or not project or not user:
        print("Missing required foreign keys (company, project, user). Run auth/project seeders first.")
        return
        
    # Resources
    resources_data = [
        {'resource_name': 'CAT 320 Excavator', 'category': 'Excavators', 'manufacturer': 'Caterpillar', 'model_number': '320GC', 'serial_number': 'CAT320-8841', 'purchase_date': datetime(2024,3,10).date(), 'current_status': 'Allocated'},
        {'resource_name': 'JCB 3DX Excavator', 'category': 'Excavators', 'manufacturer': 'JCB', 'model_number': '3DX', 'serial_number': 'JCB3DX-2210', 'purchase_date': datetime(2023,11,2).date(), 'current_status': 'Available'},
        {'resource_name': 'Schwing Stetter Mixer', 'category': 'Concrete Mixers', 'manufacturer': 'Schwing Stetter', 'model_number': 'AM 40 SP', 'serial_number': 'SS40-5521', 'purchase_date': datetime(2024,1,18).date(), 'current_status': 'Allocated'},
        {'resource_name': 'Ajax Concrete Mixer', 'category': 'Concrete Mixers', 'manufacturer': 'Ajax', 'model_number': 'CM-14', 'serial_number': 'AJX14-1187', 'purchase_date': datetime(2022,8,25).date(), 'current_status': 'Under Maintenance'},
        {'resource_name': 'Liebherr Tower Crane', 'category': 'Cranes', 'manufacturer': 'Liebherr', 'model_number': '132 EC-H', 'serial_number': 'LB132-0093', 'purchase_date': datetime(2023,5,14).date(), 'current_status': 'Allocated'},
    ]
    
    resources = []
    for r in resources_data:
        res = Resource(
            company_id=company.company_id,
            resource_category_id=cat_map[r['category']],
            resource_name=r['resource_name'],
            manufacturer=r['manufacturer'],
            model_number=r['model_number'],
            serial_number=r['serial_number'],
            purchase_date=r['purchase_date'],
            current_status=r['current_status']
        )
        resources.append(res)
    
    db.add_all(resources)
    db.commit()

    for r in resources:
        db.refresh(r)
    
    # Allocations
    allocations = [
        ResourceAllocation(
            resource_id=resources[0].resource_id,
            project_id=project.project_id,
            allocated_by_id=user.user_id,
            allocation_date=datetime(2026,6,15).date(),
            expected_return_date=datetime(2026,8,10).date(),
            allocation_status='Allocated'
        ),
        ResourceAllocation(
            resource_id=resources[2].resource_id,
            project_id=project.project_id,
            allocated_by_id=user.user_id,
            allocation_date=datetime(2026,6,20).date(),
            expected_return_date=datetime(2026,7,25).date(),
            allocation_status='Allocated'
        )
    ]
    db.add_all(allocations)
    
    # Maintenance
    records = [
        MaintenanceRecord(
            resource_id=resources[3].resource_id,
            maintenance_type='Engine Repair',
            maintenance_date=datetime(2026,6,25).date(),
            next_maintenance_date=datetime(2026,9,25).date(),
            maintenance_cost=18500,
            serviced_by='Ajax Authorized Service'
        ),
        MaintenanceRecord(
            resource_id=resources[0].resource_id,
            maintenance_type='Routine Service',
            maintenance_date=datetime(2026,6,1).date(),
            next_maintenance_date=datetime(2026,9,1).date(),
            maintenance_cost=6200,
            serviced_by='Caterpillar Service Center'
        )
    ]
    db.add_all(records)
    db.commit()
    print("Seed complete!")

if __name__ == '__main__':
    seed_data()
