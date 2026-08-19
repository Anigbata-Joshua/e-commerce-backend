import Order from '../models/order.model.js';
import asyncHandler from '../utils/asyncHandler.js';

// @route   GET /api/sales — every line item this merchant has sold, pulled
// from any order that contains at least one of their products
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

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.line_total, 0);

    res.status(200).json({ success: true, count: sales.length, total_revenue: totalRevenue, sales });
});