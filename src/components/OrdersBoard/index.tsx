import { useState } from 'react';
import { toast } from 'react-toastify';

import { OrderProps } from '../../types/Orders';
import { api } from '../../utils/api';
import { OrderModal } from '../OrderModal';

import { Board, OrdersContainer } from './styles';

interface OrdersBoardProps {
  icon: string;
  title: string;
  orders: OrderProps[];
  onCancelOrder: (orderId: string) => void;
  onChangeOrdersStatus: (orderId: string, status: OrderProps['status']) => void;
}

export function OrdersBoard({ icon, title, orders, onCancelOrder, onChangeOrdersStatus }: OrdersBoardProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<null | OrderProps>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleOpenModal(order: OrderProps) {
    setIsModalVisible(true);
    setSelectedOrder(order);
  }

  function handleCloseModal() {
    setIsModalVisible(false);
    setSelectedOrder(null);
  }

  async function handleChangeOrderStatus() {
    if (!selectedOrder) return;
    setIsLoading(true);

    const newStatus = selectedOrder.status === 'WAITING'
      ? 'IN_PRODUCTION'
      : 'DONE';

    await api.patch(`/orders/${selectedOrder._id}`, { status: newStatus });

    toast.success(`O pedido da mesa ${selectedOrder.table} teve o status alterado!`);
    onChangeOrdersStatus(selectedOrder._id, newStatus);
    setIsLoading(false);
    setIsModalVisible(false);
  }

  async function handleCancelOrder() {
    if (!selectedOrder) return;
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 2000));
    await api.delete(`/orders/${selectedOrder._id}`);

    toast.success(`O pedido da mesa ${selectedOrder.table} foi cancelado`);
    onCancelOrder(selectedOrder._id);
    setIsLoading(false);
    setIsModalVisible(false);
  }

  return (
    <Board>
      <OrderModal
        visible={isModalVisible}
        order={selectedOrder}
        isLoading={isLoading}
        onClose={handleCloseModal}
        onCancelOrder={handleCancelOrder}
        onChangeOrdersStatus={handleChangeOrderStatus}
      />
      <header>
        <span>{icon}</span>
        <strong>{title}</strong>
        <span>({orders.length})</span>
      </header>

      {orders.length > 0 &&
      <OrdersContainer>
        {orders.map((order) => (
          <button type='button' key={order._id} onClick={() => handleOpenModal(order)}>
            <strong>Mesa {order.table}</strong>
            <span>{order.products.length} itens</span>
          </button>
        ))}
      </OrdersContainer>
      }
    </Board>
  );
}
