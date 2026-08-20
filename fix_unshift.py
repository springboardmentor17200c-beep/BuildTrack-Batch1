import os

filepath = 'frontend/buildtrack-frontend/src/app/services/report.service.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

buggy_code = """    return this.getReportDataByType(type, filter).pipe(
      switchMap(data => {
        return this.http.post<Report>(this.apiUrl, { type, title, filter }, { headers: this.headers() }).pipe(
          map(apiReport => ({
            ...apiReport,
            data: data
          })),"""

fixed_code = """    return this.getReportDataByType(type, filter).pipe(
      switchMap(data => {
        return this.http.post<Report>(this.apiUrl, { type, title, filter }, { headers: this.headers() }).pipe(
          map(apiReport => {
            const newReport = { ...apiReport, data: data };
            this.reports.unshift(newReport);
            return newReport;
          }),"""

content = content.replace(buggy_code, fixed_code)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
