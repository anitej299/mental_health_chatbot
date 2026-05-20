import React, { useState, useEffect } from 'react';
import Chatbot from './Chatbot';

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [moodHistory, setMoodHistory] = useState([]);
  const [dailyCheckin, setDailyCheckin] = useState({
    mood: '',
    energy: '',
    sleep: ''
  });

  // Load mood history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('moodHistory');
    if (savedHistory) {
      setMoodHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleDailyCheckin = (e) => {
    e.preventDefault();
    if (dailyCheckin.mood && dailyCheckin.energy && dailyCheckin.sleep) {
      const newCheckin = {
        ...dailyCheckin,
        date: new Date().toLocaleDateString(),
        timestamp: new Date().toISOString()
      };
      
      const updatedHistory = [newCheckin, ...moodHistory.slice(0, 9)]; // Keep last 10 entries
      setMoodHistory(updatedHistory);
      localStorage.setItem('moodHistory', JSON.stringify(updatedHistory));
      
      setDailyCheckin({ mood: '', energy: '', sleep: '' });
      alert('Daily check-in saved!');
    }
  };

  const getMoodStats = () => {
    if (moodHistory.length === 0) return null;
    
    const moodCounts = moodHistory.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});

    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b
    );

    return {
      totalCheckins: moodHistory.length,
      mostCommonMood,
      averageEnergy: (moodHistory.reduce((sum, entry) => sum + parseInt(entry.energy), 0) / moodHistory.length).toFixed(1)
    };
  };

  const moodStats = getMoodStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white bg-opacity-95 backdrop-filter backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
                  Mindful AI Companion
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <button
                onClick={onLogout}
                className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-xl font-medium hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-300 shadow-md transform active:scale-95 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'chat', name: 'Chat', icon: '💬' },
              { id: 'checkin', name: 'Daily Check-in', icon: '📊' },
              { id: 'history', name: 'Mood History', icon: '📈' },
              { id: 'resources', name: 'Resources', icon: '📚' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'chat' && (
          <div className="px-4 py-6">
            <Chatbot />
          </div>
        )}

        {activeTab === 'checkin' && (
          <div className="px-4 py-6">
            <div className="bg-white bg-opacity-95 backdrop-filter backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-gray-100 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Daily Check-in</h2>
              <form onSubmit={handleDailyCheckin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How are you feeling today?
                  </label>
                  <select
                    value={dailyCheckin.mood}
                    onChange={(e) => setDailyCheckin({...dailyCheckin, mood: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">Select your mood</option>
                    <option value="excited">😊 Excited</option>
                    <option value="happy">😄 Happy</option>
                    <option value="calm">😌 Calm</option>
                    <option value="tired">😴 Tired</option>
                    <option value="anxious">😰 Anxious</option>
                    <option value="sad">😔 Sad</option>
                    <option value="angry">😠 Angry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Energy Level (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={dailyCheckin.energy}
                    onChange={(e) => setDailyCheckin({...dailyCheckin, energy: e.target.value})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low (1)</span>
                    <span className="font-medium">{dailyCheckin.energy || 5}</span>
                    <span>High (10)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sleep Quality (hours)
                  </label>
                  <select
                    value={dailyCheckin.sleep}
                    onChange={(e) => setDailyCheckin({...dailyCheckin, sleep: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">Select sleep duration</option>
                    <option value="less4">Less than 4 hours</option>
                    <option value="4-6">4-6 hours</option>
                    <option value="6-8">6-8 hours</option>
                    <option value="8plus">8+ hours</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 shadow-md transform active:scale-95"
                >
                  Save Check-in
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="px-4 py-6">
            <div className="bg-white bg-opacity-95 backdrop-filter backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Mood History & Insights</h2>
              
              {moodStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Total Check-ins</h3>
                    <p className="text-3xl font-bold text-blue-600">{moodStats.totalCheckins}</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                    <h3 className="text-lg font-semibold text-purple-800 mb-2">Most Common Mood</h3>
                    <p className="text-3xl font-bold text-purple-600 capitalize">{moodStats.mostCommonMood}</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Avg Energy</h3>
                    <p className="text-3xl font-bold text-green-600">{moodStats.averageEnergy}/10</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Check-ins</h3>
                {moodHistory.length > 0 ? (
                  moodHistory.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">
                          {entry.mood === 'excited' && '😊'}
                          {entry.mood === 'happy' && '😄'}
                          {entry.mood === 'calm' && '😌'}
                          {entry.mood === 'tired' && '😴'}
                          {entry.mood === 'anxious' && '😰'}
                          {entry.mood === 'sad' && '😔'}
                          {entry.mood === 'angry' && '😠'}
                        </span>
                        <div>
                          <p className="font-medium text-gray-800 capitalize">{entry.mood}</p>
                          <p className="text-sm text-gray-600">{entry.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-800">Energy: {entry.energy}/10</p>
                        <p className="text-sm text-gray-600">Sleep: {entry.sleep}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No check-in data yet. Start with a daily check-in!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="px-4 py-6">
            <div className="bg-white bg-opacity-95 backdrop-filter backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Mental Health Resources</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">Crisis Hotlines</h3>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li>National Suicide Prevention: <strong>988</strong></li>
                    <li>Crisis Text Line: Text <strong>HOME</strong> to 741741</li>
                    <li>SAMHSA Helpline: <strong>1-800-662-4357</strong></li>
                  </ul>
                </div>

                <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">Self-Care Tips</h3>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li>• Practice deep breathing exercises</li>
                    <li>• Take regular breaks throughout the day</li>
                    <li>• Maintain a consistent sleep schedule</li>
                    <li>• Stay connected with loved ones</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3">Meditation Resources</h3>
                  <ul className="space-y-2 text-sm text-purple-700">
                    <li>• Headspace (App)</li>
                    <li>• Calm (App)</li>
                    <li>• Insight Timer (App)</li>
                    <li>• YouTube meditation guides</li>
                  </ul>
                </div>

                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                  <h3 className="text-lg font-semibold text-orange-800 mb-3">Professional Help</h3>
                  <ul className="space-y-2 text-sm text-orange-700">
                    <li>• Psychology Today Therapist Directory</li>
                    <li>• BetterHelp Online Therapy</li>
                    <li>• TalkSpace Online Counseling</li>
                    <li>• Local mental health clinics</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
                <p className="text-yellow-800 text-sm text-center">
                  <strong>Remember:</strong> This AI companion is not a substitute for professional medical advice. 
                  If you're experiencing a mental health emergency, please contact emergency services immediately.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(to right, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(to right, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;