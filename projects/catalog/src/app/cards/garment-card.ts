import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { SearchHit } from '../models';

@Component({
  selector: 'mfe-garment-card',
  imports: [CurrencyPipe],
  template: `
    <article class="card">
      <div class="media">
        <img
          [src]="hit().product.image"
          [alt]="hit().product.name"
          width="720"
          height="900"
          loading="lazy"
          decoding="async"
        />
        @if (hit().affinity) {
          <span class="affinity">{{ hit().affinity }}% afinidad</span>
        }
        <span class="kind">Prenda</span>
      </div>
      <div class="body">
        <p class="brand">{{ hit().product.brand }}</p>
        <h3>{{ hit().product.name }}</h3>
        <p class="blurb">{{ hit().product.blurb }}</p>
        @if (hit().reasons.length) {
          <p class="why">{{ hit().reasons[0] }}</p>
        }
        <div class="meta">
          <span>{{ hit().product.fabric }}</span>
          <strong>{{ hit().product.price | currency: 'USD':'symbol-narrow':'1.0-0' }}</strong>
        </div>
        <button type="button" (click)="add()(hit())">Añadir al look</button>
      </div>
    </article>
  `,
  styles: `
    :host {
      display: block;
      content-visibility: auto;
      contain-intrinsic-size: 540px;
    }
    .card {
      height: 100%;
      overflow: hidden;
      border: 1px solid var(--mfe-line, rgba(243, 238, 230, 0.1));
      background: var(--mfe-elev, #161412);
      color: var(--mfe-ink, #f3eee6);
    }
    .media {
      position: relative;
      aspect-ratio: 4 / 5;
      overflow: hidden;
      background: #1c1916;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scale(1.02);
    }
    .affinity,
    .kind {
      position: absolute;
      top: 0.85rem;
      padding: 0.28rem 0.55rem;
      font-size: 0.68rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      backdrop-filter: blur(10px);
    }
    .affinity {
      left: 0.85rem;
      background: rgba(12, 11, 10, 0.55);
      color: var(--mfe-sand, #d4b48c);
    }
    .kind {
      right: 0.85rem;
      background: rgba(243, 238, 230, 0.12);
    }
    .body {
      display: grid;
      gap: 0.45rem;
      padding: 1rem 1rem 1.1rem;
    }
    .brand,
    .why {
      margin: 0;
      color: var(--mfe-muted, #9a9186);
      font-size: 0.72rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    h3,
    .blurb,
    .why {
      margin: 0;
    }
    h3 {
      font-family: 'Fraunces', serif;
      font-size: 1.35rem;
      font-weight: 400;
      line-height: 1.15;
    }
    .blurb {
      color: #d8d0c6;
      font-size: 0.92rem;
      line-height: 1.45;
    }
    .meta {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-top: 0.4rem;
      color: var(--mfe-muted, #9a9186);
      font-size: 0.85rem;
    }
    button {
      margin-top: 0.55rem;
      border: 1px solid var(--mfe-sand, #d4b48c);
      background: transparent;
      color: var(--mfe-ink, #f3eee6);
      padding: 0.7rem 0.9rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-size: 0.7rem;
      cursor: pointer;
    }
    button:hover {
      background: var(--mfe-sand, #d4b48c);
      color: #0c0b0a;
    }
  `,
})
export class GarmentCard {
  readonly hit = input.required<SearchHit>();
  readonly add = input<(hit: SearchHit) => void>(() => undefined);
}
