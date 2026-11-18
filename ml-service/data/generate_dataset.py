import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_campus_dataset():
    np.random.seed(42)
    start_date = datetime(2025, 7, 1) # Full 1-year academic cycle
    total_days = 365

    products = [
        {'sku': 'NB-CLM-300', 'name': 'Classmate Spiral Long Notebook 300p', 'category': 'Notebooks', 'price': 95, 'cost': 65, 'base_daily': 14.0, 'exam_mult': 2.8, 'sem_start_mult': 3.5},
        {'sku': 'NB-LAB-180', 'name': 'Hardbound Engineering Lab Record 180p', 'category': 'Notebooks', 'price': 80, 'cost': 52, 'base_daily': 8.0, 'exam_mult': 3.2, 'sem_start_mult': 2.5},
        {'sku': 'PEN-TMX-BL5', 'name': 'Reynolds Trimax Gel Pen Blue Pack 5', 'category': 'Pens', 'price': 250, 'cost': 180, 'base_daily': 12.0, 'exam_mult': 3.4, 'sem_start_mult': 2.0},
        {'sku': 'PEN-PLT-BK', 'name': 'Pilot V5 Liquid Ink Rollerball Black', 'category': 'Pens', 'price': 70, 'cost': 48, 'base_daily': 16.0, 'exam_mult': 2.6, 'sem_start_mult': 1.8},
        {'sku': 'CALC-CS-991CW', 'name': 'Casio fx-991CW Scientific Calculator', 'category': 'Calculators', 'price': 1595, 'cost': 1250, 'base_daily': 2.5, 'exam_mult': 4.5, 'sem_start_mult': 3.0},
        {'sku': 'GEO-DRF-01', 'name': 'Omega Mini Drafter Engineering Drawing', 'category': 'Art & Geometry', 'price': 450, 'cost': 320, 'base_daily': 3.0, 'exam_mult': 1.2, 'sem_start_mult': 5.0},
        {'sku': 'FL-SL-A4R', 'name': 'Solo A4 Ring Binder File Folder', 'category': 'Files & Folders', 'price': 135, 'cost': 90, 'base_daily': 7.0, 'exam_mult': 1.5, 'sem_start_mult': 1.5, 'proj_mult': 4.2},
        {'sku': 'LAB-GRP-50', 'name': 'A4 Millimeter Graph Sheets Pack 50', 'category': 'Lab Supplies', 'price': 60, 'cost': 38, 'base_daily': 9.0, 'exam_mult': 3.0, 'sem_start_mult': 2.0},
        {'sku': 'PEN-CLO-BF5', 'name': 'Cello Butterflow Classic Blue Pack 5', 'category': 'Pens', 'price': 50, 'cost': 32, 'base_daily': 22.0, 'exam_mult': 3.5, 'sem_start_mult': 2.2},
        {'sku': 'GEO-CAM-BX', 'name': 'Camlin Exam Mathematical Instrument Box', 'category': 'Art & Geometry', 'price': 120, 'cost': 85, 'base_daily': 5.0, 'exam_mult': 2.2, 'sem_start_mult': 3.8},
        {'sku': 'HLT-FC-4PK', 'name': 'Faber-Castell Textliner Highlighters 4pk', 'category': 'Pens', 'price': 110, 'cost': 75, 'base_daily': 8.0, 'exam_mult': 3.1, 'sem_start_mult': 1.5},
        {'sku': 'NB-PRA-100', 'name': 'Navneet Youva Practical Sheets 100pk', 'category': 'Lab Supplies', 'price': 85, 'cost': 55, 'base_daily': 10.0, 'exam_mult': 2.9, 'sem_start_mult': 2.4, 'proj_mult': 2.5}
    ]

    academic_schedule = [
        # Sem 1
        {'name': 'SEMESTER_START', 'start_day': 31, 'end_day': 42},       # Aug 1 - Aug 12
        {'name': 'MID_TERM_EXAMS', 'start_day': 82, 'end_day': 92},       # Sep 21 - Oct 1
        {'name': 'PROJECT_SUBMISSION', 'start_day': 116, 'end_day': 127}, # Oct 25 - Nov 5
        {'name': 'END_SEM', 'start_day': 142, 'end_day': 167},            # Nov 20 - Dec 15
        {'name': 'WINTER_BREAK', 'start_day': 168, 'end_day': 188},       # Dec 16 - Jan 5
        # Sem 2
        {'name': 'SEMESTER_START', 'start_day': 189, 'end_day': 198},     # Jan 6 - Jan 15
        {'name': 'MID_TERM_EXAMS', 'start_day': 234, 'end_day': 244},     # Feb 20 - Mar 2
        {'name': 'PROJECT_SUBMISSION', 'start_day': 278, 'end_day': 288}, # Apr 5 - Apr 15
        {'name': 'END_SEM', 'start_day': 304, 'end_day': 326},            # May 1 - May 23
        {'name': 'SUMMER_BREAK', 'start_day': 335, 'end_day': 365},       # Jun 1 - Jun 30
    ]

    rows = []
    for day_i in range(total_days):
        cur_date = start_date + timedelta(days=day_i)
        date_str = cur_date.strftime('%Y-%m-%d')
        dow_str = cur_date.strftime('%A')
        is_weekend = 1 if cur_date.weekday() in [5, 6] else 0

        # Determine academic period
        active_event = 'REGULAR_CLASSES'
        for event in academic_schedule:
            if event['start_day'] <= day_i <= event['end_day']:
                active_event = event['name']
                break

        for prod in products:
            multiplier = 1.0

            # Weekend effect
            if is_weekend:
                multiplier *= 0.40 # 60% dip on campus weekends

            # Academic Shock Multipliers
            if active_event == 'SEMESTER_START':
                multiplier *= prod.get('sem_start_mult', 1.5)
            elif active_event == 'MID_TERM_EXAMS':
                multiplier *= prod.get('exam_mult', 2.0)
            elif active_event == 'PROJECT_SUBMISSION':
                multiplier *= prod.get('proj_mult', 1.8)
            elif active_event == 'END_SEM':
                multiplier *= (prod.get('exam_mult', 2.2) * 1.25)
            elif active_event in ['WINTER_BREAK', 'SUMMER_BREAK']:
                multiplier *= 0.15 # Campus is mostly empty during breaks

            # Random noise
            noise = np.random.normal(0, 1.1)
            sales = max(0, int(round(prod['base_daily'] * multiplier + noise)))
            revenue = round(sales * prod['price'], 2)
            profit = round(sales * (prod['price'] - prod['cost']), 2)

            rows.append({
                'date': date_str,
                'product_sku': prod['sku'],
                'product_name': prod['name'],
                'category': prod['category'],
                'unit_price': prod['price'],
                'cost_price': prod['cost'],
                'day_of_week': dow_str,
                'is_weekend': is_weekend,
                'academic_event': active_event,
                'daily_sales': sales,
                'revenue_inr': revenue,
                'profit_inr': profit
            })

    df = pd.DataFrame(rows)
    out_dir = os.path.dirname(__file__)
    
    file_365 = os.path.join(out_dir, 'campus_stationery_sales_365d.csv')
    file_sample = os.path.join(out_dir, 'sample_campus_sales.csv')

    df.to_csv(file_365, index=False)
    df.to_csv(file_sample, index=False)
    print(f"Successfully generated {len(df)} records across 365 days for {len(products)} products.")
    print(f"Saved to: {file_365} and {file_sample}")
    return df

if __name__ == '__main__':
    generate_campus_dataset()
