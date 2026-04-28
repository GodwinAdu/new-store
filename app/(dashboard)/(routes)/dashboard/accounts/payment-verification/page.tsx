import { getPendingPayments, getPaymentStats } from '@/lib/actions/payment-verification.actions'
import PaymentVerificationDashboard from './_components/payment-verification-dashboard'

export default async function AccountsPage() {
  const [pendingPayments, stats] = await Promise.all([
    getPendingPayments(),
    getPaymentStats()
  ])

  return <PaymentVerificationDashboard pendingPayments={pendingPayments} stats={stats} />
}
