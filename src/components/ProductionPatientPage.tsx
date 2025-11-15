import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Search, Plus, Edit, User, Phone, Mail, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface Patient {
  id: string;
  patient_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone: string;
  email: string;
  address: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_conditions?: string;
  allergies?: string;
  insurance_provider?: string;
  insurance_number?: string;
  age?: number;
  gender?: string;
  city?: string;
  province?: string;
  medications?: string;
  status?: string;
  last_visit?: string;
  created_at: string;
  updated_at: string;
}

export function ProductionPatientPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [isEditPatientOpen, setIsEditPatientOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newPatient, setNewPatient] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    phone: "",
    email: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    medical_conditions: "",
    allergies: "",
    insurance_provider: "",
    insurance_number: "",
    gender: "",
    city: "",
    province: "",
    medications: ""
  });

  // Fetch patients from Supabase
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPatients(data || []);
      setFilteredPatients(data || []);
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  // Generate patient number
  const generatePatientNumber = () => {
    const year = new Date().getFullYear();
    const count = patients.length + 1;
    return `PT-${year}-${String(count).padStart(4, '0')}`;
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  // Create new patient
  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const age = newPatient.date_of_birth ? calculateAge(newPatient.date_of_birth) : null;

      const { data, error } = await supabase
        .from('patients')
        .insert([{
          ...newPatient,
          patient_number: generatePatientNumber(),
          age,
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Patient created successfully!');
      setIsNewPatientOpen(false);
      setNewPatient({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        phone: "",
        email: "",
        address: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        medical_conditions: "",
        allergies: "",
        insurance_provider: "",
        insurance_number: "",
        gender: "",
        city: "",
        province: "",
        medications: ""
      });
      fetchPatients();
    } catch (error: any) {
      console.error('Error creating patient:', error);
      toast.error('Failed to create patient');
    } finally {
      setLoading(false);
    }
  };

  // Update patient
  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setLoading(true);
    try {
      const age = selectedPatient.date_of_birth ? calculateAge(selectedPatient.date_of_birth) : null;

      const { error } = await supabase
        .from('patients')
        .update({
          ...selectedPatient,
          age,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPatient.id);

      if (error) throw error;

      toast.success('Patient updated successfully!');
      setIsEditPatientOpen(false);
      setSelectedPatient(null);
      fetchPatients();
    } catch (error: any) {
      console.error('Error updating patient:', error);
      toast.error('Failed to update patient');
    } finally {
      setLoading(false);
    }
  };

  // Search patients
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const filtered = patients.filter(patient =>
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(query.toLowerCase()) ||
      patient.patient_number.toLowerCase().includes(query.toLowerCase()) ||
      patient.phone?.includes(query) ||
      patient.email?.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredPatients(filtered);
  };

  // Load patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Patient Records</h2>
          <p className="text-muted-foreground">
            Manage patient information and medical records
          </p>
        </div>

        <Dialog open={isNewPatientOpen} onOpenChange={setIsNewPatientOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreatePatient} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={newPatient.first_name}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, first_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={newPatient.last_name}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, last_name: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={newPatient.date_of_birth}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, date_of_birth: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={newPatient.gender} onValueChange={(value) => setNewPatient(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+63 917-123-4567"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newPatient.email}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newPatient.address}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={newPatient.city}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="province">Province</Label>
                  <Input
                    id="province"
                    value={newPatient.province}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, province: e.target.value }))}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                  <Input
                    id="emergency_contact_name"
                    value={newPatient.emergency_contact_name}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={newPatient.emergency_contact_phone}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                  />
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="medical_conditions">Medical Conditions</Label>
                  <Textarea
                    id="medical_conditions"
                    value={newPatient.medical_conditions}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, medical_conditions: e.target.value }))}
                    placeholder="List any medical conditions..."
                  />
                </div>
                <div>
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea
                    id="allergies"
                    value={newPatient.allergies}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, allergies: e.target.value }))}
                    placeholder="List any allergies..."
                  />
                </div>
                <div>
                  <Label htmlFor="medications">Current Medications</Label>
                  <Textarea
                    id="medications"
                    value={newPatient.medications}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, medications: e.target.value }))}
                    placeholder="List current medications..."
                  />
                </div>
              </div>

              {/* Insurance Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insurance_provider">Insurance Provider</Label>
                  <Input
                    id="insurance_provider"
                    value={newPatient.insurance_provider}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, insurance_provider: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="insurance_number">Insurance Number</Label>
                  <Input
                    id="insurance_number"
                    value={newPatient.insurance_number}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, insurance_number: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsNewPatientOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Patient'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name, ID, phone, or email..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">Loading patients...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No patients found matching your search.' : 'No patients registered yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient #</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age/Gender</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-mono text-sm">
                        {patient.patient_number}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {patient.first_name} {patient.last_name}
                            </div>
                            {patient.email && (
                              <div className="text-sm text-muted-foreground">
                                {patient.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {patient.age && patient.gender ? (
                          <span>{patient.age}y, {patient.gender}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {patient.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span className="text-sm">{patient.phone}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {patient.last_visit ? (
                          <span className="text-sm">
                            {new Date(patient.last_visit).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                          {patient.status || 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setIsEditPatientOpen(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Patient Dialog */}
      {selectedPatient && (
        <Dialog open={isEditPatientOpen} onOpenChange={setIsEditPatientOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Patient: {selectedPatient.first_name} {selectedPatient.last_name}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdatePatient} className="space-y-6">
              {/* Similar form structure as new patient, but with selectedPatient values */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_first_name">First Name *</Label>
                  <Input
                    id="edit_first_name"
                    value={selectedPatient.first_name}
                    onChange={(e) => setSelectedPatient(prev => prev ? { ...prev, first_name: e.target.value } : null)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_last_name">Last Name *</Label>
                  <Input
                    id="edit_last_name"
                    value={selectedPatient.last_name}
                    onChange={(e) => setSelectedPatient(prev => prev ? { ...prev, last_name: e.target.value } : null)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit_date_of_birth">Date of Birth</Label>
                  <Input
                    id="edit_date_of_birth"
                    type="date"
                    value={selectedPatient.date_of_birth}
                    onChange={(e) => setSelectedPatient(prev => prev ? { ...prev, date_of_birth: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_phone">Phone Number *</Label>
                  <Input
                    id="edit_phone"
                    value={selectedPatient.phone}
                    onChange={(e) => setSelectedPatient(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_email">Email</Label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={selectedPatient.email || ''}
                    onChange={(e) => setSelectedPatient(prev => prev ? { ...prev, email: e.target.value } : null)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditPatientOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Patient'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}