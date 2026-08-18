import os
import re

file_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/inventory/inventory-data.service.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'constructor\(private http: HttpClient\) \{\s*this\.loadAll\(\);\s*\}',
    'constructor(private http: HttpClient) {}',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
