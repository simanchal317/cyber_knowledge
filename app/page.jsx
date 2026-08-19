'use client';

import BackendFetcher from './BackendFetcher';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Terminal, Shield, Server, ArrowRightLeft, Key, Crosshair, 
  BookOpen, Laptop, FileCode, Lock, Unlock, Download, Upload, 
  Plus, Trash2, Edit3, Copy, Check, Search, Menu, RefreshCw,
  ExternalLink, HelpCircle, RotateCcw, AlertTriangle, Cloud
} from 'lucide-react';

export default function RangeConsoleApp() {
  // Navigation & View State
  const [activeView, setActiveView] = useState('home');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // IPs for Live Dynamic Substitution
  const [attackerIp, setAttackerIp] = useState('10.10.14.5');
  const [targetIp, setTargetIp] = useState('10.10.11.20');

  // Admin Authentication State
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [authError, setAuthError] = useState('');

  // Core Platform Data State (Synchronized across all users via Backend API)
  const [platformData, setPlatformData] = useState(null);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'syncing' | 'error'
  const [toastMessage, setToastMessage] = useState('');
  const toastTimeoutRef = useRef(null);

  // Filters & Tabs State
  const [activeSvcCat, setActiveSvcCat] = useState('all');
  const [activeFtTab, setActiveFtTab] = useState('Upload TO target');
  const [activeCtfCat, setActiveCtfCat] = useState('web');
  const [activeCtfLevel, setActiveCtfLevel] = useState('Easy');
  const [openTopics, setOpenTopics] = useState({});

  // Practice Machine State
  const [currentMachine, setCurrentMachine] = useState(null);
  const [machineTerminalState, setMachineTerminalState] = useState({});
  const [termInput, setTermInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const termBodyRef = useRef(null);

  // Form Modals State
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [sectionForm, setSectionForm] = useState({ title: '', icon: '📁', description: '' });
  const [showSubtopicForm, setShowSubtopicForm] = useState(null); // sectionId
  const [subtopicForm, setSubtopicForm] = useState({ title: '', description: '', cmd: '' });
  const [showNbForm, setShowNbForm] = useState(false);
  const [nbForm, setNbForm] = useState({ title: '', category: 'General', level: 'Easy', description: '', cmd: '' });
  const [nbEditingId, setNbEditingId] = useState(null);
  const [showMachineForm, setShowMachineForm] = useState(false);
  const [mEditingId, setMEditingId] = useState(null);
  const [machineForm, setMachineForm] = useState({
    name: '', os: 'Linux', difficulty: 'Easy', ip: '10.10.11.42', description: '',
    steps: [{ context: 'kali', title: 'Initial Recon', hint: 'Scan the target', expected: 'nmap', output: 'PORT 80/tcp open http', switchContext: false, flag: '' }]
  });

  // Copied code feedback tracking
  const [copiedMap, setCopiedMap] = useState({});

  // Toast Helper
  const showToast = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage('');
    }, 2400);
  };

  // 1. Initial Load & Background Sync
  const fetchData = async () => {
    try {
      setSyncStatus('syncing');
      const res = await fetch('/api/data', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setPlatformData(data);
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
    } catch (err) {
      console.error('Fetch data error:', err);
      setSyncStatus('error');
    }
  };

  useEffect(() => {
    fetchData();

    // Check stored admin session
    const savedToken = localStorage.getItem('range_admin_token');
    if (savedToken) {
      setAdminToken(savedToken);
      setIsAdmin(true);
    }

    // Polling sync every 15 seconds to ensure changes made anywhere are instantly propagated
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Save changes to backend serverless database
  const persistState = async (updatedData) => {
    setPlatformData(updatedData);
    if (!isAdmin) return;

    try {
      setSyncStatus('syncing');
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(updatedData)
      });

      if (res.ok) {
        const result = await res.json();
        setSyncStatus('synced');
        showToast(result.savedCloud ? '✓ Saved & synced to all users' : '✓ Saved to server');
      } else {
        setSyncStatus('error');
        showToast('Error syncing to server');
      }
    } catch (err) {
      setSyncStatus('error');
      showToast('Network error during sync');
    }
  };

  // Interpolate dynamic IPs into commands
  const interpolate = (cmd) => {
    if (!cmd) return '';
    return cmd
      .replaceAll('<ATTACKER>', attackerIp || '<ATTACKER>')
      .replaceAll('<TARGET>', targetIp || '<TARGET>')
      .replaceAll('TARGET_HOST', targetIp || 'TARGET_HOST');
  };

  // Copy code to clipboard
  const handleCopy = (rawText, key) => {
    const interpolated = interpolate(rawText);
    navigator.clipboard.writeText(interpolated).then(() => {
      setCopiedMap(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedMap(prev => ({ ...prev, [key]: false }));
      }, 1500);
      showToast('Copied to clipboard');
    }).catch(() => {
      showToast('Copy failed');
    });
  };

  // Admin Login / Logout
  const handleLogin = async (e) => {
    e?.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUser, password: adminPass })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdmin(true);
        setAdminToken(data.token);
        localStorage.setItem('range_admin_token', data.token);
        setAdminModalOpen(false);
        setAdminUser('');
        setAdminPass('');
        showToast('Admin mode enabled — editing unlocked');
      } else {
        setAuthError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setAuthError('Authentication request failed');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setAdminToken('');
    localStorage.removeItem('range_admin_token');
    showToast('Logged out — view only mode');
  };

  // -------------------------------------------------------------
  // DYNAMIC TOPIC MANAGEMENT (LINKED BETWEEN SIDEBAR & HOME PAGE)
  // -------------------------------------------------------------
  const allMainTopics = useMemo(() => {
    if (!platformData) return [];

    const deleted = platformData.permanentlyDeletedSections || [];

    // Built-in standard sections
    const builtIns = [
      {
        id: 'services',
        title: 'Services & Protocols',
        icon: '🧩',
        count: `${platformData.services?.length || 0} entries`,
        desc: 'Port-by-port enumeration and exploitation notes for SMB, SSH, Active Directory, Databases, Redis, Kubernetes, and 70+ daemons.'
      },
      {
        id: 'filetransfer',
        title: 'File Transfer',
        icon: '📡',
        count: `${Object.values(platformData.fileTransfer || {}).flat().length} methods`,
        desc: 'Infiltration and exfiltration commands — HTTP, SMB, FTP, TFTP, SCP, Netcat, and Base64 streams wired to your active IPs.'
      },
      {
        id: 'privesc',
        title: 'Privilege Escalation',
        icon: '🪜',
        count: `${(platformData.privescLinux?.length || 0)} Linux + ${(platformData.privescWindows?.length || 0)} Windows`,
        desc: 'GTFOBins sudo abuse, SUID binaries, capabilities, Docker/LXD, token impersonation, unquoted service paths, and kernel CVEs.'
      },
      {
        id: 'ctflevels',
        title: 'CTF Topics by Level',
        icon: '🎯',
        count: `${platformData.ctfCategories?.length || 0} categories`,
        desc: 'Web, Pwn, Crypto, Forensics, and Reverse Engineering split into Easy, Medium, and Hard tiers with direct commands.'
      },
      {
        id: 'methodology',
        title: 'CTF Methodology',
        icon: '🗺️',
        count: '1 flow',
        desc: 'The structured reconnaissance, foothold, privilege escalation loop for penetration testing.'
      },
      {
        id: 'machines',
        title: 'Practice Machines',
        icon: '🖥️',
        count: `${platformData.machines?.length || 0} boxes`,
        desc: 'Simulated HTB/THM command terminal with realistic command parsing, shell context handoff, hint system, and step builder.'
      },
      {
        id: 'notebook',
        title: 'My Notebook',
        icon: '📝',
        count: `${platformData.notebookTopics?.length || 0} topics`,
        desc: 'Create custom notes, cheat sheets, and command templates with instant export/import snapshot capabilities.'
      }
    ].filter(s => !deleted.includes(s.id));

    // Custom user-created main sections
    const customList = (platformData.customSections || []).map(s => ({
      id: s.id,
      title: s.title,
      icon: s.icon || '📁',
      count: `${s.subtopics?.length || 0} subtopic${s.subtopics?.length === 1 ? '' : 's'}`,
      desc: s.description || 'Custom security topic module.',
      isCustom: true,
      subtopics: s.subtopics || []
    }));

    return [...builtIns, ...customList];
  }, [platformData]);

  // Create a new main topic (Reflects instantly in sidebar + home page)
  const handleCreateMainTopic = () => {
    if (!isAdmin) { showToast('Admin login required'); return; }
    if (!sectionForm.title.trim()) { showToast('Topic title required'); return; }

    const newSec = {
      id: 'sec_' + Date.now(),
      title: sectionForm.title.trim(),
      icon: sectionForm.icon.trim() || '📁',
      description: sectionForm.description.trim(),
      subtopics: []
    };

    const updated = {
      ...platformData,
      customSections: [...(platformData.customSections || []), newSec]
    };

    persistState(updated);
    setSectionForm({ title: '', icon: '📁', description: '' });
    setShowSectionForm(false);
    showToast(`"${newSec.title}" added to sidebar & home page`);
  };

  // Delete a main topic permanently (Removes instantly from sidebar + home page)
  const handleDeleteMainTopic = (secId, secTitle) => {
    if (!isAdmin) { showToast('Admin login required'); return; }
    if (!confirm(`Are you sure you want to permanently delete "${secTitle}"? This will remove it from both the left sidebar and the home page.`)) {
      return;
    }

    const isCustom = platformData.customSections?.some(s => s.id === secId);
    let updatedCustom = platformData.customSections || [];
    let updatedDeleted = [...(platformData.permanentlyDeletedSections || [])];

    if (isCustom) {
      updatedCustom = updatedCustom.filter(s => s.id !== secId);
    } else {
      if (!updatedDeleted.includes(secId)) {
        updatedDeleted.push(secId);
      }
    }

    const updated = {
      ...platformData,
      customSections: updatedCustom,
      permanentlyDeletedSections: updatedDeleted
    };

    persistState(updated);

    // If currently viewing the deleted topic, redirect to Home
    if (activeView === secId || (secId === 'machines' && activeView === 'machine-practice')) {
      setActiveView('home');
    }

    showToast(`"${secTitle}" deleted permanently from sidebar and home`);
  };

  // Code Block Component
  const CodeBlock = ({ label, raw, idKey, onRemove, isCustom = false }) => {
    const isCopied = copiedMap[idKey];
    return (
      <div className="code">
        <div className="code-bar">
          <span className="code-label">
            {label}
            {isCustom && <span className="custom-badge">custom</span>}
          </span>
          <div className="code-bar-actions">
            <button className={`copy-btn ${isCopied ? 'done' : ''}`} onClick={() => handleCopy(raw, idKey)}>
              {isCopied ? 'copied' : 'copy'}
            </button>
            {isAdmin && onRemove && (
              <button className="del-btn" title="Remove block" onClick={onRemove}>
                ✕
              </button>
            )}
          </div>
        </div>
        <pre>
          <code>
            {raw.split(/(<ATTACKER>|<TARGET>|TARGET_HOST)/g).map((part, i) => {
              if (part === '<ATTACKER>') return <span key={i} className="ip">{attackerIp || '<ATTACKER>'}</span>;
              if (part === '<TARGET>' || part === 'TARGET_HOST') return <span key={i} className="ip t">{targetIp || '<TARGET>'}</span>;
              return part;
            })}
          </code>
        </pre>
      </div>
    );
  };

  // Add custom note helper
  const handleAddCustomNote = (containerId, label, text) => {
    if (!isAdmin) { showToast('Admin login required'); return; }
    if (!text.trim()) return;
    const current = platformData.customAdditions || {};
    const list = current[containerId] || [];
    const updated = {
      ...platformData,
      customAdditions: {
        ...current,
        [containerId]: [...list, { label: label || 'Custom Note', text }]
      }
    };
    persistState(updated);
    showToast('Note added');
  };

  // Terminal Machine Simulator Handlers
  const openMachine = (machine) => {
    setCurrentMachine(machine);
    setShowHint(false);
    if (!machineTerminalState[machine.id]) {
      setMachineTerminalState(prev => ({
        ...prev,
        [machine.id]: {
          stepIndex: 0,
          context: 'kali',
          log: [
            { cls: 'sys', text: `[+] Connected to range target: ${machine.name} (${machine.ip || '10.10.11.42'})` },
            { cls: 'sys', text: `[+] Target OS: ${machine.os} · Difficulty: ${machine.difficulty}` },
            { cls: 'sys', text: `[!] Type 'hint' for guidance, 'clear' to reset terminal view.` }
          ]
        }
      }));
    }
    setActiveView('machine-practice');
  };

  const handleTermSubmit = (e) => {
    e.preventDefault();
    if (!termInput.trim() || !currentMachine) return;
    const raw = termInput;
    setTermInput('');

    const state = machineTerminalState[currentMachine.id] || { stepIndex: 0, context: 'kali', log: [] };
    const promptStr = state.context === 'kali' ? 'kali@range:~$' : `www-data@${currentMachine.name.toLowerCase()}:/var/www$`;

    const newLog = [...state.log, { cls: 'in', text: `${promptStr} ${raw}` }];
    const cmd = raw.trim().toLowerCase();

    if (cmd === 'clear') {
      setMachineTerminalState(prev => ({ ...prev, [currentMachine.id]: { ...state, log: [] } }));
      return;
    }

    if (cmd === 'hint') {
      const hintText = state.stepIndex >= currentMachine.steps.length 
        ? 'Machine already fully compromised!' 
        : `💡 ${currentMachine.steps[state.stepIndex]?.hint || 'No hint available'}`;
      newLog.push({ cls: 'sys', text: hintText });
      setMachineTerminalState(prev => ({ ...prev, [currentMachine.id]: { ...state, log: newLog } }));
      return;
    }

    if (state.stepIndex >= currentMachine.steps.length) {
      newLog.push({ cls: 'sys', text: '🏆 Target is already fully compromised! Click Reset to drill again.' });
      setMachineTerminalState(prev => ({ ...prev, [currentMachine.id]: { ...state, log: newLog } }));
      return;
    }

    const currentStep = currentMachine.steps[state.stepIndex];
    if (currentStep.context !== state.context) {
      newLog.push({ cls: 'sys', text: state.context === 'kali' ? '-bash: command must be executed on target shell' : '-bash: command not found' });
      setMachineTerminalState(prev => ({ ...prev, [currentMachine.id]: { ...state, log: newLog } }));
      return;
    }

    // Match expected command keyword
    if (currentStep.expected && cmd.includes(currentStep.expected.toLowerCase())) {
      (currentStep.output || '').split('\n').forEach(line => {
        newLog.push({ cls: 'sys', text: line });
      });

      if (currentStep.flag) {
        newLog.push({ cls: 'flag', text: `🚩 FLAG CAPTURED: ${currentStep.flag}` });
      }

      let newContext = state.context;
      if (currentStep.switchContext) {
        newContext = 'machine';
        newLog.push({ cls: 'win', text: '[+] Shell established: Terminal context switched to target machine.' });
      }

      const nextStepIdx = state.stepIndex + 1;
      if (nextStepIdx >= currentMachine.steps.length) {
        newLog.push({ cls: 'win', text: '🏆 Machine fully compromised! Root shell secured.' });
      }

      setMachineTerminalState(prev => ({
        ...prev,
        [currentMachine.id]: {
          ...state,
          stepIndex: nextStepIdx,
          context: newContext,
          log: newLog
        }
      }));
    } else {
      newLog.push({ cls: 'sys', text: `-bash: ${raw.split(' ')[0]}: command unrecognized or incorrect approach. (Try 'hint')` });
      setMachineTerminalState(prev => ({
        ...prev,
        [currentMachine.id]: {
          ...state,
          log: newLog
        }
      }));
    }
  };

  useEffect(() => {
    if (termBodyRef.current) {
      termBodyRef.current.scrollTop = termBodyRef.current.scrollHeight;
    }
  }, [machineTerminalState, currentMachine]);

  // Export / Import Snapshot
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(platformData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `range-notebook-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Platform snapshot exported');
  };

  const handleImport = (e) => {
    if (!isAdmin) { showToast('Admin login required to import'); return; }
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        persistState(imported);
        showToast('Notebook imported & synced to cloud');
      } catch (err) {
        showToast('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filtered Services
  const filteredServices = useMemo(() => {
    if (!platformData?.services) return [];
    let list = platformData.services;
    if (activeSvcCat !== 'all') {
      list = list.filter(s => s.cat === activeSvcCat);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.port.includes(q) || 
        s.notes.toLowerCase().includes(q)
      );
    }
    return list;
  }, [platformData, activeSvcCat, searchTerm]);

  if (!platformData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080b10', color: '#dbe4ec', fontFamily: 'var(--mono)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="brand" style={{ justifyContent: 'center', marginBottom: '16px' }}>
            <span className="dot"></span> RANGE
          </div>
          <div style={{ color: 'var(--amber)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <RefreshCw className="animate-spin" size={16} /> Initializing Offensive Security Environment...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Header Console Bar */}
      <header id="console">
        <div className="brand" onClick={() => setActiveView('home')}>
          <span className="dot"></span>
          <span>RANGE</span>
          <small>// offensive security console</small>
        </div>

        <button 
          id="menu-btn" 
          style={{ display: 'none' }} 
          className="btn-secondary" 
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          <Menu size={16} />
        </button>

        <div className="console-fields">
          <div className="field">
            <label>Kali</label>
            <input 
              value={attackerIp} 
              onChange={(e) => setAttackerIp(e.target.value)} 
              placeholder="10.10.14.5" 
            />
          </div>
          <div className="field target">
            <label>Target</label>
            <input 
              value={targetIp} 
              onChange={(e) => setTargetIp(e.target.value)} 
              placeholder="10.10.11.20" 
            />
          </div>

          <div style={{ position: 'relative' }}>
            <input 
              id="search" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="⌕ search topics…" 
            />
          </div>

          {/* Cloud Sync Status Indicator */}
          <div className="cloud-status" title={syncStatus === 'synced' ? 'Synchronized with Cloud DB' : 'Syncing changes...'}>
            <div className={`cloud-dot ${syncStatus === 'syncing' ? 'syncing' : syncStatus === 'error' ? 'error' : ''}`} />
            <span>{syncStatus === 'synced' ? 'Live Cloud' : syncStatus === 'syncing' ? 'Syncing...' : 'Offline'}</span>
          </div>

          {/* Admin Control */}
          {isAdmin ? (
            <button className="btn-secondary" onClick={handleLogout} style={{ color: 'var(--teal)', borderColor: 'var(--teal-dim)' }}>
              <Unlock size={12} style={{ display: 'inline', marginRight: '4px' }} /> Admin (Logout)
            </button>
          ) : (
            <button className="btn-secondary" onClick={() => setAdminModalOpen(true)}>
              <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} /> Admin
            </button>
          )}
        </div>
      </header>

      {/* Main Layout Shell */}
      <div id="shell">
        {/* LEFT SIDEBAR NAVIGATION (LINKED TO ALL TOPICS) */}
        <nav id="nav" className={mobileNavOpen ? 'open' : ''}>
          {/* Home View */}
          <div className="nav-group">
            <div className={`nav-link ${activeView === 'home' ? 'active' : ''}`} onClick={() => { setActiveView('home'); setMobileNavOpen(false); }}>
              🏠&nbsp; Home
            </div>
          </div>

          {/* DYNAMIC TOPICS LISTED ON LEFT SIDEBAR */}
          {allMainTopics.map(sec => (
            <div className="nav-group" key={sec.id}>
              <div 
                className={`nav-link ${activeView === sec.id || (sec.id === 'machines' && activeView === 'machine-practice') ? 'active' : ''}`} 
                onClick={() => { setActiveView(sec.id); setMobileNavOpen(false); }}
              >
                {sec.icon}&nbsp; {sec.title}
              </div>
            </div>
          ))}
        </nav>

        {/* Content View Area */}
        <main id="main">
          {/* HOME VIEW (WITH ALL TOPIC CARDS LINKED TO LEFT SIDEBAR) */}
          {activeView === 'home' && (
            <section className="view">
              <div className="hero">
                <span className="eyebrow">Lab reference · shared drill book</span>
                <h1>Your offensive security <span>drill console</span>.</h1>
                <p>
                  Set your Kali and target box IPs once in the console bar above — every command across all 70+ daemons,
                  privilege escalation scripts, and file transfers updates live in real-time. Create or delete topics on the left
                  and home page — all changes sync to cloud and appear for all visitors.
                </p>
                <div className="hero-stats">
                  <div className="hstat">
                    <b>{platformData.services?.length || 0}</b>
                    <span>Services Covered</span>
                  </div>
                  <div className="hstat">
                    <b>{Object.values(platformData.fileTransfer || {}).flat().length}</b>
                    <span>Transfer Methods</span>
                  </div>
                  <div className="hstat">
                    <b>{(platformData.privescLinux?.length || 0) + (platformData.privescWindows?.length || 0)}</b>
                    <span>PrivEsc Techniques</span>
                  </div>
                  <div className="hstat">
                    <b>{platformData.machines?.length || 0}</b>
                    <span>Practice Machines</span>
                  </div>
                </div>
              </div>

              {!isAdmin && (
                <div className="io-note">
                  🔒 Viewing Mode: You can browse, copy live IP commands, practice terminal machines, and export snapshots. Log in as Admin in the top-right corner to add, edit, or delete shared content.
                </div>
              )}

              {/* Add New Main Topic Button */}
              {isAdmin && (
                <div className="notebook-toolbar">
                  <button className="add-btn" onClick={() => setShowSectionForm(!showSectionForm)}>
                    + New Main Topic (Adds to Sidebar &amp; Home)
                  </button>
                </div>
              )}

              {/* Main Topic Creator Form */}
              {showSectionForm && (
                <div className="add-form" style={{ marginBottom: '20px' }}>
                  <div className="add-form-row">
                    <div>
                      <label>Topic Title</label>
                      <input 
                        value={sectionForm.title} 
                        onChange={e => setSectionForm({ ...sectionForm, title: e.target.value })} 
                        placeholder="e.g. Cloud Security &amp; AWS IAM" 
                      />
                    </div>
                    <div>
                      <label>Icon / Emoji</label>
                      <input 
                        value={sectionForm.icon} 
                        onChange={e => setSectionForm({ ...sectionForm, icon: e.target.value })} 
                        placeholder="☁️" 
                        maxLength={4} 
                      />
                    </div>
                  </div>
                  <label>Description</label>
                  <textarea 
                    value={sectionForm.description} 
                    onChange={e => setSectionForm({ ...sectionForm, description: e.target.value })} 
                    placeholder="Brief description of this domain..." 
                  />
                  <div className="form-actions">
                    <button className="btn-secondary" onClick={() => setShowSectionForm(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleCreateMainTopic}>
                      Save Main Topic
                    </button>
                  </div>
                </div>
              )}

              {/* HOME GRID: ALL TOPICS LINKED TO SIDEBAR WITH INSTANT DELETE BUTTONS */}
              <div className="home-grid">
                {allMainTopics.map(sec => (
                  <div 
                    className="home-card" 
                    key={sec.id} 
                    onClick={() => setActiveView(sec.id)}
                  >
                    <div className="hc-top">
                      <h3>{sec.icon} {sec.title}</h3>
                      <span className="count">{sec.count}</span>
                    </div>
                    <p>{sec.desc}</p>

                    {isAdmin && (
                      <div className="nb-topic-actions" style={{ marginTop: '14px' }}>
                        <button 
                          className="nb-icon-btn danger" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMainTopic(sec.id, sec.title);
                          }}
                        >
                          ✕ delete permanently
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="footnote">
                ⚠ For use only against systems you own or are explicitly authorized to test in CTF / lab environments.
              </div>
            </section>
          )}

          {/* SERVICES & PROTOCOLS VIEW */}
          {activeView === 'services' && (
            <section className="view">
              <div className="section-head">
                <span className="eyebrow">SVC · ENUMERATION &amp; EXPLOITATION</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <h2>🧩 Services &amp; Protocols</h2>
                  {isAdmin && (
                    <button 
                      className="nb-icon-btn danger" 
                      onClick={() => handleDeleteMainTopic('services', 'Services & Protocols')}
                    >
                      ✕ delete this topic permanently
                    </button>
                  )}
                </div>
                <p>Every command automatically substitutes your Target IP ({targetIp}). Click any card to expand enumeration commands and tradecraft.</p>
              </div>

              <div className="svc-filters">
                <div 
                  className={`svc-filter ${activeSvcCat === 'all' ? 'active' : ''}`} 
                  onClick={() => setActiveSvcCat('all')}
                >
                  All ({platformData.services?.length || 0})
                </div>
                {['web', 'file', 'remote', 'mail', 'infra', 'windows', 'db', 'container', 'other'].map(cat => (
                  <div 
                    key={cat} 
                    className={`svc-filter ${activeSvcCat === cat ? 'active' : ''}`} 
                    onClick={() => setActiveSvcCat(cat)}
                  >
                    {cat.toUpperCase()} ({platformData.services?.filter(s => s.cat === cat).length || 0})
                  </div>
                ))}
              </div>

              <div className="svc-grid">
                {filteredServices.map((svc, idx) => {
                  const isOpen = openTopics[`svc_${idx}`];
                  const customNotes = platformData.customAdditions?.[`svc_${idx}`] || [];

                  return (
                    <div className={`svc-card ${isOpen ? 'open' : ''}`} key={idx}>
                      <div 
                        className="svc-card-head" 
                        onClick={() => setOpenTopics(prev => ({ ...prev, [`svc_${idx}`]: !prev[`svc_${idx}`] }))}
                      >
                        <span className="svc-port">{svc.port}</span>
                        <h4>{svc.name}</h4>
                        <span className="cat">{svc.cat.toUpperCase()}</span>
                        <span className="chev">▸</span>
                      </div>

                      {isOpen && (
                        <div className="svc-card-body">
                          <div className="subhead">Enumeration Commands</div>
                          {svc.enum?.map((cmd, ci) => (
                            <CodeBlock 
                              key={ci} 
                              label="cmd" 
                              raw={cmd} 
                              idKey={`svc_${idx}_${ci}`} 
                            />
                          ))}

                          <div className="subhead">Exploitation Notes</div>
                          <p style={{ color: 'var(--text-dim)', fontSize: '13px', lineHeight: '1.7', margin: '8px 0' }}>
                            {svc.notes}
                          </p>

                          {/* Custom Notes */}
                          {customNotes.map((cn, cni) => (
                            <CodeBlock 
                              key={cni} 
                              label={cn.label} 
                              raw={cn.text} 
                              idKey={`svc_c_${idx}_${cni}`} 
                              isCustom={true}
                              onRemove={isAdmin ? () => {
                                const current = platformData.customAdditions || {};
                                const list = (current[`svc_${idx}`] || []).filter((_, i) => i !== cni);
                                persistState({
                                  ...platformData,
                                  customAdditions: { ...current, [`svc_${idx}`]: list }
                                });
                              } : null}
                            />
                          ))}

                          {isAdmin && (
                            <div style={{ marginTop: '12px' }}>
                              <button 
                                className="add-btn" 
                                onClick={() => {
                                  const text = prompt('Enter command or note:');
                                  if (text) handleAddCustomNote(`svc_${idx}`, 'Custom Note', text);
                                }}
                              >
                                + Add command or note
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* FILE TRANSFER VIEW */}
          {activeView === 'filetransfer' && (
            <section className="view">
              <div className="section-head">
                <span className="eyebrow">EXFIL / INFIL · TRADECRAFT</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <h2>📡 File Transfer Techniques</h2>
                  {isAdmin && (
                    <button 
                      className="nb-icon-btn danger" 
                      onClick={() => handleDeleteMainTopic('filetransfer', 'File Transfer')}
                    >
                      ✕ delete this topic permanently
                    </button>
                  )}
                </div>
                <p>Live attacker server commands paired with target retrieval commands. IPs update dynamically.</p>
              </div>

              <div className="ft-tabs">
                {Object.keys(platformData.fileTransfer || {}).map(tabName => (
                  <div 
                    key={tabName} 
                    className={`ft-tab ${activeFtTab === tabName ? 'active' : ''}`}
                    onClick={() => setActiveFtTab(tabName)}
                  >
                    {tabName}
                  </div>
                ))}
              </div>

              <div>
                {(platformData.fileTransfer?.[activeFtTab] || []).map((ft, fi) => (
                  <div className="topic open" key={fi} style={{ padding: '16px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontFamily: 'var(--disp)', fontSize: '15px', color: 'var(--text)' }}>
                        {ft.method}
                      </h4>
                      {isAdmin && (
                        <button 
                          className="nb-icon-btn danger" 
                          onClick={() => {
                            const list = platformData.fileTransfer[activeFtTab].filter((_, i) => i !== fi);
                            persistState({
                              ...platformData,
                              fileTransfer: { ...platformData.fileTransfer, [activeFtTab]: list }
                            });
                          }}
                        >
                          ✕ delete
                        </button>
                      )}
                    </div>
                    {ft.note && <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '8px' }}>{ft.note}</div>}
                    <CodeBlock label="Command" raw={ft.cmd} idKey={`ft_${activeFtTab}_${fi}`} />
                  </div>
                ))}

                {isAdmin && (
                  <button 
                    className="add-btn" 
                    style={{ marginTop: '10px' }}
                    onClick={() => {
                      const method = prompt('Method title (e.g. Python HTTP server):');
                      if (!method) return;
                      const cmd = prompt('Command string:');
                      if (!cmd) return;
                      const note = prompt('Optional note / description:') || '';
                      const list = platformData.fileTransfer[activeFtTab] || [];
                      persistState({
                        ...platformData,
                        fileTransfer: {
                          ...platformData.fileTransfer,
                          [activeFtTab]: [...list, { method, cmd, note }]
                        }
                      });
                    }}
                  >
                    + Add File Transfer Method
                  </button>
                )}
              </div>
            </section>
          )}

          {/* PRIVESC VIEW */}
          {activeView === 'privesc' && (
            <section className="view">
              <div className="section-head">
                <span className="eyebrow">PRIV · LOCAL PRIVILEGE ESCALATION</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <h2>🪜 Privilege Escalation Matrix</h2>
                  {isAdmin && (
                    <button 
                      className="nb-icon-btn danger" 
                      onClick={() => handleDeleteMainTopic('privesc', 'Privilege Escalation')}
                    >
                      ✕ delete this topic permanently
                    </button>
                  )}
                </div>
                <p>Detection command first (safe, read-only), followed by verified exploitation commands.</p>
              </div>

              <div className="subhead">Linux Privilege Escalation</div>
              {platformData.privescLinux?.map((item, idx) => {
                const isOpen = openTopics[`priv_l_${idx}`] ?? true;
                return (
                  <div className={`topic ${isOpen ? 'open' : ''}`} key={idx}>
                    <div 
                      className="topic-head" 
                      onClick={() => setOpenTopics(prev => ({ ...prev, [`priv_l_${idx}`]: !isOpen }))}
                    >
                      <span className="topic-id">PRIV-L-{String(idx + 1).padStart(2, '0')}</span>
                      <h3>{item.t}</h3>
                      <span className="sev sev-high">High</span>
                      <span className="chev">▸</span>
                    </div>
                    {isOpen && (
                      <div className="topic-body">
                        <p className="summary">{item.d}</p>
                        <div className="subhead">Detect (Read-Only)</div>
                        <CodeBlock label="Detection" raw={item.det} idKey={`priv_l_det_${idx}`} />
                        <div className="subhead">Exploit</div>
                        <CodeBlock label="Exploitation" raw={item.exp} idKey={`priv_l_exp_${idx}`} />
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="subhead" style={{ marginTop: '36px' }}>Windows Privilege Escalation</div>
              {platformData.privescWindows?.map((item, idx) => {
                const isOpen = openTopics[`priv_w_${idx}`] ?? true;
                return (
                  <div className={`topic ${isOpen ? 'open' : ''}`} key={idx}>
                    <div 
                      className="topic-head" 
                      onClick={() => setOpenTopics(prev => ({ ...prev, [`priv_w_${idx}`]: !isOpen }))}
                    >
                      <span className="topic-id">PRIV-W-{String(idx + 1).padStart(2, '0')}</span>
                      <h3>{item.t}</h3>
                      <span className="sev sev-high">High</span>
                      <span className="chev">▸</span>
                    </div>
                    {isOpen && (
                      <div className="topic-body">
                        <p className="summary">{item.d}</p>
                        <div className="subhead">Detect</div>
                        <CodeBlock label="Detection" raw={item.det} idKey={`priv_w_det_${idx}`} />
                        <div className="subhead">Exploit</div>
                        <CodeBlock label="Exploitation" raw={item.exp} idKey={`priv_w_exp_${idx}`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          )}

          {/* CTF TOPICS BY LEVEL */}
          {activeView === 'ctflevels' && (
            <section className="view">
              <div className="section-head">
                <span className="eyebrow">CTF · CATEGORY × DIFFICULTY</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <h2>🎯 CTF Topics by Level</h2>
                  {isAdmin && (
                    <button 
                      className="nb-icon-btn danger" 
                      onClick={() => handleDeleteMainTopic('ctflevels', 'CTF Topics by Level')}
                    >
                      ✕ delete this topic permanently
                    </button>
                  )}
                </div>
                <p>Categorized challenges broken down into Easy, Medium, and Hard progression tiers.</p>
              </div>

              <div className="cat-tabs">
                {platformData.ctfCategories?.map(cat => (
                  <div 
                    key={cat.id} 
                    className={`cat-tab ${activeCtfCat === cat.id ? 'active' : ''}`}
                    onClick={() => setActiveCtfCat(cat.id)}
                  >
                    {cat.title}
                  </div>
                ))}
              </div>

              {(() => {
                const catObj = platformData.ctfCategories?.find(c => c.id === activeCtfCat);
                if (!catObj) return null;
                const levelData = catObj.levels?.[activeCtfLevel] || { desc: '', cmds: [] };

                return (
                  <div>
                    <div className="level-row">
                      {['Easy', 'Medium', 'Hard'].map(lvl => (
                        <div 
                          key={lvl} 
                          className={`level-pill ${lvl.toLowerCase()} ${activeCtfLevel === lvl ? 'active' : ''}`}
                          onClick={() => setActiveCtfLevel(lvl)}
                        >
                          {lvl}
                        </div>
                      ))}
                    </div>

                    <div className="topic open" style={{ padding: '20px' }}>
                      <p style={{ color: 'var(--text-dim)', marginTop: 0 }}>{levelData.desc}</p>
                      <div className="subhead">Practice Commands &amp; Exploits</div>
                      {levelData.cmds?.map((cmdItem, ci) => (
                        <CodeBlock 
                          key={ci} 
                          label={cmdItem.l} 
                          raw={cmdItem.c} 
                          idKey={`ctf_${activeCtfCat}_${activeCtfLevel}_${ci}`} 
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}
            </section>
          )}

          {/* METHODOLOGY FLOW */}
          {activeView === 'methodology' && (
            <section className="view">
              <div className="section-head">
                <span className="eyebrow">MAP · THE SHAPE OF A BOX</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <h2>🗺️ CTF / OSCP-Style Methodology</h2>
                  {isAdmin && (
                    <button 
                      className="nb-icon-btn danger" 
                      onClick={() => handleDeleteMainTopic('methodology', 'CTF Methodology')}
                    >
                      ✕ delete this topic permanently
                    </button>
                  )}
                </div>
                <p>The structured reconnaissance, foothold, privilege escalation loop for penetration testing.</p>
              </div>

              <div className="flow">
                <div className="flow-row"><div className="flow-node stage">1 · Recon &amp; Enumeration</div></div>
                <div className="flow-arrow-down">▼</div>
                <div className="flow-branches">
                  <div className="flow-branch">
                    <div className="flow-branch-title">Network Scan</div>
                    <ul className="flow-list">
                      <li>nmap -sC -sV -p- &lt;target&gt;</li>
                      <li>nmap -sU --top-ports 100</li>
                      <li>whatweb / wafw00f</li>
                    </ul>
                  </div>
                  <div className="flow-branch">
                    <div className="flow-branch-title">Web Recon</div>
                    <ul className="flow-list">
                      <li>gobuster dir / ffuf vhost</li>
                      <li>robots.txt &amp; .git/config</li>
                      <li>JS bundle &amp; API routes</li>
                    </ul>
                  </div>
                  <div className="flow-branch">
                    <div className="flow-branch-title">Services</div>
                    <ul className="flow-list">
                      <li>enum4linux -a (SMB)</li>
                      <li>showmount -e (NFS)</li>
                      <li>snmpwalk -c public</li>
                    </ul>
                  </div>
                </div>

                <div className="flow-arrow-down">▼</div>
                <div className="flow-row"><div className="flow-node stage">2 · Foothold &amp; Initial Access</div></div>
                <div className="flow-arrow-down">▼</div>
                <div className="flow-branches">
                  <div className="flow-branch">
                    <div className="flow-branch-title">Web Vulnerability</div>
                    <ul className="flow-list">
                      <li>SQLi / Auth Bypass</li>
                      <li>File Upload &amp; Webshell</li>
                      <li>SSTI / Deserialization RCE</li>
                    </ul>
                  </div>
                  <div className="flow-branch">
                    <div className="flow-branch-title">Exposed Service</div>
                    <ul className="flow-list">
                      <li>Default / Leaked Creds</li>
                      <li>Known CVE for version</li>
                      <li>Anonymous access / misconfig</li>
                    </ul>
                  </div>
                </div>

                <div className="flow-arrow-down">▼</div>
                <div className="flow-row"><div className="flow-node">3 · Stabilize Shell (python3 pty spawn)</div></div>
                <div className="flow-arrow-down">▼</div>
                <div className="flow-row"><div className="flow-node stage">4 · Local Enumeration (LinPEAS / WinPEAS / Sudo / SUID)</div></div>
                <div className="flow-arrow-down">▼</div>
                <div className="flow-row"><div className="flow-node stage">5 · Privilege Escalation → Root / SYSTEM</div></div>
                <div className="flow-arrow-down">▼</div>
                <div className="flow-row"><div className="flow-node stage">6 · Loot &amp; Flag Submission (root.txt / hashes)</div></div>
              </div>
            </section>
          )}

          {/* PRACTICE MACHINES LIST */}
          {activeView === 'machines' && (
            <section className="view">
              <div className="section-head">
                <span className="eyebrow">RANGE · HTB/THM-STYLE DRILL BOXES</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <h2>🖥️ Practice Machines</h2>
                  {isAdmin && (
                    <button 
                      className="nb-icon-btn danger" 
                      onClick={() => handleDeleteMainTopic('machines', 'Practice Machines')}
                    >
                      ✕ delete this topic permanently
                    </button>
                  )}
                </div>
                <p>Interactive simulated CTF terminal drills. Step through reconnaissance, exploit payloads, and privilege escalation.</p>
              </div>

              <div className="notebook-toolbar">
                {isAdmin && (
                  <button className="add-btn" onClick={() => {
                    setMEditingId(null);
                    setMachineForm({
                      name: '', os: 'Linux', difficulty: 'Easy', ip: '10.10.11.42', description: '',
                      steps: [{ context: 'kali', title: 'Initial Recon', hint: 'Scan the box', expected: 'nmap', output: 'PORT 80/tcp open http', switchContext: false, flag: '' }]
                    });
                    setShowMachineForm(true);
                  }}>
                    + New Machine
                  </button>
                )}
                <button className="btn-secondary" onClick={handleExport}>
                  <Download size={13} style={{ display: 'inline', marginRight: '5px' }} /> Export Snapshot
                </button>
                {isAdmin && (
                  <label className="btn-secondary" style={{ cursor: 'pointer' }}>
                    <Upload size={13} style={{ display: 'inline', marginRight: '5px' }} /> Import JSON
                    <input type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />
                  </label>
                )}
              </div>

              {/* Machine Builder Form */}
              {showMachineForm && (
                <div className="add-form" style={{ marginBottom: '24px' }}>
                  <div className="add-form-row">
                    <div>
                      <label>Machine Name</label>
                      <input 
                        value={machineForm.name} 
                        onChange={e => setMachineForm({ ...machineForm, name: e.target.value })} 
                        placeholder="e.g. Cerberus" 
                      />
                    </div>
                    <div>
                      <label>OS</label>
                      <select 
                        value={machineForm.os} 
                        onChange={e => setMachineForm({ ...machineForm, os: e.target.value })}
                      >
                        <option>Linux</option>
                        <option>Windows</option>
                      </select>
                    </div>
                  </div>

                  <div className="add-form-row">
                    <div>
                      <label>Difficulty</label>
                      <select 
                        value={machineForm.difficulty} 
                        onChange={e => setMachineForm({ ...machineForm, difficulty: e.target.value })}
                      >
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                      </select>
                    </div>
                    <div>
                      <label>Target IP</label>
                      <input 
                        value={machineForm.ip} 
                        onChange={e => setMachineForm({ ...machineForm, ip: e.target.value })} 
                        placeholder="10.10.11.42" 
                      />
                    </div>
                  </div>

                  <label>Description</label>
                  <textarea 
                    value={machineForm.description} 
                    onChange={e => setMachineForm({ ...machineForm, description: e.target.value })} 
                    placeholder="Scenario overview..." 
                  />

                  <div className="subhead">Interactive Steps</div>
                  {machineForm.steps.map((step, si) => (
                    <div className="step-row" key={si}>
                      <button 
                        className="del-btn rm-step" 
                        onClick={() => {
                          const updated = machineForm.steps.filter((_, i) => i !== si);
                          setMachineForm({ ...machineForm, steps: updated });
                        }}
                      >
                        ✕ remove
                      </button>
                      <div className="step-row-title">Step {si + 1}</div>
                      <div className="add-form-row">
                        <div>
                          <label>Runs in</label>
                          <select 
                            value={step.context} 
                            onChange={e => {
                              const s = [...machineForm.steps];
                              s[si].context = e.target.value;
                              setMachineForm({ ...machineForm, steps: s });
                            }}
                          >
                            <option value="kali">Kali Terminal</option>
                            <option value="machine">Machine Terminal</option>
                          </select>
                        </div>
                        <div>
                          <label>Step Title</label>
                          <input 
                            value={step.title} 
                            onChange={e => {
                              const s = [...machineForm.steps];
                              s[si].title = e.target.value;
                              setMachineForm({ ...machineForm, steps: s });
                            }}
                            placeholder="e.g. Port Scan" 
                          />
                        </div>
                      </div>

                      <label>Hint</label>
                      <input 
                        value={step.hint} 
                        onChange={e => {
                          const s = [...machineForm.steps];
                          s[si].hint = e.target.value;
                          setMachineForm({ ...machineForm, steps: s });
                        }}
                        placeholder="Guidance if player gets stuck" 
                      />

                      <label>Expected Command Keyword</label>
                      <input 
                        value={step.expected} 
                        onChange={e => {
                          const s = [...machineForm.steps];
                          s[si].expected = e.target.value;
                          setMachineForm({ ...machineForm, steps: s });
                        }}
                        placeholder="e.g. nmap" 
                      />

                      <label>Simulated Output</label>
                      <textarea 
                        value={step.output} 
                        onChange={e => {
                          const s = [...machineForm.steps];
                          s[si].output = e.target.value;
                          setMachineForm({ ...machineForm, steps: s });
                        }}
                        placeholder="What terminal prints back..." 
                      />

                      <div className="add-form-row" style={{ marginTop: '8px' }}>
                        <div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={step.switchContext} 
                              onChange={e => {
                                const s = [...machineForm.steps];
                                s[si].switchContext = e.target.checked;
                                setMachineForm({ ...machineForm, steps: s });
                              }}
                              style={{ width: 'auto', margin: 0 }}
                            />
                            Gets a shell (switch to machine prompt)
                          </label>
                        </div>
                        <div>
                          <input 
                            value={step.flag} 
                            onChange={e => {
                              const s = [...machineForm.steps];
                              s[si].flag = e.target.value;
                              setMachineForm({ ...machineForm, steps: s });
                            }}
                            placeholder="Flag revealed (optional, e.g. HTB{...})" 
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button 
                    type="button" 
                    className="add-btn" 
                    onClick={() => {
                      setMachineForm({
                        ...machineForm,
                        steps: [...machineForm.steps, { context: 'kali', title: 'Next Step', hint: '', expected: '', output: '', switchContext: false, flag: '' }]
                      });
                    }}
                  >
                    + Add Step
                  </button>

                  <div className="form-actions" style={{ marginTop: '16px' }}>
                    <button className="btn-secondary" onClick={() => setShowMachineForm(false)}>Cancel</button>
                    <button className="btn-primary" onClick={() => {
                      if (!machineForm.name.trim()) { showToast('Name required'); return; }
                      const newM = {
                        id: mEditingId || 'm_' + Date.now(),
                        ...machineForm
                      };
                      let list = platformData.machines || [];
                      if (mEditingId) {
                        list = list.map(m => m.id === mEditingId ? newM : m);
                      } else {
                        list = [...list, newM];
                      }
                      persistState({ ...platformData, machines: list });
                      setShowMachineForm(false);
                      setMEditingId(null);
                    }}>Save Machine</button>
                  </div>
                </div>
              )}

              {/* Machine Cards List */}
              <div style={{ marginTop: '16px' }}>
                {platformData.machines?.map(m => {
                  const state = machineTerminalState[m.id];
                  const isDone = state && state.stepIndex >= m.steps.length;

                  return (
                    <div className="machine-card" key={m.id}>
                      <div className="machine-card-top">
                        <h3>{m.name}</h3>
                        <span className="os-badge">{m.os}</span>
                        <span className={`sev ${m.difficulty === 'Easy' ? 'sev-med' : m.difficulty === 'Medium' ? 'sev-high' : 'sev-crit'}`}>
                          {m.difficulty}
                        </span>
                        {isDone && <span className="sev sev-med">✓ Owned</span>}
                      </div>
                      <div className="machine-meta">
                        <span>{m.steps?.length || 0} step{m.steps?.length === 1 ? '' : 's'}</span>
                        {m.ip && <span>IP: {m.ip}</span>}
                      </div>
                      <p className="machine-desc">{m.description}</p>
                      <div className="machine-actions">
                        <button className="btn-primary" onClick={() => openMachine(m)}>
                          ▶ Practice
                        </button>
                        {isAdmin && (
                          <>
                            <button 
                              className="nb-icon-btn" 
                              onClick={() => {
                                setMEditingId(m.id);
                                setMachineForm({ ...m });
                                setShowMachineForm(true);
                              }}
                            >
                              ✎ edit
                            </button>
                            <button 
                              className="nb-icon-btn danger" 
                              onClick={() => {
                                const list = platformData.machines.filter(x => x.id !== m.id);
                                persistState({ ...platformData, machines: list });
                              }}
                            >
                              ✕ delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* MACHINE PRACTICE TERMINAL VIEW */}
          {activeView === 'machine-practice' && currentMachine && (() => {
            const state = machineTerminalState[currentMachine.id] || { stepIndex: 0, context: 'kali', log: [] };
            const totalSteps = currentMachine.steps.length;
            const currentStep = currentMachine.steps[state.stepIndex] || { title: 'Complete' };
            const pct = Math.min(100, Math.round((state.stepIndex / totalSteps) * 100));

            return (
              <section className="view">
                <div 
                  style={{ color: 'var(--text-faint)', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}
                  onClick={() => setActiveView('machines')}
                >
                  ← Back to Practice Machines
                </div>

                <div className="section-head">
                  <span className="eyebrow">MACHINE · {currentMachine.os.toUpperCase()} / {currentMachine.difficulty.toUpperCase()}</span>
                  <h2>{currentMachine.name}</h2>
                  <p>{currentMachine.description}</p>
                </div>

                <div className="progress-wrap">
                  <div className="progress-label">
                    <span>
                      {state.stepIndex >= totalSteps ? 'Fully Compromised (100%)' : `Step ${state.stepIndex + 1} / ${totalSteps}: ${currentStep.title}`}
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', margin: '12px 0' }}>
                  <button className="btn-secondary" onClick={() => setShowHint(!showHint)}>
                    <HelpCircle size={13} style={{ display: 'inline', marginRight: '5px' }} />
                    {showHint ? 'Hide Hint' : '💡 Hint'}
                  </button>
                  <button 
                    className="btn-secondary" 
                    onClick={() => {
                      setMachineTerminalState(prev => ({
                        ...prev,
                        [currentMachine.id]: {
                          stepIndex: 0,
                          context: 'kali',
                          log: [{ cls: 'sys', text: '↺ Machine reset. Starting from Step 1.' }]
                        }
                      }));
                      showToast('Machine reset');
                    }}
                  >
                    <RotateCcw size={13} style={{ display: 'inline', marginRight: '5px' }} /> Reset
                  </button>
                </div>

                {showHint && (
                  <div className="hint-box">
                    💡 {state.stepIndex >= totalSteps ? 'Target already owned!' : currentStep.hint || 'No hint provided for this step.'}
                  </div>
                )}

                {/* Interactive Terminal */}
                <div className="term-shell">
                  <div className="term-bar">
                    <span className="term-dot r"></span>
                    <span className="term-dot y"></span>
                    <span className="term-dot g"></span>
                    <span className="term-title">
                      {state.context === 'kali' ? 'kali@range — attacker shell' : `${currentMachine.name.toLowerCase()} — target shell`}
                    </span>
                  </div>
                  <div className="term-body" ref={termBodyRef}>
                    {state.log.map((entry, idx) => (
                      <div key={idx} className={`term-line ${entry.cls}`}>
                        {entry.text}
                      </div>
                    ))}
                  </div>
                  <form className="term-inputline" onSubmit={handleTermSubmit}>
                    <span className={`term-prompt ${state.context === 'machine' ? 'ctx-machine' : ''}`}>
                      {state.context === 'kali' ? 'kali@range:~$' : `www-data@${currentMachine.name.toLowerCase()}:/var/www$`}
                    </span>
                    <input 
                      className="term-input" 
                      value={termInput} 
                      onChange={e => setTermInput(e.target.value)} 
                      placeholder="type a command and press Enter..." 
                      autoFocus 
                    />
                  </form>
                </div>
              </section>
            );
          })()}

          {/* NOTEBOOK VIEW */}
          {activeView === 'notebook' && (
            <section className="view">
              <div className="section-head">
                <span className="eyebrow">CUSTOM · USER DRILL BOOK &amp; CHEAT SHEETS</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <h2>📝 My Notebook</h2>
                  {isAdmin && (
                    <button 
                      className="nb-icon-btn danger" 
                      onClick={() => handleDeleteMainTopic('notebook', 'My Notebook')}
                    >
                      ✕ delete this topic permanently
                    </button>
                  )}
                </div>
                <p>Add custom penetration testing methodologies, custom payloads, and CTF writeups.</p>
              </div>

              <div className="notebook-toolbar">
                {isAdmin && (
                  <button className="add-btn" onClick={() => {
                    setNbEditingId(null);
                    setNbForm({ title: '', category: 'General', level: 'Easy', description: '', cmd: '' });
                    setShowNbForm(true);
                  }}>
                    + New Notebook Note
                  </button>
                )}
                <button className="btn-secondary" onClick={handleExport}>
                  <Download size={13} style={{ display: 'inline', marginRight: '5px' }} /> Export Notebook
                </button>
                {isAdmin && (
                  <label className="btn-secondary" style={{ cursor: 'pointer' }}>
                    <Upload size={13} style={{ display: 'inline', marginRight: '5px' }} /> Import Notebook
                    <input type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />
                  </label>
                )}
              </div>

              {/* Notebook Form */}
              {showNbForm && (
                <div className="add-form" style={{ marginBottom: '24px' }}>
                  <div className="add-form-row">
                    <div>
                      <label>Title</label>
                      <input 
                        value={nbForm.title} 
                        onChange={e => setNbForm({ ...nbForm, title: e.target.value })} 
                        placeholder="e.g. Blind SQL Injection Automated Script" 
                      />
                    </div>
                    <div>
                      <label>Category</label>
                      <input 
                        value={nbForm.category} 
                        onChange={e => setNbForm({ ...nbForm, category: e.target.value })} 
                        placeholder="Web / PrivEsc / Cloud" 
                      />
                    </div>
                  </div>
                  <label>Description</label>
                  <textarea 
                    value={nbForm.description} 
                    onChange={e => setNbForm({ ...nbForm, description: e.target.value })} 
                    placeholder="Context & usage instructions..." 
                  />
                  <label>Initial Command / Payload</label>
                  <textarea 
                    value={nbForm.cmd} 
                    onChange={e => setNbForm({ ...nbForm, cmd: e.target.value })} 
                    placeholder="sqlmap -u http://<TARGET>/api --dump..." 
                  />
                  <div className="form-actions">
                    <button className="btn-secondary" onClick={() => setShowNbForm(false)}>Cancel</button>
                    <button className="btn-primary" onClick={() => {
                      if (!nbForm.title.trim()) return;
                      const newTopic = {
                        id: nbEditingId || 'nb_' + Date.now(),
                        title: nbForm.title,
                        category: nbForm.category || 'General',
                        level: nbForm.level,
                        description: nbForm.description,
                        commands: nbForm.cmd ? [{ label: 'Command', text: nbForm.cmd }] : []
                      };
                      let list = platformData.notebookTopics || [];
                      if (nbEditingId) {
                        list = list.map(t => t.id === nbEditingId ? newTopic : t);
                      } else {
                        list = [...list, newTopic];
                      }
                      persistState({ ...platformData, notebookTopics: list });
                      setShowNbForm(false);
                      setNbEditingId(null);
                    }}>Save Note</button>
                  </div>
                </div>
              )}

              {/* Notebook Topics List */}
              <div style={{ marginTop: '16px' }}>
                {(!platformData.notebookTopics || platformData.notebookTopics.length === 0) ? (
                  <div className="empty-notebook">
                    No custom notebook topics yet. Log in as admin to create your first personal cheat sheet!
                  </div>
                ) : (
                  platformData.notebookTopics.map(t => (
                    <div className="topic open" key={t.id} style={{ marginBottom: '16px' }}>
                      <div className="topic-head" style={{ cursor: 'default' }}>
                        <span className="topic-id">{(t.category || 'GENERAL').toUpperCase()}</span>
                        <h3 style={{ flex: 1 }}>{t.title}</h3>
                        {isAdmin && (
                          <div className="nb-topic-actions">
                            <button 
                              className="nb-icon-btn" 
                              onClick={() => {
                                setNbEditingId(t.id);
                                setNbForm({
                                  title: t.title,
                                  category: t.category,
                                  level: t.level || 'Easy',
                                  description: t.description || '',
                                  cmd: t.commands?.[0]?.text || ''
                                });
                                setShowNbForm(true);
                              }}
                            >
                              ✎ edit
                            </button>
                            <button 
                              className="nb-icon-btn danger" 
                              onClick={() => {
                                const list = platformData.notebookTopics.filter(x => x.id !== t.id);
                                persistState({ ...platformData, notebookTopics: list });
                              }}
                            >
                              ✕ delete
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="topic-body">
                        {t.description && <p className="summary">{t.description}</p>}
                        {t.commands?.map((c, ci) => (
                          <CodeBlock 
                            key={ci} 
                            label={c.label || 'Payload'} 
                            raw={c.text} 
                            idKey={`nb_${t.id}_${ci}`} 
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* CUSTOM USER CREATED SECTIONS */}
          {platformData.customSections?.map(sec => {
            if (activeView !== sec.id) return null;

            return (
              <section className="view" key={sec.id}>
                <div className="section-head">
                  <span className="eyebrow">CUSTOM MAIN TOPIC</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <h2>{sec.icon} {sec.title}</h2>
                    {isAdmin && (
                      <button 
                        className="nb-icon-btn danger" 
                        onClick={() => handleDeleteMainTopic(sec.id, sec.title)}
                      >
                        ✕ delete this whole topic permanently
                      </button>
                    )}
                  </div>
                  <p>{sec.description}</p>
                </div>

                <div className="notebook-toolbar">
                  {isAdmin && (
                    <button className="add-btn" onClick={() => setShowSubtopicForm(showSubtopicForm === sec.id ? null : sec.id)}>
                      + New Subtopic
                    </button>
                  )}
                </div>

                {showSubtopicForm === sec.id && (
                  <div className="add-form" style={{ marginBottom: '20px' }}>
                    <label>Subtopic Title</label>
                    <input 
                      value={subtopicForm.title} 
                      onChange={e => setSubtopicForm({ ...subtopicForm, title: e.target.value })} 
                      placeholder="e.g. AWS IMDSv2 Bypass" 
                    />
                    <label>Description</label>
                    <textarea 
                      value={subtopicForm.description} 
                      onChange={e => setSubtopicForm({ ...subtopicForm, description: e.target.value })} 
                      placeholder="Details..." 
                    />
                    <label>Command or Script</label>
                    <textarea 
                      value={subtopicForm.cmd} 
                      onChange={e => setSubtopicForm({ ...subtopicForm, cmd: e.target.value })} 
                      placeholder="curl -H 'X-aws-ec2-metadata-token: ...' http://169.254.169.254..." 
                    />
                    <div className="form-actions">
                      <button className="btn-secondary" onClick={() => setShowSubtopicForm(null)}>Cancel</button>
                      <button className="btn-primary" onClick={() => {
                        if (!subtopicForm.title.trim()) return;
                        const newSub = {
                          id: 'sub_' + Date.now(),
                          title: subtopicForm.title,
                          description: subtopicForm.description,
                          commands: subtopicForm.cmd ? [{ label: 'Command', text: subtopicForm.cmd }] : []
                        };
                        const updatedSections = platformData.customSections.map(s => {
                          if (s.id === sec.id) {
                            return { ...s, subtopics: [...(s.subtopics || []), newSub] };
                          }
                          return s;
                        });
                        persistState({ ...platformData, customSections: updatedSections });
                        setSubtopicForm({ title: '', description: '', cmd: '' });
                        setShowSubtopicForm(null);
                      }}>Add Subtopic</button>
                    </div>
                  </div>
                )}

                <div>
                  {(!sec.subtopics || sec.subtopics.length === 0) ? (
                    <div className="empty-notebook">
                      No subtopics in this section yet. Click "+ New Subtopic" above to add commands and notes.
                    </div>
                  ) : (
                    sec.subtopics.map((sub, sidx) => (
                      <div className="topic open" key={sub.id || sidx} style={{ marginBottom: '14px' }}>
                        <div className="topic-head" style={{ cursor: 'default' }}>
                          <h3 style={{ flex: 1 }}>{sub.title}</h3>
                          {isAdmin && (
                            <button 
                              className="nb-icon-btn danger" 
                              onClick={() => {
                                const updatedSections = platformData.customSections.map(s => {
                                  if (s.id === sec.id) {
                                    return { ...s, subtopics: s.subtopics.filter(x => x.id !== sub.id) };
                                  }
                                  return s;
                                });
                                persistState({ ...platformData, customSections: updatedSections });
                              }}
                            >
                              ✕ delete
                            </button>
                          )}
                        </div>
                        <div className="topic-body">
                          {sub.description && <p className="summary">{sub.description}</p>}
                          {sub.commands?.map((c, ci) => (
                            <CodeBlock 
                              key={ci} 
                              label={c.label || 'cmd'} 
                              raw={c.text} 
                              idKey={`cust_${sec.id}_${sub.id}_${ci}`} 
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            );
          })}
          <BackendFetcher />
        </main>
      </div>

      {/* Admin Login Modal */}
      {adminModalOpen && (
        <div className="modal-overlay" onClick={() => setAdminModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">
              <Lock size={18} color="var(--amber)" /> Admin Authentication
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '16px' }}>
              Authenticate with server-side credentials to manage shared topics, customize practice machines, and broadcast live changes.
            </p>

            {authError && (
              <div style={{ color: 'var(--red)', background: 'var(--red-glow)', padding: '8px 12px', borderRadius: '4px', fontSize: '12px', marginBottom: '12px' }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <label style={{ fontSize: '10.5px', color: 'var(--text-faint)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Username</label>
              <input 
                type="text" 
                value={adminUser} 
                onChange={e => setAdminUser(e.target.value)} 
                placeholder="admin username" 
                style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--line)', color: 'var(--text)', padding: '8px 10px', borderRadius: '3px', marginBottom: '12px', fontFamily: 'var(--mono)', outline: 'none' }}
                autoFocus 
              />

              <label style={{ fontSize: '10.5px', color: 'var(--text-faint)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Password</label>
              <input 
                type="password" 
                value={adminPass} 
                onChange={e => setAdminPass(e.target.value)} 
                placeholder="••••••••" 
                style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--line)', color: 'var(--text)', padding: '8px 10px', borderRadius: '3px', marginBottom: '18px', fontFamily: 'var(--mono)', outline: 'none' }} 
              />

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setAdminModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Authenticate</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Toast Alert */}
      <div id="toast" className={toastMessage ? 'show' : ''}>
        {toastMessage}
      </div>
    </div>
  );
}
