from pyspark import pipelines as dp
from pyspark.sql.functions import *
from pyspark.sql.types import *
from datetime import datetime, timedelta
import calendar

# Import common functions
from utilities.common_functions import *

@dp.table(
    comment="Conformed date dimension covering 2020-2030",
    table_properties={
        "quality": "gold",
        "pipelines.autoOptimize.managed": "true"
    }
)
@dp.expect("valid_date_range", "full_date BETWEEN '2020-01-01' AND '2030-12-31'")
@dp.expect("unique_date_key", "date_sk IS NOT NULL")
def dim_date():
    # Generate date range
    start_date = datetime(2020, 1, 1)
    end_date = datetime(2030, 12, 31)
    
    dates = []
    current = start_date
    while current <= end_date:
        dates.append({
            'date_sk': int(current.strftime('%Y%m%d')),
            'full_date': current.date(),
            'year': current.year,
            'quarter': (current.month - 1) // 3 + 1,
            'quarter_name': f"Q{(current.month - 1) // 3 + 1} {current.year}",
            'month': current.month,
            'month_name': calendar.month_name[current.month],
            'month_year': current.strftime('%b %Y'),
            'day_of_month': current.day,
            'day_of_week': current.isoweekday(),
            'day_name': calendar.day_name[current.weekday()],
            'is_weekend': current.weekday() >= 5,
            'week_of_year': current.isocalendar()[1],
            'season': get_season(current.month),
            'fiscal_year': current.year if current.month >= 4 else current.year - 1,
            'fiscal_quarter': f"FY{current.year if current.month >= 4 else current.year - 1} Q{((current.month - 4) % 12) // 3 + 1}"
        })
        current += timedelta(days=1)
    
    return spark.createDataFrame(dates)