import { useEffect, useState } from 'react';
import socketIo from 'socket.io-client';

import { OrderProps } from '../../types/Orders';
import { api } from '../../utils/api';

import { OrdersBoard } from '../OrdersBoard';

import { Container } from './styles';

export function Orders() {
  const [orders, setOrders] = useState<OrderProps[]>([]);

  useEffect(() => {
    const socket = socketIo('http://localhost:3001', {
      transports: ['websocket']
    });

    socket.on('orders@new', (order) => {
      setOrders(prevState => prevState.concat(order));
    });
  }, []);

  useEffect(() => {
    api.get('/orders').then(({ data }) => {
      setOrders(data);
    });
  }, []);

  const waiting = orders.filter((order) => order.status === 'WAITING');
  const inProduction = orders.filter((order) => order.status === 'IN_PRODUCTION');
  const done = orders.filter((order) => order.status === 'DONE');

  function handleCancelOrder(orderId: string) {
    setOrders((prevState) => prevState.filter(order => order._id !== orderId));
  }

  function handleOrdersStatusChange(orderId: string, status: OrderProps['status']) {
    setOrders((prevState) => prevState.map((order) => (
      order._id === orderId
        ? { ...order, status }
        : order
    )));
  }

  return (
    <Container>
      <OrdersBoard
        icon="🕑"
        title="Em espera"
        orders={waiting}
        onCancelOrder={handleCancelOrder}
        onChangeOrdersStatus={handleOrdersStatusChange}
      />

      <OrdersBoard
        icon="👨‍🍳"
        title="Em preparação"
        orders={inProduction}
        onCancelOrder={handleCancelOrder}
        onChangeOrdersStatus={handleOrdersStatusChange}
      />

      <OrdersBoard
        icon="✅"
        title="Pronto!"
        orders={done}
        onCancelOrder={handleCancelOrder}
        onChangeOrdersStatus={handleOrdersStatusChange}
      />
    </Container>
  );
}
