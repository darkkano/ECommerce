import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { SearchHit, SearchResponse } from './models';
import { ProductGrid } from './product-grid';

@Component({
  selector: 'mfe-root',
  imports: [ProductGrid],
  template: `
    <main class="preview">
      <header>
        <p>Remote independiente</p>
        <h1>MARE Catalog MFE</h1>
        <p>Este bundle se sirve en :4201 y el shell lo consume con Native Federation.</p>
      </header>
      <mfe-product-grid [hits]="hits()" [loading]="loading()" />
    </main>
  `,
  styles: `
    .preview {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem 1.25rem 4rem;
    }
    header {
      margin-bottom: 2rem;
    }
    p {
      margin: 0;
      color: #9a9186;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-size: 0.75rem;
    }
    h1 {
      margin: 0.4rem 0 0.6rem;
      font-family: 'Fraunces', serif;
      font-size: 2.4rem;
      font-weight: 400;
    }
  `,
})
export class App {
  private readonly http = inject(HttpClient);
  readonly hits = signal<SearchHit[]>([]);
  readonly loading = signal(true);

  constructor() {
    this.http.get<SearchResponse>('/api/search?q=ropa%20para%20ir%20a%20la%20playa%20de%20noche').subscribe({
      next: (response) => {
        this.hits.set(response.hits);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
