import { css, customElement, html, LitElement, property } from "lit-element";
import { unsafeHTML } from "lit-html/directives/unsafe-html";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import { Exchange } from "../model/exchange";

@customElement("app-detail")
class DetailComponent extends LitElement {

  public static styles = css`
    :host {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      overflow:hidden;
    }

    .general {
      font-size: 1rem;
      flex-basis: 2rem;
      padding: 0.75rem;
      border-bottom: 1px solid #eee;
    }

    .content {
      flex: 1;
      display: flex;
      flex-direction: row;
      overflow: hidden;
    }

    .part {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;
      padding: 0.75rem;
    }

    .response {
      border-left: 1px solid #eee;
    }

    .headers {
      font-family: monospace;
      overflow: hidden;
      overflow-x: hidden;
      overflow-y: scroll;
      flex: 0.3;
      background: #f5f2f0;
      padding: 0.75rem 1rem;
      margin-bottom: 0.5rem;
    }

    .body {
      overflow-x: hidden;
      overflow-y: scroll;
      flex: 0.7;
      background: #f5f2f0;
      padding: 0.75rem 1rem;
      margin: 0;
    }

    .token.comment {
      color: slategray;
    }

    .token.punctuation {
      color: #999;
    }

    .token.property, .token.boolean, .token.number {
      color: #905;
    }

    .token.string {
      white-space: initial;
      color: #690;
    }

    .token.operator {
      color: #9a6e3a;
    }

    .token.keyword {
      color: #07a;
    }

    .key {
      text-transform: capitalize;
      margin-right: 0.2rem;
    }

    .title {
      margin: 0 0 0.5rem;
      font-weight:normal;
      font-size: 1rem;
      color: #888;
    }

    .status {
      margin-top: 0.4rem;
      color: #888;
    }

    .url {
      margin-left: 0.5rem;
    }
  `;

  @property()
  private exchange: Exchange;

  constructor() {
    super();
    window.addEventListener("selected", (event: CustomEvent<Exchange>) => {
      this.exchange = event.detail;
    });
  }

  public renderHeaders(headers: object) {
    return Object.keys(headers).sort((a, b) => a.localeCompare(b)).map((key) => html`<div><span class="key token keyword">${key}:</span><span>${headers[key]}</span></div>`);
  }

  public render() {
    return this.exchange ?
      html`
        <div class="general">
          <div><app-method name="${this.exchange.request.method}"></app-method><span class="url">${this.exchange.request.url}</span></div>
          <div class="status">${this.exchange.response && (`${this.exchange.response.status} ${this.exchange.response.text}`)}</div>
        </div>
        <div class="content">
          <div class="part request">
            <h2 class="title">Request</h2>
            <div class="headers">${this.renderHeaders(this.exchange.request.headers)}</div>
            <pre class="body"><code>${this.exchange.request.data && unsafeHTML(Prism.highlight(JSON.stringify(this.exchange.request.data, null, 2), Prism.languages.json, "json"))}</code></pre>
          </div>
          <div class="part response">
            <h2 class="title">Response</h2>
            <div class="headers">${this.renderHeaders(this.exchange.response.headers)}</div>
            <pre class="body"><code>${this.exchange.response ? unsafeHTML(Prism.highlight(JSON.stringify(this.exchange.response.data, null, 2), Prism.languages.json, "json")) : ""}</code></pre>
          </div>
        </div>`
      :
      html`<div class="empty"></div>`
    ;
  }
}
