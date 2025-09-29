
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

// --- DATA & CONFIG ---
const TOOLS_LIST = [
  'Command Prompt',
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
  'Performance Monitor',
  'Print Management',
  'Resource Monitor',
  'Services',
  'System Configuration',
  'System Information',
  'Task Scheduler',
  'Windows Memory Diagnostic',
];

// --- GENERIC COMPONENTS & TYPES ---

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

// --- DESKTOP & MENU COMPONENTS ---

type DesktopIconProps = {
  name: string;
  iconName: string;
  onOpen: () => void;
};

const DesktopIcon = ({ name, iconName, onOpen }: DesktopIconProps) => {
  return (
    <div className="desktop-icon" onDoubleClick={onOpen}>
      <div className="desktop-icon-img">
        <Icon name={iconName} className="paskanet-icon" />
      </div>
      <span className="desktop-icon-label">{name}</span>
    </div>
  );
};

const StartMenu = ({ onShutdown, onClose }: { onShutdown: () => void, onClose: () => void }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                const startButton = (event.target as HTMLElement).closest('.start-button');
                if (!startButton) {
                    onClose();
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div className="start-menu" ref={menuRef}>
            <div className="start-menu-item" onClick={onShutdown}>
                <Icon name="shutdown" />
                Shutdown
            </div>
        </div>
    );
};


