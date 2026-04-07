import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Vote, CheckCircle2 } from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [candidates, setCandidates] = useState([]);
  const [electionActive, setElectionActive] = useState(false);
  const [hasVoted, setHasVoted] = useState(user?.hasVoted || false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statusRes, candidatesRes] = await Promise.all([
        axios.get('/admin/status'),
        axios.get('/candidates')
      ]);
      setElectionActive(statusRes.data.active);
      setCandidates(candidatesRes.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate) return;
    setError('');
    
    // Add vote confirmation popup
    if (!window.confirm(`Are you sure you want to vote for ${selectedCandidate.name}? You cannot change your vote.`)) {
      return;
    }

    try {
      await axios.post('/vote', { candidateId: selectedCandidate._id });
      setHasVoted(true);
      setSuccess('Your vote has been recorded successfully!');
      
      // Update local user state
      const updatedUser = { ...user, hasVoted: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit vote');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
        <div className="font-bold text-xl flex items-center gap-2">
          <Vote /> Student Voting Portal
        </div>
        <div className="flex items-center gap-4">
          <span>Welcome, {user?.name} ({user?.studentId})</span>
          <button onClick={logout} className="p-2 hover:bg-blue-700 rounded transition flex items-center gap-1">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6">
        {error && <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-6">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6 flex items-center gap-2"><CheckCircle2 /> {success}</div>}

        {!electionActive ? (
          <div className="bg-white p-10 rounded-xl shadow-sm text-center border mt-10">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Election is currently closed</h2>
            <p className="text-gray-500 mb-6">Please check back later or view the results if they have been released.</p>
            <button 
              onClick={() => window.location.href = '/results'}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md"
            >
              View Election Results
            </button>
          </div>
        ) : hasVoted ? (
          <div className="bg-white p-10 rounded-xl shadow-sm text-center border mt-10">
            <div className="flex justify-center mb-4 text-green-500">
              <CheckCircle2 size={64} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">You Have Voted!</h2>
            <p className="text-gray-600">Thank you for participating in the election. Your vote has been securely recorded.</p>
            <button 
              onClick={() => window.location.href = '/results'}
              className="mt-6 px-6 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium"
            >
              View Results
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-blue-100 border-l-4 border-l-blue-500">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Cast Your Vote</h2>
              <p className="text-gray-600">Review the candidates below and select one to cast your secure vote. You may only vote once.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates.map(candidate => (
                <div 
                  key={candidate._id} 
                  className={`bg-white rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${selectedCandidate?._id === candidate._id ? 'border-blue-500 shadow-md ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300 shadow-sm'}`}
                  onClick={() => setSelectedCandidate(candidate)}
                >
                  <div className="h-48 bg-gray-200 w-full object-cover flex items-center justify-center text-gray-400">
                    {candidate.image ? (
                      <img src={candidate.image} alt={candidate.name} className="h-full w-full object-cover" />
                    ) : 'No Image'}
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{candidate.name}</h3>
                    <div className="text-sm font-medium text-blue-600 mb-3">{candidate.position} - {candidate.department}</div>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{candidate.manifesto || 'No manifesto provided.'}</p>
                    
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="candidate" 
                        checked={selectedCandidate?._id === candidate._id} 
                        readOnly
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm font-medium">Select Candidate</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {candidates.length === 0 && (
              <div className="text-center p-10 bg-white rounded-xl border text-gray-500">
                No candidates available.
              </div>
            )}

            {selectedCandidate && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex justify-center items-center gap-6 z-10">
                <div className="text-gray-700">
                  Ready to vote for <span className="font-bold">{selectedCandidate.name}</span>?
                </div>
                <button
                  onClick={handleVote}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Final Vote
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
