import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { SearchHit } from '../models';

@Component({
  selector: 'mfe-accessory-card',
  imports: [CurrencyPipe],
  template: `
    <article class="card">
      <div class="orb">
        <img
          [src]="hit().product.image"
          [alt]="hit().product.name"
          width="400"
          height="400"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div class="body">
        <span>Accesorio</span>
        <h3>{{ hit().product.name }}</h3>
        <p>{{ hit().product.blurb }}</p>
        @if (hit().reasons.length) {
          <p class="why">{{ hit().reasons[0] }}</p>
        }
        <div class="meta">
          <strong>{{ hit().product.price | currency: 'USD':'symbol-narrow':'1.0-0' }}</strong>
          <button type="button" (click)="add()(hit())">Añadir</button>
        </div>
      </div>
    </article>
  `,
  styles: `
    :host {
      display: block;
      content-visibility: auto;
      contain-intrinsic-size: 220px;
    }
    .card {
      display: grid;
      grid-template-columns: 118px 1fr;
      gap: 0.9rem;
      align-items: center;
      min-height: 160px;
      padding: 0.9rem;
      border: 1px solid var(--mfe-line, rgba(243, 238, 230, 0.1));
      background: var(--mfe-elev, #161412);
      color: var(--mfe-ink, #f3eee6);
    }
    .orb {
      width: 118px;
      height: 118px;
      overflow: hidden;
      border-radius: 999px;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .body {
      display: grid;
      gap: 0.28rem;
    }
    span,
    .why {
      margin: 0;
      color: var(--mfe-sand, #d4b48c);
      font-size: 0.68rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    h3,
    p {
      margin: 0;
    }
    h3 {
      font-family: 'Fraunces', serif;
      font-size: 1.12rem;
      font-weight: 400;
    }
    p {
      color: #d8d0c6;
      font-size: 0.86rem;
    }
    .meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.35rem;
    }
    button {
      border: 1px solid rgba(243, 238, 230, 0.2);
      background: transparent;
      color: var(--mfe-ink, #f3eee6);
      padding: 0.4rem 0.65rem;
      font-size: 0.68rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      cursor: pointer;
    }
  `,
})
export class AccessoryCard {
  readonly hit = input.required<SearchHit>();
  readonly add = input<(hit: SearchHit) => void>(() => undefined);
}
