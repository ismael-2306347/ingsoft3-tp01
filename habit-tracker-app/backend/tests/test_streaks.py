from datetime import date

from app.streaks import best_streak, current_streak


def test_current_streak_empty_logs_is_zero():
    assert current_streak([], today=date(2026, 8, 18)) == 0


def test_current_streak_counts_consecutive_days_including_today():
    logs = [date(2026, 8, 18), date(2026, 8, 17), date(2026, 8, 16)]
    assert current_streak(logs, today=date(2026, 8, 18)) == 3


def test_current_streak_still_active_if_yesterday_checked_but_not_today():
    logs = [date(2026, 8, 17), date(2026, 8, 16)]
    assert current_streak(logs, today=date(2026, 8, 18)) == 2


def test_current_streak_breaks_on_gap():
    logs = [date(2026, 8, 18), date(2026, 8, 17), date(2026, 8, 14)]
    assert current_streak(logs, today=date(2026, 8, 18)) == 2


def test_current_streak_zero_if_most_recent_older_than_yesterday():
    logs = [date(2026, 8, 15), date(2026, 8, 14)]
    assert current_streak(logs, today=date(2026, 8, 18)) == 0


def test_best_streak_empty_logs_is_zero():
    assert best_streak([]) == 0


def test_best_streak_finds_longest_run_even_if_not_current():
    logs = [
        date(2026, 8, 1), date(2026, 8, 2), date(2026, 8, 3), date(2026, 8, 4),
        date(2026, 8, 10), date(2026, 8, 11),
    ]
    assert best_streak(logs) == 4


def test_best_streak_ignores_duplicate_dates():
    logs = [date(2026, 8, 1), date(2026, 8, 1), date(2026, 8, 2)]
    assert best_streak(logs) == 2
