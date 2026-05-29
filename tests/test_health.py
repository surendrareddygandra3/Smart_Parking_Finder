from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_openapi_available():
    res = client.get("/openapi.json")
    assert res.status_code == 200
