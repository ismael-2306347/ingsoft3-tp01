from datetime import date, timedelta
from typing import Iterable


def current_streak(log_dates: Iterable[date], today: date) -> int:
    dates = sorted(set(log_dates), reverse=True)
    if not dates:
        return 0

    most_recent = dates[0]
    if most_recent == today:
        cursor = today
    elif most_recent == today - timedelta(days=1):
        cursor = most_recent
    else:
        return 0

    streak = 0
    expected = cursor
    for d in dates:
        if d == expected:
            streak += 1
            expected = expected - timedelta(days=1)
        elif d < expected:
            break
    return streak


def best_streak(log_dates: Iterable[date]) -> int:
    dates = sorted(set(log_dates))
    if not dates:
        return 0

    longest = 1
    current = 1
    for prev, curr in zip(dates, dates[1:]):
        if curr == prev + timedelta(days=1):
            current += 1
            longest = max(longest, current)
        else:
            current = 1
    return longest
