import React from 'react';
import StoreIcon from '../StoreIcon';

const formatPrice = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? `¥${(number / 100).toFixed(2)}` : '—';
};

// 下单/取消订单确认卡片：确认后前端回发 [CONFIRM:op_id] / [REJECT:op_id] 标记消息，
// 由 Agent 服务端执行写操作（LLM 只能提议，不能直接执行）
const OrderConfirmCard = ({ confirm, disabled, onConfirmDecision }) => {
  const { summary, resolved } = confirm;
  if (!summary) return null;

  const isOrder = summary.type === 'create_order';
  const settled = resolved || disabled;
  const order = summary.order;

  return (
    <div className={`agent-confirm-card ${settled ? 'is-settled' : ''}`}>
      <div className="agent-confirm-head">
        <span className="agent-confirm-badge"><StoreIcon name={isOrder ? 'cart' : 'close'} size={13} /></span>
        <strong>{summary.title || (isOrder ? '确认创建订单' : '确认取消订单')}</strong>
      </div>

      {isOrder ? (
        <>
          <ul className="agent-confirm-items">
            {summary.items?.map((item) => (
              <li key={item.book_id}>
                <span className="agent-confirm-item-title" title={item.title}>
                  《{item.title}》× {item.quantity}
                </span>
                <span className="agent-confirm-item-price">{formatPrice(item.subtotal)}</span>
              </li>
            ))}
          </ul>
          <div className="agent-confirm-total">
            <span>预估总价</span>
            <strong>{formatPrice(summary.estimated_total)}</strong>
          </div>
        </>
      ) : (
        <div className="agent-confirm-order">
          <p className="agent-confirm-order-no">订单号：{order?.order_no || order?.order_id}</p>
          <p className="agent-confirm-order-status">
            状态：{order?.status_text || '待支付'} · 金额 {formatPrice(order?.total_amount)}
          </p>
          {order?.items?.length > 0 && (
            <p className="agent-confirm-order-items">
              含：{order.items.map((item) => `《${item.title}》×${item.quantity}`).join('、')}
            </p>
          )}
        </div>
      )}

      {summary.note && <p className="agent-confirm-note">{summary.note}</p>}

      <div className="agent-confirm-actions">
        {settled ? (
          <span className="agent-confirm-settled">{resolved === 'confirmed' ? '已确认' : '已取消'}</span>
        ) : (
          <>
            <button
              type="button"
              className="agent-confirm-accept"
              onClick={() => onConfirmDecision('confirmed')}
            >
              {isOrder ? '确认下单' : '确认取消订单'}
            </button>
            <button
              type="button"
              className="agent-confirm-decline"
              onClick={() => onConfirmDecision('rejected')}
            >
              再想想
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmCard;
