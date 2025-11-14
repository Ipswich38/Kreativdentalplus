import { useState } from "react";
import { Plus, Search, Package, AlertTriangle, TrendingDown, TrendingUp, Edit, Trash2, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: "ppe" | "consumable" | "equipment";
  unitType: string;
  currentStock: number;
  minimumStock: number;
  costPerUnit: number;
  supplier: string;
  lastRestocked?: string;
}

// Mock inventory data
const mockInventory: InventoryItem[] = [
  {
    id: "1",
    code: "PPE-001",
    name: "Head Caps (Disposable)",
    category: "ppe",
    unitType: "pcs",
    currentStock: 50,
    minimumStock: 100,
    costPerUnit: 2.50,
    supplier: "MediSupply Corp",
    lastRestocked: "2024-10-01"
  },
  {
    id: "2",
    code: "PPE-002",
    name: "Gloves (Small)",
    category: "ppe",
    unitType: "box",
    currentStock: 2,
    minimumStock: 5,
    costPerUnit: 450.00,
    supplier: "MediSupply Corp",
    lastRestocked: "2024-09-15"
  },
  {
    id: "3",
    code: "PPE-003",
    name: "Foot Covers (Disposable)",
    category: "ppe",
    unitType: "pcs",
    currentStock: 250,
    minimumStock: 100,
    costPerUnit: 2.00,
    supplier: "MediSupply Corp",
    lastRestocked: "2024-11-01"
  },
  {
    id: "4",
    code: "CON-001",
    name: "Cotton Rolls",
    category: "consumable",
    unitType: "pack",
    currentStock: 1,
    minimumStock: 5,
    costPerUnit: 150.00,
    supplier: "Dental Supplies Inc",
    lastRestocked: "2024-09-20"
  },
  {
    id: "5",
    code: "CON-002",
    name: "Dental Mirrors",
    category: "consumable",
    unitType: "pcs",
    currentStock: 25,
    minimumStock: 15,
    costPerUnit: 35.00,
    supplier: "Dental Supplies Inc",
    lastRestocked: "2024-10-15"
  },
  {
    id: "6",
    code: "CON-003",
    name: "Disposable Needles",
    category: "consumable",
    unitType: "box",
    currentStock: 8,
    minimumStock: 10,
    costPerUnit: 850.00,
    supplier: "MediSupply Corp",
    lastRestocked: "2024-10-20"
  }
];

export function InventoryPage() {
  const [inventory] = useState<InventoryItem[]>(mockInventory);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const lowStockItems = inventory.filter(item => item.currentStock <= item.minimumStock);
  const criticalStockItems = inventory.filter(item => item.currentStock < item.minimumStock * 0.5);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-gray-900 mb-1">Inventory Management</h1>
          <p className="text-sm text-gray-600">Manage PPE, consumables, and equipment</p>
        </div>
        <div className="flex gap-2">
          <AddStockDialog />
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Reports
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Items</p>
                <p className="text-gray-900">{inventory.length}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Low Stock</p>
                <p className="text-gray-900">{lowStockItems.length}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Critical</p>
                <p className="text-gray-900">{criticalStockItems.length}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-gray-900">₱{totalValue.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-0 shadow-lg border-l-4 border-l-orange-500">
          <CardHeader className="bg-orange-50">
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertTriangle className="w-5 h-5" />
              Low Stock Alerts ({lowStockItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.map(item => (
                <div key={item.id} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-gray-900">{item.name}</h4>
                    <Badge variant="destructive" className="text-xs">
                      {item.currentStock < item.minimumStock * 0.5 ? "Critical" : "Low"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Stock: {item.currentStock} {item.unitType}</p>
                  <p className="text-sm text-gray-600 mb-3">Min: {item.minimumStock} {item.unitType}</p>
                  <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600">
                    Reorder Now
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by name or code..."
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
            <SelectItem value="ppe">PPE</SelectItem>
            <SelectItem value="consumable">Consumables</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Inventory Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Items ({inventory.length})</TabsTrigger>
          <TabsTrigger value="ppe">PPE ({inventory.filter(i => i.category === "ppe").length})</TabsTrigger>
          <TabsTrigger value="consumable">Consumables ({inventory.filter(i => i.category === "consumable").length})</TabsTrigger>
          <TabsTrigger value="equipment">Equipment ({inventory.filter(i => i.category === "equipment").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <InventoryTable items={filteredInventory} />
        </TabsContent>
        <TabsContent value="ppe" className="mt-6">
          <InventoryTable items={filteredInventory.filter(i => i.category === "ppe")} />
        </TabsContent>
        <TabsContent value="consumable" className="mt-6">
          <InventoryTable items={filteredInventory.filter(i => i.category === "consumable")} />
        </TabsContent>
        <TabsContent value="equipment" className="mt-6">
          <InventoryTable items={filteredInventory.filter(i => i.category === "equipment")} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Inventory Table Component
function InventoryTable({ items }: { items: InventoryItem[] }) {
  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock < item.minimumStock * 0.5) {
      return { label: "Critical", color: "bg-red-500" };
    } else if (item.currentStock <= item.minimumStock) {
      return { label: "Low", color: "bg-orange-500" };
    } else {
      return { label: "Good", color: "bg-green-500" };
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {items.map((item) => {
        const status = getStockStatus(item);
        const stockPercentage = (item.currentStock / item.minimumStock) * 100;

        return (
          <Card key={item.id} className="border-0 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-gray-900">{item.name}</h3>
                        <Badge variant="outline" className="text-xs">{item.code}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{item.category.toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Current Stock</p>
                      <p className="text-gray-900">{item.currentStock} {item.unitType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Minimum Stock</p>
                      <p className="text-gray-900">{item.minimumStock} {item.unitType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Cost/Unit</p>
                      <p className="text-gray-900">₱{item.costPerUnit.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Value</p>
                      <p className="text-gray-900">₱{(item.currentStock * item.costPerUnit).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Stock Level</span>
                      <span className={`px-2 py-1 rounded text-xs text-white ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${status.color} transition-all`}
                        style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {item.supplier && (
                    <p className="text-xs text-gray-500 mt-3">Supplier: {item.supplier}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline">
                    Add Stock
                  </Button>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {items.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No items found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Add Stock Dialog
function AddStockDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    item: "",
    quantity: "",
    costPerUnit: "",
    supplier: "",
    invoiceNumber: "",
    date: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Stock added:", formData);
    setOpen(false);
    setFormData({
      item: "",
      quantity: "",
      costPerUnit: "",
      supplier: "",
      invoiceNumber: "",
      date: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Stock
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Stock</DialogTitle>
          <DialogDescription>
            Add new stock for an inventory item
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item">Item</Label>
            <Select value={formData.item} onValueChange={(value) => setFormData({ ...formData, item: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="head-caps">Head Caps</SelectItem>
                <SelectItem value="gloves">Gloves (Small)</SelectItem>
                <SelectItem value="cotton-rolls">Cotton Rolls</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Enter quantity"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="costPerUnit">Cost per Unit (₱)</Label>
            <Input
              id="costPerUnit"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.costPerUnit}
              onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              placeholder="Supplier name"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              placeholder="INV-2024-XXXX"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Add Stock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}