import { useState } from "react";
import { 
  Search, 
  UserPlus, 
  Edit, 
  Trash2, 
  FileText,
  Calendar,
  DollarSign,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Heart,
  Shield,
  User,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  getAllPatients, 
  createPatient, 
  updatePatient, 
  deletePatient, 
  searchPatients,
  findDuplicatePatient,
  getPatientStats,
  getPatientById,
  type Patient 
} from "../data/patients";

export function PatientRecordPage() {
  const [patients, setPatients] = useState<Patient[]>(getAllPatients());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "profile">("list");
  const stats = getPatientStats();

  const filteredPatients = searchQuery 
    ? searchPatients(searchQuery)
    : patients;

  const handleViewProfile = (patient: Patient) => {
    setSelectedPatient(patient);
    setViewMode("profile");
  };

  const handlePatientCreated = (patient: Patient) => {
    setPatients(getAllPatients());
  };

  const handlePatientUpdated = () => {
    setPatients(getAllPatients());
    if (selectedPatient) {
      setSelectedPatient(getPatientById(selectedPatient.id) || null);
    }
  };

  const handlePatientDeleted = () => {
    setPatients(getAllPatients());
    setViewMode("list");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {viewMode === "list" ? (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-gray-900 mb-1">Patient Records</h1>
              <p className="text-sm text-gray-600">Manage patient information and medical history</p>
            </div>
            <AddPatientDialog onCreate={handlePatientCreated} />
          </div>

          {/* Search & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search patients by name, number, or phone..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <StatCard value={stats.totalPatients.toString()} label="Total Patients" color="from-blue-500 to-cyan-500" />
            <StatCard value={stats.activePatients.toString()} label="Active Patients" color="from-green-500 to-emerald-500" />
          </div>

          {/* Patients List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredPatients.map((patient) => (
              <PatientCard 
                key={patient.id} 
                patient={patient}
                onView={() => handleViewProfile(patient)}
              />
            ))}

            {filteredPatients.length === 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No patients found</p>
                  <p className="text-sm text-gray-500">Try adjusting your search or add a new patient</p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      ) : (
        <PatientProfile 
          patient={selectedPatient!}
          onBack={() => setViewMode("list")}
          onUpdate={handlePatientUpdated}
          onDelete={handlePatientDeleted}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border-0 shadow-lg">
      <div className={`text-transparent bg-clip-text bg-gradient-to-r ${color} mb-1`}>
        {value}
      </div>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}

// Patient Card Component
function PatientCard({ patient, onView }: { patient: Patient; onView: () => void }) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white">
                {patient.firstName[0]}{patient.lastName[0]}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-gray-900">{patient.firstName} {patient.lastName}</h3>
                <Badge variant={patient.status === "active" ? "default" : "secondary"} className="text-xs">
                  {patient.status}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{patient.patientNumber}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{patient.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Age: {patient.age}</span>
                </div>
              </div>

              {patient.lastVisit && (
                <p className="text-xs text-gray-500 mt-2">
                  Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onView}>
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Patient Profile Component
function PatientProfile({ patient, onBack, onUpdate, onDelete }: { patient: Patient; onBack: () => void; onUpdate: () => void; onDelete: () => void }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <div className="flex-1">
          <h1 className="text-gray-900">{patient.firstName} {patient.lastName}</h1>
          <p className="text-sm text-gray-600">{patient.patientNumber}</p>
        </div>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoField label="Full Name" value={`${patient.firstName} ${patient.lastName}`} />
              <InfoField label="Date of Birth" value={new Date(patient.birthDate).toLocaleDateString()} />
              <InfoField label="Age" value={`${patient.age} years old`} />
              <InfoField label="Gender" value={patient.gender} />
              <InfoField label="Phone" value={patient.phone} icon={Phone} />
              <InfoField label="Email" value={patient.email} icon={Mail} />
              <div className="md:col-span-2">
                <InfoField 
                  label="Address" 
                  value={`${patient.address}, ${patient.city}, ${patient.province}`} 
                  icon={MapPin} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-600 text-sm mb-1">Next Appointment</p>
                <p className="text-gray-900">No upcoming</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-600 text-sm mb-1">Outstanding Balance</p>
                <p className="text-gray-900">₱0.00</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Tabs */}
      <Card className="border-0 shadow-lg">
        <Tabs defaultValue="medical" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
            <TabsTrigger value="medical" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-500">
              <Heart className="w-4 h-4 mr-2" />
              Medical History
            </TabsTrigger>
            <TabsTrigger value="insurance" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-500">
              <Shield className="w-4 h-4 mr-2" />
              Insurance
            </TabsTrigger>
            <TabsTrigger value="appointments" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-500">
              <Calendar className="w-4 h-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="billing" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-500">
              <DollarSign className="w-4 h-4 mr-2" />
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="medical" className="p-6">
            <div className="space-y-4">
              <InfoField label="Medical Conditions" value={patient.medicalHistory || "None"} />
              <InfoField label="Allergies" value={patient.allergies || "None"} />
              <InfoField label="Current Medications" value={patient.medications || "None"} />
            </div>
          </TabsContent>

          <TabsContent value="insurance" className="p-6">
            <div className="space-y-4">
              <InfoField label="Insurance Type" value={patient.insuranceType} />
              {patient.insuranceProvider && (
                <>
                  <InfoField label="Provider" value={patient.insuranceProvider} />
                  <InfoField label="Card Number" value={patient.insuranceCardNumber} />
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="p-6">
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No appointment history</p>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="p-6">
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No billing records</p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

// Info Field Component
function InfoField({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) {
  return (
    <div>
      <label className="text-sm text-gray-600 mb-1 block">{label}</label>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        <p className="text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// Add Patient Dialog
function AddPatientDialog({ onCreate }: { onCreate: (patient: Patient) => void }) {
  const [open, setOpen] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicatePatient, setDuplicatePatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    province: "",
    medicalHistory: "",
    allergies: "",
    medications: "",
    insuranceType: "private",
    insuranceProvider: "",
    insuranceCardNumber: ""
  });

  // Check for duplicate when phone or name changes
  const checkForDuplicate = () => {
    if (formData.phone.length >= 10 || (formData.firstName && formData.lastName && formData.birthDate)) {
      const potential = findDuplicatePatient(formData.phone, formData.firstName, formData.lastName, formData.birthDate);
      
      if (potential) {
        setDuplicatePatient(potential);
        setShowDuplicateWarning(true);
      } else {
        setDuplicatePatient(null);
        setShowDuplicateWarning(false);
      }
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, phone: e.target.value });
    setTimeout(checkForDuplicate, 500);
  };

  const handleUseExisting = () => {
    setShowDuplicateWarning(false);
    setOpen(false);
    // Navigate to existing patient
  };

  const handleSaveAsNew = () => {
    setShowDuplicateWarning(false);
    handleSubmit(new Event('submit') as any);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for duplicates before final submit
    checkForDuplicate();
    
    if (showDuplicateWarning) {
      return; // Don't submit if duplicate warning is shown
    }
    
    console.log("New patient:", formData);
    setOpen(false);
    setFormData({
      firstName: "",
      lastName: "",
      birthDate: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      province: "",
      medicalHistory: "",
      allergies: "",
      medications: "",
      insuranceType: "private",
      insuranceProvider: "",
      insuranceCardNumber: ""
    });
    onCreate(formData as Patient);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          <UserPlus className="w-4 h-4 mr-2" />
          Add New Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Patient</DialogTitle>
          <DialogDescription>
            Add a new patient to the system with their personal and medical information
          </DialogDescription>
        </DialogHeader>

        {/* Duplicate Warning */}
        {showDuplicateWarning && duplicatePatient && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-orange-900 mb-2">Possible Duplicate Patient</h4>
                <div className="bg-white rounded-lg p-4 mb-3">
                  <p className="text-gray-900 mb-2">
                    <strong>Existing Patient:</strong> {duplicatePatient.firstName} {duplicatePatient.lastName}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <p>Born: {new Date(duplicatePatient.birthDate).toLocaleDateString()}</p>
                    <p>Age: {duplicatePatient.age} years</p>
                    <p className="col-span-2">Phone: {duplicatePatient.phone}</p>
                    {duplicatePatient.lastVisit && (
                      <p className="col-span-2">Last Visit: {new Date(duplicatePatient.lastVisit).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleUseExisting}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Use Existing Patient
                  </Button>
                  <Button 
                    onClick={handleSaveAsNew}
                    size="sm"
                    variant="outline"
                  >
                    Save as New Patient
                  </Button>
                  <Button 
                    onClick={() => setShowDuplicateWarning(false)}
                    size="sm"
                    variant="outline"
                  >
                    Cancel & Review
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => {
                    setFormData({ ...formData, firstName: e.target.value });
                    setTimeout(checkForDuplicate, 500);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => {
                    setFormData({ ...formData, lastName: e.target.value });
                    setTimeout(checkForDuplicate, 500);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Date of Birth *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  required
                  value={formData.birthDate}
                  onChange={(e) => {
                    setFormData({ ...formData, birthDate: e.target.value });
                    setTimeout(checkForDuplicate, 500);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+63 XXX-XXX-XXXX"
                  required
                  value={formData.phone}
                  onChange={handlePhoneChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-gray-900 mb-4">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div>
            <h3 className="text-gray-900 mb-4">Medical History</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medicalHistory">Medical Conditions</Label>
                <Textarea
                  id="medicalHistory"
                  placeholder="List any medical conditions..."
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Input
                  id="allergies"
                  placeholder="E.g., Penicillin"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medications">Current Medications</Label>
                <Input
                  id="medications"
                  placeholder="List current medications..."
                  value={formData.medications}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Insurance */}
          <div>
            <h3 className="text-gray-900 mb-4">Insurance</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Insurance Type</Label>
                <Select value={formData.insuranceType} onValueChange={(value) => setFormData({ ...formData, insuranceType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="maxicare">Maxicare</SelectItem>
                    <SelectItem value="medicard">Medicard</SelectItem>
                    <SelectItem value="valucare">Valucare</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.insuranceType !== "private" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="insuranceProvider">Provider</Label>
                    <Input
                      id="insuranceProvider"
                      value={formData.insuranceProvider}
                      onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insuranceCardNumber">Card Number</Label>
                    <Input
                      id="insuranceCardNumber"
                      value={formData.insuranceCardNumber}
                      onChange={(e) => setFormData({ ...formData, insuranceCardNumber: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Register Patient
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}