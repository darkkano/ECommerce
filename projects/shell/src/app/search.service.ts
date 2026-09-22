import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';
import { Subject } from 'rxjs';
import { SearchMode, SearchResponse } from './models';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly http = inject(HttpClient);
  private readonly query$ = new Subject<{ q: string; mode: SearchMode }>();

  readonly loading = signal(false);
  readonly result = signal<SearchResponse | null>(null);
  readonly mode = signal<SearchMode>('semantic');
  readonly query = signal('');

  constructor() {
    this.query$
      .pipe(
        debounceTime(160),
        distinctUntilChanged((a, b) => a.q === b.q && a.mode === b.mode),
        tap(() => this.loading.set(true)),
        switchMap(({ q, mode }) =>
          // Proxy de Angular: /api/* → http://localhost:3001/api/*
          this.http
            .get<SearchResponse>('/api/search', { params: { q, mode } })
            .pipe(catchError(() => of(null))),
        ),
      )
      .subscribe((response) => {
        this.result.set(response);
        this.loading.set(false);
      });
  }

  setMode(mode: SearchMode) {
    this.mode.set(mode);
    this.search(this.query());
  }

  search(raw: string) {
    const q = raw.trim();
    this.query.set(raw);
    this.query$.next({ q, mode: this.mode() });
  }

  previewIntent(text: string) {
    const value = text.toLowerCase();
    const chips: string[] = [];
    if (/playa|mar|costa|orilla/.test(value)) chips.push('Playa');
    if (/noche|anochecer|luna|cena/.test(value)) chips.push('Noche');
    if (/ropa|vestido|atuendo|outfit|prenda/.test(value)) chips.push('Atuendo');
    if (/oficina|trabajo/.test(value)) chips.push('Oficina');
    if (/correr|running|lluvia|llueve/.test(value)) chips.push('Deporte');
    if (/cita|elegante/.test(value)) chips.push('Cita');
    if (/verano|calor|comodo|cómodo/.test(value)) chips.push('Verano');
    return chips.slice(0, 4);
  }
}
