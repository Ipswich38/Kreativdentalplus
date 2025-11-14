import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Search, Download, Plus, Package, DollarSign } from "lucide-react";
import { services, serviceCategories } from "../data/services";

export function ServiceCatalogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Services");

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.rates.some(rate => 
                           rate.category.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900">Service Catalog</h2>
          <p className="text-sm text-gray-600 mt-1">
            Complete list of dental services and rates
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Rates
          </Button>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Services</p>
                <p className="text-gray-900">{services.length}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Price Range</p>
                <p className="text-gray-900">₱800 - ₱50,000</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Most Popular</p>
                <p className="text-gray-900">Oral Prophylaxis</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {serviceCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={
                    selectedCategory === category
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      : ""
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services List - Card View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredServices.map((service) => (
          <Card key={service.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="border-b bg-gradient-to-br from-gray-50 to-white">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="mb-2">{service.name}</CardTitle>
                  {service.description && (
                    <p className="text-sm text-gray-600">{service.description}</p>
                  )}
                </div>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {service.rates.length} option{service.rates.length > 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {service.rates.map((rate, idx) => (
                    <TableRow key={idx} className="hover:bg-gray-50">
                      <TableCell className="py-3">{rate.category}</TableCell>
                      <TableCell className="text-right py-3">
                        <span className="text-gray-900">{rate.rate}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Table View */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle>Complete Services Rate Table</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">SERVICE</TableHead>
                  <TableHead className="w-[40%]">CATEGORY</TableHead>
                  <TableHead className="text-right w-[30%]">RATE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  service.rates.map((rate, idx) => (
                    <TableRow key={`${service.id}-${idx}`} className="hover:bg-gray-50">
                      {idx === 0 && (
                        <TableCell className="py-3" rowSpan={service.rates.length}>
                          <div>
                            <p className="text-gray-900">{service.name}</p>
                            {service.description && (
                              <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                            )}
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="py-3">{rate.category}</TableCell>
                      <TableCell className="text-right py-3">
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                          {rate.rate}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
