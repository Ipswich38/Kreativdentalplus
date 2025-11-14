export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: "ppe" | "consumable" | "equipment";
  unitType: string;
  currentStock: number;
  minimumStock: number;
  costPerUnit: number;
  supplier: string;
  supplierContact?: string;
  lastRestocked?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockTransaction {
  id: string;
  itemId: string;
  itemName: string;
  transactionType: "stock-in" | "stock-out" | "adjustment";
  quantity: number;
  costPerUnit?: number;
  totalCost?: number;
  supplier?: string;
  invoiceNumber?: string;
  reason?: string;
  performedBy: string;
  date: string;
  notes?: string;
  createdAt: string;
}

// Mock data stores
let inventoryItems: InventoryItem[] = [
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
    lastRestocked: "2024-10-01",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-10-01T00:00:00Z"
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
    lastRestocked: "2024-09-15",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-09-15T00:00:00Z"
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
    lastRestocked: "2024-11-01",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-11-01T00:00:00Z"
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
    lastRestocked: "2024-09-20",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-09-20T00:00:00Z"
  }
];

let stockTransactions: StockTransaction[] = [];

// INVENTORY ITEM CRUD

// CREATE
export function createInventoryItem(itemData: Omit<InventoryItem, "id" | "code" | "createdAt" | "updatedAt">): InventoryItem {
  const categoryPrefix = itemData.category === "ppe" ? "PPE" : itemData.category === "consumable" ? "CON" : "EQP";
  const itemsInCategory = inventoryItems.filter(i => i.category === itemData.category).length;
  
  const newItem: InventoryItem = {
    ...itemData,
    id: `${Date.now()}`,
    code: `${categoryPrefix}-${String(itemsInCategory + 1).padStart(3, "0")}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  inventoryItems.push(newItem);
  return newItem;
}

// READ
export function getAllInventoryItems(): InventoryItem[] {
  return [...inventoryItems];
}

export function getInventoryItemById(id: string): InventoryItem | undefined {
  return inventoryItems.find(i => i.id === id);
}

export function getInventoryItemsByCategory(category: InventoryItem["category"]): InventoryItem[] {
  return inventoryItems.filter(i => i.category === category && i.isActive);
}

export function getLowStockItems(): InventoryItem[] {
  return inventoryItems.filter(i => i.currentStock <= i.minimumStock && i.isActive);
}

export function getCriticalStockItems(): InventoryItem[] {
  return inventoryItems.filter(i => i.currentStock < i.minimumStock * 0.5 && i.isActive);
}

export function searchInventoryItems(query: string): InventoryItem[] {
  const lowerQuery = query.toLowerCase();
  return inventoryItems.filter(i => 
    i.name.toLowerCase().includes(lowerQuery) ||
    i.code.toLowerCase().includes(lowerQuery)
  );
}

// UPDATE
export function updateInventoryItem(id: string, updates: Partial<Omit<InventoryItem, "id" | "code" | "createdAt">>): InventoryItem | null {
  const index = inventoryItems.findIndex(i => i.id === id);
  
  if (index === -1) return null;
  
  inventoryItems[index] = {
    ...inventoryItems[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  return inventoryItems[index];
}

// DELETE (Soft delete)
export function deleteInventoryItem(id: string): boolean {
  const index = inventoryItems.findIndex(i => i.id === id);
  
  if (index === -1) return false;
  
  inventoryItems[index].isActive = false;
  inventoryItems[index].updatedAt = new Date().toISOString();
  
  return true;
}

// STOCK TRANSACTIONS

// Add Stock (Stock In)
export function addStock(
  itemId: string,
  quantity: number,
  costPerUnit: number,
  supplier: string,
  invoiceNumber: string,
  performedBy: string,
  notes?: string
): StockTransaction | null {
  const item = inventoryItems.find(i => i.id === itemId);
  
  if (!item) return null;
  
  // Update stock
  item.currentStock += quantity;
  item.lastRestocked = new Date().toISOString().split('T')[0];
  item.updatedAt = new Date().toISOString();
  
  // Create transaction record
  const transaction: StockTransaction = {
    id: `${Date.now()}`,
    itemId,
    itemName: item.name,
    transactionType: "stock-in",
    quantity,
    costPerUnit,
    totalCost: quantity * costPerUnit,
    supplier,
    invoiceNumber,
    performedBy,
    date: new Date().toISOString().split('T')[0],
    notes,
    createdAt: new Date().toISOString()
  };
  
  stockTransactions.push(transaction);
  return transaction;
}

// Remove Stock (Stock Out)
export function removeStock(
  itemId: string,
  quantity: number,
  reason: string,
  performedBy: string,
  notes?: string
): StockTransaction | null {
  const item = inventoryItems.find(i => i.id === itemId);
  
  if (!item || item.currentStock < quantity) return null;
  
  // Update stock
  item.currentStock -= quantity;
  item.updatedAt = new Date().toISOString();
  
  // Create transaction record
  const transaction: StockTransaction = {
    id: `${Date.now()}`,
    itemId,
    itemName: item.name,
    transactionType: "stock-out",
    quantity: -quantity,
    reason,
    performedBy,
    date: new Date().toISOString().split('T')[0],
    notes,
    createdAt: new Date().toISOString()
  };
  
  stockTransactions.push(transaction);
  return transaction;
}

// Adjust Stock (Correction)
export function adjustStock(
  itemId: string,
  newQuantity: number,
  reason: string,
  performedBy: string,
  notes?: string
): StockTransaction | null {
  const item = inventoryItems.find(i => i.id === itemId);
  
  if (!item) return null;
  
  const difference = newQuantity - item.currentStock;
  
  // Update stock
  item.currentStock = newQuantity;
  item.updatedAt = new Date().toISOString();
  
  // Create transaction record
  const transaction: StockTransaction = {
    id: `${Date.now()}`,
    itemId,
    itemName: item.name,
    transactionType: "adjustment",
    quantity: difference,
    reason,
    performedBy,
    date: new Date().toISOString().split('T')[0],
    notes,
    createdAt: new Date().toISOString()
  };
  
  stockTransactions.push(transaction);
  return transaction;
}

// Get Transactions
export function getAllStockTransactions(): StockTransaction[] {
  return [...stockTransactions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getTransactionsByItem(itemId: string): StockTransaction[] {
  return stockTransactions
    .filter(t => t.itemId === itemId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getTransactionsByDateRange(startDate: string, endDate: string): StockTransaction[] {
  return stockTransactions.filter(t => t.date >= startDate && t.date <= endDate);
}

// STATISTICS
export function getInventoryStats() {
  const totalValue = inventoryItems
    .filter(i => i.isActive)
    .reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0);
  
  return {
    totalItems: inventoryItems.filter(i => i.isActive).length,
    lowStock: getLowStockItems().length,
    criticalStock: getCriticalStockItems().length,
    totalValue,
    byCategory: {
      ppe: inventoryItems.filter(i => i.category === "ppe" && i.isActive).length,
      consumable: inventoryItems.filter(i => i.category === "consumable" && i.isActive).length,
      equipment: inventoryItems.filter(i => i.category === "equipment" && i.isActive).length
    }
  };
}
