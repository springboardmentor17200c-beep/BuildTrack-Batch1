import os
import json

angular_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/angular.json'
with open(angular_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Update budget
budgets = data['projects']['buildtrack-frontend']['architect']['build']['configurations']['production']['budgets']
for b in budgets:
    if b['type'] == 'initial':
        b['maximumWarning'] = '2MB'
        b['maximumError'] = '4MB'
    elif b['type'] == 'anyComponentStyle':
        b['maximumWarning'] = '100kB'
        b['maximumError'] = '200kB'

with open(angular_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)
