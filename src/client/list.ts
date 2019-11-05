import { css, customElement, html, LitElement, property } from "lit-element";
import { Exchange } from "../model/exchange";

declare module "../model/exchange" {
  interface Exchange {
    selected?: boolean;
  }
}

@customElement("app-list")
class ListComponent extends LitElement {

  public static styles = css`
    :host {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      overflow-x:hidden;
      overflow-y: scroll;
    }

    .header {
      height: 2rem;
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid #eee;
      color: #444;
      font-size: 1rem;
      font-weight: bold;
      line-height: 2rem;
      position: relative;
    }

    .header::after {
      content:'';
      display: inline-block;
      width: 0.4rem;
      height: 0.4rem;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: #888;
      border-radius: 0.4rem;
      position: absolute;
    }

    .header.connected::after {
      background: green;
    }

    .exchange {
      height: 2rem;
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid #eee;
      cursor: pointer;
    }

    .selected {
      background: #eee;
    }

    .request {
      display:flex;
      align-items: baseline;
      color: #444;
      line-height: 0.8rem;
      margin-bottom: 0.5rem;
    }

    .url {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      flex: 1;
      padding: 0 0.4rem;
    }

    .time {
      color: #888;
    }

    .response {
      display: flex;
      color: #888;
      line-height: 0.8rem;
      white-space: nowrap;
    }

    .status {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .status::before {
      content: '';
      display: inline-block;
      width: 0.4rem;
      height: 0.4rem;
      background: #888;
      border-radius: 0.4rem;
      margin: 0 0.3rem 0.1rem 0;
    }

    .status.ok::before {
      background: green;
    }

    .status.ko::before {
      background: red;
    }

    .exchange.pending {
      opacity: 0.5;
    }

    .exchange.pending .response {
      visibility: hidden;
    }

    .method {
      font-size: 0.7rem;
    }

    .size, .duration {
      border-left: 1px solid #ddd;
      padding-left: 0.3rem;
      margin-left: 0.3rem;
    }
  `;

  @property()
  private exchanges: Exchange[] = [];

  @property()
  private connected: boolean;

  private offset = new Date().getTimezoneOffset() * 60000;

  constructor() {
    super();
    window.addEventListener("data", (event: CustomEvent<Exchange[]>) => {
      this.exchanges = event.detail;
    });
    window.addEventListener("connection", (event: CustomEvent<boolean>) => {
      this.connected = event.detail;
    });
  }

  public connectedCallback() {
    super.connectedCallback();
  }

  public onSelect(exchange: Exchange) {
    this.exchanges.forEach((e) => e.selected = false);
    exchange.selected = true;
    this.dispatchEvent(new CustomEvent( "selected", { bubbles: true, composed: true, detail: exchange } ));
    this.requestUpdate();
  }

  public getIndicator(exchange: Exchange) {
    if (exchange.response) {
      return exchange.response.status < 400 ? "ok" : "ko";
    }
    return "";
  }

  public getRequestTime(exchange: Exchange) {
    return new Date(exchange.request.time - this.offset).toISOString().substr(11, 5);
  }

  public render() {
    return html`
      <div class="header ${this.connected ? "connected" : ""}">API Sniffer</div>
      ${this.exchanges.map((exchange) => html`
        <div @click=${() => this.onSelect(exchange)} class="exchange${exchange.response ? " done" : " pending"}${exchange.selected ? " selected" : ""}" >
          <div class="request">
            <app-method class="method" name="${exchange.request.method}"></app-method>
            <span class="url">${exchange.request.url}</span>
            <span class="time">${this.getRequestTime(exchange)}</span>
          </div>
            <div class="response">
              <span class="status ${this.getIndicator(exchange)}">${exchange.response && `${exchange.response.status} ${exchange.response.text}`}</span>
              <span class="size">size: ${exchange.response && `${(JSON.stringify(exchange.response.data).length / 1024).toFixed(2)}`}&nbsp;ko</span>
              <span class="duration">duration: ${exchange.response && `${exchange.response.time - exchange.request.time}`}&nbsp;ms</span>
            </div>
        </div>
      `)}
    `;
  }
}
