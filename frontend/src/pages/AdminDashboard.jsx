import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Settings, Users, PlusCircle, Trash2, Activity, Play, Square, UserCheck, Shield, Key } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [candidates, setCandidates] = useState([]);
  const [students, setStudents] = useState([]);
  const [electionActive, setElectionActive] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // New Candidate Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: '', department: '', position: '', manifesto: '', image: '' });

  // Update Credentials State
  const [showCredForm, setShowCredForm] = useState(false);
  const [credentials, setCredentials] = useState({ name: '', studentId: '', password: '' });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statusRes, candidatesRes, studentsRes] = await Promise.all([
        axios.get('/admin/status'),
        axios.get('/candidates'),
        axios.get('/admin/students')
      ]);
      setElectionActive(statusRes.data.active);
      setCandidates(candidatesRes.data);
      setStudents(studentsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleElection = async () => {
    try {
      const res = await axios.put('/admin/status', { active: !electionActive });
      setElectionActive(res.data.setting.value);
    } catch (err) {
      alert('Failed to toggle election status');
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    try {
      await axios.delete(`/candidates/${id}`);
      setCandidates(candidates.filter(c => c._id !== id));
    } catch (err) {
      alert('Failed to delete candidate');
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/candidates', newCandidate);
      setCandidates([...candidates, res.data]);
      setShowAddForm(false);
      setNewCandidate({ name: '', department: '', position: '', manifesto: '', image: '' });
    } catch (err) {
      alert('Failed to add candidate');
    }
  };

  const handlePromoteAdmin = async (id, name) => {
    if (!window.confirm(`Are you sure you want to promote ${name} to an Admin? They will have full access.`)) return;
    try {
      const res = await axios.put(`/admin/students/${id}/promote`);
      setStudents(students.map(s => s._id === id ? res.data.student : s));
      alert(res.data.message);
    } catch (err) {
      alert('Failed to promote user');
    }
  };

  const handleDemoteAdmin = async (id, name) => {
    if (!window.confirm(`Are you sure you want to demote ${name} back to a regular Student?`)) return;
    try {
      const res = await axios.put(`/admin/students/${id}/demote`);
      setStudents(students.map(s => s._id === id ? res.data.student : s));
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to demote user');
    }
  };

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    try {
      const payload = {};
      if (credentials.name) payload.name = credentials.name;
      if (credentials.studentId) payload.studentId = credentials.studentId;
      if (credentials.password) payload.password = credentials.password;
      
      const res = await axios.put('/profile', payload);
      alert(res.data.message);
      setShowCredForm(false);
      setCredentials({ name: '', studentId: '', password: '' });
      // Usually user should log out to test new credentials
      logout();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update credentials');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-gray-800 text-white p-4 shadow-md flex justify-between items-center">
        <div className="font-bold text-xl flex items-center gap-2">
          <Settings /> Admin Control Panel
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-300">Admin: {user?.name}</span>
          <button onClick={() => setShowCredForm(!showCredForm)} className="hover:text-blue-400 transition flex items-center gap-1">
            <Key size={18} /> Update Credentials
          </button>
          <Link to="/results" className="hover:text-blue-400 transition flex items-center gap-1">
            <Activity size={18} /> View Results
          </Link>
          <button onClick={logout} className="p-2 hover:bg-gray-700 rounded transition flex items-center gap-1">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col gap-6">
        
        {showCredForm && (
          <section className="bg-white p-6 rounded-xl shadow-sm border mt-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Change Admin Credentials</h2>
            <form onSubmit={handleUpdateCredentials} className="flex flex-col md:flex-row gap-4">
              <input 
                placeholder="New Name (e.g. Head Admin)" 
                className="p-2 border rounded flex-1" 
                value={credentials.name} 
                onChange={e => setCredentials({...credentials, name: e.target.value})} 
              />
              <input 
                placeholder="New Student ID (e.g. admin123)" 
                className="p-2 border rounded flex-1" 
                value={credentials.studentId} 
                onChange={e => setCredentials({...credentials, studentId: e.target.value})} 
              />
              <input 
                type="password"
                placeholder="New Password" 
                className="p-2 border rounded flex-1" 
                value={credentials.password} 
                onChange={e => setCredentials({...credentials, password: e.target.value})} 
              />
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700">Save & Logout</button>
            </form>
          </section>
        )}

        {/* Election Controls Layer */}
        <section className="bg-white p-6 rounded-xl shadow-sm border flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Global Election Status</h2>
            <p className="text-gray-500 text-sm">When active, students can sign in and cast their votes.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full font-bold text-sm ${electionActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {electionActive ? '🔴 ELECTION IS ACTIVE' : '⏹ ELECTION CLOSED'}
            </div>
            
            <button 
              onClick={handleToggleElection}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white transition-colors ${electionActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
            >
              {electionActive ? <><Square size={18} /> Stop Election</> : <><Play size={18} /> Start Election</>}
            </button>
          </div>
        </section>

        {/* Candidates Management Layer */}
        <section className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-2">
              <Users className="text-gray-600" />
              <h2 className="text-xl font-bold text-gray-800">Manage Candidates</h2>
            </div>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium text-sm"
            >
              <PlusCircle size={18} /> {showAddForm ? 'Cancel' : 'Add Candidate'}
            </button>
          </div>

          {showAddForm && (
            <div className="p-6 bg-blue-50 border-b">
              <form onSubmit={handleAddCandidate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Candidate Name" className="p-2 border rounded" value={newCandidate.name} onChange={e => setNewCandidate({...newCandidate, name: e.target.value})} />
                <input required placeholder="Department (e.g. Science)" className="p-2 border rounded" value={newCandidate.department} onChange={e => setNewCandidate({...newCandidate, department: e.target.value})} />
                <input required placeholder="Position (e.g. President)" className="p-2 border rounded" value={newCandidate.position} onChange={e => setNewCandidate({...newCandidate, position: e.target.value})} />
                <input placeholder="Image URL" className="p-2 border rounded" value={newCandidate.image} onChange={e => setNewCandidate({...newCandidate, image: e.target.value})} />
                <textarea placeholder="Manifesto / Bio" className="p-2 border rounded md:col-span-2" value={newCandidate.manifesto} onChange={e => setNewCandidate({...newCandidate, manifesto: e.target.value})} />
                <div className="md:col-span-2 flex justify-end">
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700">Save Candidate</button>
                </div>
              </form>
            </div>
          )}

          <div className="p-0">
            {candidates.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No candidates available. Register one above.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Position & Dept</th>
                    <th className="p-4 font-semibold">Current Votes</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {candidates.map(candidate => (
                    <tr key={candidate._id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-gray-800">{candidate.name}</td>
                      <td className="p-4 text-gray-600">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs border">{candidate.position}</span>
                        <span className="ml-2 text-sm text-gray-500">{candidate.department}</span>
                      </td>
                      <td className="p-4 font-bold text-blue-600 text-lg">{candidate.voteCount}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDeleteCandidate(candidate._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded transition inline-flex items-center gap-1 text-sm"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Users & Admins Management Layer */}
        <section className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-2">
              <UserCheck className="text-gray-600" />
              <h2 className="text-xl font-bold text-gray-800">User Management</h2>
            </div>
          </div>
          <div className="p-0">
            {students.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No users found in the system.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                    <th className="p-4 font-semibold">Student Name</th>
                    <th className="p-4 font-semibold">ID & Dept</th>
                    <th className="p-4 font-semibold">Current Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map(s => (
                    <tr key={s._id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-gray-800">{s.name}</td>
                      <td className="p-4 text-gray-600">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs border">{s.studentId}</span>
                        <span className="ml-2 text-sm text-gray-500">{s.department}</span>
                      </td>
                      <td className="p-4 font-bold">
                        {s.role === 'admin' ? (
                          <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs border border-blue-200">ADMIN</span>
                        ) : s.hasVoted ? (
                          <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs border border-green-200">VOTED</span>
                        ) : (
                          <span className="text-gray-500 bg-gray-50 px-2 py-1 rounded text-xs border group-hover:bg-gray-100">PENDING VOTE</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {s.role !== 'admin' && s.role !== 'superadmin' && (
                          <button 
                            onClick={() => handlePromoteAdmin(s._id, s.name)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition inline-flex items-center gap-1 text-sm font-medium border mr-2"
                          >
                            <Shield size={16} /> Promote to Admin
                          </button>
                        )}
                        {s.role === 'admin' && user?.role === 'superadmin' && (
                          <button 
                            onClick={() => handleDemoteAdmin(s._id, s.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition inline-flex items-center gap-1 text-sm font-medium border border-red-200"
                          >
                            <UserCheck size={16} /> Demote to Student
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

      </main>
    </div>
  );
};

export default AdminDashboard;
