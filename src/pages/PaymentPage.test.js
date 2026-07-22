import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentPage from './PaymentPage';

jest.mock('../contexts/UserContext', () => {
  const user = { id: 2, username: 'admin' };
  return { useUser: () => ({ user, loading: false }) };
});

const orderFixture = {
  id: 8,
  order_no: 'ORD-PREVIEW-8',
  total_amount: 94,
  status: 0,
  is_paid: false,
  order_items: [
    {
      id: 11,
      book_id: 1,
      quantity: 2,
      price: 47,
      subtotal: 94,
      book: { title: '三体', author: '刘慈欣', cover_url: '' }
    }
  ]
};

const renderPaymentPage = () => render(
  <MemoryRouter initialEntries={['/payment/8']}>
    <Routes>
      <Route path="/payment/:orderId" element={<PaymentPage />} />
      <Route path="/orders" element={<div>订单列表</div>} />
    </Routes>
  </MemoryRouter>
);

afterEach(() => {
  jest.restoreAllMocks();
});

test('loads the order and shows the success dialog after a successful payment', async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ code: 0, data: orderFixture })
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ code: 0, message: '支付成功' })
    });

  renderPaymentPage();

  const payButton = await screen.findByRole('button', { name: '使用支付宝支付 ¥94.00' });
  fireEvent.click(payButton);

  const dialog = await screen.findByRole('dialog', { name: '支付成功' });
  expect(dialog).toBeInTheDocument();
  expect(within(dialog).getByText('ORD-PREVIEW-8')).toBeInTheDocument();
  expect(within(dialog).getByText('¥94.00')).toBeInTheDocument();
  expect(payButton).toBeDisabled();
  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
});
