from datetime import date, timedelta
from typing import Iterable


def completion_rate(log_dates: Iterable[date], today: date, days: int = 30) -> float:
    """Porcentaje de días con check-in en los últimos `days` días (incluido hoy)."""
    if days <= 0:
        raise ValueError("days tiene que ser mayor que cero")

    start = today - timedelta(days=days - 1)
    in_window = {d for d in log_dates if start <= d <= today}
    return round(len(in_window) * 100 / days, 1)


def weekly_summary(log_dates: Iterable[date], today: date) -> dict:
    """Cuántos check-ins hubo esta semana y cómo se compara con la anterior."""
    dates = set(log_dates)
    this_week_start = today - timedelta(days=today.weekday())
    last_week_start = this_week_start - timedelta(days=7)

    this_week = 0
    last_week = 0
    for d in dates:
        if this_week_start <= d <= today:
            this_week += 1
        elif last_week_start <= d < this_week_start:
            last_week += 1

    if this_week > last_week:
        trend = "mejorando"
    elif this_week < last_week:
        trend = "bajando"
    else:
        trend = "estable"

    return {"this_week": this_week, "last_week": last_week, "trend": trend}