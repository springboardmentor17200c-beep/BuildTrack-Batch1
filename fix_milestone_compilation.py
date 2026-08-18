import os

# 1. Fix models.ts
model_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/projects/models/projects.model.ts'
with open(model_path, 'r', encoding='utf-8') as f:
    model_content = f.read()

if "progressPercentage?:" not in model_content:
    model_content = model_content.replace(
        "completionDate: string | null;",
        "completionDate: string | null;\n  progressPercentage?: number;"
    )
    with open(model_path, 'w', encoding='utf-8') as f:
        f.write(model_content)

# 2. Fix projects-data.service.ts
data_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/projects/projects-data.service.ts'
with open(data_path, 'r', encoding='utf-8') as f:
    data_content = f.read()

# Remove accidental progress_percentage from createProject
data_content = data_content.replace(
    "description: payload.description,\n      progress_percentage: payload.progressPercentage || 0,",
    "description: payload.description,"
)

# Fix this.apiUrl in addMilestone
data_content = data_content.replace(
    "this.http.post(`${this.apiUrl}/project-milestones`",
    "this.http.post(this.milestonesBase"
)

with open(data_path, 'w', encoding='utf-8') as f:
    f.write(data_content)
