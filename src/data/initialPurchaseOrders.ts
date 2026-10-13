import { PurchaseOrder } from '../types/purchase';
import { INITIAL_SUPPLIERS } from './mockSuppliers';
import { INITIAL_PRODUCTS } from './mockProducts';

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-101',
    poNumber: 'PO-2026-0042',
    supplierId: INITIAL_SUPPLIERS[0].id,
    supplier: INITIAL_SUPPLIERS[0],
    orderDate: '2026-03-28',
    expectedDeliveryDate: '2026-04-05',
    status: 'Pending',
    items: [
      {
        id: 'poi-1',
        productId: INITIAL_PRODUCTS[0].id, // Surface Laptop 4
        product: INITIAL_PRODUCTS[0],
        unitCost: 112000,
        quantityOrdered: 5,
        quantityReceived: 0,
        quantityReceivingNow: 0,
        taxRate: 5,
        totalCost: 560000,
      },
      {
        id: 'poi-2',
        productId: INITIAL_PRODUCTS[2].id, // Kingston Fury RAM
        product: INITIAL_PRODUCTS[2],
        unitCost: 5800,
        quantityOrdered: 10,
        quantityReceived: 0,
        quantityReceivingNow: 0,
        taxRate: 5,
        totalCost: 58000,
      },
    ],
    subtotal: 618000,
    taxAmount: 30900,
    grandTotal: 648900,
    notes: 'Urgent restocking for corporate tender',
    internalNotes: 'Payment verified with account manager. Free delivery included.',
    createdBy: 'Forhad',
    receiveHistory: [],
  },
  {
    id: 'po-102',
    poNumber: 'PO-2026-0038',
    supplierId: INITIAL_SUPPLIERS[1].id,
    supplier: INITIAL_SUPPLIERS[1],
    orderDate: '2026-03-20',
    expectedDeliveryDate: '2026-03-27',
    status: 'Partial Receive',
    items: [
      {
        id: 'poi-3',
        productId: INITIAL_PRODUCTS[1].id, // Core i7-12700K
        product: INITIAL_PRODUCTS[1],
        unitCost: 34000,
        quantityOrdered: 8,
        quantityReceived: 5, // Partial!
        quantityReceivingNow: 0,
        taxRate: 5,
        totalCost: 272000,
      },
      {
        id: 'poi-4',
        productId: INITIAL_PRODUCTS[3].id, // Logitech Master 3S
        product: INITIAL_PRODUCTS[3],
        unitCost: 8200,
        quantityOrdered: 15,
        quantityReceived: 10, // Partial!
        quantityReceivingNow: 0,
        taxRate: 5,
        totalCost: 123000,
      },
    ],
    subtotal: 395000,
    taxAmount: 19750,
    grandTotal: 414750,
    notes: 'Partial shipment received via courier batch #882',
    internalNotes: 'Remaining 3 CPUs and 5 Mice expected by next Monday.',
    createdBy: 'Forhad',
    receiveHistory: [
      {
        id: 'rec-1',
        receivedAt: '2026-03-24 14:30',
        receivedBy: 'Forhad',
        referenceNote: 'First batch courier delivery #882',
        itemsReceived: [
          { productId: INITIAL_PRODUCTS[1].id, productName: INITIAL_PRODUCTS[1].name, quantity: 5 },
          { productId: INITIAL_PRODUCTS[3].id, productName: INITIAL_PRODUCTS[3].name, quantity: 10 },
        ],
      },
    ],
  },
];
