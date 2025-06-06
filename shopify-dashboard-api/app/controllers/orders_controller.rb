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

  # Build the Shopify URL just like in index…
  base_url = "https://#{ENV['SHOPIFY_STORE']}/admin/api/2023-01/orders.json?status=any"
  if start_date.present? && end_date.present?
    created_min = "#{start_date}T00:00:00Z"
    created_max = "#{end_date}T23:59:59Z"
    base_url += "&created_at_min=#{created_min}&created_at_max=#{created_max}"
  end

  resp = Faraday.get(base_url) do |req|
    req.headers['X-Shopify-Access-Token'] = ENV['SHOPIFY_ACCESS_TOKEN']
    req.headers['Content-Type']           = 'application/json'
  end
  return render( json: { error: "Failed to fetch orders", status: resp.status }, status: :bad_request ) unless resp.success?

  orders = JSON.parse(resp.body)["orders"]

  # 1) Drop any orders where customer info is missing
  orders = orders.select { |o| o["customer"] && o["customer"]["id"] }

  # 2) Group _all_ those in-range orders by customer ID
  grouped = orders.group_by { |o| o["customer"]["id"] }

  new_count       = 0
  returning_count = 0
  range_start     = Date.parse(start_date) if start_date

  grouped.each do |cust_id, cust_orders|
    # 3) Find that customer’s earliest order date in our fetched set
    first_order_at = cust_orders
                      .map   { |o| Date.parse(o["created_at"]) }
                      .min

    # 4) Compare it to the window’s start date
    if first_order_at < range_start
      returning_count += 1
    else
      new_count += 1
    end
  end

  render json: {
    new_customers:       new_count,
    returning_customers: returning_count
  }
  end
end
