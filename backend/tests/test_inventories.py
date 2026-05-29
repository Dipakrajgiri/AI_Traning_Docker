def test_create_inventory(client, auth_headers):
    """Test creating a new inventory."""
    response = client.post(
        "/api/inventories",
        json={
            "name": "Test Inventory",
            "description": "A test inventory"
        },
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Inventory"
    assert data["description"] == "A test inventory"
    assert "id" in data
    assert data["category_count"] == 0
    assert data["item_count"] == 0


def test_list_inventories(client, auth_headers):
    """Test listing all inventories for the authenticated user."""
    # Create first inventory
    client.post(
        "/api/inventories",
        json={"name": "Inventory 1", "description": "First inventory"},
        headers=auth_headers
    )
    
    # Create second inventory
    client.post(
        "/api/inventories",
        json={"name": "Inventory 2", "description": "Second inventory"},
        headers=auth_headers
    )
    
    # List inventories
    response = client.get("/api/inventories", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["name"] == "Inventory 1"
    assert data[1]["name"] == "Inventory 2"


def test_update_inventory(client, auth_headers):
    """Test updating an existing inventory."""
    # Create an inventory
    create_response = client.post(
        "/api/inventories",
        json={"name": "Original Name", "description": "Original description"},
        headers=auth_headers
    )
    inventory_id = create_response.json()["id"]
    
    # Update the inventory
    response = client.put(
        f"/api/inventories/{inventory_id}",
        json={"name": "Updated Name", "description": "Updated description"},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["description"] == "Updated description"


def test_delete_inventory(client, auth_headers):
    """Test deleting an inventory."""
    # Create an inventory
    create_response = client.post(
        "/api/inventories",
        json={"name": "To Delete", "description": "Will be deleted"},
        headers=auth_headers
    )
    inventory_id = create_response.json()["id"]
    
    # Delete the inventory
    response = client.delete(f"/api/inventories/{inventory_id}", headers=auth_headers)
    assert response.status_code == 204
    
    # Verify it's deleted
    get_response = client.get(f"/api/inventories/{inventory_id}", headers=auth_headers)
    assert get_response.status_code == 404


def test_cannot_access_another_users_inventory(client):
    """Test that user B cannot access user A's inventory."""
    # Register and login user A
    client.post(
        "/api/auth/register",
        json={"email": "usera@example.com", "password": "passwordA", "name": "User A"}
    )
    login_a = client.post(
        "/api/auth/login",
        data={"username": "usera@example.com", "password": "passwordA"}
    )
    token_a = login_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}
    
    # Create inventory for user A
    inv_response = client.post(
        "/api/inventories",
        json={"name": "User A Inventory", "description": "Private inventory"},
        headers=headers_a
    )
    inventory_id = inv_response.json()["id"]
    
    # Register and login user B
    client.post(
        "/api/auth/register",
        json={"email": "userb@example.com", "password": "passwordB", "name": "User B"}
    )
    login_b = client.post(
        "/api/auth/login",
        data={"username": "userb@example.com", "password": "passwordB"}
    )
    token_b = login_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}
    
    # User B tries to access user A's inventory
    response = client.get(f"/api/inventories/{inventory_id}", headers=headers_b)
    assert response.status_code == 404
