
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

const TOOLS_LIST = [
  'Component Services',
  'Computer Management',
  'Defragment and Optimize Drives',
  'Disk Cleanup',
  'DNS',
  'Event Viewer',
  'File Explorer',
  'Group Policy Management',
  'iSCSI Initiator',
  'Local Security Policy',
  'Paskanet II Console',
  'Paskanet II Directory Manager',
  'Performance Monitor',
  'Print Management',
  'Resource Monitor',
  'Services',
  'System Configuration',
  'System Information',
  'Task Scheduler',
  'Windows Memory Diagnostic',
];

type IconProps = {
  name: string;
  className?: string;
};

const Icon = ({ name, className = '' }: IconProps) => {
  return <div className={`icon icon-${name} ${className}`}></div>;
};


type WindowComponentProps = {
  title: string;
  onClose: () => void;
  onFocus: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  style: React.CSSProperties;
  children?: React.ReactNode;
};

const BaseWindow = ({ title, onClose, onFocus, onDragStart, style, children }: WindowComponentProps) => {
  return (
    <div className="window" onMouseDown={onFocus} style={style}>
      <div className="title-bar" onMouseDown={onDragStart}>
        <span className="title-bar-text">{title}</span>
        <div className="title-bar-controls">
          <button className="title-bar-button" aria-label="Minimize" disabled><Icon name="minimize" /></button>
          <button className="title-bar-button" aria-label="Maximize" disabled><Icon name="maximize" /></button>
          <button className="title-bar-button close-button" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
      </div>
      <div className="window-body">
        {children}
      </div>
    </div>
  );
};

// --- START OF NEW TOOL COMPONENTS ---

const PerformanceMonitor = (props: Omit<WindowComponentProps, 'title' | 'children'>) => {
  const [data, setData] = useState<number[]>(() => Array(60).fill(0));

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData.slice(1), Math.random() * 80 + 10];
        return newData;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const generatePath = (d: number[]) => {
    let path = `M 0,${100 - d[0] * 0.9}`;
    d.forEach((point, i) => {
      if (i > 0) {
        path += ` L ${i * (300 / 59)},${100 - point * 0.9}`;
      }
    });
    return path;
  };
  
  return (
    <BaseWindow title="Performance Monitor" {...props}>
      <div className="performance-monitor">
        <h3>CPU Usage (%)</h3>
        <div className="chart-container">
            <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="chart-svg">
                <path d={generatePath(data)} stroke="#0078d7" fill="none" strokeWidth="1" />
            </svg>
             <div className="chart-grid">
                {[...Array(5)].map((_, i) => <div key={i} className="grid-line" style={{bottom: `${i * 25}%`}}></div>)}
            </div>
        </div>
      </div>
    </BaseWindow>
  );
};


