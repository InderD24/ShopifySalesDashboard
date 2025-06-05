# app/controllers/orders_controller.rb
class OrdersController < ApplicationController
  def index
    # 1) Read optional start/end params (format: "YYYY-MM-DD")
    start_date = params[:start]
    end_date   = params[:end]

    # 2) Build base Shopify URL including status=any
    base_url = "https://#{ENV['SHOPIFY_STORE']}/admin/api/2023-01/orders.json?status=any"

    # 3) If both start and end are provided, append created_at filters
    if start_date.present? && end_date.present?
      # Convert to ISO‐8601 with timestamps at day boundaries
      created_min = "#{start_date}T00:00:00Z"
      created_max = "#{end_date}T23:59:59Z"
      base_url += "&created_at_min=#{created_min}&created_at_max=#{created_max}"
    end

    # 4) Perform the HTTP GET to Shopify
    response = Faraday.get(base_url) do |req|
      req.headers['X-Shopify-Access-Token'] = ENV['SHOPIFY_ACCESS_TOKEN']
      req.headers['Content-Type']           = 'application/json'
    end

    # 5) Handle errors
    unless response.success?
      return render json: { error: "Failed to fetch orders", status: response.status },
                    status: :bad_request
    end

    # 6) Parse and aggregate
    orders = JSON.parse(response.body)["orders"]
    stats  = OrderStats.new(orders)

    # 7) Return exactly the JSON your React app expects
    render json: {
      total_revenue:         stats.total_revenue,
      orders_by_day:         stats.orders_by_day,
      average_order_value:   stats.average_order_value
    }
  end
    def customers_metric
    start_date = params[:start]
    end_date   = params[:end]

    base_url = "https://#{ENV['SHOPIFY_STORE']}/admin/api/2023-01/orders.json?status=any"
    if start_date.present? && end_date.present?
      created_min = "#{start_date}T00:00:00Z"
      created_max = "#{end_date}T23:59:59Z"
      base_url += "&created_at_min=#{created_min}&created_at_max=#{created_max}"
    end

    response = Faraday.get(base_url) do |req|
      req.headers['X-Shopify-Access-Token'] = ENV['SHOPIFY_ACCESS_TOKEN']
      req.headers['Content-Type']           = 'application/json'
    end

    unless response.success?
      return render json: { error: "Failed to fetch orders", status: response.status },
                    status: :bad_request
    end

    orders = JSON.parse(response.body)["orders"]

    # Group orders by customer ID
    by_customer = orders.group_by { |o| o["customer"]["id"] }
    new_count       = by_customer.count { |_cust_id, arr| arr.size == 1 }
    returning_count = by_customer.count { |_cust_id, arr| arr.size > 1 }

    render json: {
      new_customers:       new_count,
      returning_customers: returning_count
    }
  end
end
