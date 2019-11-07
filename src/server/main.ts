import { App } from "./app";

const app = new App(process.env.PORT || 8080, 50);
app.listen();
