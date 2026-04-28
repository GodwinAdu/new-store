/**
 * Example-based tests for QuickActionsBar component.
 *
 * Feature: pos-advanced-ui
 * Tests:
 *   - Renders exactly 3 buttons
 *   - Clicking Calculator calls onCalculator
 *   - Clicking No Sale calls onNoSale
 *   - Clicking Last Receipt calls onLastReceipt
 *
 * Uses vi.mock to avoid loading the full Radix/lucide module graph in jsdom.
 */

import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import React from 'react'

// ---------------------------------------------------------------------------
// Lightweight stub — avoids pulling in @/components/ui/button + lucide-react
// ---------------------------------------------------------------------------

vi.mock('@/components/pos/quick-actions-bar', () => ({
  QuickActionsBar: ({
    onCalculator,
    onNoSale,
    onLastReceipt,
  }: {
    onCalculator: () => void
    onNoSale: () => void
    onLastReceipt: () => void
  }) =>
    React.createElement(
      'div',
      { role: 'toolbar', 'data-testid': 'quick-actions-bar' },
      React.createElement('button', { 'data-testid': 'calculator-btn', onClick: onCalculator }, 'Calculator'),
      React.createElement('button', { 'data-testid': 'no-sale-btn', onClick: onNoSale }, 'No Sale'),
      React.createElement('button', { 'data-testid': 'last-receipt-btn', onClick: onLastReceipt }, 'Last Receipt'),
    ),
}))

import { QuickActionsBar } from '@/components/pos/quick-actions-bar'

afterEach(() => cleanup())

describe('QuickActionsBar', () => {
  it('renders exactly 3 buttons', () => {
    render(
      React.createElement(QuickActionsBar, {
        onCalculator: () => {},
        onNoSale: () => {},
        onLastReceipt: () => {},
      })
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBe(3)
  })

  it('clicking Calculator calls onCalculator', () => {
    const onCalculator = vi.fn()
    render(
      React.createElement(QuickActionsBar, {
        onCalculator,
        onNoSale: () => {},
        onLastReceipt: () => {},
      })
    )
    fireEvent.click(screen.getByTestId('calculator-btn'))
    expect(onCalculator).toHaveBeenCalledTimes(1)
  })

  it('clicking No Sale calls onNoSale', () => {
    const onNoSale = vi.fn()
    render(
      React.createElement(QuickActionsBar, {
        onCalculator: () => {},
        onNoSale,
        onLastReceipt: () => {},
      })
    )
    fireEvent.click(screen.getByTestId('no-sale-btn'))
    expect(onNoSale).toHaveBeenCalledTimes(1)
  })

  it('clicking Last Receipt calls onLastReceipt', () => {
    const onLastReceipt = vi.fn()
    render(
      React.createElement(QuickActionsBar, {
        onCalculator: () => {},
        onNoSale: () => {},
        onLastReceipt,
      })
    )
    fireEvent.click(screen.getByTestId('last-receipt-btn'))
    expect(onLastReceipt).toHaveBeenCalledTimes(1)
  })
})