const ResourceMonitor = (props: Omit<WindowComponentProps, 'title' | 'children'>) => {
    const initialProcesses = [
        { name: 'System', pid: 4, cpu: 15, memory: 128 },
        { name: 'svchost.exe', pid: 1120, cpu: 5, memory: 64 },
        { name: 'explorer.exe', pid: 4132, cpu: 8, memory: 256 },
        { name: 'chrome.exe', pid: 5123, cpu: 25, memory: 512 },
        { name: 'P2Manager.exe', pid: 6012, cpu: 12, memory: 180 },
        { name: 'services.exe', pid: 888, cpu: 2, memory: 48 },
    ];
    const [processes, setProcesses] = useState(initialProcesses);

    useEffect(() => {
        const interval = setInterval(() => {
            setProcesses(procs => procs.map(p => ({
                ...p,
                cpu: Math.max(0, Math.min(100, p.cpu + Math.floor(Math.random() * 5) - 2)),
                memory: Math.max(p.memory*0.95, Math.min(p.memory*1.05, p.memory + Math.floor(Math.random() * 10) - 5)),
            })));
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <BaseWindow title="Resource Monitor" {...props}>
            <div className="table-view-container">
                <table className="data-table">
                    <thead>
                        <tr><th>Process</th><th>PID</th><th>CPU (%)</th><th>Memory (MB)</th></tr>
                    </thead>
                    <tbody>
                        {processes.sort((a,b) => b.cpu - a.cpu).map(p => (
                            <tr key={p.pid}>
                                <td>{p.name}</td>
                                <td>{p.pid}</td>
                                <td>{p.cpu}</td>
                                <td>{p.memory.toFixed(1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </BaseWindow>
    );
};

const Services = (props: Omit<WindowComponentProps, 'title' | 'children'>) => {
    const [services, setServices] = useState([
        { name: 'Print Spooler', status: 'Running', description: 'Manages all print jobs.' },
        { name: 'Windows Update', status: 'Stopped', description: 'Enables the detection, download, and installation of updates.' },
        { name: 'Paskanet II Agent', status: 'Running', description: 'Monitors Paskanet II services.' },
        { name: 'Remote Desktop Service', status: 'Running', description: 'Allows users to connect remotely.' },
        { name: 'Windows Defender', status: 'Running', description: 'Protects against malware.' },
        { name: 'DNS Client', status: 'Running', description: 'Resolves and caches DNS names.' },
        { name: 'DHCP Client', status: 'Stopped', description: 'Manages network configuration.' },
    ]);
    const [selectedService, setSelectedService] = useState<string | null>(null);

    const handleServiceAction = (name: string, action: 'start' | 'stop' | 'restart') => {
        setServices(current => current.map(s => {
            if (s.name === name) {
                if (action === 'start') return { ...s, status: 'Running' };
                if (action === 'stop') return { ...s, status: 'Stopped' };
                if (action === 'restart') {
                    // Quick restart simulation
                    setTimeout(() => handleServiceAction(name, 'start'), 500);
                    return { ...s, status: 'Stopped' };
                }
            }
            return s;
        }));
    };
    
    const currentService = services.find(s => s.name === selectedService);

    return (
        <BaseWindow title="Services" {...props}>
            <div className="services-container">
                <div className="services-toolbar">
                    <button onClick={() => currentService && handleServiceAction(currentService.name, 'start')} disabled={!currentService || currentService.status === 'Running'}><Icon name="start"/> Start</button>
                    <button onClick={() => currentService && handleServiceAction(currentService.name, 'stop')} disabled={!currentService || currentService.status === 'Stopped'}><Icon name="stop"/> Stop</button>
                    <button onClick={() => currentService && handleServiceAction(currentService.name, 'restart')} disabled={!currentService}><Icon name="restart"/> Restart</button>
                </div>
                <div className="table-view-container">
                    <table className="data-table selectable">
                        <thead>
                            <tr><th>Name</th><th>Description</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {services.map(s => (
                                <tr key={s.name} onClick={() => setSelectedService(s.name)} className={selectedService === s.name ? 'selected' : ''}>
                                    <td>{s.name}</td>
                                    <td>{s.description}</td>
                                    <td><span className={`status-dot ${s.status.toLowerCase()}`}></span> {s.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </BaseWindow>
    );
};

const EventViewer = (props: Omit<WindowComponentProps, 'title' | 'children'>) => {
    const events = [
        { level: 'Error', source: 'Kernel-Power', id: 41, message: 'The system has rebooted without cleanly shutting down first.' },
        { level: 'Warning', source: 'DNS-Client', id: 1014, message: 'Name resolution for the name _ldap._tcp.paskanet2.local timed out.' },
        { level: 'Information', source: 'Service Control Manager', id: 7036, message: 'The Print Spooler service entered the running state.' },
        { level: 'Information', source: 'P2-Agent', id: 100, message: 'Successfully polled server PN2-WEB-01.' },
        { level: 'Error', source: 'P2-Agent', id: 205, message: 'Failed to connect to PN2-DB-01.' },
        { level: 'Warning', source: 'Disk', id: 153, message: 'The IO operation at logical block address ... was retried.' },
    ];
    const getIcon = (level: string) => {
        if (level === 'Error') return <Icon name="error" />;
        if (level === 'Warning') return <Icon name="warning" />;
        return <Icon name="info" />;
    }

    return (
        <BaseWindow title="Event Viewer" {...props}>
            <h3>Windows Logs &gt; System</h3>
             <div className="table-view-container">
                <table className="data-table">
                    <thead><tr><th>Level</th><th>Source</th><th>Event ID</th><th>Message</th></tr></thead>
                    <tbody>
                        {events.map((e, i) => <tr key={i}><td><div className="event-level-cell">{getIcon(e.level)} {e.level}</div></td><td>{e.source}</td><td>{e.id}</td><td>{e.message}</td></tr>)}
                    </tbody>
                </table>
            </div>
        </BaseWindow>
    );
};

const DiskCleanup = (props: Omit<WindowComponentProps, 'title' | 'children'>) => {
    const [step, setStep] = useState(0); // 0: initial, 1: scanning, 2: results, 3: cleaning
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (step === 1 || step === 3) {
            setProgress(0);
            const interval = setInterval(() => {
                setProgress(p => {
                    if (p >= 100) {
                        clearInterval(interval);
                        setStep(s => s + 1);
                        return 100;
                    }
                    return p + 5;
                });
            }, 100);
            return () => clearInterval(interval);
        }
    }, [step]);
    
    return (
        <BaseWindow title="Disk Cleanup (C:)" {...props}>
            <div className="disk-tool">
                {step === 0 && <>
                    <p>Disk Cleanup can free up space on your hard disk.</p>
                    <button onClick={() => setStep(1)}>Scan Disk</button>
                </>}
                {(step === 1 || step === 3) && <>
                    <p>{step === 1 ? 'Scanning' : 'Cleaning up'} files...</p>
                    <div className="progress-bar-container full-width"><div className="progress-bar-fill" style={{width: `${progress}%`}}></div></div>
                </>}
                 {step === 2 && <>
                    <p>Files to delete:</p>
                    <ul className="file-list">
                        <li><input type="checkbox" defaultChecked /> Downloaded Program Files (1.2 MB)</li>
                        <li><input type="checkbox" defaultChecked /> Temporary Internet Files (34.5 MB)</li>
                        <li><input type="checkbox" defaultChecked /> Recycle Bin (15.7 MB)</li>
                    </ul>
                    <button onClick={() => setStep(3)}>Clean up system files</button>
                </>}
                {step === 4 && <p>Disk cleanup complete.</p>}
            </div>
        </BaseWindow>
    );
};

const DefragmentAndOptimizeDrives = (props: Omit<WindowComponentProps, 'title' | 'children'>) => {
    const [drives, setDrives] = useState([
        { name: '(C:)', media: 'Solid state drive', status: 'OK' },
        { name: '(D:) Recovery', media: 'Hard disk drive', status: 'Needs optimization' },
    ]);
    const [optimizing, setOptimizing] = useState(false);

    const handleOptimize = () => {
        setOptimizing(true);
        setTimeout(() => {
            setDrives(d => d.map(drive => ({ ...drive, status: 'OK' })));
            setOptimizing(false);
        }, 3000);
    };

    return (
        <BaseWindow title="Optimize Drives" {...props}>
            <div className="table-view-container">
                <