// src/components/ui/Tabs.jsx
import { createContext, useContext, useState } from 'react';

const TabsContext = createContext();

export function Tabs({ value, onValueChange, children, className = '' }) {
  const [active, setActive] = useState(value);
  return (
    <TabsContext.Provider value={{ active, setActive: v => { setActive(v); onValueChange?.(v); } }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}
export function TabsList({ children, className = '' }) {
  return <div className={`flex gap-4 ${className}`}>{children}</div>;
}
export function TabsTrigger({ value, children, className = '' }) {
  const { active, setActive } = useContext(TabsContext);
  return <button onClick={() => setActive(value)} className={`px-3 py-2 rounded font-medium ${active === value ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'} ${className}`}>{children}</button>;
}
export function TabsContent({ value, children }) {
  const { active } = useContext(TabsContext);
  return active === value ? <div>{children}</div> : null;
}