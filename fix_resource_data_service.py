import os

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/resource-data.service.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Add projects$ BehaviorSubject
if "private projects = new BehaviorSubject<any[]>([]);" not in ts_content:
    ts_content = ts_content.replace(
        "private allocations = new BehaviorSubject<ResourceAllocation[]>([]);",
        "private allocations = new BehaviorSubject<ResourceAllocation[]>([]);\n  private projects = new BehaviorSubject<any[]>([]);"
    )

    ts_content = ts_content.replace(
        "allocations$ = this.allocations.asObservable();",
        "allocations$ = this.allocations.asObservable();\n  projects$ = this.projects.asObservable();"
    )

    ts_content = ts_content.replace(
        "maintenance: this.http.get<any[]>(`${environment.apiUrl}/resources/maintenance`, this.headers).pipe(catchError(() => of([])))",
        "maintenance: this.http.get<any[]>(`${environment.apiUrl}/resources/maintenance`, this.headers).pipe(catchError(() => of([]))),\n      projects: this.http.get<any[]>(`${environment.apiUrl}/projects/enriched`, this.headers).pipe(catchError(() => of([])))"
    )

    ts_content = ts_content.replace(
        "}).subscribe(({ resources, allocations, maintenance }) => {",
        "}).subscribe(({ resources, allocations, maintenance, projects }) => {\n      this.projects.next(projects);"
    )

    old_projectNames = """  get projectNames(): string[] {
    return ['Skyline Residency Tower', 'Riverside Business Park'];
  }"""
    
    new_projectNames = """  get projectNames(): string[] {
    return this.projects.value.map(p => p.project_name);
  }"""
    
    ts_content = ts_content.replace(old_projectNames, new_projectNames)

    old_addAllocation = """  addAllocation(alloc: ResourceAllocation) {
    this.allocations.next([alloc, ...this.allocations.value]);
  }"""
    
    new_addAllocation = """  addAllocation(alloc: ResourceAllocation) {
    const proj = this.projects.value.find(p => p.project_name === alloc.project);
    const projId = proj ? proj.project_id : 1; // Fallback to 1 if not found
    const numResourceId = parseInt(alloc.resourceId.replace('R-', ''), 10) || parseInt(alloc.resourceId, 10);
    
    const body = {
      resource_id: numResourceId,
      project_id: projId,
      allocated_by_id: 1, // Will be overridden by backend using current_user
      allocation_date: alloc.allocationDate,
      expected_return_date: alloc.expectedReturnDate,
      allocation_status: 'Allocated',
      remarks: alloc.remarks || ''
    };
    
    this.http.post(`${environment.apiUrl}/resources/allocations`, body, this.headers).subscribe({
      next: () => this.loadAll(),
      error: err => console.error('Failed to add allocation', err)
    });
  }"""
    
    ts_content = ts_content.replace(old_addAllocation, new_addAllocation)

    old_returnAllocation = """  returnAllocation(allocId: string) {
    const update = this.allocations.value.map(a => {
      if(a.allocationId === allocId) {
         return { ...a, actualReturnDate: new Date().toISOString().split('T')[0], allocationStatus: 'Returned' as any };
      }
      return a;
    });
    this.allocations.next(update);
  }"""

    new_returnAllocation = """  returnAllocation(allocId: string) {
    const today = new Date().toISOString().split('T')[0];
    const numericId = parseInt(allocId, 10);
    
    // Optimistic UI update
    const update = this.allocations.value.map(a => {
      if(a.allocationId === allocId) {
         return { ...a, actualReturnDate: today, allocationStatus: 'Returned' as any };
      }
      return a;
    });
    this.allocations.next(update);

    this.http.put(`${environment.apiUrl}/resources/allocations/${numericId}`, {
      actual_return_date: today,
      allocation_status: 'Returned'
    }, this.headers).subscribe({
      next: () => this.loadAll(),
      error: err => console.error('Failed to return allocation', err)
    });
  }"""
    
    ts_content = ts_content.replace(old_returnAllocation, new_returnAllocation)

    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write(ts_content)
