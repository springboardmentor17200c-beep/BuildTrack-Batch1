import os

filepath = 'frontend/buildtrack-frontend/src/app/services/report.service.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add HttpHeaders
content = content.replace("import { HttpClient } from '@angular/common/http';", "import { HttpClient, HttpHeaders } from '@angular/common/http';")

# Add headers() method
headers_method = """  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('buildtrack_auth_token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }"""
content = content.replace("  constructor(private http: HttpClient) {}", headers_method)

# Add headers to all http calls
content = content.replace("this.http.post<Report>(this.apiUrl, { type, title, filter })", "this.http.post<Report>(this.apiUrl, { type, title, filter }, { headers: this.headers() })")
content = content.replace("this.http.get<any[]>('http://localhost:8000/analytics/progress')", "this.http.get<any[]>('http://localhost:8000/analytics/progress', { headers: this.headers() })")
content = content.replace("this.http.get<any[]>('http://localhost:8000/analytics/budget')", "this.http.get<any[]>('http://localhost:8000/analytics/budget', { headers: this.headers() })")
content = content.replace("this.http.get<any>('http://localhost:8000/analytics/procurement')", "this.http.get<any>('http://localhost:8000/analytics/procurement', { headers: this.headers() })")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