// --- TOOL COMPONENTS ---

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
            <div className="disk-tool">
                 <div className="table-view-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Drive</th>
                                <th>Media type</th>
                                <th>Current status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drives.map(drive => (
                                <tr key={drive.name}>
                                    <td>{drive.name}</td>
                                    <td>{drive.media}</td>
                                    <td>{optimizing && drive.status !== 'OK' ? 'Optimizing...' : drive.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button onClick={handleOptimize} disabled={optimizing || drives.every(d => d.status === 'OK')}>
                    {optimizing ? 'Optimizing...' : 'Optimize'}
                </button>
            </div>
        </BaseWindow>
    );
};

const Terminal = (props: Omit<WindowComponentProps, 'title' | 'children'>) => {
    const [lines, setLines] = useState<string[]>(['Paskanet II [Version 2.1.0]', '(c) Paskanet Corporation. All rights reserved.', '']);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);

    const executeCommand = (cmd: string) => {
        const [command, ...args] = cmd.trim().split(' ');
        const output: string[] = [`P:\\> ${cmd}`];

        switch (command.toLowerCase()) {
            case 'help':
                output.push('For more information on a specific command, type HELP command-name');
                output.push('CLS              Clears the screen.');
                output.push('CMD              Starts a new instance of the Paskanet II command interpreter.');
                output.push('COLOR            Sets the default console foreground and background colors.');
                output.push('DATE             Displays or sets the date.');
                output.push('DIR              Displays a list of files and subdirectories in a directory.');
                output.push('ECHO             Displays messages, or turns command echoing on or off.');
                output.push('EXIT             Quits the CMD.EXE program (command interpreter).');
                output.push('HOSTNAME         Prints the name of the current host.');
                output.push('IPCONFIG         Displays all current TCP/IP network configuration values.');
                output.push('NETSTAT          Displays protocol statistics and current TCP/IP network connections.');
                output.push('PING             Verifies connectivity to a remote computer.');
                output.push('SHUTDOWN         Allows proper local or remote shutdown of the machine.');
                output.push('SYSINFO          Displays machine specific properties and configuration.');
                output.push('TASKLIST         Displays all currently running tasks including services.');
                output.push('TIME             Displays or sets the system time.');
                output.push('TYPE             Displays the contents of a text file or files.');
                output.push('VER              Displays the Paskanet II version.');
                output.push('WHOAMI           Displays the current user name.');
                break;
            case 'cls':
                setLines([]);
                return; // Early return to avoid adding to lines
            case 'echo':
                output.push(args.join(' '));
                break;
            case 'ver':
                output.push('Paskanet II [Version 2.1.0]');
                break;
            case 'date':
                output.push(`The current date is: ${new Date().toLocaleDateString()}`);
                break;
            case 'time':
                output.push(`The current time is: ${new Date().toLocaleTimeString()}`);
                break;
            case 'dir':
                output.push(' Volume in drive P is PaskanetOS');
                output.push(' Directory of P:\\');
                output.push('');
                output.push('07/04/2024  02:10 PM    <DIR>          Users');
                output.push('07/04/2024  01:05 PM    <DIR>          Windows');
                output.push('07/04/2024  03:15 PM    <DIR>          Program Files');
                output.push('07/05/2024  09:00 AM             1,024 config.sys');
                output.push('               1 File(s)          1,024 bytes');
                output.push('               3 Dir(s)   17,179,869,184 bytes free');
                break;
            case 'ping':
                if (args.length === 0) {
                    output.push('Usage: ping <hostname>');
                } else {
                    output.push(`Pinging ${args[0]} with 32 bytes of data:`);
                    for (let i = 0; i < 4; i++) {
                        const delay = Math.floor(Math.random() * (150 - 20 + 1) + 20);
                        output.push(`Reply from ${args[0]}: bytes=32 time=${delay}ms TTL=58`);
                    }
                }
                break;
            case 'tasklist':
                 output.push('Image Name                     PID Session Name        Session#    Mem Usage');
                 output.push('========================= ======== ================ =========== ============');
                 output.push('System                           4 Services                   0      128 MB');
                 output.push('svchost.exe                   1120 Services                   0       64 MB');
                 output.push('explorer.exe                  4132 Console                    1      256 MB');
                 output.push('P2Manager.exe                 6012 Services                   0      180 MB');
                 output.push('cmd.exe                       7123 Console                    1       24 MB');
                break;
            case 'sysinfo':
                output.push('Host Name:                 PASKANET-SVR-01');
                output.push('OS Name:                   Paskanet II Server');
                output.push('OS Version:                2.1.0 Build 2100');
                output.push('Processor(s):              1 Processor(s) Installed.');
                output.push('Total Physical Memory:     32,768 MB');
                output.push('Available Physical Memory: 14,336 MB');
                break;
            case 'exit':
                 props.onClose();
                 return;
            case 'shutdown':
                output.push('Broadcasting shutdown message...');
                output.push('Use the Start Menu or Manage menu to shut down.');
                break;
            case '':
                // Just add a new prompt if empty command
                break;
            default:
                output.push(`'${command}' is not recognized as an internal or external command,`);
                output.push('operable program or batch file.');
                break;
        }

        setLines(prev => [...prev, ...output, '']);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const command = e.currentTarget.value;
            if (command) {
                setCommandHistory(prev => [command, ...prev]);
            }
            setHistoryIndex(-1);
            executeCommand(command);
            e.currentTarget.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length > 0) {
                const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
                setHistoryIndex(newIndex);
                e.currentTarget.value = commandHistory[newIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
             if (historyIndex > 0) {
                const newIndex = Math.max(historyIndex - 1, 0);
                setHistoryIndex(newIndex);
                e.currentTarget.value = commandHistory[newIndex];
            } else if (historyIndex <= 0) {
                setHistoryIndex(-1);
                e.currentTarget.value = '';
            }
        }
    };
    
    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
    }, [lines]);
    
    useEffect(() => {
        inputRef.current?.focus();
    }, []);


    return (
        <BaseWindow title="Paskanet II Command Prompt" {...props}>
            <div className="console-body" ref={bodyRef} onClick={() => inputRef.current?.focus()}>
                {lines.map((line, i) => (
                    <div key={i} className="console-line">{line}</div>
                ))}
                 <div className="console-input-line">
                    <span className="console-prompt">P:\&gt;</span>
                    <input
                        ref={inputRef}
                        type="text"
                        className="console-input"
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck="false"
                    />
                </div>
            </div>
        </BaseWindow>
    );
};

// --- CORE APP COMPONENTS ---

