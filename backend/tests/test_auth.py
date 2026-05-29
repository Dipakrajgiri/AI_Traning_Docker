def test_register_success(client):
    """Test successful user registration."""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "password123",
            "name": "New User"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_register_duplicate_email(client):
    """Test registering with duplicate email returns 400."""
    # First registration
    client.post(
        "/api/auth/register",
        json={
            "email": "duplicate@example.com",
            "password": "password123",
            "name": "User One"
        }
    )
    
    # Second registration with same email
    response = client.post(
        "/api/auth/register",
        json={
            "email": "duplicate@example.com",
            "password": "differentpassword",
            "name": "User Two"
        }
    )
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]


def test_login_success(client):
    """Test successful login with correct credentials."""
    # Register a user first
    client.post(
        "/api/auth/register",
        json={
            "email": "loginuser@example.com",
            "password": "loginpass123",
            "name": "Login User"
        }
    )
    
    # Login with the same credentials
    response = client.post(
        "/api/auth/login",
        data={
            "username": "loginuser@example.com",
            "password": "loginpass123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    """Test login with wrong password returns 401."""
    # Register a user first
    client.post(
        "/api/auth/register",
        json={
            "email": "wrongpass@example.com",
            "password": "correctpass",
            "name": "Wrong Pass User"
        }
    )
    
    # Login with wrong password
    response = client.post(
        "/api/auth/login",
        data={
            "username": "wrongpass@example.com",
            "password": "wrongpass"
        }
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_get_me_authenticated(client, auth_headers):
    """Test getting current user with valid token."""
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "email" in data
    assert "name" in data


def test_get_me_no_token(client):
    """Test getting current user without token returns 401."""
    response = client.get("/api/auth/me")
    assert response.status_code == 401
