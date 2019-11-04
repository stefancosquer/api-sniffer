import { css, customElement, html, LitElement, property } from "lit-element";

@customElement("app-method")
class MethodComponent extends LitElement {

  public static styles = css`
    :host {
      text-transform: uppercase;
      font-weight: bold;
    }

    .get, .head, .options {
      color: green;
    }

    .post, .put, .patch {
      color: orange;
    }

    .delete {
      color: red;
    }
  `;

  @property()
  private name: string;

  constructor() {
    super();
  }

  public render() {
    return html`<span class="${this.name}">${this.name}</span>`;
  }
}
