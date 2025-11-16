import { useState, useEffect } from "react";
import { Plus, Search, Package, AlertTriangle, TrendingDown, TrendingUp, Edit, Trash2, Filter, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import type { User } from "../data/users";
import { PageWrapper } from "./PageWrapper";

// ... (interfaces remain the same)
interface InventoryItem {
  id: string;
  item_code: string;
  name: string;
  category: 'supplies' | 'equipment' | 'ppe' | 'consumables';
  unit_type: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  cost_per_unit: number;
  supplier?: string;
  location?: string;
  description?: string;
  last_restocked?: string;
  created_at: string;
  updated_at: string;
}

interface StockMovement {
  id: string;
  inventory_item_id: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference_number?: string;
  performed_by: string;
  movement_date: string;
  created_at: string;
  // Joined data
  item_name?: string;
  item_code?: string;
  staff_name?: string;
}

interface ProductionInventoryPageProps {
  currentUser: User;
}

export function ProductionInventoryPage({ currentUser }: ProductionInventoryPageProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<'overview' | 'movements'>('overview');
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isStockMovementDialogOpen, setIsStockMovementDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(false);

  // New item form
  const [newItem, setNewItem] = useState({
    item_code: '',
    name: '',
    category: 'supplies' as const,
    unit_type: '',
    current_stock: '',
    minimum_stock: '',
    maximum_stock: '',
    cost_per_unit: '',
    supplier: '',
    location: '',
    description: ''
  });

  // Stock movement form
  const [newMovement, setNewMovement] = useState({
    movement_type: 'in' as const,
    quantity: '',
    reason: '',
    reference_number: '',
    movement_date: new Date().toISOString().split('T')[0]
  });

  // Permission checks - Allow admin, front_desk, and dentist (including Dra. Camila) full CRUD access
  const canManageInventory = ['admin', 'front_desk', 'dentist'].includes(currentUser.role);
  const canViewInventory = ['admin', 'receptionist', 'staff', 'front_desk', 'dentist'].includes(currentUser.role);

  if (!canViewInventory) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">You don't have permission to view inventory data.</p>
        </div>
      </div>
    );
  }

  // Fetch inventory items
  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInventory(data || []);
    } catch (error: any) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory');
    }
  };

  // Fetch stock movements
  const fetchStockMovements = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          inventory:inventory_item_id(name, item_code),
          staff_users:performed_by(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Stock movements query error:', error);
        if (error.message.includes('relation "stock_movements" does not exist')) {
          toast.error('Stock movements table not found. Please run the database setup script.');
          setStockMovements([]);
          return;
        }
        throw error;
      }

      const processedData = (data || []).map(movement => ({
        ...movement,
        item_name: movement.inventory?.name || 'Unknown Item',
        item_code: movement.inventory?.item_code || 'N/A',
        staff_name: movement.staff_users?.full_name || 'Unknown Staff'
      }));

      setStockMovements(processedData);
    } catch (error: any) {
      console.error('Error fetching stock movements:', error);
      toast.error('Failed to load stock movements');
    }
  };

  // Add new inventory item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageInventory) {
      toast.error('You do not have permission to add inventory items');
      return;
    }

    setLoading(true);
    try {
      const itemData = {
        item_code: newItem.item_code.toUpperCase(),
        name: newItem.name,
        category: newItem.category,
        unit_type: newItem.unit_type,
        current_stock: parseInt(newItem.current_stock),
        minimum_stock: parseInt(newItem.minimum_stock),
        maximum_stock: newItem.maximum_stock ? parseInt(newItem.maximum_stock) : null,
        cost_per_unit: parseFloat(newItem.cost_per_unit),
        supplier: newItem.supplier,
        location: newItem.location,
        description: newItem.description,
        last_restocked: new Date().toISOString()
      };

      if (editingItem) {
        const { error } = await supabase
          .from('inventory')
          .update({
            ...itemData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Inventory item updated successfully');
      } else {
        const { error } = await supabase
          .from('inventory')
          .insert([itemData]);

        if (error) throw error;
        toast.success('Inventory item added successfully');
      }

      setIsAddItemDialogOpen(false);
      setEditingItem(null);
      resetItemForm();
      fetchInventory();
    } catch (error: any) {
      console.error('Error saving inventory item:', error);
      toast.error('Failed to save inventory item');
    } finally {
      setLoading(false);
    }
  };

  // Add stock movement
  const handleAddStockMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageInventory || !selectedItem) {
      toast.error('You do not have permission to record stock movements');
      return;
    }

    setLoading(true);
    try {
      // Get current user ID
      const { data: staffData } = await supabase
        .from('staff_users')
        .select('id')
        .eq('employee_number', currentUser.employeeId)
        .single();

      if (!staffData) throw new Error('Staff user not found');

      const movementData = {
        inventory_item_id: selectedItem.id,
        movement_type: newMovement.movement_type,
        quantity: parseInt(newMovement.quantity),
        reason: newMovement.reason,
        reference_number: newMovement.reference_number,
        performed_by: staffData.id,
        movement_date: newMovement.movement_date
      };

      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert([movementData]);

      if (movementError) throw movementError;

      // Update current stock
      const stockChange = newMovement.movement_type === 'in'
        ? parseInt(newMovement.quantity)
        : -parseInt(newMovement.quantity);

      const newCurrentStock = Math.max(0, selectedItem.current_stock + stockChange);

      const { error: updateError } = await supabase
        .from('inventory')
        .update({
          current_stock: newCurrentStock,
          last_restocked: newMovement.movement_type === 'in' ? new Date().toISOString() : selectedItem.last_restocked,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedItem.id);

      if (updateError) throw updateError;

      toast.success('Stock movement recorded successfully');
      setIsStockMovementDialogOpen(false);
      setSelectedItem(null);
      resetMovementForm();
      fetchInventory();
      fetchStockMovements();
    } catch (error: any) {
      console.error('Error recording stock movement:', error);
      toast.error('Failed to record stock movement');
    } finally {
      setLoading(false);
    }
  };

  // Delete inventory item
  const handleDeleteItem = async (itemId: string) => {
    if (!canManageInventory) {
      toast.error('You do not have permission to delete inventory items');
      return;
    }

    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast.success('Inventory item deleted successfully');
      fetchInventory();
    } catch (error: any) {
      console.error('Error deleting inventory item:', error);
      toast.error('Failed to delete inventory item');
    }
  };

  // Reset forms
  const resetItemForm = () => {
    setNewItem({
      item_code: '',
      name: '',
      category: 'supplies',
      unit_type: '',
      current_stock: '',
      minimum_stock: '',
      maximum_stock: '',
      cost_per_unit: '',
      supplier: '',
      location: '',
      description: ''
    });
  };

  const resetMovementForm = () => {
    setNewMovement({
      movement_type: 'in',
      quantity: '',
      reason: '',
      reference_number: '',
      movement_date: new Date().toISOString().split('T')[0]
    });
  };

  // Export inventory data
  const exportInventoryData = () => {
    const csvContent = [
      ['Item Code', 'Name', 'Category', 'Current Stock', 'Minimum Stock', 'Unit Type', 'Cost per Unit', 'Total Value', 'Supplier'].join(','),
      ...inventory.map(item => [
        item.item_code,
        item.name,
        item.category,
        item.current_stock,
        item.minimum_stock,
        item.unit_type,
        item.cost_per_unit,
        (item.current_stock * item.cost_per_unit).toFixed(2),
        item.supplier || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Inventory report exported successfully');
  };

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.item_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate statistics
  const lowStockItems = inventory.filter(item => item.current_stock <= item.minimum_stock);
  const criticalStockItems = inventory.filter(item => item.current_stock < item.minimum_stock * 0.5);
  const totalValue = inventory.reduce((sum, item) => sum + (item.current_stock * item.cost_per_unit), 0);

  // Load data on component mount
  useEffect(() => {
    fetchInventory();
    fetchStockMovements();
  }, []);

  const getStockStatus = (item: InventoryItem) => {
    if (item.current_stock < item.minimum_stock * 0.5) {
      return { label: "Critical", className: "inactive" };
    } else if (item.current_stock <= item.minimum_stock) {
      return { label: "Low", className: "on-leave" };
    } else {
      return { label: "Good", className: "active" };
    }
  };

  const pageActions = (
    <div className="flex gap-2">
      {canManageInventory && (
        <button className="donezo-header-button" onClick={() => setIsAddItemDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      )}

      <button className="donezo-header-button secondary" onClick={exportInventoryData}>
        <Download className="w-4 h-4" />
        Export
      </button>
    </div>
  );

  return (
    <PageWrapper
      title="Inventory Management"
      subtitle="Manage supplies, equipment, PPE, and consumables"
      actions={pageActions}
    >
      {/* Stats Cards */}
      <div className="dentists-stats-grid" style={{ marginBottom: '32px' }}>
        <div className="donezo-stat-card">
          <div className="donezo-stat-header">
            <span className="donezo-stat-label">Total Items</span>
            <Package className="donezo-stat-icon" />
          </div>
          <div className="donezo-stat-value">{inventory.length}</div>
          <p className="donezo-stat-meta">
            Across {new Set(inventory.map(i => i.category)).size} categories
          </p>
        </div>

        <div className="donezo-stat-card">
          <div className="donezo-stat-header">
            <span className="donezo-stat-label">Low Stock</span>
            <AlertTriangle className="donezo-stat-icon" />
          </div>
          <div className="donezo-stat-value" style={{ color: 'var(--accent-orange)' }}>{lowStockItems.length}</div>
          <p className="donezo-stat-meta">
            Items below minimum threshold
          </p>
        </div>

        <div className="donezo-stat-card">
          <div className="donezo-stat-header">
            <span className="donezo-stat-label">Critical Stock</span>
            <TrendingDown className="donezo-stat-icon" />
          </div>
          <div className="donezo-stat-value" style={{ color: '#ef4444' }}>{criticalStockItems.length}</div>
          <p className="donezo-stat-meta">
            Items requiring immediate attention
          </p>
        </div>

        <div className="donezo-stat-card">
          <div className="donezo-stat-header">
            <span className="donezo-stat-label">Total Value</span>
            <TrendingUp className="donezo-stat-icon" />
          </div>
          <div className="donezo-stat-value" style={{ color: 'var(--primary-green)' }}>₱{totalValue.toLocaleString()}</div>
          <p className="donezo-stat-meta">
            Current inventory value
          </p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="donezo-inventory-alert" style={{ marginBottom: '32px' }}>
          <h3 className="donezo-inventory-alert-title">
            <AlertTriangle />
            Low Stock Alerts ({lowStockItems.length})
          </h3>
          <div className="donezo-inventory-alert-grid">
            {lowStockItems.slice(0, 6).map(item => {
              const status = getStockStatus(item);
              return (
                <div key={item.id} className="donezo-inventory-alert-item">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <span className={`donezo-dentist-badge ${status.className}`}>{status.label}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Current: {item.current_stock} {item.unit_type}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    Minimum: {item.minimum_stock} {item.unit_type}
                  </p>
                  {canManageInventory && (
                    <button
                      className="donezo-header-button"
                      style={{ width: '100%' }}
                      onClick={() => {
                        setSelectedItem(item);
                        setIsStockMovementDialogOpen(true);
                      }}
                    >
                      Add Stock
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="appointments-filter-bar" style={{ marginBottom: '24px' }}>
        <div className="donezo-search appointments-search-wrapper">
          <Search className="donezo-search-icon" />
          <input
            placeholder="Search by name or item code..."
            className="donezo-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="donezo-select" style={{ width: '200px' }}>
          <option value="all">All Categories</option>
          <option value="supplies">Supplies</option>
          <option value="equipment">Equipment</option>
          <option value="ppe">PPE</option>
          <option value="consumables">Consumables</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="donezo-tabs">
        <div className="donezo-tabs-list">
          <button className={`donezo-tabs-trigger ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Inventory Overview</button>
          <button className={`donezo-tabs-trigger ${activeTab === 'movements' ? 'active' : ''}`} onClick={() => setActiveTab('movements')}>Stock Movements</button>
        </div>

        <div className={`donezo-tabs-content ${activeTab === 'overview' ? 'active' : ''}`}>
          <div className="donezo-section">
            {loading ? (
              <div className="text-center py-8">Loading inventory...</div>
            ) : filteredInventory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No inventory items found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="donezo-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Current Stock</th>
                      <th>Minimum Stock</th>
                      <th>Unit Cost</th>
                      <th>Total Value</th>
                      <th>Status</th>
                      {canManageInventory && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => {
                      const status = getStockStatus(item);
                      return (
                        <tr key={item.id}>
                          <td>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">{item.item_code}</div>
                            </div>
                          </td>
                          <td>
                            <span className="donezo-dentist-badge inactive">{item.category}</span>
                          </td>
                          <td>
                            {item.current_stock} {item.unit_type}
                          </td>
                          <td>
                            {item.minimum_stock} {item.unit_type}
                          </td>
                          <td>₱{item.cost_per_unit.toFixed(2)}</td>
                          <td className="font-medium">
                            ₱{(item.current_stock * item.cost_per_unit).toFixed(2)}
                          </td>
                          <td>
                            <span className={`donezo-dentist-badge ${status.className}`}>{status.label}</span>
                          </td>
                          {canManageInventory && (
                            <td>
                              <div className="flex gap-2">
                                <button
                                  className="donezo-icon-button"
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setIsStockMovementDialogOpen(true);
                                  }}
                                >
                                  Stock
                                </button>
                                <button
                                  className="donezo-icon-button"
                                  onClick={() => {
                                    setEditingItem(item);
                                    setNewItem({
                                      item_code: item.item_code,
                                      name: item.name,
                                      category: item.category,
                                      unit_type: item.unit_type,
                                      current_stock: item.current_stock.toString(),
                                      minimum_stock: item.minimum_stock.toString(),
                                      maximum_stock: item.maximum_stock?.toString() || '',
                                      cost_per_unit: item.cost_per_unit.toString(),
                                      supplier: item.supplier || '',
                                      location: item.location || '',
                                      description: item.description || ''
                                    });
                                    setIsAddItemDialogOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  className="donezo-icon-button"
                                  onClick={() => handleDeleteItem(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className={`donezo-tabs-content ${activeTab === 'movements' ? 'active' : ''}`}>
          <div className="donezo-section">
            <div className="donezo-section-header">
              <h3 className="donezo-section-title">Recent Stock Movements</h3>
            </div>
            {stockMovements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No stock movements recorded
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="donezo-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Item</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Reason</th>
                      <th>Performed By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockMovements.map((movement) => (
                      <tr key={movement.id}>
                        <td>
                          {new Date(movement.movement_date).toLocaleDateString()}
                        </td>
                        <td>
                          <div>
                            <div className="font-medium">{movement.item_name}</div>
                            <div className="text-sm text-muted-foreground">{movement.item_code}</div>
                          </div>
                        </td>
                        <td>
                          <span className={`donezo-dentist-badge ${movement.movement_type === 'in' ? 'active' : 'inactive'}`}>
                            {movement.movement_type.toUpperCase()}
                          </span>
                        </td>
                        <td className={
                          movement.movement_type === 'in' ? 'text-green-600' : 'text-red-600'
                        }>
                          {movement.movement_type === 'in' ? '+' : '-'}{movement.quantity}
                        </td>
                        <td>{movement.reason}</td>
                        <td>{movement.staff_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {isAddItemDialogOpen && (
        <div className="donezo-dialog-overlay" onClick={() => setIsAddItemDialogOpen(false)}>
          <div className="donezo-dialog-content" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="donezo-dialog-header">
              <h3 className="donezo-dialog-title">{editingItem ? 'Edit' : 'Add'} Inventory Item</h3>
            </div>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="donezo-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="donezo-form-field">
                  <label htmlFor="item_code">Item Code *</label>
                  <input
                    value={newItem.item_code}
                    onChange={(e) => setNewItem(prev => ({ ...prev, item_code: e.target.value }))}
                    placeholder="e.g. SUP-001"
                    required
                    className="donezo-input"
                  />
                </div>
                <div className="donezo-form-field">
                  <label htmlFor="name">Name *</label>
                  <input
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Dental Gloves"
                    required
                    className="donezo-input"
                  />
                </div>
              </div>

              <div className="donezo-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="donezo-form-field">
                  <label>Category *</label>
                  <select
                    value={newItem.category}
                    onChange={(e: any) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                    className="donezo-select"
                  >
                    <option value="supplies">Supplies</option>
                    <option value="equipment">Equipment</option>
                    <option value="ppe">PPE</option>
                    <option value="consumables">Consumables</option>
                  </select>
                </div>
                <div className="donezo-form-field">
                  <label htmlFor="unit_type">Unit Type *</label>
                  <input
                    value={newItem.unit_type}
                    onChange={(e) => setNewItem(prev => ({ ...prev, unit_type: e.target.value }))}
                    placeholder="e.g. box, pieces, units"
                    required
                    className="donezo-input"
                  />
                </div>
              </div>

              <div className="donezo-form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="donezo-form-field">
                  <label htmlFor="current_stock">Current Stock *</label>
                  <input
                    type="number"
                    value={newItem.current_stock}
                    onChange={(e) => setNewItem(prev => ({ ...prev, current_stock: e.target.value }))}
                    required
                    className="donezo-input"
                  />
                </div>
                <div className="donezo-form-field">
                  <label htmlFor="minimum_stock">Minimum Stock *</label>
                  <input
                    type="number"
                    value={newItem.minimum_stock}
                    onChange={(e) => setNewItem(prev => ({ ...prev, minimum_stock: e.target.value }))}
                    required
                    className="donezo-input"
                  />
                </div>
                <div className="donezo-form-field">
                  <label htmlFor="maximum_stock">Maximum Stock</label>
                  <input
                    type="number"
                    value={newItem.maximum_stock}
                    onChange={(e) => setNewItem(prev => ({ ...prev, maximum_stock: e.target.value }))}
                    className="donezo-input"
                  />
                </div>
              </div>

              <div className="donezo-form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="donezo-form-field">
                  <label htmlFor="cost_per_unit">Cost per Unit *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.cost_per_unit}
                    onChange={(e) => setNewItem(prev => ({ ...prev, cost_per_unit: e.target.value }))}
                    required
                    className="donezo-input"
                  />
                </div>
                <div className="donezo-form-field">
                  <label htmlFor="supplier">Supplier</label>
                  <input
                    value={newItem.supplier}
                    onChange={(e) => setNewItem(prev => ({ ...prev, supplier: e.target.value }))}
                    className="donezo-input"
                  />
                </div>
                <div className="donezo-form-field">
                  <label htmlFor="location">Location</label>
                  <input
                    value={newItem.location}
                    onChange={(e) => setNewItem(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Storage Room A"
                    className="donezo-input"
                  />
                </div>
              </div>

              <div className="donezo-form-field">
                <label htmlFor="description">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional details about the item..."
                  className="donezo-textarea"
                />
              </div>

              <div className="donezo-dialog-footer">
                <button type="button" className="donezo-header-button secondary" onClick={() => {
                  setIsAddItemDialogOpen(false);
                  setEditingItem(null);
                  resetItemForm();
                }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="donezo-header-button">
                  {loading ? 'Saving...' : editingItem ? 'Update' : 'Add'} Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isStockMovementDialogOpen && (
        <div className="donezo-dialog-overlay" onClick={() => setIsStockMovementDialogOpen(false)}>
          <div className="donezo-dialog-content" onClick={e => e.stopPropagation()}>
            <div className="donezo-dialog-header">
              <h3 className="donezo-dialog-title">Record Stock Movement</h3>
              {selectedItem && (
                <p className="text-sm text-muted-foreground">
                  {selectedItem.name} ({selectedItem.item_code})
                  <br />
                  Current Stock: {selectedItem.current_stock} {selectedItem.unit_type}
                </p>
              )}
            </div>
            <form onSubmit={handleAddStockMovement} className="space-y-4">
              <div className="donezo-form-field">
                <label>Movement Type *</label>
                <select
                  value={newMovement.movement_type}
                  onChange={(e: any) => setNewMovement(prev => ({ ...prev, movement_type: e.target.value }))}
                  className="donezo-select"
                >
                  <option value="in">Stock In (Add)</option>
                  <option value="out">Stock Out (Remove)</option>
                  <option value="adjustment">Adjustment</option>
                </select>
              </div>

              <div className="donezo-form-field">
                <label htmlFor="quantity">Quantity *</label>
                <input
                  type="number"
                  value={newMovement.quantity}
                  onChange={(e) => setNewMovement(prev => ({ ...prev, quantity: e.target.value }))}
                  required
                  className="donezo-input"
                />
              </div>

              <div className="donezo-form-field">
                <label htmlFor="reason">Reason *</label>
                <textarea
                  value={newMovement.reason}
                  onChange={(e) => setNewMovement(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g. New stock delivery, Used in treatment, Damaged items"
                  required
                  className="donezo-textarea"
                />
              </div>

              <div className="donezo-form-field">
                <label htmlFor="reference_number">Reference Number</label>
                <input
                  value={newMovement.reference_number}
                  onChange={(e) => setNewMovement(prev => ({ ...prev, reference_number: e.target.value }))}
                  placeholder="e.g. Invoice number, Purchase order"
                  className="donezo-input"
                />
              </div>

              <div className="donezo-form-field">
                <label htmlFor="movement_date">Movement Date *</label>
                <input
                  type="date"
                  value={newMovement.movement_date}
                  onChange={(e) => setNewMovement(prev => ({ ...prev, movement_date: e.target.value }))}
                  required
                  className="donezo-input"
                />
              </div>

              <div className="donezo-dialog-footer">
                <button type="button" className="donezo-header-button secondary" onClick={() => {
                  setIsStockMovementDialogOpen(false);
                  setSelectedItem(null);
                  resetMovementForm();
                }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="donezo-header-button">
                  {loading ? 'Recording...' : 'Record Movement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}