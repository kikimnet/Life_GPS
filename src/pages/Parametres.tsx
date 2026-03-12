import { useState } from 'react';
import { User, Bell, Globe, Cpu } from 'lucide-react';

type Tab = 'profil' | 'système' | 'notifications' | 'intégrations';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profil', label: 'Profil', icon: <User size={16} /> },
    { id: 'système', label: 'Système', icon: <Cpu size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'intégrations', label: 'Intégrations', icon: <Globe size={16} /> },
];

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ background: '#1a1a1e', borderRadius: '14px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: '0 0 20px' }}>{title}</h3>
        {children}
    </div>
);

const SettingRow = ({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#e5e7eb' }}>{label}</div>
            {description && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{description}</div>}
        </div>
        {children}
    </div>
);

const inputStyle: React.CSSProperties = {
    background: '#111113', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
    padding: '8px 12px', color: '#e5e7eb', fontSize: '14px', fontFamily: 'inherit', minWidth: '220px',
};

export const Parametres = () => {
    const [activeTab, setActiveTab] = useState<Tab>('profil');
    const [name, setName] = useState('kikimnet');
    const [email, setEmail] = useState('kikimnet@hotmail.com');
    const [lang, setLang] = useState('FR');
    const [timezone, setTimezone] = useState('America/Toronto');
    const [notifications, setNotifications] = useState({ email: true, remind: true, weekly: false });
    const [pomodoroDuration, setPomodoroDuration] = useState(25);

    return (
        <div style={{ padding: '32px 40px', minHeight: '100vh' }}>
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', margin: 0 }}>Paramètres</h1>
                <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>Gérez votre compte et vos préférences</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', marginBottom: '24px', width: 'fit-content' }}>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                        borderRadius: '8px', border: 'none', fontSize: '14px',
                        background: activeTab === tab.id ? '#1a1a1e' : 'transparent',
                        color: activeTab === tab.id ? '#e5e7eb' : '#9ca3af',
                        cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s',
                    }}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'profil' && (
                <div style={{ maxWidth: '600px' }}>
                    <SectionCard title="Informations personnelles">
                        <SettingRow label="Nom d'utilisateur">
                            <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                        </SettingRow>
                        <SettingRow label="Email">
                            <input value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                        </SettingRow>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                                Sauvegarder
                            </button>
                        </div>
                    </SectionCard>

                    <SectionCard title="Langue">
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {[{ code: 'FR', flag: '🇫🇷', label: 'Français' }, { code: 'EN', flag: '🇬🇧', label: 'English' }, { code: 'ES', flag: '🇪🇸', label: 'Español' }].map(l => (
                                <button key={l.code} onClick={() => setLang(l.code)} style={{
                                    padding: '10px 20px', borderRadius: '10px', border: `1px solid ${lang === l.code ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                                    background: lang === l.code ? 'rgba(99,102,241,0.15)' : 'transparent',
                                    color: lang === l.code ? '#e5e7eb' : '#9ca3af', fontSize: '14px', cursor: 'pointer', fontWeight: 500,
                                }}>{l.flag} {l.label}</button>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            )}

            {activeTab === 'système' && (
                <div style={{ maxWidth: '600px' }}>
                    <SectionCard title="Préférences">
                        <SettingRow label="Fuseau horaire" description="Utilisé pour les rappels et statistiques">
                            <select value={timezone} onChange={e => setTimezone(e.target.value)} style={inputStyle}>
                                {['America/Toronto', 'America/New_York', 'Europe/Paris', 'Africa/Casablanca', 'Asia/Dubai'].map(tz => (
                                    <option key={tz} value={tz}>{tz}</option>
                                ))}
                            </select>
                        </SettingRow>
                        <SettingRow label="Durée sessions Pomodoro" description="Durée en minutes par défaut">
                            <input type="number" value={pomodoroDuration} onChange={e => setPomodoroDuration(parseInt(e.target.value))} min={5} max={90}
                                style={{ ...inputStyle, minWidth: '80px' }} />
                        </SettingRow>
                    </SectionCard>

                    <SectionCard title="Compte">
                        <SettingRow label="Plan actuel" description="Votre abonnement actuel">
                            <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(99,102,241,0.2)', color: '#818cf8', fontSize: '13px', fontWeight: 700 }}>PRO PLAN</span>
                        </SettingRow>
                    </SectionCard>
                </div>
            )}

            {activeTab === 'notifications' && (
                <div style={{ maxWidth: '600px' }}>
                    <SectionCard title="Notifications par email">
                        {[
                            { key: 'email', label: 'Rappels d\'habitudes', desc: 'Rappels quotidiens pour vos habitudes' },
                            { key: 'remind', label: 'Rappels de missions', desc: 'Rappels pour vos missions Deep Work' },
                            { key: 'weekly', label: 'Résumé hebdomadaire', desc: 'Résumé de vos progrès chaque semaine' },
                        ].map(n => (
                            <SettingRow key={n.key} label={n.label} description={n.desc}>
                                <button onClick={() => setNotifications(p => ({ ...p, [n.key]: !p[n.key as keyof typeof notifications] }))} style={{
                                    width: '44px', height: '24px', borderRadius: '12px', border: 'none',
                                    background: notifications[n.key as keyof typeof notifications] ? '#6366f1' : 'rgba(255,255,255,0.15)',
                                    cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                                }}>
                                    <div style={{
                                        position: 'absolute', top: '4px',
                                        left: notifications[n.key as keyof typeof notifications] ? '23px' : '4px',
                                        width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
                                    }} />
                                </button>
                            </SettingRow>
                        ))}
                    </SectionCard>
                </div>
            )}

            {activeTab === 'intégrations' && (
                <div style={{ maxWidth: '600px' }}>
                    <SectionCard title="Intégrations disponibles">
                        {[
                            { name: 'Google Calendar', desc: 'Synchroniser vos missions et objectifs', logo: '📅', available: false },
                            { name: 'Notion', desc: 'Exporter votre journal et revues', logo: '📦', available: false },
                            { name: 'Todoist', desc: 'Importer vos tâches existantes', logo: '✅', available: false },
                        ].map(i => (
                            <SettingRow key={i.name} label={`${i.logo} ${i.name}`} description={i.desc}>
                                <button disabled style={{
                                    padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'transparent', color: '#6b7280', fontSize: '13px', cursor: 'not-allowed',
                                }}>Bientôt disponible</button>
                            </SettingRow>
                        ))}
                    </SectionCard>
                </div>
            )}
        </div>
    );
};
