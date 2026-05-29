def test_create_item(client, auth_headers):
    """Test creating a new item."""
    # Create an inventory
    inv_response = client.post(
        "/api/inventories",
        json={"name": "Test Inventory", "description": "For items"},
        headers=auth_headers
    )
    inventory_id = inv_response.json()["id"]
    
    # Create a category
    cat_response = client.post(
        f"/api/inventories/{inventory_id}/categories",
        json={"name": "Electronics", "description": "Electronic items"},
        headers=auth_headers
    )
    category_id = cat_response.json()["id"]
    
    # Create an item
    response = client.post(
        "/api/items",
        json={
            "name": "Laptop",
            "sku": "lpt-001",
            "category_id": category_id,
            "quantity": 10,
            "min_stock": 5,
            "price": 999.99,
            "cost": 800.00,
            "supplier": "Tech Supplier",
            "unit": "pieces",
            "status": "in-stock"
        },
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Laptop"
    assert data["sku"] == "LPT-001"  # Should be uppercased
    assert data["quantity"] == 10
    assert data["category_id"] == category_id


def test_list_items_by_category(client, auth_headers):
    """Test listing items filtered by category."""
    # Create an inventory
    inv_response = client.post(
        "/api/inventories",
        json={"name": "Test Inventory", "description": "For filtering"},
        headers=auth_headers
    )
    inventory_id = inv_response.json()["id"]
    
    # Create two categories
    cat1_response = client.post(
        f"/api/inventories/{inventory_id}/categories",
        json={"name": "Electronics", "description": "Electronic items"},
        headers=auth_headers
    )
    cat1_id = cat1_response.json()["id"]
    
    cat2_response = client.post(
        f"/api/inventories/{inventory_id}/categories",
        json={"name": "Clothing", "description": "Clothing items"},
        headers=auth_headers
    )
    cat2_id = cat2_response.json()["id"]
    
    # Create items in each category
    client.post(
        "/api/items",
        json={"name": "Laptop", "sku": "lpt-001", "category_id": cat1_id, "quantity": 5},
        headers=auth_headers
    )
    client.post(
        "/api/items",
        json={"name": "Phone", "sku": "phn-001", "category_id": cat1_id, "quantity": 3},
        headers=auth_headers
    )
    client.post(
        "/api/items",
        json={"name": "Shirt", "sku": "srt-001", "category_id": cat2_id, "quantity": 10},
        headers=auth_headers
    )
    
    # List items by first category
    response = client.get(f"/api/items?cat_id={cat1_id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all(item["category_id"] == cat1_id for item in data)
    
    # List items by second category
    response = client.get(f"/api/items?cat_id={cat2_id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["category_id"] == cat2_id


def test_sku_is_uppercased_on_create(client, auth_headers):
    """Test that SKU is automatically uppercased on item creation."""
    # Create an inventory and category
    inv_response = client.post(
        "/api/inventories",
        json={"name": "Test Inventory", "description": "For SKU test"},
        headers=auth_headers
    )
    inventory_id = inv_response.json()["id"]
    
    cat_response = client.post(
        f"/api/inventories/{inventory_id}/categories",
        json={"name": "Test Category", "description": "Test"},
        headers=auth_headers
    )
    category_id = cat_response.json()["id"]
    
    # Create item with lowercase SKU
    response = client.post(
        "/api/items",
        json={
            "name": "Test Item",
            "sku": "abc-123-xyz",
            "category_id": category_id,
            "quantity": 1
        },
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["sku"] == "ABC-123-XYZ"


def test_update_item(client, auth_headers):
    """Test updating an existing item."""
    # Create inventory, category, and item
    inv_response = client.post(
        "/api/inventories",
        json={"name": "Test Inventory", "description": "For update"},
        headers=auth_headers
    )
    inventory_id = inv_response.json()["id"]
    
    cat_response = client.post(
        f"/api/inventories/{inventory_id}/categories",
        json={"name": "Test Category", "description": "Test"},
        headers=auth_headers
    )
    category_id = cat_response.json()["id"]
    
    item_response = client.post(
        "/api/items",
        json={
            "name": "Original Name",
            "sku": "org-001",
            "category_id": category_id,
            "quantity": 5,
            "price": 100.00
        },
        headers=auth_headers
    )
    item_id = item_response.json()["id"]
    
    # Update the item
    response = client.put(
        f"/api/items/{item_id}",
        json={
            "name": "Updated Name",
            "sku": "upd-002",
            "category_id": category_id,
            "quantity": 15,
            "price": 150.00
        },
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["sku"] == "UPD-002"  # Should be uppercased
    assert data["quantity"] == 15
    assert data["price"] == 150.00


def test_delete_item(client, auth_headers):
    """Test deleting an item."""
    # Create inventory, category, and item
    inv_response = client.post(
        "/api/inventories",
        json={"name": "Test Inventory", "description": "For delete"},
        headers=auth_headers
    )
    inventory_id = inv_response.json()["id"]
    
    cat_response = client.post(
        f"/api/inventories/{inventory_id}/categories",
        json={"name": "Test Category", "description": "Test"},
        headers=auth_headers
    )
    category_id = cat_response.json()["id"]
    
    item_response = client.post(
        "/api/items",
        json={
            "name": "To Delete",
            "sku": "del-001",
            "category_id": category_id,
            "quantity": 1
        },
        headers=auth_headers
    )
    item_id = item_response.json()["id"]
    
    # Delete the item
    response = client.delete(f"/api/items/{item_id}", headers=auth_headers)
    assert response.status_code == 204
    
    # Verify it's deleted
    get_response = client.get(f"/api/items/{item_id}", headers=auth_headers)
    assert get_response.status_code == 404


def test_dashboard_stats_accuracy(client, auth_headers):
    """Test that dashboard stats accurately reflect item counts and values."""
    # Create inventory and categories
    inv_response = client.post(
        "/api/inventories",
        json={"name": "Test Inventory", "description": "For stats"},
        headers=auth_headers
    )
    inventory_id = inv_response.json()["id"]
    
    cat_response = client.post(
        f"/api/inventories/{inventory_id}/categories",
        json={"name": "Test Category", "description": "Test"},
        headers=auth_headers
    )
    category_id = cat_response.json()["id"]
    
    # Create items with known quantities and values
    # Item 1: in-stock, quantity 10, price 100, cost 80
    client.post(
        "/api/items",
        json={
            "name": "Item 1",
            "sku": "itm-001",
            "category_id": category_id,
            "quantity": 10,
            "min_stock": 5,
            "price": 100.00,
            "cost": 80.00,
            "status": "in-stock"
        },
        headers=auth_headers
    )
    
    # Item 2: in-stock, quantity 5, price 50, cost 40
    client.post(
        "/api/items",
        json={
            "name": "Item 2",
            "sku": "itm-002",
            "category_id": category_id,
            "quantity": 5,
            "min_stock": 3,
            "price": 50.00,
            "cost": 40.00,
            "status": "in-stock"
        },
        headers=auth_headers
    )
    
    # Item 3: low-stock, quantity 2, price 30, cost 25
    client.post(
        "/api/items",
        json={
            "name": "Item 3",
            "sku": "itm-003",
            "category_id": category_id,
            "quantity": 2,
            "min_stock": 5,
            "price": 30.00,
            "cost": 25.00,
            "status": "low-stock"
        },
        headers=auth_headers
    )
    
    # Item 4: out-of-stock, quantity 0, price 20, cost 15
    client.post(
        "/api/items",
        json={
            "name": "Item 4",
            "sku": "itm-004",
            "category_id": category_id,
            "quantity": 0,
            "min_stock": 1,
            "price": 20.00,
            "cost": 15.00,
            "status": "out-of-stock"
        },
        headers=auth_headers
    )
    
    # Get dashboard stats
    response = client.get("/api/dashboard/stats", headers=auth_headers)
    assert response.status_code == 200
    stats = response.json()
    
    # Verify stats match expected values
    assert stats["total_items"] == 4
    assert stats["in_stock"] == 2
    assert stats["low_stock"] == 1
    assert stats["out_of_stock"] == 1
    assert stats["total_value"] == 10*100 + 5*50 + 2*30 + 0*20  # 1000 + 250 + 60 + 0 = 1310
    assert stats["total_cost"] == 10*80 + 5*40 + 2*25 + 0*15  # 800 + 200 + 50 + 0 = 1050
    assert stats["inventory_count"] == 1
    assert stats["category_count"] == 1
