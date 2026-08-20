import os

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/workforce/workforce-data.service.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

import re
ts_content = re.sub(
    r'loadShifts\(\) \{\s*this\.http\.get<ApiShift\[\]>\(`\$\{this\.base\}/shifts`, \{ headers: this\.headers\(\) \}\)\s*\.pipe\(catchError\(this\.handleError\(\[\]\)\)\)\s*\.subscribe\(data => this\.shifts\$\$\.next\(data\.map\(mapShift\)\)\);\s*\}',
    r'''loadShifts() {
    this.http.get<ApiShift[]>(`${this.base}/shifts`, { headers: this.headers() })
      .pipe(catchError(this.handleError([])))
      .subscribe(data => {
        console.log("FETCHED SHIFTS FROM BACKEND: ", data);
        this.shifts$$.next(data.map(mapShift));
      });
  }''',
    ts_content,
    flags=re.DOTALL
)

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
