# app/services/order_stats.rb
class OrderStats
  def initialize(orders)
    @orders = orders
  end

  # Total revenue across all orders
  def total_revenue
    @orders.sum { |o| o["current_total_price"].to_f }
  end

  # Orders grouped by date (YYYY-MM-DD)
  def orders_by_day
    @orders
      .group_by { |o| Date.parse(o["created_at"]).to_s }
      .transform_values(&:count)
  end

  # Average order value (revenue ÷ order count)
  def average_order_value
    return 0 if @orders.empty?
    total_revenue / @orders.size
  end
end
