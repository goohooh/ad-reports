import { createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

// 로딩 컴포넌트 정의
const LoadingComponent = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <p>Loading...</p> {/* 스피너나 애니메이션 추가 가능 */}
  </div>
);

export const Route = createRootRoute({
  beforeLoad: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (location.pathname === '/login') {
        return;
      }
      throw redirect({ to: '/login' });
    } else if (location.pathname !== '/reports') {
      throw redirect({ to: '/reports' });
    }
    return;
  },
  pendingComponent: LoadingComponent, // 로딩 중 표시할 컴포넌트
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
