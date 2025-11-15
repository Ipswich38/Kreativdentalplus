import { useState, useEffect } from "react";
import { Plus, Search, Package, AlertTriangle, TrendingDown, TrendingUp, Edit, Trash2, Filter, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { User } from "../data/users";

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

  // Permission checks
  const canManageInventory = ['admin'].includes(currentUser.role);
  const canViewInventory = ['admin', 'receptionist', 'staff'].includes(currentUser.role);

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
          inventory!inner(name, item_code),
          staff_users!inner(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const processedData = (data || []).map(movement => ({
        ...movement,
        item_name: movement.inventory?.name,
        item_code: movement.inventory?.item_code,
        staff_name: movement.staff_users?.full_name
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
      return { label: "Critical", color: "bg-red-500", variant: "destructive" as const };
    } else if (item.current_stock <= item.minimum_stock) {
      return { label: "Low", color: "bg-orange-500", variant: "secondary" as const };
    } else {
      return { label: "Good", color: "bg-green-500", variant: "default" as const };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Inventory Management</h2>
          <p className="text-muted-foreground">
            Manage supplies, equipment, PPE, and consumables
          </p>
        </div>

        <div className="flex gap-2">
          {canManageInventory && (
            <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Edit' : 'Add'} Inventory Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddItem} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="item_code">Item Code *</Label>
                      <Input
                        value={newItem.item_code}
                        onChange={(e) => setNewItem(prev => ({ ...prev, item_code: e.target.value }))}
                        placeholder="e.g. SUP-001"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        value={newItem.name}
                        onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Dental Gloves"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category *</Label>
                      <Select
                        value={newItem.category}
                        onValueChange={(value: any) => setNewItem(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="supplies">Supplies</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="ppe">PPE</SelectItem>
                          <SelectItem value="consumables">Consumables</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="unit_type">Unit Type *</Label>
                      <Input
                        value={newItem.unit_type}
                        onChange={(e) => setNewItem(prev => ({ ...prev, unit_type: e.target.value }))}
                        placeholder="e.g. box, pieces, units"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="current_stock">Current Stock *</Label>
                      <Input
                        type="number"
                        value={newItem.current_stock}
                        onChange={(e) => setNewItem(prev => ({ ...prev, current_stock: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="minimum_stock">Minimum Stock *</Label>
                      <Input
                        type="number"
                        value={newItem.minimum_stock}
                        onChange={(e) => setNewItem(prev => ({ ...prev, minimum_stock: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="maximum_stock">Maximum Stock</Label>
                      <Input
                        type="number"
                        value={newItem.maximum_stock}
                        onChange={(e) => setNewItem(prev => ({ ...prev, maximum_stock: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="cost_per_unit">Cost per Unit *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newItem.cost_per_unit}
                        onChange={(e) => setNewItem(prev => ({ ...prev, cost_per_unit: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplier">Supplier</Label>
                      <Input
                        value={newItem.supplier}
                        onChange={(e) => setNewItem(prev => ({ ...prev, supplier: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        value={newItem.location}
                        onChange={(e) => setNewItem(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="e.g. Storage Room A"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Additional details about the item..."
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => {
                      setIsAddItemDialogOpen(false);
                      setEditingItem(null);
                      resetItemForm();
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : editingItem ? 'Update' : 'Add'} Item
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}

          <Button variant="outline" onClick={exportInventoryData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {new Set(inventory.map(i => i.category)).size} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Items below minimum threshold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Items requiring immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">₱{totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Current inventory value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-l-4 border-l-orange-500 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertTriangle className="w-5 h-5" />
              Low Stock Alerts ({lowStockItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.slice(0, 6).map(item => {
                const status = getStockStatus(item);
                return (
                  <div key={item.id} className="p-4 bg-white rounded-lg border border-orange-200">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <Badge variant={status.variant} className="text-xs">
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Current: {item.current_stock} {item.unit_type}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      Minimum: {item.minimum_stock} {item.unit_type}
                    </p>
                    {canManageInventory && (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setSelectedItem(item);
                          setIsStockMovementDialogOpen(true);
                        }}
                      >
                        Add Stock
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by name or item code..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="supplies">Supplies</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
            <SelectItem value="ppe">PPE</SelectItem>
            <SelectItem value="consumables">Consumables</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Inventory Overview</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <div className="text-center py-8">Loading inventory...</div>
              ) : filteredInventory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No inventory items found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Minimum Stock</TableHead>
                        <TableHead>Unit Cost</TableHead>
                        <TableHead>Total Value</TableHead>
                        <TableHead>Status</TableHead>
                        {canManageInventory && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInventory.map((item) => {
                        const status = getStockStatus(item);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-muted-foreground">{item.item_code}</div>
                              </div>
                            </TableCell>
                            <TableCell className="capitalize">
                              <Badge variant="outline">{item.category}</Badge>
                            </TableCell>
                            <TableCell>
                              {item.current_stock} {item.unit_type}
                            </TableCell>
                            <TableCell>
                              {item.minimum_stock} {item.unit_type}
                            </TableCell>
                            <TableCell>₱{item.cost_per_unit.toFixed(2)}</TableCell>
                            <TableCell className="font-medium">
                              ₱{(item.current_stock * item.cost_per_unit).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </TableCell>
                            {canManageInventory && (
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setIsStockMovementDialogOpen(true);
                                    }}
                                  >
                                    Stock
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
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
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteItem(item.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Movements</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track all stock changes and movements
              </p>
            </CardHeader>
            <CardContent>
              {stockMovements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No stock movements recorded
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Performed By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockMovements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>
                            {new Date(movement.movement_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{movement.item_name}</div>
                              <div className="text-sm text-muted-foreground">{movement.item_code}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              movement.movement_type === 'in' ? 'default' :
                              movement.movement_type === 'out' ? 'secondary' : 'outline'
                            }>
                              {movement.movement_type.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className={
                            movement.movement_type === 'in' ? 'text-green-600' : 'text-red-600'
                          }>
                            {movement.movement_type === 'in' ? '+' : '-'}{movement.quantity}
                          </TableCell>
                          <TableCell>{movement.reason}</TableCell>
                          <TableCell>{movement.staff_name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stock Movement Dialog */}
      {canManageInventory && (
        <Dialog open={isStockMovementDialogOpen} onOpenChange={setIsStockMovementDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Stock Movement</DialogTitle>
              {selectedItem && (
                <p className="text-sm text-muted-foreground">
                  {selectedItem.name} ({selectedItem.item_code})
                  <br />
                  Current Stock: {selectedItem.current_stock} {selectedItem.unit_type}
                </p>
              )}
            </DialogHeader>
            <form onSubmit={handleAddStockMovement} className="space-y-4">
              <div>
                <Label>Movement Type *</Label>
                <Select
                  value={newMovement.movement_type}
                  onValueChange={(value: any) => setNewMovement(prev => ({ ...prev, movement_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Stock In (Add)</SelectItem>
                    <SelectItem value="out">Stock Out (Remove)</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  type="number"
                  value={newMovement.quantity}
                  onChange={(e) => setNewMovement(prev => ({ ...prev, quantity: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="reason">Reason *</Label>
                <Textarea
                  value={newMovement.reason}
                  onChange={(e) => setNewMovement(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g. New stock delivery, Used in treatment, Damaged items"
                  required
                />
              </div>

              <div>
                <Label htmlFor="reference_number">Reference Number</Label>
                <Input
                  value={newMovement.reference_number}
                  onChange={(e) => setNewMovement(prev => ({ ...prev, reference_number: e.target.value }))}
                  placeholder="e.g. Invoice number, Purchase order"
                />
              </div>

              <div>
                <Label htmlFor="movement_date">Movement Date *</Label>
                <Input
                  type="date"
                  value={newMovement.movement_date}
                  onChange={(e) => setNewMovement(prev => ({ ...prev, movement_date: e.target.value }))}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsStockMovementDialogOpen(false);
                  setSelectedItem(null);
                  resetMovementForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Recording...' : 'Record Movement'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}