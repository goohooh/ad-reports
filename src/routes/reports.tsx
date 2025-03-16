import ReportPage from '@/pages/Reports';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/reports')({
  component: ReportPage,
});
