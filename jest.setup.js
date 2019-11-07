global.window = {
  customElements: {
    define: jest.fn()
  },
  addEventListener: jest.fn()
};

global.HTMLElement = class {
  attachShadow = jest.fn()
  dispatchEvent = jest.fn()
};

global.Document = class {};

global.CustomEvent = class {};

global.JSCompiler_renameProperty = jest.fn();
