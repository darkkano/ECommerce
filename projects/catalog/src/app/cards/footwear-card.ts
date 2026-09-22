import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { SearchHit } from '../models';

@Component({
  selector: 'mfe-footwear-card',
  imports: [CurrencyPipe],
  template: `
    <article class="card">
      <div class="split">
        <div class="media">
          <img
            [src]="hit().product.image"
            [alt]="hit().product.name"
            width="720"
            height="540"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div class="body">
          <span class="kind">Calzado</span>
          @if (hit().affinity) {
            <span class="affinity">{{ hit().affinity }}%</span>
          }
          <p class="brand">{{ hit().product.brand }}</p>
          <h3>{{ hit().product.name }}</h3>
          <p class="blurb">{{ hit().product.blurb }}</p>
          <p class="sizes">Tallas {{ hit().product.sizes.join(' · ') }}</p>
          @if (hit().reasons.length) {
            <p class="why">{{ hit().reasons[0] }}</p>
          }
          <div class="meta">
            <strong>{{ hit().product.price | currency: 'USD':'symbol-narrow':'1.0-0' }}</strong>
            <button type="button" (click)="add()(hit())">Añadir</button>
          </div>
        </div>
      </div>
    </article>
  `,
  styles: `
    :host {
      display: block;
      content-visibility: auto;
      contain-intrinsic-size: 280px;
    }
    .card {
      border: 1px solid var(--mfe-line, rgba(243, 238, 230, 0.1));
      background: linear-gradient(90deg, #141210 42%, #1b1714 42%);
      color: var(--mfe-ink, #f3eee6);
    }
    .split {
      display: grid;
      grid-template-columns: 42% 1fr;
      min-height: 240px;
    }
    .media {
      overflow: hidden;
      background: #1c1916;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .body {
      display: grid;
      align-content: start;
      gap: 0.4rem;
      padding: 1.1rem 1.15rem;
    }
    .kind,
    .affinity,
    .brand,
    .why,
    .sizes {
      margin: 0;
      font-size: 0.7rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--mfe-muted, #9a9186);
    }
    .affinity {
      color: var(--mfe-sand, #d4b48c);
    }
    h3 {
      margin: 0.15rem 0;
      font-family: 'Fraunces', serif;
      font-size: 1.28rem;
      font-weight: 400;
    }
    .blurb {
      margin: 0;
      color: #d8d0c6;
      font-size: 0.9rem;
    }
    .meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.5rem;
    }
    button {
      border: 0;
      background: var(--mfe-sand, #d4b48c);
      color: #0c0b0a;
      padding: 0.55rem 0.8rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-size: 0.68rem;
      cursor: pointer;
    }
    @media (max-width: 720px) {
      .split {
        grid-template-columns: 1fr;
      }
      .media {
        aspect-ratio: 16 / 10;
      }
    }
  `,
})
export class FootwearCard {
  readonly hit = input.required<SearchHit>();
  readonly add = input<(hit: SearchHit) => void>(() => undefined);
}
