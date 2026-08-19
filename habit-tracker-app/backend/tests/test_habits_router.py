from datetime import date


def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_and_list_habit(client):
    create_response = client.post(
        "/api/habits", json={"name": "Tomar agua", "description": "8 vasos"}
    )
    assert create_response.status_code == 201
    body = create_response.json()
    assert body["name"] == "Tomar agua"
    assert body["current_streak"] == 0
    assert body["checked_in_today"] is False

    list_response = client.get("/api/habits")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1


def test_checkin_marks_today_and_updates_streak(client):
    habit_id = client.post("/api/habits", json={"name": "Leer"}).json()["id"]

    response = client.post(f"/api/habits/{habit_id}/checkin")
    assert response.status_code == 200
    body = response.json()
    assert body["checked_in_today"] is True
    assert body["current_streak"] == 1


def test_checkin_is_idempotent_via_api(client):
    habit_id = client.post("/api/habits", json={"name": "Leer"}).json()["id"]
    client.post(f"/api/habits/{habit_id}/checkin")
    response = client.post(f"/api/habits/{habit_id}/checkin")
    assert response.status_code == 200
    assert response.json()["current_streak"] == 1


def test_delete_checkin_undoes_today(client):
    habit_id = client.post("/api/habits", json={"name": "Leer"}).json()["id"]
    client.post(f"/api/habits/{habit_id}/checkin")

    response = client.delete(f"/api/habits/{habit_id}/checkin")
    assert response.status_code == 200
    assert response.json()["checked_in_today"] is False
    assert response.json()["current_streak"] == 0


def test_get_logs_returns_dates_desc(client):
    habit_id = client.post("/api/habits", json={"name": "Leer"}).json()["id"]
    client.post(f"/api/habits/{habit_id}/checkin")

    response = client.get(f"/api/habits/{habit_id}/logs")
    assert response.status_code == 200
    logs = response.json()
    assert len(logs) == 1
    assert logs[0]["date"] == date.today().isoformat()


def test_update_habit_changes_name(client):
    habit_id = client.post("/api/habits", json={"name": "Leer"}).json()["id"]
    response = client.put(
        f"/api/habits/{habit_id}", json={"name": "Leer libros", "description": None}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Leer libros"


def test_delete_habit_removes_it(client):
    habit_id = client.post("/api/habits", json={"name": "Leer"}).json()["id"]
    delete_response = client.delete(f"/api/habits/{habit_id}")
    assert delete_response.status_code == 204

    list_response = client.get("/api/habits")
    assert list_response.json() == []


def test_operations_on_missing_habit_return_404(client):
    assert client.get("/api/habits/999/logs").status_code == 404
    assert client.put("/api/habits/999", json={"name": "X"}).status_code == 404
    assert client.delete("/api/habits/999").status_code == 404
    assert client.post("/api/habits/999/checkin").status_code == 404
