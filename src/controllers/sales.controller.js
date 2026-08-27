import Order from '../models/order.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Only 'paid' represents confirmed revenue now — 'shipped'/'completed'
// are no longer reachable via updateOrderStatus (see validation schema).
const CONFIRMED_STATUSES = ['paid'];

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

    // Same 404-not-403 pattern as product/category ownership checks — a
    // merchant with no items on this order shouldn't be able to tell an
    // order they can't touch apart from one that doesn't exist at all.
    const ownsItem = order.items.some(
        (item) => item.merchant.toString() === merchantId.toString()
    );
    if (!ownsItem) {
        throw new ApiError(404, 'Order not found');
    }

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, order });
});