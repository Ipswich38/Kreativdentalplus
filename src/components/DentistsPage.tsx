import { useState } from "react";
import { Plus, Search, Users } from "lucide-react";
import { dentists } from "../data/dentists";
import { DentistCard } from "./DentistCard";
import { DentistRateTable } from "./DentistRateTable";
import { PageWrapper } from "./PageWrapper";

export function DentistsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const filteredDentists = dentists.filter(dentist =>
    dentist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dentist.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pageActions = (
    <button className="donezo-header-button">
      <Plus className="w-4 h-4" />
      Add Dentist
    </button>
  );

  return (
    <PageWrapper
      title="Dentists Management"
      subtitle={`${dentists.length} dentists in your practice`}
      actions={pageActions}
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="dentists-stats-grid">
          <div className="donezo-stat-card">
            <div className="dentist-stat-card-header">
              <div>
                <p className="dentist-stat-card-label">Active Dentists</p>
                <p className="dentist-stat-card-value">{dentists.filter(d => d.status === "active").length}</p>
              </div>
              <div className="dentist-stat-card-icon" style={{ background: 'var(--primary-green)' }}>
                <Users />
              </div>
            </div>
          </div>

          <div className="donezo-stat-card">
            <div className="dentist-stat-card-header">
              <div>
                <p className="dentist-stat-card-label">Specialists</p>
                <p className="dentist-stat-card-value">{dentists.filter(d => d.specialty !== "General Dentistry").length}</p>
              </div>
              <div className="dentist-stat-card-icon" style={{ background: 'var(--secondary-blue)' }}>
                <Users />
              </div>
            </div>
          </div>

          <div className="donezo-stat-card">
            <div className="dentist-stat-card-header">
              <div>
                <p className="dentist-stat-card-label">General Dentists</p>
                <p className="dentist-stat-card-value">{dentists.filter(d => d.specialty === "General Dentistry").length}</p>
              </div>
              <div className="dentist-stat-card-icon" style={{ background: 'var(--accent-orange)' }}>
                <Users />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="donezo-tabs">
          <div className="donezo-tabs-list">
            <button
              className={`donezo-tabs-trigger ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`donezo-tabs-trigger ${activeTab === "rates" ? "active" : ""}`}
              onClick={() => setActiveTab("rates")}
            >
              Rates & Commission
            </button>
          </div>

          {/* Overview Tab */}
          <div className={`donezo-tabs-content ${activeTab === "overview" ? "active" : ""}`}>
            <div className="donezo-section">
              <div className="donezo-section-header">
                <h3 className="donezo-section-title">All Dentists</h3>
                <div className="donezo-search" style={{ maxWidth: '300px' }}>
                  <Search className="donezo-search-icon" />
                  <input
                    placeholder="Search dentists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="donezo-search-input"
                  />
                </div>
              </div>
              <div>
                {filteredDentists.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No dentists found</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Try adjusting your search query
                    </p>
                  </div>
                ) : (
                  <div className="dentists-list-grid">
                    {filteredDentists.map((dentist) => (
                      <DentistCard key={dentist.id} dentist={dentist} showActions={true} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rates Tab */}
          <div className={`donezo-tabs-content ${activeTab === "rates" ? "active" : ""}`}>
            <div className="dentists-rates-list">
              {dentists.map((dentist) => (
                <DentistRateTable key={dentist.id} dentist={dentist} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}