const MenuBar = ({ onOpenTool, onShutdown }: { onOpenTool: (tool: string) => void; onShutdown: () => void; }) => {
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleMenuClick = (menu: string) => {
        setOpenMenu(prev => (prev === menu ? null : menu));
    };
    
    const handleItemClick = (tool: string) => {
        onOpenTool(tool);
        setOpenMenu(null);
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenu(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="menu-bar-app-level" ref={menuRef}>
            <div className="menu-item" onClick={() => handleMenuClick('Manage')}>
                Manage
                {openMenu === 'Manage' && (
                    <div className="menu-dropdown">
                        <div className="dropdown-item" onClick={onShutdown}>Shutdown</div>
                    </div>
                )}
            </div>
            <div className="menu-item" onClick={() => handleMenuClick('Tools')}>
                Tools
                {openMenu === 'Tools' && (
                    <div className="menu-dropdown">
                        {TOOLS_LIST.map(tool => (
                            <div key={tool} className="dropdown-item" onClick={() => handleItemClick(tool)}>{tool}</div>
                        ))}
                    </div>
                )}
            </div>
            <div className="menu-item">View</div>
            <div className="menu-item">Help</div>
        </div>
    );
};

const ServerManager = () => {
    // This is a mock implementation.
    const [servers, setServers] = useState([
        { name: 'PN2-WEB-01', ip: '192.168.1.10', status: 'online', cpu: 34, mem: 68, disk: 45, netUp: 1.2, netDown: 5.4 },
        { name: 'PN2-WEB-02', ip: '192.168.1.11', status: 'online', cpu: 28, mem: 75, disk: 50, netUp: 0.8, netDown: 3.1 },
        { name: 'PN2-DB-01', ip: '192.168.1.20', status: 'warning', cpu: 88, mem: 92, disk: 80, netUp: 10.5, netDown: 2.2 },
        { name: 'PN2-CACHE-01', ip: '192.168.1.30', status: 'offline', cpu: 0, mem: 0, disk: 0, netUp: 0, netDown: 0 },
    ]);
    const [selectedServer, setSelectedServer] = useState(servers[0]);
    const [logs, setLogs] = useState([
        '[Info] Server startup sequence initiated.',
        '[Info] Paskanet II Agent v2.1.0 connected.',
        '[Warning] High memory usage detected: 92%',
        '[Error] Failed to connect to database replica on PN2-DB-02.',
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setServers(currentServers => currentServers.map(s => {
                if (s.status === 'offline') return s;
                return {
                    ...s,
                    cpu: Math.max(10, Math.min(99, s.cpu + Math.floor(Math.random() * 7) - 3)),
                    mem: Math.max(10, Math.min(99, s.mem + Math.floor(Math.random() * 5) - 2)),
                }
            }));
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    const selected = servers.find(s => s.name === selectedServer.name)!;

    return (
        <div className="server-manager-live-view">
            <div className="server-list-sidebar">
                <div className="server-list-cluster">
                    <h3>Web Servers</h3>
                    {servers.filter(s => s.name.includes('WEB')).map(server => (
                        <div key={server.name} className={`server-list-item ${selectedServer.name === server.name ? 'selected' : ''}`} onClick={() => setSelectedServer(server)}>
                            <span className={`status-dot ${server.status}`}></span>
                            <div className="server-info">
                                <span className="server-name">{server.name}</span>
                                <span className="server-details">{server.ip}</span>
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="server-list-cluster">
                    <h3>Database Servers</h3>
                     {servers.filter(s => s.name.includes('DB')).map(server => (
                        <div key={server.name} className={`server-list-item ${selectedServer.name === server.name ? 'selected' : ''}`} onClick={() => setSelectedServer(server)}>
                            <span className={`status-dot ${server.status}`}></span>
                            <div className="server-info">
                                <span className="server-name">{server.name}</span>
                                <span className="server-details">{server.ip}</span>
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="server-list-cluster">
                    <h3>Other Servers</h3>
                     {servers.filter(s => !s.name.includes('WEB') && !s.name.includes('DB')).map(server => (
                        <div key={server.name} className={`server-list-item ${selectedServer.name === server.name ? 'selected' : ''}`} onClick={() => setSelectedServer(server)}>
                            <span className={`status-dot ${server.status}`}></span>
                            <div className="server-info">
                                <span className="server-name">{server.name}</span>
                                <span className="server-details">{server.ip}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="server-dashboard-main">
                <div className="dashboard-header">
                    <div className="server-title">
                        <h2>{selected.name}</h2>
                        <span>{selected.ip} &bull; Paskanet II Datacenter</span>
                    </div>
                    <div className="server-actions">
                        <button disabled={selected.status === 'offline'}>Restart</button>
                        <button className="stop-button" disabled={selected.status === 'offline'}>Stop</button>
                    </div>
                </div>
                <div className="metrics-grid">
                    <div className="metric-card">
                        <div className="metric-header">CPU Utilization</div>
                        <div className="metric-body"><span className="metric-large-value">{selected.cpu}<span className="unit">%</span></span></div>
                    </div>
                     <div className="metric-card">
                        <div className="metric-header">Memory</div>
                        <div className="metric-body">
                            <span className="metric-large-value">{selected.mem}<span className="unit">%</span></span>
                            <span className="metric-small-value">{(selected.mem/100 * 32).toFixed(1)} / 32.0 GB</span>
                        </div>
                    </div>
                     <div className="metric-card">
                        <div className="metric-header">Disk (C:)</div>
                         <div className="metric-body">
                            <span className="metric-large-value">{selected.disk}<span className="unit">%</span></span>
                            <div className="progress-bar-container full-width" style={{margin: '5px 0 0 0'}}><div className="progress-bar-fill" style={{width: `${selected.disk}%`}}></div></div>
                        </div>
                    </div>
                     <div className="metric-card">
                        <div className="metric-header">Network I/O</div>
                        <div className="metric-body">
                             <div className="network-details">
                                <span>&uarr; {selected.netUp.toFixed(1)} Mbps Sent</span>
                                <span>&darr; {selected.netDown.toFixed(1)} Mbps Received</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="log-viewer">
                    <div className="log-tabs"><button className="active">System</button><button>Application</button></div>
                    <div className="log-content">
                        {logs.map((log, i) => <div key={i} className={`log-line ${log.includes('Error') ? 'log-error' : ''}`}>{log}</div>)}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ServerManagerWindow = (props: Omit<WindowComponentProps, 'title' | 'children'>) => {
    return (
        <BaseWindow title="Server Manager" {...props}>
            <ServerManager />
        </BaseWindow>
    );
};


// --- APP LOGIC & MAIN COMPONENT ---

const toolComponentMap: { [key: string]: React.ComponentType<any> } = {
  'Command Prompt': Terminal,
  'Server Manager': ServerManagerWindow,
  'Performance Monitor': PerformanceMonitor,
  'Resource Monitor': ResourceMonitor,
  'Services': Services,
  'Event Viewer': EventViewer,
  'Disk Cleanup': DiskCleanup,
  'Defragment and Optimize Drives': DefragmentAndOptimizeDrives,
};

const App = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [shuttingDown, setShuttingDown] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [time, setTime] = useState(new Date());
    const [isStartMenuOpen, setStartMenuOpen] = useState(false);

    const [windows, setWindows] = useState<any[]>([]);
    const windowIdCounter = useRef(0);
    const dragInfo = useRef<{ id: number; offset: { x: number; y: number } } | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000 * 30); // Update every 30s
        return () => clearInterval(timer);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const password = (e.target as any).password.value;
        if (password === '0000') {
            setLoggedIn(true);
            setLoginError('');
        } else {
            setLoginError('Incorrect password.');
        }
    };
    
    const handleShutdown = () => {
        setShuttingDown(true);
        setTimeout(() => {
            setWindows([]);
            setStartMenuOpen(false);
            setLoggedIn(false);
            setShuttingDown(false);
        }, 1500);
    }

    const focusWindow = useCallback((id: number) => {
        setWindows(currentWindows => {
            const maxZ = currentWindows.length;
            const windowToFocus = currentWindows.find(w => w.id === id);
            if (!windowToFocus || windowToFocus.zIndex === maxZ) {
                return currentWindows;
            }
            const oldZ = windowToFocus.zIndex;
            return currentWindows.map(w => {
                if (w.id === id) return { ...w, zIndex: maxZ };
                if (w.zIndex > oldZ) return { ...w, zIndex: w.zIndex - 1 };
                return w;
            });
        });
    }, []);

    const openWindow = useCallback((toolName: string) => {
        const component = toolComponentMap[toolName];
        if (!component) {
            alert(`Tool "${toolName}" is not available.`);
            return;
        }
        const newId = windowIdCounter.current++;
        const isServerManager = toolName === 'Server Manager';

        setWindows(currentWindows => {
            const newWindow = {
                id: newId,
                title: toolName,
                component,
                position: { x: isServerManager ? 50 : 50 + (newId % 10) * 20, y: isServerManager ? 40 : 50 + (newId % 10) * 20 },
                size: { width: isServerManager ? 'calc(100vw - 100px)' : '640px', height: isServerManager ? 'calc(100vh - 150px)' : '480px'},
                zIndex: currentWindows.length + 1
            };
            return [...currentWindows, newWindow];
        });
    }, []);

    const closeWindow = useCallback((id: number) => {
        setWindows(currentWindows => currentWindows.filter(w => w.id !== id));
    }, []);

    const handleDrag = useCallback((e: MouseEvent) => {
        if (!dragInfo.current) return;
        const { id, offset } = dragInfo.current;
        setWindows(prev => prev.map(w => w.id === id ? { ...w, position: { x: e.clientX - offset.x, y: e.clientY - offset.y } } : w));
    }, []);

    const handleDragEnd = useCallback(() => {
        dragInfo.current = null;
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', handleDragEnd);
    }, [handleDrag]);
    
    const handleDragStart = useCallback((id: number, e: React.MouseEvent) => {
        const windowEl = (e.target as HTMLElement).closest('.window');
        if (!windowEl) return;
        focusWindow(id);
        const rect = windowEl.getBoundingClientRect();
        dragInfo.current = {
            id,
            offset: { x: e.clientX - rect.left, y: e.clientY - rect.top },
        };
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', handleDragEnd);
    }, [focusWindow, handleDrag, handleDragEnd]);


    if (shuttingDown) {
        return (
            <div className="shutdown-screen">
                <div className="paskanet-logo"><Icon name="paskanet-logo" /></div>
                <h1>Shutting down...</h1>
            </div>
        );
    }


    if (!loggedIn) {
        return (
            <div className="login-screen">
                <form className="login-box" onSubmit={handleLogin}>
                    <div className="paskanet-logo"><Icon name="paskanet-logo" /></div>
                    <h1>Paskanet II</h1>
                    <p>Enter password to continue.</p>
                    <input type="password" name="password" placeholder="Password" autoFocus />
                    <button type="submit">Login</button>
                    {loginError && <p className="login-error">{loginError}</p>}
                </form>
            </div>
        );
    }

    return (
        <div className="desktop">
            <MenuBar onOpenTool={openWindow} onShutdown={handleShutdown} />
            
            <div className="desktop-icons-container">
                 <DesktopIcon name="Server Manager" iconName="server-manager" onOpen={() => openWindow('Server Manager')} />
            </div>

            {windows.sort((a,b) => a.zIndex - b.zIndex).map(win => {
                const WinComponent = win.component;
                return (
                    <WinComponent
                        key={win.id}
                        onClose={() => closeWindow(win.id)}
                        onFocus={() => focusWindow(win.id)}
                        onDragStart={(e: React.MouseEvent) => handleDragStart(win.id, e)}
                        style={{
                            left: win.position.x,
                            top: win.position.y,
                            zIndex: win.zIndex,
                            width: win.size.width,
                            height: win.size.height,
                        }}
                    />
                );
            })}

            {isStartMenuOpen && <StartMenu onShutdown={handleShutdown} onClose={() => setStartMenuOpen(false)} />}
            
            <div className="taskbar">
                <button className="start-button" aria-label="Start" onClick={() => setStartMenuOpen(p => !p)}>
                    <Icon name="paskanet-logo" className="start-logo"/>
                </button>
                <div className="taskbar-tray">
                    <div className="taskbar-clock">
                        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- RENDER ---
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}