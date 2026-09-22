import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import axios from 'axios';
import { env } from '../config/env.js';
import Merchant from '../models/merchant.model.js';

const CONFIRMED_STATUSES = ['paid'];
const LOW_STOCK_THRESHOLD = 5;

// @route   GET /api/sales — every line item this merchant has sold, pulled
// from any order that contains at least one of their products. Revenue
// totals only count confirmed orders (see CONFIRMED_STATUSES) — pending
// orders still appear in `sales` so the merchant can see and confirm them,
// but their value is reported separately as `pending_revenue`, not folded
// into `total_revenue`.
// @access  Authenticated merchant
export const getMerchantSales = asyncHandler(async (req, res) => {
    const merchantId = req.merchant._id;

    const orders = await Order.find({ 'items.merchant': merchantId }).sort({ createdAt: -1 });

    const sales = orders.flatMap((order) =>
        order.items
            .filter((item) => item.merchant.toString() === merchantId.toString())
            .map((item) => ({
                order_id: order._id,
                user: order.user,
                status: order.status,
                created_at: order.createdAt,
                product: item.product,
                title: item.title,
                unit_price: item.unit_price,
                quantity: item.quantity,
                line_total: item.unit_price * item.quantity,
            }))
    );

    const totalRevenue = sales
        .filter((sale) => CONFIRMED_STATUSES.includes(sale.status))
        .reduce((sum, sale) => sum + sale.line_total, 0);

    const pendingRevenue = sales
        .filter((sale) => sale.status === 'pending')
        .reduce((sum, sale) => sum + sale.line_total, 0);

    res.status(200).json({
        success: true,
        count: sales.length,
        total_revenue: totalRevenue,
        pending_revenue: pendingRevenue,
        sales,
    });
});

// @route   PATCH /api/sales/:orderId/status — a merchant marks an order they
// have items in as paid/shipped/completed/cancelled, once the customer has
// been redirected to WhatsApp and payment/fulfillment is confirmed manually.
// @access  Authenticated merchant (must own at least one item in the order)
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const merchantId = req.merchant._id;

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    const merchantItems = order.items.filter(
        (item) => item.merchant.toString() === merchantId.toString()
    );
    if (merchantItems.length === 0) {
        throw new ApiError(404, 'Order not found');
    }

    const wasAlreadyPaid = order.status === 'paid';
    order.status = status;
    await order.save();

    // Only decrement stock the first time an order is confirmed paid —
    // guards against double-decrementing if status is set to 'paid' twice
    // or moved paid -> shipped -> paid again.
    if (status === 'paid' && !wasAlreadyPaid) {
        await Promise.all(
            merchantItems.map((item) => decrementStockAndCheck(item))
        );
    }

    res.status(200).json({ success: true, order });
});

async function decrementStockAndCheck(item) {
    const product = await Product.findById(item.product);
    if (!product) return;

    const newQuantity = Math.max(0, product.quantity - item.quantity);
    product.quantity = newQuantity;
    await product.save();

    if (newQuantity <= LOW_STOCK_THRESHOLD) {
        notifyLowStock(product).catch((err) => {
            console.error('Low-stock webhook failed:', err.message);
        });
    }
}

async function notifyLowStock(product) {
    if (!env.n8nLowStockWebhookUrl) return;

    const merchant = await Merchant.findById(product.merchant).select('email store_name');
    if (!merchant) return;

    await axios.post(env.n8nLowStockWebhookUrl, {
        productId: product._id,
        merchantId: product.merchant,
        merchantEmail: merchant.email,
        storeName: merchant.store_name,
        title: product.title,
        quantity: product.quantity,
        threshold: LOW_STOCK_THRESHOLD,
        timestamp: new Date().toISOString(),
    });
}