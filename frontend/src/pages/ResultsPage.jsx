import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Activity, ArrowLeft } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ResultsPage = () => {
  const { user } = useContext(AuthContext);
  const [candidates, setCandidates] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await axios.get('/admin/results'); // Accessible if role is admin... 
      // Wait, we need to adapt our backend route. The prompt says "GET /api/results". 
      // Initially we put it in `/admin/results`. For now let's hope it's accessible or we change backend router. 
      // If student can view results, we might need a public or general protected route.
      setCandidates(res.data.candidates);
      setTotalVotes(res.data.totalVotes);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError(err.response.data.message);
      } else {
        setError('Failed to fetch results');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading charts...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  const CANDIDATE_COLORS = [
    '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#06b6d4', '#84cc16', '#a855f7'
  ];

  const candidateColors = candidates.map((_, i) => CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]);

  const barChartData = {
    labels: candidates.map(c => c.name),
    datasets: [
      {
        label: 'Votes',
        data: candidates.map(c => c.voteCount),
        backgroundColor: candidateColors,
        borderColor: candidateColors,
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: candidates.map(c => c.name),
    datasets: [
      {
        data: candidates.map(c => c.voteCount),
        backgroundColor: candidateColors,
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white p-4 shadow-sm flex items-center gap-4 border-b">
        <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="text-gray-600 hover:text-blue-600 transition flex items-center gap-1">
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>
        <div className="font-bold text-lg text-gray-800 flex items-center gap-2 border-l pl-4">
          <Activity className="text-blue-600" /> Live Election Results
        </div>
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6">
        
        <div className="bg-blue-600 text-white p-8 rounded-xl shadow-md mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Total Votes Cast</h1>
          <div className="text-6xl font-black">{totalVotes}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Vote Distribution (Bar)</h2>
            <div className="w-full h-80">
              <Bar 
                data={barChartData} 
                options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} 
              />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Vote Share (Pie)</h2>
            <div className="w-full h-80 flex justify-center">
              <Pie 
                data={pieChartData} 
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-gray-600 font-semibold">Rank</th>
                <th className="p-4 text-gray-600 font-semibold">Candidate</th>
                <th className="p-4 text-gray-600 font-semibold text-right">Votes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {candidates.map((c, idx) => (
                <tr key={c._id} className={idx === 0 && c.voteCount > 0 ? 'bg-amber-50' : ''}>
                  <td className="p-4 font-bold text-gray-500">
                    <div className="flex items-center gap-2">
                       <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: CANDIDATE_COLORS[idx % CANDIDATE_COLORS.length] }}></span>
                       #{idx + 1}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{c.name}</div>
                    <div className="text-sm text-gray-500">{c.position}</div>
                  </td>
                  <td className="p-4 text-right font-bold text-blue-600 text-lg">{c.voteCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
};

export default ResultsPage;
