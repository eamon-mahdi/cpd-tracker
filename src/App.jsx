import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Download, Settings, Search, Filter, Edit2, BarChart3, TrendingUp, Award, Clock } from 'lucide-react';

const CPDTracker = () => {
  const domains = [
    'Professional Knowledge and Practice',
    'Quality and Safety',
    'Communication and Interpersonal Skills',
    'Management and Leadership',
    'Teaching and Training',
    'Research and Innovation'
  ];

  const activityTypes = [
    'Course/Conference',
    'Journal Club',
    'Teaching/Training',
    'Audit/Service Improvement',
    'Research/Publication',
    'Mentoring/Supervision',
    'Case Review/Clinicopathology',
    'e-Learning/Online Module',
    'Professional Reading',
    'Presentation',
    'Committee Work',
    'Other'
  ];

  const [professional, setProfessional] = useState(() => {
    try {
      const saved = localStorage?.getItem('cpdProfessional');
      return saved ? JSON.parse(saved) : {
        name: '',
        gmcNumber: '',
        position: '',
        healthBoard: '',
        specialty: 'Haematology',
        subspecialties: '',
        qualifications: '',
        portfolioPeriod: '',
        appraisalFrequency: 'Annual',
        revalidationDate: '',
        trainingGrade: '',
        department: '',
        email: '',
        phone: ''
      };
    } catch {
      return {
        name: '',
        gmcNumber: '',
        position: '',
        healthBoard: '',
        specialty: 'Haematology',
        subspecialties: '',
        qualifications: '',
        portfolioPeriod: '',
        appraisalFrequency: 'Annual',
        revalidationDate: '',
        trainingGrade: '',
        department: '',
        email: '',
        phone: ''
      };
    }
  });

  const [activities, setActivities] = useState(() => {
    try {
      const saved = localStorage?.getItem('cpdActivities');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    activity: '',
    domain: domains[0],
    type: 'Course/Conference',
    provider: '',
    location: '',
    hours: '',
    credits: '',
    reflection: '',
    keyLearnings: '',
    applicationToWork: '',
    evidence: '',
    mandatory: false,
    multiDomain: [],
    certifications: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState('summary');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDomain, setFilterDomain] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterMandatory, setFilterMandatory] = useState('All');
  const [expandedActivity, setExpandedActivity] = useState(null);

  useEffect(() => {
    try {
      localStorage?.setItem('cpdProfessional', JSON.stringify(professional));
    } catch {}
  }, [professional]);

  useEffect(() => {
    try {
      localStorage?.setItem('cpdActivities', JSON.stringify(activities));
    } catch {}
  }, [activities]);

  const handleProfessionalChange = (e) => {
    const { name, value } = e.target;
    setProfessional(prev => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'hours' || name === 'credits' ? parseFloat(value) || '' : value)
    }));
  };

  const handleMultiDomainChange = (domain) => {
    setFormData(prev => ({
      ...prev,
      multiDomain: prev.multiDomain.includes(domain)
        ? prev.multiDomain.filter(d => d !== domain)
        : [...prev.multiDomain, domain]
    }));
  };

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!formData.activity || !formData.hours) {
      alert('Please fill in activity name and hours');
      return;
    }

    if (editingId) {
      setActivities(activities.map(a => 
        a.id === editingId 
          ? { ...formData, id: editingId, timestamp: a.timestamp }
          : a
      ));
      setEditingId(null);
    } else {
      const newActivity = {
        id: Date.now(),
        ...formData,
        hours: parseFloat(formData.hours),
        credits: formData.credits ? parseFloat(formData.credits) : 0,
        timestamp: new Date().toISOString()
      };
      setActivities([...activities, newActivity]);
    }

    setFormData({
      date: new Date().toISOString().split('T')[0],
      activity: '',
      domain: domains[0],
      type: 'Course/Conference',
      provider: '',
      location: '',
      hours: '',
      credits: '',
      reflection: '',
      keyLearnings: '',
      applicationToWork: '',
      evidence: '',
      mandatory: false,
      multiDomain: [],
      certifications: ''
    });
    setShowForm(false);
  };

  const handleEditActivity = (activity) => {
    setFormData(activity);
    setEditingId(activity.id);
    setShowForm(true);
  };

  const handleDeleteActivity = (id) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      setActivities(activities.filter(a => a.id !== id));
    }
  };

  const calculateStats = (activitiesList = activities) => {
    const stats = {};
    let totalHours = 0;
    let totalActivities = 0;
    let totalCredits = 0;
    let mandatoryHours = 0;

    domains.forEach(domain => {
      const domainActivities = activitiesList.filter(a => a.domain === domain || a.multiDomain.includes(domain));
      const domainHours = domainActivities.reduce((sum, a) => sum + a.hours, 0);
      stats[domain] = {
        count: domainActivities.length,
        hours: domainHours,
        activities: domainActivities
      };
      totalHours += domainHours;
      totalActivities += activitiesList.length;
    });

    totalCredits = activitiesList.reduce((sum, a) => sum + (a.credits || 0), 0);
    mandatoryHours = activitiesList.filter(a => a.mandatory).reduce((sum, a) => sum + a.hours, 0);

    return { stats, totalHours, totalActivities, totalCredits, mandatoryHours };
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.reflection.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.keyLearnings.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = filterDomain === 'All' || activity.domain === filterDomain || activity.multiDomain.includes(filterDomain);
    const matchesType = filterType === 'All' || activity.type === filterType;
    const matchesMandatory = filterMandatory === 'All' || (filterMandatory === 'mandatory' ? activity.mandatory : !activity.mandatory);
    return matchesSearch && matchesDomain && matchesType && matchesMandatory;
  });

  const { stats: displayStats, totalHours: displayHours, totalActivities: displayActivities, totalCredits: displayCredits, mandatoryHours: displayMandatoryHours } = calculateStats(filteredActivities);
  const allStats = calculateStats(activities);

  const getActivityTypeIcon = (type) => {
    const icons = {
      'Course/Conference': '🎓',
      'Journal Club': '📖',
      'Teaching/Training': '👨‍🏫',
      'Audit/Service Improvement': '✅',
      'Research/Publication': '🔬',
      'Mentoring/Supervision': '👥',
      'Case Review/Clinicopathology': '🔍',
      'e-Learning/Online Module': '💻',
      'Professional Reading': '📚',
      'Presentation': '🎤',
      'Committee Work': '📋',
      'Other': '📌'
    };
    return icons[type] || '📌';
  };

  const generateComprehensivePDF = () => {
    let pdfHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CPD Portfolio - ${professional.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
          }
          
          @page { margin: 20mm; size: A4; }
          @media print { 
            body { margin: 0; padding: 0; }
            .page { page-break-after: always; }
            .no-page-break { page-break-inside: avoid; }
          }
          
          .header {
            background: linear-gradient(135deg, #1a5490 0%, #2e5c8a 100%);
            color: white;
            padding: 40px;
            border-radius: 8px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          
          .header-title {
            text-align: center;
            margin-bottom: 30px;
          }
          
          .header-title h1 {
            font-size: 32px;
            margin-bottom: 5px;
          }
          
          .header-title p {
            font-size: 14px;
            opacity: 0.95;
          }
          
          .header-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-top: 20px;
          }
          
          .header-item {
            border-bottom: 2px solid rgba(255,255,255,0.3);
            padding-bottom: 10px;
          }
          
          .header-label {
            font-size: 11px;
            text-transform: uppercase;
            opacity: 0.9;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
          
          .header-value {
            font-size: 14px;
            font-weight: bold;
            margin-top: 5px;
          }
          
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          
          .section-title {
            background: linear-gradient(135deg, #2e5c8a 0%, #3d7ba8 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 6px 6px 0 0;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 0;
          }
          
          .section-content {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 0 0 6px 6px;
            border: 1px solid #ddd;
            border-top: none;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .summary-card {
            background: white;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #1a5490;
            text-align: center;
          }
          
          .summary-value {
            font-size: 28px;
            font-weight: bold;
            color: #1a5490;
            margin: 10px 0;
          }
          
          .summary-label {
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
            font-weight: 600;
          }
          
          .domain-section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          
          .domain-header {
            background: linear-gradient(135deg, #2e5c8a 0%, #3d7ba8 100%);
            color: white;
            padding: 12px 15px;
            border-radius: 6px 6px 0 0;
            font-size: 14px;
            font-weight: bold;
          }
          
          .domain-stats {
            background: white;
            padding: 15px;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 6px 6px;
          }
          
          .domain-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 15px;
          }
          
          .domain-stat {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            border-left: 3px solid #1a5490;
          }
          
          .stat-label {
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
            font-weight: 600;
          }
          
          .stat-value {
            font-size: 18px;
            font-weight: bold;
            color: #1a5490;
            margin-top: 5px;
          }
          
          .activity {
            background: white;
            padding: 12px;
            margin-bottom: 10px;
            border-radius: 4px;
            border-left: 3px solid #2e5c8a;
            page-break-inside: avoid;
          }
          
          .activity-title {
            font-weight: bold;
            color: #333;
            font-size: 12px;
          }
          
          .activity-meta {
            font-size: 10px;
            color: #666;
            margin-top: 5px;
          }
          
          .activity-details {
            font-size: 10px;
            color: #555;
            margin-top: 5px;
            padding-top: 5px;
            border-top: 1px solid #ddd;
          }
          
          .badge {
            display: inline-block;
            background: #1a5490;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 9px;
            margin-right: 5px;
            margin-top: 3px;
          }
          
          .mandatory-badge {
            background: #ef4444;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <!-- Header with Professional Details -->
        <div class="header">
          <div class="header-title">
            <h1>Continuing Professional Development (CPD) Portfolio</h1>
            <p>Royal College of Pathologists (RCPath) - Revalidation Document</p>
          </div>
          <div class="header-grid">
            <div class="header-item">
              <div class="header-label">Name</div>
              <div class="header-value">${professional.name || 'Not specified'}</div>
            </div>
            <div class="header-item">
              <div class="header-label">GMC Number</div>
              <div class="header-value">${professional.gmcNumber || 'Not specified'}</div>
            </div>
            <div class="header-item">
              <div class="header-label">Position</div>
              <div class="header-value">${professional.position || 'Not specified'}</div>
            </div>
            <div class="header-item">
              <div class="header-label">Health Board</div>
              <div class="header-value">${professional.healthBoard || 'Not specified'}</div>
            </div>
            <div class="header-item">
              <div class="header-label">Specialty</div>
              <div class="header-value">${professional.specialty}${professional.subspecialties ? ' (' + professional.subspecialties + ')' : ''}</div>
            </div>
            <div class="header-item">
              <div class="header-label">Portfolio Period</div>
              <div class="header-value">${professional.portfolioPeriod || 'Not specified'}</div>
            </div>
            <div class="header-item">
              <div class="header-label">Department</div>
              <div class="header-value">${professional.department || 'Not specified'}</div>
            </div>
            <div class="header-item">
              <div class="header-label">Revalidation Date</div>
              <div class="header-value">${professional.revalidationDate || 'Not specified'}</div>
            </div>
            <div class="header-item">
              <div class="header-label">Qualifications</div>
              <div class="header-value">${professional.qualifications || 'Not specified'}</div>
            </div>
          </div>
        </div>

        <!-- Summary Section -->
        <div class="section">
          <div class="section-title">Summary</div>
          <div class="section-content">
            <div class="summary-grid">
              <div class="summary-card">
                <div class="summary-label">Total Hours</div>
                <div class="summary-value">${allStats.totalHours}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Total Activities</div>
                <div class="summary-value">${allStats.totalActivities}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">CME Credits</div>
                <div class="summary-value">${allStats.totalCredits.toFixed(0)}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Domains Covered</div>
                <div class="summary-value">${Object.values(allStats.stats).filter(s => s.count > 0).length}/6</div>
              </div>
            </div>
            <p style="font-size: 11px; color: #666; margin-top: 15px;">
              <strong>Report Generated:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}<br>
              <strong>Mandatory Training Hours:</strong> ${allStats.mandatoryHours}h<br>
              <strong>Professional Development Credits:</strong> ${allStats.totalCredits.toFixed(1)}
            </p>
          </div>
        </div>

        <!-- Domain Sections -->
        ${domains.map(domain => {
          const domainStats = allStats.stats[domain];
          
          return \`
            <div class="domain-section no-page-break">
              <div class="domain-header">\${domain}</div>
              <div class="domain-stats">
                <div class="domain-grid">
                  <div class="domain-stat">
                    <div class="stat-label">Hours</div>
                    <div class="stat-value">\${domainStats.hours}h</div>
                  </div>
                  <div class="domain-stat">
                    <div class="stat-label">Activities</div>
                    <div class="stat-value">\${domainStats.count}</div>
                  </div>
                  <div class="domain-stat">
                    <div class="stat-label">Avg Hours/Activity</div>
                    <div class="stat-value">\${domainStats.count > 0 ? (domainStats.hours / domainStats.count).toFixed(1) : '0'}h</div>
                  </div>
                </div>
                
                <div>
                  \${domainStats.activities.length > 0 
                    ? domainStats.activities.map(activity => \`
                      <div class="activity">
                        <div class="activity-title">\${activity.activity}</div>
                        <div class="activity-meta">
                          📅 \${new Date(activity.date).toLocaleDateString()} | 
                          ⏱️ \${activity.hours}h | 
                          \${getActivityTypeIcon(activity.type)} \${activity.type}
                          \${activity.mandatory ? '<span class="badge mandatory-badge">MANDATORY</span>' : ''}
                        </div>
                        <div class="activity-details">
                          \${activity.provider ? '<strong>Provider:</strong> ' + activity.provider + '<br>' : ''}
                          \${activity.location ? '<strong>Location:</strong> ' + activity.location + '<br>' : ''}
                          \${activity.credits ? '<strong>Credits:</strong> ' + activity.credits + '<br>' : ''}
                          \${activity.keyLearnings ? '<strong>Key Learnings:</strong> ' + activity.keyLearnings.substring(0, 100) + '...<br>' : ''}
                          \${activity.reflection ? '<strong>Reflection:</strong> "' + activity.reflection.substring(0, 100) + '..."' : ''}
                        </div>
                      </div>
                    \`).join('')
                    : '<p style="color: #999; font-style: italic; font-size: 10px;">No activities recorded in this domain.</p>'
                  }
                </div>
              </div>
            </div>
          \`;
        }).join('')}

        <!-- Footer -->
        <div class="footer">
          <p>
            This CPD portfolio documents continuing professional development in accordance with the Royal College of Pathologists 
            Framework for Maintenance of Certification and Revalidation requirements.
          </p>
          <p style="margin-top: 10px; color: #999;">
            Document automatically generated by CPD Tracker System
          </p>
        </div>
      </body>
      </html>
    \`;

    const printWindow = window.open('', '', 'height=1000,width=900');
    printWindow.document.write(pdfHTML);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  const exportToCSV = () => {
    if (activities.length === 0) {
      alert('No activities to export');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    
    csvContent += 'CPD PORTFOLIO EXPORT\n';
    csvContent += \`Generated,\${new Date().toLocaleString()}\n\n\`;
    csvContent += 'PROFESSIONAL DETAILS\n';
    csvContent += \`Name,\${professional.name}\n\`;
    csvContent += \`GMC Number,\${professional.gmcNumber}\n\`;
    csvContent += \`Position,\${professional.position}\n\`;
    csvContent += \`Health Board,\${professional.healthBoard}\n\`;
    csvContent += \`Specialty,\${professional.specialty}\n\`;
    csvContent += \`Department,\${professional.department}\n\`;
    csvContent += \`Portfolio Period,\${professional.portfolioPeriod}\n\n\`;

    csvContent += 'SUMMARY STATISTICS\n';
    csvContent += \`Total Hours,\${allStats.totalHours}\n\`;
    csvContent += \`Total Activities,\${allStats.totalActivities}\n\`;
    csvContent += \`CME Credits,\${allStats.totalCredits}\n\`;
    csvContent += \`Mandatory Hours,\${allStats.mandatoryHours}\n\`;
    csvContent += \`Domains Covered,\${Object.values(allStats.stats).filter(s => s.count > 0).length}/6\n\n\`;

    csvContent += 'DOMAIN SUMMARY\n';
    csvContent += 'Domain,Hours,Activities\n';
    domains.forEach(domain => {
      const domainStats = allStats.stats[domain];
      csvContent += \`"\${domain}",\${domainStats.hours},\${domainStats.count}\n\`;
    });
    csvContent += '\n';

    csvContent += 'DETAILED ACTIVITIES\n';
    csvContent += 'Date,Activity,Domain,Type,Provider,Location,Hours,Credits,Mandatory,Key Learnings,Application,Reflection,Evidence\n';
    activities.forEach(activity => {
      csvContent += \`\${activity.date},"\${activity.activity}","\${activity.domain}","\${activity.type}","\${activity.provider || ''}","\${activity.location || ''}",\${activity.hours},"\${activity.credits || ''}","\${activity.mandatory ? 'Yes' : 'No'}","\${(activity.keyLearnings || '').replace(/"/g, '""')}","\${(activity.applicationToWork || '').replace(/"/g, '""')}","\${(activity.reflection || '').replace(/"/g, '""')}","\${(activity.evidence || '').replace(/"/g, '""')}"\n\`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', \`CPD_Portfolio_\${professional.name || 'Export'}_\${new Date().toISOString().split('T')[0]}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <style>{\`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Crimson+Text:wght@400;600&display=swap');
        
        * { font-family: 'Poppins', sans-serif; }
        h1, h2, h3 { font-family: 'Crimson Text', serif; }

        .domain-stat { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .domain-stat:hover { transform: translateY(-2px); }
        .activity-card { animation: slideIn 0.3s ease-out; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .glow { box-shadow: 0 0 20px rgba(26, 84, 144, 0.3); }
        input, textarea, select { transition: all 0.2s; }
        input:focus, textarea:focus, select:focus { outline: none; box-shadow: 0 0 0 3px rgba(26, 84, 144, 0.3) !important; }

        .tab-button { transition: all 0.2s; }
        .tab-button:hover { transform: translateY(-2px); }

        .activity-expanded {
          background: rgba(30, 41, 59, 0.6);
          border-left: 4px solid #10b981;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 10px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          overflow-y: auto;
        }

        .modal-content {
          background: #1e293b;
          border-radius: 12px;
          padding: 30px;
          max-height: 90vh;
          overflow-y: auto;
          max-width: 900px;
          width: 95%;
          margin: 20px auto;
        }
      \`}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">CPD Portfolio</h1>
          <p className="text-slate-400 text-sm md:text-base">Comprehensive Continuing Professional Development Tracker</p>
        </div>

        {/* Professional Details Banner */}
        {professional.name && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 md:p-6 mb-8 text-white glow">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 text-xs md:text-sm">
              <div><span className="opacity-70">Name:</span> <strong className="block">{professional.name}</strong></div>
              <div><span className="opacity-70">GMC:</span> <strong className="block">{professional.gmcNumber}</strong></div>
              <div><span className="opacity-70">Position:</span> <strong className="block">{professional.position}</strong></div>
              <div><span className="opacity-70">Health Board:</span> <strong className="block">{professional.healthBoard}</strong></div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-8 justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {['summary', 'activities', 'domains', 'analytics'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`tab-button px-3 md:px-5 py-2 rounded-lg font-semibold transition-all text-xs md:text-base ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white shadow-lg glow'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 md:px-4 py-2 rounded-lg transition-all text-xs md:text-base"
          >
            <Settings size={16} /> Details
          </button>
        </div>

        {/* Professional Details Modal */}
        {showSettings && (
          <div className="modal-overlay" onClick={() => setShowSettings(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Settings size={20} /> Professional Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name *"
                  value={professional.name}
                  onChange={handleProfessionalChange}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 text-sm"
                />
                <input
                  type="text"
                  name="gmcNumber"
                  placeholder="GMC Number *"
                  value={professional.gmcNumber}
                  onChange={handleProfessionalChange}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 text-sm"
                />
                <input
                  type="text"
                  name="position"
                  placeholder="Position/Title *"
                  value={professional.position}
                  onChange={handleProfessionalChange}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 text-sm"
                />
                <input
                  type="text"
                  name="healthBoard"
                  placeholder="Health Board/Hospital *"
                  value={professional.healthBoard}
                  onChange={handleProfessionalChange}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 text-sm"
                />
                <input
                  type="text"
                  name="department"
                  placeholder="Department"
                  value={professional.department}
                  onChange={handleProfessionalChange}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 text-sm"
                />
                <input
                  type="text"
                  name="specialty"
                  placeholder="Specialty"
                  value={professional.specialty}
                  onChange={handleProfessionalChange}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 text-sm"
                />
                <input
                  type="text"
                  name="subspecialties"
                  placeholder="Subspecialties"
                  value={professional.subspecialties}
                  onChange={handleProfessionalChange}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 text-sm"
                />
                <input
                  type="text"
                  name="qualifications"
                  placeholder="Qualifications"
                  value={professional.qualifications}
                  onChange={handleProfessionalChange}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 text-sm"
                />
                <input
                  type="text"
                  name="portfolioPeriod"
                  placeholder="Portfolio Period"
                  value={professional.portfolioPeriod}
                  onChange={handleProfessionalChange}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 text-sm"
                />
                <input
                  type="date"
                  name="revalidationDate"
                  value={professional.revalidationDate}
                  onChange={handleProfessionalChange}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 text-sm"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg transition-all text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-2 rounded-lg transition-all text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary View */}
        {viewMode === 'summary' && (
          <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 md:p-6 text-white glow">
                <div className="text-xs md:text-sm font-semibold opacity-90 mb-2 flex items-center gap-2"><Clock size={16} /> Total Hours</div>
                <div className="text-3xl md:text-4xl font-bold">{displayHours}</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-4 md:p-6 text-white glow">
                <div className="text-xs md:text-sm font-semibold opacity-90 mb-2 flex items-center gap-2"><BarChart3 size={16} /> Activities</div>
                <div className="text-3xl md:text-4xl font-bold">{displayActivities}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4 md:p-6 text-white glow">
                <div className="text-xs md:text-sm font-semibold opacity-90 mb-2 flex items-center gap-2"><Award size={16} /> Credits</div>
                <div className="text-3xl md:text-4xl font-bold">{displayCredits.toFixed(0)}</div>
              </div>
              <div className="bg-gradient-to-br from-pink-600 to-pink-700 rounded-xl p-4 md:p-6 text-white glow">
                <div className="text-xs md:text-sm font-semibold opacity-90 mb-2 flex items-center gap-2"><TrendingUp size={16} /> Domains</div>
                <div className="text-3xl md:text-4xl font-bold">{Object.values(displayStats).filter(s => s.count > 0).length}/6</div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">CPD by Domain</h2>
              <div className="space-y-4">
                {domains.map(domain => {
                  const domainStat = displayStats[domain];
                  
                  return (
                    <div key={domain} className="domain-stat bg-slate-700 rounded-lg p-4 md:p-6 hover:bg-slate-600">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                        <h3 className="text-white font-semibold text-sm md:text-base flex-1">{domain}</h3>
                        <div className="flex gap-4 md:gap-6">
                          <div className="text-right">
                            <div className="text-2xl md:text-2xl font-bold text-blue-400">{domainStat.hours}h</div>
                            <div className="text-xs text-slate-400">hours</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl md:text-2xl font-bold text-slate-300">{domainStat.count}</div>
                            <div className="text-xs text-slate-400">activities</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 md:gap-4">
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 rounded-lg font-semibold transition-all glow text-sm"
              >
                <Plus size={18} /> Add Activity
              </button>
              <button
                onClick={generateComprehensivePDF}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 md:px-6 py-2 rounded-lg font-semibold transition-all text-sm"
              >
                <Download size={18} /> PDF
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 md:px-6 py-2 rounded-lg font-semibold transition-all text-sm"
              >
                <Download size={18} /> CSV
              </button>
            </div>
          </div>
        )}

        {/* Activities View */}
        {viewMode === 'activities' && (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-wrap gap-2 md:gap-4">
              <button
                onClick={() => { setShowForm(!showForm); setEditingId(null); }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all glow text-sm"
              >
                <Plus size={16} /> {editingId ? 'Cancel' : 'Add'}
              </button>
            </div>

            {/* Search and Filter */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                <div className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded-lg">
                  <Search size={16} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent text-white flex-1 outline-none placeholder-slate-500 text-sm"
                  />
                </div>
                <select
                  value={filterDomain}
                  onChange={(e) => setFilterDomain(e.target.value)}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg outline-none text-sm"
                >
                  <option value="All">All Domains</option>
                  {domains.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Form */}
            {showForm && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg md:text-2xl font-bold text-white mb-6">{editingId ? 'Edit' : 'New'} Activity</h3>
                <form onSubmit={handleAddActivity} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 text-sm"
                      required
                    />
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 text-sm"
                    >
                      {activityTypes.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>

                  <input
                    type="text"
                    name="activity"
                    placeholder="Activity Title *"
                    value={formData.activity}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 text-sm"
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <input
                      type="text"
                      name="provider"
                      placeholder="Provider"
                      value={formData.provider}
                      onChange={handleInputChange}
                      className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 text-sm"
                    />
                    <input
                      type="text"
                      name="location"
                      placeholder="Location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 text-sm"
                    />
                  </div>

                  <select
                    name="domain"
                    value={formData.domain}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 text-sm"
                  >
                    {domains.map(d => <option key={d}>{d}</option>)}
                  </select>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    <input
                      type="number"
                      name="hours"
                      placeholder="Hours *"
                      value={formData.hours}
                      onChange={handleInputChange}
                      className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 text-sm"
                      step="0.5"
                      required
                    />
                    <input
                      type="number"
                      name="credits"
                      placeholder="Credits"
                      value={formData.credits}
                      onChange={handleInputChange}
                      className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 text-sm"
                      step="0.5"
                    />
                    <label className="flex items-center gap-2 text-white cursor-pointer bg-slate-700 px-4 py-2 rounded-lg border border-slate-600">
                      <input
                        type="checkbox"
                        name="mandatory"
                        checked={formData.mandatory}
                        onChange={handleInputChange}
                        className="cursor-pointer"
                      />
                      <span className="text-sm">Mandatory</span>
                    </label>
                  </div>

                  <textarea
                    name="keyLearnings"
                    placeholder="Key Learnings"
                    value={formData.keyLearnings}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 text-sm"
                  />

                  <textarea
                    name="reflection"
                    placeholder="Reflection / Notes"
                    value={formData.reflection}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 text-sm"
                  />

                  <div className="flex gap-2 md:gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition-all text-sm"
                    >
                      {editingId ? 'Update' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditingId(null); }}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-all text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Activities List */}
            <div className="space-y-3">
              {filteredActivities.length === 0 ? (
                <div className="bg-slate-800 rounded-xl p-6 md:p-8 text-center text-slate-400 text-sm">
                  <p>{activities.length === 0 ? 'No activities yet.' : 'No activities match filters.'}</p>
                </div>
              ) : (
                filteredActivities.map(activity => (
                  <div
                    key={activity.id}
                    className="activity-card bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-600 transition-all overflow-hidden"
                  >
                    <div className="p-4 cursor-pointer" onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="text-white font-semibold text-sm md:text-base truncate">{activity.activity}</h4>
                            {activity.mandatory && <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded">M</span>}
                          </div>
                          <p className="text-slate-400 text-xs md:text-sm mb-1">{activity.domain}</p>
                          <div className="flex gap-2 md:gap-4 text-xs text-slate-400">
                            <span>📅 {new Date(activity.date).toLocaleDateString()}</span>
                            <span>⏱️ {activity.hours}h</span>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditActivity(activity); }}
                            className="text-blue-400 hover:text-blue-300 p-1"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteActivity(activity.id); }}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {expandedActivity === activity.id && (
                      <div className="activity-expanded mx-4 mb-4 text-sm">
                        {activity.keyLearnings && <div className="mb-2"><p className="text-xs text-slate-400 font-semibold">KEY LEARNINGS</p><p className="text-white">{activity.keyLearnings}</p></div>}
                        {activity.reflection && <div><p className="text-xs text-slate-400 font-semibold">REFLECTION</p><p className="text-white italic">"{activity.reflection}"</p></div>}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Domains View */}
        {viewMode === 'domains' && (
          <div className="space-y-4 md:space-y-6">
            {domains.map(domain => {
              const allDomainActivities = activities.filter(a => a.domain === domain || a.multiDomain.includes(domain));
              const domainStat = calculateStats(activities).stats[domain];
              
              return (
                <div key={domain} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 md:px-6 py-3">
                    <h3 className="text-base md:text-lg font-bold text-white">{domain}</h3>
                  </div>
                  <div className="p-4 md:p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-4">
                      <div className="bg-slate-700 rounded p-3">
                        <div className="text-xs text-slate-400 font-semibold uppercase">Hours</div>
                        <div className="text-2xl font-bold mt-1 text-blue-400">{domainStat.hours}h</div>
                      </div>
                      <div className="bg-slate-700 rounded p-3">
                        <div className="text-xs text-slate-400 font-semibold uppercase">Activities</div>
                        <div className="text-2xl font-bold mt-1 text-emerald-400">{domainStat.count}</div>
                      </div>
                      <div className="bg-slate-700 rounded p-3">
                        <div className="text-xs text-slate-400 font-semibold uppercase">Avg Hours</div>
                        <div className="text-2xl font-bold mt-1 text-slate-300">{domainStat.count > 0 ? (domainStat.hours / domainStat.count).toFixed(1) : '0'}h</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {allDomainActivities.length > 0 ? (
                        allDomainActivities.map(activity => (
                          <div key={activity.id} className="bg-slate-700 rounded p-3 hover:bg-slate-600 transition text-sm">
                            <div className="text-white font-semibold text-sm">{activity.activity}</div>
                            <div className="text-slate-400 text-xs mt-1">{activity.hours}h • {new Date(activity.date).toLocaleDateString()}</div>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 italic text-sm">No activities</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Analytics View */}
        {viewMode === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-slate-800 rounded-xl p-4 md:p-6 border border-slate-700">
                <h4 className="text-white font-semibold text-sm uppercase mb-4">Activity Types</h4>
                {activityTypes.map(type => {
                  const count = activities.filter(a => a.type === type).length;
                  return count > 0 ? (
                    <div key={type} className="mb-3">
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>{type}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                      <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: \`\${(count / activities.length) * 100}%\` }} />
                      </div>
                    </div>
                  ) : null;
                })}
              </div>

              <div className="bg-slate-800 rounded-xl p-4 md:p-6 border border-slate-700">
                <h4 className="text-white font-semibold text-sm uppercase mb-4">Statistics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>Avg Hours/Activity:</span>
                    <span className="font-semibold text-white">{(allStats.totalHours / (allStats.totalActivities || 1)).toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Mandatory Hours:</span>
                    <span className="font-semibold text-white">{allStats.mandatoryHours}h</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Monthly Average:</span>
                    <span className="font-semibold text-white">{(allStats.totalHours / 12).toFixed(1)}h</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4 md:p-6 border border-slate-700">
              <h4 className="text-white font-semibold text-sm uppercase mb-4">Hours by Domain</h4>
              <div className="space-y-3">
                {domains.map(domain => {
                  const domainStat = allStats.stats[domain];
                  return (
                    <div key={domain}>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span className="flex-1 truncate">{domain}</span>
                        <span className="font-semibold">{domainStat.hours}h</span>
                      </div>
                      <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          style={{ width: \`\${Math.min((domainStat.hours / (allStats.totalHours || 1)) * 100, 100)}%\` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CPDTracker;