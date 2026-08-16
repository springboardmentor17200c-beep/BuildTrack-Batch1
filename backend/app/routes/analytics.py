from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.core.permissions import require_roles

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)

@router.get("/budget")
def get_budget_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager")),
):
    # Moving hardcoded mock data to backend to preserve UI functionality while completing full-stack integration
    
    budgets = [
        { "budgetId": 'B-1', "project": 'Skyline Residency Tower', "estimatedCost": 22000000, "approvedBudget": 24000000, "budgetStatus": 'Approved' },
        { "budgetId": 'B-2', "project": 'Riverside Business Park', "estimatedCost": 19000000, "approvedBudget": 20000000, "budgetStatus": 'Approved' },
    ]

    expenses = [
        { "expenseId": 'E-1', "budgetId": 'B-1', "project": 'Skyline Residency Tower', "category": 'Material Cost', "title": 'Cement & Steel bulk order', "amount": 4200000, "expenseDate": '2026-06-10' },
        { "expenseId": 'E-2', "budgetId": 'B-1', "project": 'Skyline Residency Tower', "category": 'Labor Cost', "title": 'Site workforce payments — June', "amount": 2100000, "expenseDate": '2026-06-30' },
        { "expenseId": 'E-3', "budgetId": 'B-1', "project": 'Skyline Residency Tower', "category": 'Equipment Cost', "title": 'Tower crane rental', "amount": 950000, "expenseDate": '2026-06-15' },
        { "expenseId": 'E-4', "budgetId": 'B-1', "project": 'Skyline Residency Tower', "category": 'Maintenance Cost', "title": 'Excavator service', "amount": 62000, "expenseDate": '2026-06-25' },
        { "expenseId": 'E-5', "budgetId": 'B-2', "project": 'Riverside Business Park', "category": 'Material Cost', "title": 'Sand & aggregate delivery', "amount": 1850000, "expenseDate": '2026-06-18' },
        { "expenseId": 'E-6', "budgetId": 'B-2', "project": 'Riverside Business Park', "category": 'Transportation Cost', "title": 'Material logistics — Q2', "amount": 340000, "expenseDate": '2026-06-20' },
        { "expenseId": 'E-7', "budgetId": 'B-2', "project": 'Riverside Business Park', "category": 'Administrative Cost', "title": 'Site office & permits', "amount": 180000, "expenseDate": '2026-06-05' },
        { "expenseId": 'E-8', "budgetId": 'B-2', "project": 'Riverside Business Park', "category": 'Labor Cost', "title": 'Site workforce payments — June', "amount": 1650000, "expenseDate": '2026-06-30' },
    ]
    
    return {
        "budgets": budgets,
        "expenses": expenses
    }

@router.get("/progress")
def get_progress_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager")),
):
    progress = [
        { "projectId": 'P-1', "project": 'Skyline Residency Tower', "category": 'Residential', "status": 'In Progress', "completionPercentage": 78, "startDate": '2025-11-01', "expectedEndDate": '2026-10-12' },
        { "projectId": 'P-2', "project": 'Riverside Business Park', "category": 'Commercial', "status": 'In Progress', "completionPercentage": 45, "startDate": '2026-02-15', "expectedEndDate": '2027-03-30' },
        { "projectId": 'P-3', "project": 'Greenfield Metro Extension', "category": 'Infrastructure', "status": 'Completed', "completionPercentage": 100, "startDate": '2024-06-01', "expectedEndDate": '2026-01-05' },
        { "projectId": 'P-4', "project": 'Harborview Logistics Hub', "category": 'Industrial', "status": 'On Hold', "completionPercentage": 29, "startDate": '2025-09-01', "expectedEndDate": '2026-08-18' },
    ]
    return {
        "progress": progress
    }

@router.get("/procurement")
def get_procurement_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager")),
):
    purchase_orders = [
        { "purchaseOrderId": 'PO-501', "project": 'Skyline Residency Tower', "vendor": 'UltraTech Cement Ltd', "orderDate": '2026-06-08', "expectedDeliveryDate": '2026-06-20', "totalAmount": 1250000, "orderStatus": 'Delivered' },
        { "purchaseOrderId": 'PO-502', "project": 'Riverside Business Park', "vendor": 'Tata Steel Distributors', "orderDate": '2026-06-25', "expectedDeliveryDate": '2026-07-15', "totalAmount": 980000, "orderStatus": 'Confirmed' },
        { "purchaseOrderId": 'PO-503', "project": 'Skyline Residency Tower', "vendor": 'ElectroSupply Co.', "orderDate": '2026-07-01', "expectedDeliveryDate": '2026-07-18', "totalAmount": 320000, "orderStatus": 'Pending' },
        { "purchaseOrderId": 'PO-504', "project": 'Riverside Business Park', "vendor": 'BuildRight Equipment Rentals', "orderDate": '2026-05-20', "expectedDeliveryDate": '2026-06-01', "totalAmount": 540000, "orderStatus": 'Delivered' },
        { "purchaseOrderId": 'PO-505', "project": 'Skyline Residency Tower', "vendor": 'UltraTech Cement Ltd', "orderDate": '2026-07-05', "expectedDeliveryDate": '2026-07-22', "totalAmount": 410000, "orderStatus": 'Pending' },
    ]

    vendors = [
        { "vendorId": 'V-1', "vendorName": 'UltraTech Cement Ltd', "totalOrders": 2, "totalSpend": 1660000, "pendingInvoices": 1 },
        { "vendorId": 'V-2', "vendorName": 'Tata Steel Distributors', "totalOrders": 1, "totalSpend": 980000, "pendingInvoices": 1 },
        { "vendorId": 'V-3', "vendorName": 'ElectroSupply Co.', "totalOrders": 1, "totalSpend": 320000, "pendingInvoices": 0 },
        { "vendorId": 'V-4', "vendorName": 'BuildRight Equipment Rentals', "totalOrders": 1, "totalSpend": 540000, "pendingInvoices": 0 },
    ]

    return {
        "purchaseOrders": purchase_orders,
        "vendors": vendors
    }
