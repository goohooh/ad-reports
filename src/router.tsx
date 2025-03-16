import { createRouter } from "@tanstack/react-router";
import App from "./App";

// 라우트 정의
export const router = createRouter({
  routeTree: {
    path: "/",
    component: App,
  },
});

// 타입스크립트용 타입 선언
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
