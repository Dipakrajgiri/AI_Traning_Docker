import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import get_db, Base
from app import models
from app.routers import (
    auth_router,
    dashboard_router,
    inventories_router,
    items_router,
)


# Create file-based SQLite database for testing
import tempfile
import os

test_db_file = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
test_db_file.close()
SQLITE_TEST_URL = f"sqlite:///{test_db_file.name}"
test_engine = create_engine(
    SQLITE_TEST_URL, connect_args={"check_same_thread": False}
)
TestSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=test_engine
)


@pytest.fixture(scope="session")
def database_engine():
    """Create the test database engine once for the entire test session."""
    Base.metadata.create_all(bind=test_engine)
    yield test_engine
    Base.metadata.drop_all(bind=test_engine)
    os.unlink(test_db_file.name)


@pytest.fixture(scope="function")
def db_session(database_engine):
    """Create a fresh database session for each test."""
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture(scope="function", autouse=True)
def cleanup_database(db_session):
    """Clean up database before each test."""
    # Delete all data from all tables
    db_session.query(models.InventoryItem).delete()
    db_session.query(models.Category).delete()
    db_session.query(models.Inventory).delete()
    db_session.query(models.User).delete()
    db_session.commit()
    yield


@pytest.fixture(scope="function")
def client(db_session):
    """Create a TestClient with the test database."""
    # Create a fresh FastAPI app for testing (no startup event)
    test_app = FastAPI(title="InvenTrack Test API")
    
    # Add CORS middleware
    from fastapi.middleware.cors import CORSMiddleware
    test_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    test_app.include_router(auth_router)
    test_app.include_router(dashboard_router)
    test_app.include_router(inventories_router)
    test_app.include_router(items_router)
    
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    test_app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(test_app) as test_client:
        yield test_client
    
    test_app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def registered_user(client: TestClient):
    """Register a user and return the user data and token."""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "testpassword123",
            "name": "Test User"
        }
    )
    assert response.status_code == 201
    data = response.json()
    return {
        "email": "test@example.com",
        "password": "testpassword123",
        "token": data["access_token"]
    }


@pytest.fixture(scope="function")
def auth_headers(registered_user):
    """Return authentication headers with Bearer token."""
    token = registered_user["token"]
    return {"Authorization": f"Bearer {token}"}
