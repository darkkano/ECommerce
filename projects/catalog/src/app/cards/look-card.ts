import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { SearchHit } from '../models';

@Component({
  selector: 'mfe-look-card',
  imports: [CurrencyPipe],
  template: `
    <article class="card">
      <img
        [src]="hit().product.image"
        [alt]="hit().product.name"
        width="1200"
        height="800"
        loading="lazy"
        decoding="async"
      />
      <div class="veil">
        <span>Look completo</span>
        @if (hit().affinity) {
          <b>{{ hit().affinity }}% afinidad</b>
        }
        <h3>{{ hit().product.name }}</h3>
        <p>{{ hit().product.blurb }}</p>
        @if (hit().reasons.length) {
          <p class="why">{{ hit().reasons.join(' · ') }}</p>
        }
        <div class="row">
          <strong>{{ hit().product.price | currency: 'USD':'symbol-narrow':'1.0-0' }}</strong>
          <button type="button" (click)="add()(hit())">Añadir el look</button>
        </div>
      </div>
    </article>
  `,
  styles: `
    :host {
      display: block;
      content-visibility: auto;
      contain-intrinsic-size: 420px;
    }
    .card {
      position: relative;
      min-height: 380px;
      overflow: hidden;
      color: var(--mfe-ink, #f3eee6);
    }
    img {
      width: 100%;
      height: 100%;
      min-height: 380px;
      object-fit: cover;
      filter: saturate(0.9) contrast(1.05);
    }
    .veil {
      position: absolute;
      inset: auto 0 0;
      display: grid;
      gap: 0.4rem;
      padding: 2.2rem 1.4rem 1.3rem;
      background: linear-gradient(180deg, transparent, rgba(12, 11, 10, 0.88) 55%);
    }
    span,
    b,
    .why {
      font-size: 0.7rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    b {
      color: var(--mfe-sand, #d4b48c);
    }
    h3,
    p {
      margin: 0;
    }
    h3 {
      font-family: 'Fraunces', serif;
      font-size: clamp(1.8rem, 4vw, 3rem);
      font-weight: 400;
      line-height: 1;
    }
    p {
      max-width: 36rem;
      color: #e7e0d6;
    }
    .row {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-top: 0.4rem;
    }
    button {
      border: 0;
      background: var(--mfe-ink, #f3eee6);
      color: #0c0b0a;
      padding: 0.7rem 1rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-size: 0.7rem;
      cursor: pointer;
    }
    @media (max-width: 800px) {
      .card {
        min-height: 320px;
      }
    }
  `,
})
export class LookCard {
  readonly hit = input.required<SearchHit>();
  readonly add = input<(hit: SearchHit) => void>(() => undefined);
}
