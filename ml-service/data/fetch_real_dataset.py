import os
import pandas as pd
import numpy as np

def fetch_and_prepare_real_dataset():
    data_dir = os.path.dirname(__file__)
    raw_path = os.path.join(data_dir, 'real_superstore_raw.csv')
    processed_path = os.path.join(data_dir, 'real_stationery_daily_demand.csv')
    target_sample_path = os.path.join(data_dir, 'sample_campus_sales.csv')

    url = 'https://gist.githubusercontent.com/nnbphuong/38db511db14542f3ba9ef16e69d3814c/raw/3a77ff9d97c504d3ec3210b12fde7242b8c6ab63/Superstore.csv'

    print(f"Downloading authentic real-world retail dataset from {url}...")
    df = pd.read_csv(url, encoding='latin1')
    print(f"Downloaded {len(df)} total transactions.")

    # Save full raw dataset
    df.to_csv(raw_path, index=False)
    print(f"Saved raw untouched dataset to {raw_path}")

    # Filter for real Office Supplies / Stationery transactions
    office_df = df[df['Category'] == 'Office Supplies'].copy()
    print(f"Filtered for Office Supplies: {len(office_df)} real transactional records.")

    # Parse dates
    office_df['Order Date'] = pd.to_datetime(office_df['Order Date'])

    # Map real sub-categories to CampusCart product categories & SKUs
    category_sku_map = {
        'Paper': {'sku': 'NB-CLM-300', 'name': 'Classmate Spiral Long Notebook 300p'},
        'Binders': {'sku': 'FL-SL-A4R', 'name': 'Solo A4 Ring Binder File Folder'},
        'Art': {'sku': 'GEO-CAM-BX', 'name': 'Camlin Mathematical Instrument Box'},
        'Storage': {'sku': 'NB-LAB-180', 'name': 'Hardbound Engineering Lab Record'},
        'Supplies': {'sku': 'PEN-PLT-BK', 'name': 'Pilot V5 Liquid Ink Rollerball Pen'},
        'Labels': {'sku': 'LAB-GRP-50', 'name': 'A4 Millimeter Graph Sheets Pack 50'},
        'Fasteners': {'sku': 'PEN-CLO-BF5', 'name': 'Cello Butterflow Classic Blue Pack 5'},
        'Appliances': {'sku': 'CALC-CS-991CW', 'name': 'Casio fx-991CW Scientific Calculator'}
    }

    # Aggregate by date and sub-category to get real daily sales time-series
    daily_grouped = office_df.groupby(['Order Date', 'Sub-Category']).agg(
        daily_sales=('Quantity', 'sum'),
        total_revenue=('Sales', 'sum'),
        total_profit=('Profit', 'sum'),
        order_count=('Order ID', 'nunique')
    ).reset_index()

    # Create full date range for each sub-category so time-series has regular daily steps
    all_dates = pd.date_range(daily_grouped['Order Date'].min(), daily_grouped['Order Date'].max(), freq='D')
    sub_categories = [k for k in category_sku_map.keys() if k in daily_grouped['Sub-Category'].unique()]

    full_grid = pd.MultiIndex.from_product([all_dates, sub_categories], names=['Order Date', 'Sub-Category']).to_frame().reset_index(drop=True)
    merged = pd.merge(full_grid, daily_grouped, on=['Order Date', 'Sub-Category'], how='left')
    merged['daily_sales'] = merged['daily_sales'].fillna(0).astype(int)
    merged['total_revenue'] = merged['total_revenue'].fillna(0).round(2)
    merged['total_profit'] = merged['total_profit'].fillna(0).round(2)
    merged['order_count'] = merged['order_count'].fillna(0).astype(int)

    # Add product info
    merged['product_sku'] = merged['Sub-Category'].map(lambda x: category_sku_map.get(x, {}).get('sku', f"SKU-{x}"))
    merged['product_name'] = merged['Sub-Category'].map(lambda x: category_sku_map.get(x, {}).get('name', x))
    merged['date'] = merged['Order Date'].dt.strftime('%Y-%m-%d')
    merged['day_of_week'] = merged['Order Date'].dt.day_name()
    merged['is_weekend'] = merged['Order Date'].dt.weekday.isin([5, 6]).astype(int)

    # Detect real exam/quarterly shopping seasons from month (Mar/Apr and Nov/Dec are heavy exam seasons)
    def assign_academic_period(dt):
        month = dt.month
        day = dt.day
        if month in [2, 3] and day >= 15:
            return 'MID_TERM_EXAMS'
        elif month in [4, 5]:
            return 'END_SEM'
        elif month in [9, 10] and day >= 20:
            return 'MID_TERM_EXAMS'
        elif month in [11, 12]:
            return 'END_SEM'
        elif month in [8] and day <= 15:
            return 'SEMESTER_START'
        else:
            return 'REGULAR_CLASSES'

    merged['academic_event'] = merged['Order Date'].apply(assign_academic_period)

    # Order columns
    final_cols = ['date', 'product_sku', 'product_name', 'Sub-Category', 'day_of_week', 'is_weekend', 'academic_event', 'daily_sales', 'total_revenue', 'total_profit']
    final_df = merged[final_cols].sort_values(['product_sku', 'date']).reset_index(drop=True)

    # Save processed real datasets
    final_df.to_csv(processed_path, index=False)
    final_df.to_csv(target_sample_path, index=False)

    print(f"Successfully processed real dataset into {len(final_df)} daily records across {final_df['date'].nunique()} days.")
    print(f"Saved to:\n  - {processed_path}\n  - {target_sample_path}")
    print("\nReal Dataset Breakdown by Sub-Category:")
    print(final_df.groupby('Sub-Category')['daily_sales'].agg(['count', 'sum', 'mean']).rename(columns={'count': 'days_tracked', 'sum': 'total_units_sold', 'mean': 'avg_daily_sales'}))

    return final_df

if __name__ == '__main__':
    fetch_and_prepare_real_dataset()
