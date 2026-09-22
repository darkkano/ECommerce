import { NgComponentOutlet } from '@angular/common';
import { Component, Type, input } from '@angular/core';
import { AccessoryCard } from './cards/accessory-card';
import { FootwearCard } from './cards/footwear-card';
import { GarmentCard } from './cards/garment-card';
import { LookCard } from './cards/look-card';
import { ProductKind, SearchHit } from './models';

@Component({
  selector: 'mfe-product-grid',
  imports: [NgComponentOutlet],
  template: `
    <section class="grid-shell">
      <header class="mfe-meta">
        <span>Micro-frontend · catalog</span>
        <span>Native Federation · :4201</span>
        <span>Render dinámico por tipo</span>
      </header>

      @if (loading()) {
        <div class="skeletons" aria-hidden="true">
          @for (item of skeletonItems; track item) {
            <div class="skel" [class.wide]="item === 1"></div>
          }
        </div>
      } @else if (!hits().length) {
        <div class="empty">
          <p>El catálogo no tiene una prenda para ese recorte.</p>
          <p>Prueba a describir el momento, no la palabra.</p>
        </div>
      } @else {
        <div class="grid">
          @for (hit of hits(); track hit.product.id; let i = $index) {
            <div class="cell" [class.look]="hit.product.kind === 'look'" [style.animation-delay]="i * 45 + 'ms'">
              <ng-container
                [ngComponentOutlet]="cardFor(hit.product.kind)"
                [ngComponentOutletInputs]="inputsFor(hit)"
              />
            </div>
          }
        </div>
      }
    </section>
  `,
  styles: `
    :host {
      --mfe-ink: #f3eee6;
      --mfe-muted: #9a9186;
      --mfe-sand: #d4b48c;
      --mfe-elev: #161412;
      --mfe-line: rgba(243, 238, 230, 0.1);
      display: block;
    }
    .mfe-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.8rem 1.2rem;
      margin-bottom: 1.1rem;
      color: var(--mfe-muted);
      font-size: 0.7rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 1rem;
    }
    .cell {
      grid-column: span 4;
      animation: rise 0.55s ease both;
      contain: layout paint;
    }
    .cell.look {
      grid-column: span 8;
    }
    .empty {
      padding: 3rem 0;
      color: var(--mfe-muted);
    }
    .empty p {
      margin: 0.2rem 0;
    }
    .skeletons {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 1rem;
    }
    .skel {
      min-height: 360px;
      background: linear-gradient(90deg, #161412 0%, #221e1a 50%, #161412 100%);
      background-size: 200% 100%;
      animation: shine 1.1s linear infinite;
    }
    .skel.wide {
      min-height: 420px;
    }
    @keyframes rise {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }
    @keyframes shine {
      to {
        background-position: -200% 0;
      }
    }
    @media (max-width: 980px) {
      .cell,
      .cell.look {
        grid-column: span 6;
      }
      .skeletons {
        grid-template-columns: 1fr 1fr;
      }
    }
    @media (max-width: 700px) {
      .cell,
      .cell.look {
        grid-column: span 12;
      }
      .skeletons {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class ProductGrid {
  readonly hits = input<SearchHit[]>([]);
  readonly loading = input(false);

  readonly skeletonItems = [1, 2, 3];

  private readonly cards: Record<ProductKind, Type<unknown>> = {
    garment: GarmentCard,
    footwear: FootwearCard,
    accessory: AccessoryCard,
    look: LookCard,
  };

  cardFor(kind: ProductKind): Type<unknown> {
    return this.cards[kind] ?? GarmentCard;
  }

  inputsFor(hit: SearchHit) {
    return { hit, add: this.emitAdd };
  }

  private emitAdd = (hit: SearchHit) => {
    window.dispatchEvent(
      new CustomEvent('mare:add-to-cart', {
        detail: hit.product,
      }),
    );
  };
}
