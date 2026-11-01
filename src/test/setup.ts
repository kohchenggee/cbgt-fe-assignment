import "@testing-library/jest-dom/vitest";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { handlers, resetMockDb } from "../mocks/handlers";
import ReactModal from "react-modal";
import { cleanup } from "@testing-library/react";

export const server = setupServer(...handlers);

beforeAll(() => {
  if (!document.getElementById('root')) {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
  }

  ReactModal.setAppElement('#root');
  server.listen({ onUnhandledRequest: "error" });
});
beforeEach(() => resetMockDb());
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => {server.close()});
