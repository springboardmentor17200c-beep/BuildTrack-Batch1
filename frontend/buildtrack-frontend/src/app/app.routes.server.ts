import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'projects/detail/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'procurement/vendor-dashboard/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'procurement/requests/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'procurement/workflow/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
