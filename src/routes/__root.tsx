import { createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

// 로딩 컴포넌트 정의
const LoadingComponent = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <p>Loading...</p> {/* 스피너나 애니메이션 추가 가능 */}
  </div>
);

export const Route = createRootRoute({
  beforeLoad: async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      if (location.pathname === '/login') {
        return;
      }
      throw redirect({ to: '/login' });
    }

    const isValid = await new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 1000)); //(token); // 비동기 토큰 검증
    if (!isValid) {
      throw redirect({ to: '/login' });
    } else {
      throw redirect({ to: '/reports' });
    }
  },
  pendingComponent: LoadingComponent, // 로딩 중 표시할 컴포넌트
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
