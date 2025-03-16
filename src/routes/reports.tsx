import ReportPage from '@/pages/Report';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/reports')({
  component: ReportPage,
});
