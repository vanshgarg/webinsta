import { motion } from 'motion/react';
import { 
  X, 
  Lock, 
  FileSpreadsheet, 
  LogOut, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Database,
  RefreshCw,
  ExternalLink,
  Plus,
  ArrowRightLeft
} from 'lucide-react';
import type { LeadData } from '../services/googleSheets';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser: any;
  adminToken: string | null;
  leads: LeadData[];
  spreadsheetId: string;
  sheetUrl: string;
  isSyncing: boolean;
  isCreatingSheet: boolean;
  adminError: string;
  adminSuccess: string;
  manualSheetId: string;
  setManualSheetId: (val: string) => void;
  onLogin: () => Promise<void>;
  onLogout: () => Promise<void>;
  onCreateSheet: () => Promise<void>;
  onLinkSheet: () => void;
  onSync: () => Promise<void>;
  onDeleteLead: (id: string) => void;
}

export default function AdminPortalModal({
  onClose,
  adminUser,
  leads,
  spreadsheetId,
  sheetUrl,
  isSyncing,
  isCreatingSheet,
  adminError,
  adminSuccess,
  manualSheetId,
  setManualSheetId,
  onLogin,
  onLogout,
  onCreateSheet,
  onLinkSheet,
  onSync,
  onDeleteLead
}: AdminPortalModalProps) {
  
  const totalLeads = leads.length;
  const syncedLeadsCount = leads.filter(l => l.synced).length;
  const unsyncedLeadsCount = totalLeads - syncedLeadsCount;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(15, 17, 23, 0.4)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <style>{`
        /* Google Sign-In Button Styling */
        .gsi-material-button {
          -moz-user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
          -webkit-appearance: none;
          background-color: WHITE;
          background-image: none;
          border: 1px solid #747775;
          -webkit-border-radius: 20px;
          border-radius: 20px;
          -webkit-box-sizing: border-box;
          box-sizing: border-box;
          color: #1f1f1f;
          cursor: pointer;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 500;
          height: 40px;
          letter-spacing: 0.25px;
          outline: none;
          overflow: hidden;
          padding: 0 12px;
          position: relative;
          text-align: center;
          -transition: background-color .218s, border-color .218s, box-shadow .218s;
          transition: background-color .218s, border-color .218s, box-shadow .218s;
          vertical-align: middle;
          white-space: nowrap;
          width: auto;
          max-width: 400px;
          min-width: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gsi-material-button .gsi-material-button-icon {
          height: 20px;
          margin-right: 12px;
          min-width: 20px;
          width: 20px;
        }
        .gsi-material-button .gsi-material-button-content-wrapper {
          align-items: center;
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          height: 100%;
          justify-content: space-between;
          position: relative;
          width: 100%;
        }
        .gsi-material-button .gsi-material-button-contents {
          flex-grow: 1;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          vertical-align: top;
        }
        .gsi-material-button:hover {
          -webkit-box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
          box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
          background-color: #F7F8F8;
        }
        .gsi-material-button:active {
          background-color: #F1F3F4;
        }
        
        /* Modern table styling */
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          color: #333;
        }
        .admin-table th {
          background: #F8F9FC;
          padding: 12px 16px;
          font-weight: 600;
          color: #4A5568;
          text-align: left;
          border-bottom: 1px solid #E2E8F0;
        }
        .admin-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #EDF2F7;
          vertical-align: middle;
        }
        .admin-table tr:hover {
          background-color: #F8FAFC;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 9999px;
        }
        .status-badge.synced {
          background-color: #DEF7EC;
          color: #03543F;
        }
        .status-badge.pending {
          background-color: #FEF3C7;
          color: #92400E;
        }
      `}</style>

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        style={{
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '85vh',
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #E2E8F0'
        }}
      >
        {/* Header toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid #E2E8F0',
          background: '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1A365D 0%, #2B6CB0 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Database size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1A202C' }}>Lead Management & Google Sheets Sync</h2>
              <p style={{ fontSize: '12px', color: '#718096' }}>Track, audit, and push customer requests to your Google Spreadsheet</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: '#EDF2F7',
              color: '#4A5568',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          
          {/* Messages Alert Block */}
          {adminError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: '#FFF5F5',
              border: '1px solid #FED7D7',
              borderRadius: '12px',
              color: '#C53030',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              <AlertCircle size={18} />
              <span>{adminError}</span>
            </div>
          )}

          {adminSuccess && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: '#F0FDF4',
              border: '1px solid #DCFCE7',
              borderRadius: '12px',
              color: '#166534',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              <CheckCircle size={18} />
              <span>{adminSuccess}</span>
            </div>
          )}

          {/* Grid Layout: Config panel left, Statistics right */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '28px'
          }}>
            {/* Left side: Authenticate and sheet setup */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              {!adminUser ? (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <Lock size={32} color="#4A5568" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#2D3748', marginBottom: '6px' }}>Secure Administrator Login</h4>
                  <p style={{ fontSize: '12px', color: '#718096', maxWidth: '300px', margin: '0 auto 12px', lineHeight: 1.5 }}>
                    Connect your agency Google account to automate spreadsheet setup and push submissions.
                  </p>
                  <p style={{ 
                    fontSize: '11px', 
                    color: '#9B2C2C', 
                    background: '#FFF5F5', 
                    border: '1px solid #FED7D7', 
                    borderRadius: '8px', 
                    padding: '8px 10px', 
                    maxWidth: '300px', 
                    margin: '0 auto 18px', 
                    lineHeight: 1.4, 
                    fontWeight: 500 
                  }}>
                    ⚠️ <strong>Important:</strong> On the Google OAuth consent step, please make sure you <strong>check/tick the box</strong> permitting WebInsta to view and edit your Google Sheets. Otherwise, writing to your spreadsheet will be denied by Google with a 403 error.
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button onClick={onLogin} className="gsi-material-button">
                      <div className="gsi-material-button-state"></div>
                      <div className="gsi-material-button-content-wrapper">
                        <div className="gsi-material-button-icon">
                          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                          </svg>
                        </div>
                        <span className="gsi-material-button-contents">Sign in with Google</span>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden' }}>
                        <img src={adminUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80'} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#2D3748', display: 'block' }}>{adminUser.displayName || 'Administrator'}</span>
                        <span style={{ fontSize: '11px', color: '#718096', display: 'block', wordBreak: 'break-all' }}>{adminUser.email}</span>
                      </div>
                    </div>
                    <button 
                      onClick={onLogout}
                      style={{
                        padding: '6px 12px',
                        background: 'white',
                        border: '1px solid #CBD5E0',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: '#718096',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 600
                      }}
                    >
                      <LogOut size={12} /> Disconnect
                    </button>
                  </div>

                  {spreadsheetId ? (
                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2F855A', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                        <FileSpreadsheet size={16} /> Connected Sheet
                      </div>
                      <p style={{ fontSize: '11px', color: '#718096', marginBottom: '12px', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                        ID: {spreadsheetId}
                      </p>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {sheetUrl && (
                          <a 
                            href={sheetUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            style={{
                              flex: 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '10px',
                              background: '#3182CE',
                              color: 'white',
                              borderRadius: '8px',
                              fontSize: '12px',
                              textDecoration: 'none',
                              fontWeight: 600,
                              textAlign: 'center'
                            }}
                          >
                            Open Google Sheet <ExternalLink size={12} />
                          </a>
                        )}
                        <button 
                          onClick={onCreateSheet}
                          disabled={isCreatingSheet}
                          style={{
                            padding: '10px 14px',
                            background: '#EDF2F7',
                            color: '#4A5568',
                            border: '1px solid #CBD5E0',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Change Sheet
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#2D3748', marginBottom: '4px' }}>Setup Leads Spreadsheet</p>
                        <p style={{ fontSize: '11px', color: '#718096', lineHeight: 1.4 }}>Create a new Google Spreadsheet in your account automatically, styled and formatted, or enter an existing ID.</p>
                      </div>

                      <button 
                        onClick={onCreateSheet}
                        disabled={isCreatingSheet}
                        style={{
                          width: '100%',
                          padding: '11px',
                          background: 'linear-gradient(135deg, #2F855A 0%, #276749 100%)',
                          color: 'white',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        {isCreatingSheet ? (
                          <>
                            <RefreshCw className="animate-spin" size={14} /> Creating on Drive...
                          </>
                        ) : (
                          <>
                            <Plus size={14} /> Create New Leads Spreadsheet
                          </>
                        )}
                      </button>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#4A5568', fontWeight: 600 }}>OR Link existing Sheet ID:</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input 
                            type="text" 
                            placeholder="Spreadsheet long ID..." 
                            value={manualSheetId}
                            onChange={(e) => setManualSheetId(e.target.value)}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              border: '1px solid #CBD5E0',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontFamily: 'monospace'
                            }}
                          />
                          <button 
                            onClick={onLinkSheet}
                            style={{
                              padding: '8px 12px',
                              background: '#4A5568',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Link
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right side: Lead Metrics Cards */}
            <div style={{
              display: 'grid',
              gridTemplateRows: 'auto 1fr',
              gap: '16px'
            }}>
              {/* Sync Dashboard Card */}
              <div style={{
                background: '#1A202C',
                color: 'white',
                borderRadius: '16px',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div style={{
                  position: 'absolute',
                  right: '-10px',
                  top: '-10px',
                  opacity: 0.1,
                  color: 'white'
                }}>
                  <Sparkles size={120} />
                </div>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <span style={{ background: 'rgba(255,255,255,0.15)', color: '#63B3ED', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>COE CAPABILITY</span>
                    <span style={{ color: '#A0AEC0', fontSize: '12px' }}>Google Sheets Agent</span>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '6px' }}>Pending Sync Hub</h3>
                  <p style={{ fontSize: '12px', color: '#CBD5E0', marginBottom: '16px', lineHeight: 1.4 }}>
                    There are currently <strong style={{ color: '#E9D8FD' }}>{unsyncedLeadsCount} unsynced leads</strong> locally waiting to be synced to sheets.
                  </p>
                </div>

                <button
                  onClick={onSync}
                  disabled={isSyncing || unsyncedLeadsCount === 0 || !adminUser || !spreadsheetId}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: (isSyncing || unsyncedLeadsCount === 0 || !adminUser || !spreadsheetId) ? 'not-allowed' : 'pointer',
                    background: (isSyncing || unsyncedLeadsCount === 0 || !adminUser || !spreadsheetId) 
                      ? '#4A5568' 
                      : 'linear-gradient(135deg, #63B3ED 0%, #4299E1 100%)',
                    color: (isSyncing || unsyncedLeadsCount === 0 || !adminUser || !spreadsheetId) ? '#A0AEC0' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} /> Syncing Leads...
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft size={16} /> Force Sync {unsyncedLeadsCount} Leads to Sheets
                    </>
                  )}
                </button>
              </div>

              {/* Stats Counters */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px'
              }}>
                <div style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#718096', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Total Leads</span>
                  <span style={{ fontSize: '24px', fontWeight: 700, color: '#1A202C' }}>{totalLeads}</span>
                </div>
                <div style={{ padding: '16px', background: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#166534', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Synced</span>
                  <span style={{ fontSize: '24px', fontWeight: 700, color: '#15803D' }}>{syncedLeadsCount}</span>
                </div>
                <div style={{ padding: '16px', background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#92400E', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Pending</span>
                  <span style={{ fontSize: '24px', fontWeight: 700, color: '#B45309' }}>{unsyncedLeadsCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table: Submissions Audit Logs */}
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#2D3748', marginBottom: '12px' }}>Submissions Archive</h4>
            
            {leads.length === 0 ? (
              <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                background: '#F8FAFC', 
                border: '2px dashed #E2E8F0', 
                borderRadius: '16px',
                color: '#718096'
              }}>
                <Database size={24} style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '13px' }}>No lead submissions registered yet. Try submitting the contact form!</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Submitted At</th>
                      <th>Visitor Name</th>
                      <th>Phone / WhatsApp</th>
                      <th>Business (Type)</th>
                      <th>Additional Message</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id}>
                        <td style={{ color: '#718096', whiteSpace: 'nowrap' }}>{lead.submittedAt}</td>
                        <td style={{ fontWeight: 600 }}>
                          {lead.name}
                          {lead.email && <div style={{ fontSize: '11px', color: '#718096', fontWeight: 400 }}>{lead.email}</div>}
                        </td>
                        <td style={{ fontFamily: 'monospace' }}>
                          <a 
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{ color: '#2b6cb0', textDecoration: 'none' }}
                            title="Chat on WhatsApp"
                          >
                            {lead.phone}
                          </a>
                        </td>
                        <td>
                          {lead.business ? (
                            <span>
                              {lead.business} <span style={{ fontSize: '11px', color: '#718096' }}>({lead.businessType})</span>
                            </span>
                          ) : (
                            <span style={{ color: '#A0AEC0', fontStyle: 'italic' }}>None ({lead.businessType})</span>
                          )}
                        </td>
                        <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={lead.message}>
                          {lead.message || <span style={{ color: '#718096', fontStyle: 'italic' }}>None</span>}
                        </td>
                        <td>
                          {lead.synced ? (
                            <span className="status-badge synced">
                              <CheckCircle size={10} /> Synced
                            </span>
                          ) : (
                            <span className="status-badge pending">
                              <AlertCircle size={10} /> Pending
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            onClick={() => onDeleteLead(lead.id)}
                            style={{
                              padding: '6px',
                              background: 'transparent',
                              border: 'none',
                              color: '#E53E3E',
                              cursor: 'pointer',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            title="Delete Lead"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Footer info bar */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #E2E8F0',
          background: '#F8FAFC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: '#718096'
        }}>
          <span>Workspace Integration Active</span>
          <span>Security status: Token Encrypted in Memory Only</span>
        </div>
      </motion.div>
    </div>
  );
}
