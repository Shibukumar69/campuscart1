import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('campuscart_items');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed.map((item) => {
            if (item?.product?.shopId === 'shop-central' || item?.product?.shopId?._id === 'shop-central') {
              return {
                ...item,
                product: {
                  ...item.product,
                  shopId: {
                    _id: '673b00000000000000000001',
                    name: 'Campus Central Stationary',
                    campusLocation: 'Student Activity Center, GF-04',
                  },
                },
              };
            }
            return item;
          })
        : [];
    } catch {
      return [];
    }
  });
  const [deliveryType, setDeliveryType] = useState('HOSTEL_DELIVERY');

  useEffect(() => {
    localStorage.setItem('campuscart_items', JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    const parsedQty = Math.max(1, parseInt(quantity, 10) || 1);

    setItems((prevItems) => {
      // Check if product belongs to another shop
      if (prevItems.length > 0 && prevItems[0].product.shopId?._id !== product.shopId?._id && prevItems[0].product.shopId !== product.shopId) {
        toast.error('Cart can only contain items from one campus shop at a time. Clear cart first or complete existing order.');
        return prevItems;
      }

      const existingIndex = prevItems.findIndex((i) => i.product._id === product._id);

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIndex].quantity + parsedQty;

        if (newQty > product.currentStock) {
          toast.error(`Only ${product.currentStock} units available in stock.`);
          updated[existingIndex].quantity = product.currentStock;
        } else {
          updated[existingIndex].quantity = newQty;
          toast.success(`Updated "${product.title}" quantity to ${newQty}`);
        }
        return updated;
      } else {
        if (parsedQty > product.currentStock) {
          toast.error(`Cannot add: Only ${product.currentStock} units available in stock.`);
          return prevItems;
        }
        toast.success(`Added "${product.title}" to cart`);
        return [...prevItems, { product, quantity: parsedQty }];
      }
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.product._id !== productId));
    toast.info('Item removed from cart');
  };

  const updateQuantity = (productId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    if (qty <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prev) =>
      prev.map((i) => {
        if (i.product._id === productId) {
          if (qty > i.product.currentStock) {
            toast.error(`Max available stock is ${i.product.currentStock}`);
            return { ...i, quantity: i.product.currentStock };
          }
          return { ...i, quantity: qty };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = deliveryType === 'SELF_PICKUP' ? 0 : 15;
  const totalAmount = subtotal + (items.length > 0 ? deliveryFee : 0);
  const currentShop = items.length > 0 ? items[0].product.shopId : null;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        deliveryFee,
        totalAmount,
        deliveryType,
        setDeliveryType,
        currentShop,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
