import { css, customElement, html, LitElement } from "lit-element";

@customElement("app-main")
class MainComponent extends LitElement {

  public static styles = css`
    :host {
      display: flex;
      width: 100%;
      height:100%;
    }

    .list {
      width: 20vw;
    }

    .detail {
      box-shadow: 0rem 0 0.4rem rgba(0, 0, 0, 0.25);
      z-index: 1;
      flex: 1;
    }
  `;

  constructor() {
    super();
    this.connect();
  }

  public connect() {
    const ws = new WebSocket(`ws${window.location.protocol === "https:" ? "s" : ""}://${window.location.host}`);
    ws.onopen = () => {
      this.dispatchEvent(new CustomEvent( "connection", { bubbles: true, composed: true, detail: true } ));
    };
    ws.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      this.dispatchEvent(new CustomEvent( "data", { bubbles: true, composed: true, detail: data } ));
    };
    ws.onclose = () => {
      this.dispatchEvent(new CustomEvent( "connection", { bubbles: true, composed: true, detail: false } ));
      setTimeout(this.connect.bind(this), 1000);
    };
  }

  public render() {
    return html`
      <app-list class="list"></app-list>
      <app-detail class="detail"></app-detail>
    `;
  }
}
