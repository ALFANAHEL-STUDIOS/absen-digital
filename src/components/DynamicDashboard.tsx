"use client";

import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import DashboardWidget from './DashboardWidget';
import { PlusCircle, BarChart2, LineChart, PieChart, Table, FileBarChart2 } from 'lucide-react';

// Apply responsive capabilities to the grid layout
const ResponsiveGridLayout = WidthProvider(Responsive) as any;

// Define widget types
const widgetTypes = [{
  id: 'bar',
  name: 'Bar Chart',
  icon: <BarChart2 size={18} />
}, {
  id: 'line',
  name: 'Line Chart',
  icon: <LineChart size={18} />
}, {
  id: 'pie',
  name: 'Pie Chart',
  icon: <PieChart size={18} />
}, {
  id: 'stats',
  name: 'Statistics',
  icon: <FileBarChart2 size={18} />
}, {
  id: 'table',
  name: 'Table',
  icon: <Table size={18} data-unique-id="60cdb3d3-983d-484e-bc76-8065eda2ee08" data-file-name="components/DynamicDashboard.tsx" />
}];

// Sample data for different widget types
const sampleData = {
  bar: [{
    name: 'Jan',
    hadir: 100,
    sakit: 30,
    izin: 20,
    alpha: 10
  }, {
    name: 'Feb',
    hadir: 120,
    sakit: 25,
    izin: 15,
    alpha: 8
  }, {
    name: 'Mar',
    hadir: 115,
    sakit: 20,
    izin: 25,
    alpha: 12
  }, {
    name: 'Apr',
    hadir: 130,
    sakit: 15,
    izin: 10,
    alpha: 5
  }, {
    name: 'May',
    hadir: 125,
    sakit: 20,
    izin: 15,
    alpha: 7
  }],
  line: [{
    name: 'Week 1',
    hadir: 92,
    sakit: 4,
    izin: 2,
    alpha: 2
  }, {
    name: 'Week 2',
    hadir: 90,
    sakit: 5,
    izin: 3,
    alpha: 2
  }, {
    name: 'Week 3',
    hadir: 93,
    sakit: 3,
    izin: 2,
    alpha: 2
  }, {
    name: 'Week 4',
    hadir: 95,
    sakit: 3,
    izin: 1,
    alpha: 1
  }],
  pie: [{
    name: 'Hadir',
    value: 85
  }, {
    name: 'Sakit',
    value: 7
  }, {
    name: 'Izin',
    value: 5
  }, {
    name: 'Alpha',
    value: 3
  }],
  stats: [{
    label: 'Total Siswa',
    value: 350,
    percentage: 5
  }, {
    label: 'Total Kelas',
    value: 12,
    percentage: 0
  }, {
    label: 'Kehadiran',
    value: '94%',
    percentage: 2
  }, {
    label: 'Guru Aktif',
    value: 24,
    percentage: 2
  }],
  table: [{
    nama: 'Ahmad Farhan',
    kelas: 'IX-A',
    status: 'Hadir',
    waktu: '07:15'
  }, {
    nama: 'Siti Aisyah',
    kelas: 'VIII-B',
    status: 'Hadir',
    waktu: '07:20'
  }, {
    nama: 'Budi Santoso',
    kelas: 'VII-A',
    status: 'Sakit',
    waktu: '-'
  }, {
    nama: 'Dewi Anggraini',
    kelas: 'IX-B',
    status: 'Hadir',
    waktu: '07:05'
  }]
};

// Default widget layouts for different screen sizes
const defaultLayouts = {
  lg: [{
    i: 'stats-1',
    x: 0,
    y: 0,
    w: 4,
    h: 2,
    type: 'stats'
  }, {
    i: 'bar-1',
    x: 4,
    y: 0,
    w: 8,
    h: 4,
    type: 'bar'
  }, {
    i: 'pie-1',
    x: 0,
    y: 2,
    w: 4,
    h: 4,
    type: 'pie'
  }, {
    i: 'line-1',
    x: 0,
    y: 6,
    w: 6,
    h: 4,
    type: 'line'
  }, {
    i: 'table-1',
    x: 6,
    y: 6,
    w: 6,
    h: 4,
    type: 'table'
  }],
  md: [{
    i: 'stats-1',
    x: 0,
    y: 0,
    w: 4,
    h: 2,
    type: 'stats'
  }, {
    i: 'bar-1',
    x: 4,
    y: 0,
    w: 4,
    h: 4,
    type: 'bar'
  }, {
    i: 'pie-1',
    x: 0,
    y: 2,
    w: 4,
    h: 4,
    type: 'pie'
  }, {
    i: 'line-1',
    x: 0,
    y: 6,
    w: 4,
    h: 4,
    type: 'line'
  }, {
    i: 'table-1',
    x: 4,
    y: 4,
    w: 4,
    h: 4,
    type: 'table'
  }],
  sm: [{
    i: 'stats-1',
    x: 0,
    y: 0,
    w: 6,
    h: 2,
    type: 'stats'
  }, {
    i: 'bar-1',
    x: 0,
    y: 2,
    w: 6,
    h: 4,
    type: 'bar'
  }, {
    i: 'pie-1',
    x: 0,
    y: 6,
    w: 6,
    h: 4,
    type: 'pie'
  }, {
    i: 'line-1',
    x: 0,
    y: 10,
    w: 6,
    h: 4,
    type: 'line'
  }, {
    i: 'table-1',
    x: 0,
    y: 14,
    w: 6,
    h: 4,
    type: 'table'
  }]
};

// Widget titles
const defaultWidgetTitles = {
  'stats-1': 'Statistik Kehadiran',
  'bar-1': 'Kehadiran Bulanan',
  'pie-1': 'Distribusi Kehadiran',
  'line-1': 'Tren Kehadiran',
  'table-1': 'Data Kehadiran Terkini'
};
interface DynamicDashboardProps {
  userRole: string | null;
  schoolId: string | null;
}
export default function DynamicDashboard({
  userRole,
  schoolId
}: DynamicDashboardProps) {
  // State for layouts
  const [layouts, setLayouts] = useState(() => {
    // Try to load from localStorage first
    if (typeof window !== 'undefined') {
      const savedLayouts = localStorage.getItem(`dashboard-layout-${userRole}`);
      return savedLayouts ? JSON.parse(savedLayouts) : defaultLayouts;
    }
    return defaultLayouts;
  });

  // State for widgets
  const [widgets, setWidgets] = useState<any[]>(() => {
    // Initialize widgets from layouts
    return Object.values(layouts.lg || {}).map((item: any) => ({
      id: item.i,
      type: item.type,
      title: defaultWidgetTitles[item.i] || `Widget ${item.i}`,
      data: sampleData[item.type] || []
    }));
  });

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  // Widget being edited
  const [editingWidget, setEditingWidget] = useState<string | null>(null);
  // Add widget modal state
  const [showAddWidgetModal, setShowAddWidgetModal] = useState(false);
  // New widget type
  const [newWidgetType, setNewWidgetType] = useState('bar');

  // Save layouts to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`dashboard-layout-${userRole}`, JSON.stringify(layouts));
    }
  }, [layouts, userRole]);

  // Handle layout change
  const handleLayoutChange = (currentLayout: any, allLayouts: any) => {
    setLayouts(allLayouts);
  };

  // Add a new widget
  const addWidget = (type: string) => {
    const newWidgetId = `${type}-${Date.now()}`;
    const newWidget = {
      id: newWidgetId,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Chart`,
      data: sampleData[type] || []
    };

    // Add the widget to the state
    setWidgets([...widgets, newWidget]);

    // Add the widget to layouts
    const newLayouts = {
      ...layouts
    };
    Object.keys(newLayouts).forEach(breakpoint => {
      const lastWidget = [...newLayouts[breakpoint]].sort((a, b) => b.y + b.h - (a.y + a.h))[0];
      const y = lastWidget ? lastWidget.y + lastWidget.h : 0;
      let w = 6;
      let h = 4;
      if (type === 'stats') {
        h = 2;
      }
      newLayouts[breakpoint] = [...newLayouts[breakpoint], {
        i: newWidgetId,
        x: 0,
        y,
        w,
        h,
        type
      }];
    });
    setLayouts(newLayouts);
    setShowAddWidgetModal(false);
  };

  // Remove a widget
  const removeWidget = (id: string) => {
    // Remove from widgets state
    setWidgets(widgets.filter(widget => widget.id !== id));

    // Remove from layouts
    const newLayouts = {
      ...layouts
    };
    Object.keys(newLayouts).forEach(breakpoint => {
      newLayouts[breakpoint] = newLayouts[breakpoint].filter(item => item.i !== id);
    });
    setLayouts(newLayouts);
  };

  // Edit a widget
  const editWidget = (id: string) => {
    setEditingWidget(id);
  };

  // Reset to default layout
  const resetLayout = () => {
    setLayouts(defaultLayouts);
    setWidgets(Object.values(defaultLayouts.lg).map((item: any) => ({
      id: item.i,
      type: item.type,
      title: defaultWidgetTitles[item.i] || `Widget ${item.i}`,
      data: sampleData[item.type] || []
    })));
  };
  return <div className="pb-4" data-unique-id="d3bedf03-8af4-4646-b834-71c0c8738313" data-file-name="components/DynamicDashboard.tsx" data-dynamic-text="true">
      {/* Dashboard Controls */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-2 justify-between items-center" data-unique-id="129325e3-7589-4786-b23a-0526f3ce6058" data-file-name="components/DynamicDashboard.tsx">
        <h2 className="text-lg font-semibold" data-unique-id="1c7ee2d7-1a89-4970-a874-43882923f518" data-file-name="components/DynamicDashboard.tsx"><span className="editable-text" data-unique-id="96252bc8-a341-4e4c-8a40-45b6603dabf0" data-file-name="components/DynamicDashboard.tsx">Dashboard Kustom</span></h2>
        <div className="flex items-center gap-2" data-unique-id="7312f235-1643-4d68-a531-7ee80576a9e6" data-file-name="components/DynamicDashboard.tsx" data-dynamic-text="true">
          <button onClick={() => setIsEditMode(!isEditMode)} className={`px-4 py-2 rounded-lg text-sm font-medium ${isEditMode ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} data-unique-id="e839c155-fa1c-4723-adff-ffed08caff37" data-file-name="components/DynamicDashboard.tsx" data-dynamic-text="true">
            {isEditMode ? 'Simpan Perubahan' : 'Edit Dashboard'}
          </button>
          
          {isEditMode && <>
              <button onClick={() => setShowAddWidgetModal(true)} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium flex items-center gap-1" data-unique-id="a8edd25b-39e6-464d-a4cc-f66a778527c0" data-file-name="components/DynamicDashboard.tsx">
                <PlusCircle size={16} />
                <span data-unique-id="abc89eac-16a9-4bc7-8a0b-e9ac86f44bf9" data-file-name="components/DynamicDashboard.tsx"><span className="editable-text" data-unique-id="e1c663c2-72a2-4a34-ae3a-645016ae9f98" data-file-name="components/DynamicDashboard.tsx">Tambah Widget</span></span>
              </button>
              
              <button onClick={resetLayout} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium" data-unique-id="1bf1a4a2-812c-4db3-b195-1a9175ac023f" data-file-name="components/DynamicDashboard.tsx"><span className="editable-text" data-unique-id="a96235b1-931e-4e43-9044-e3495932a895" data-file-name="components/DynamicDashboard.tsx">
                Reset Layout
              </span></button>
            </>}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 min-h-[600px]" data-unique-id="5f0c80e2-2f11-469e-a415-984fa8078acb" data-file-name="components/DynamicDashboard.tsx">
        <ResponsiveGridLayout className="layout" layouts={layouts} breakpoints={{
        lg: 1200,
        md: 996,
        sm: 768,
        xs: 480,
        xxs: 0
      }} cols={{
        lg: 12,
        md: 8,
        sm: 6,
        xs: 4,
        xxs: 2
      }} rowHeight={70} onLayoutChange={handleLayoutChange} isDraggable={isEditMode} isResizable={isEditMode} compactType="vertical" margin={[16, 16]}>
          {widgets.map(widget => <div key={widget.id} data-is-mapped="true" data-unique-id="ec4cc884-e1f6-4504-b086-9f672460ac02" data-file-name="components/DynamicDashboard.tsx">
              <DashboardWidget id={widget.id} title={widget.title} type={widget.type} data={widget.data} onRemove={removeWidget} onEdit={editWidget} isEditing={isEditMode} />
            </div>)}
        </ResponsiveGridLayout>
      </div>

      {/* Add Widget Modal */}
      {showAddWidgetModal && <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50" data-unique-id="8cbe6f3b-bbee-4819-8fe3-45146087fa8a" data-file-name="components/DynamicDashboard.tsx">
          <div className="bg-white rounded-xl p-6 w-96 max-w-full mx-4" data-unique-id="f0ea1cb3-c9b9-454f-ac0a-4b20a71e21fa" data-file-name="components/DynamicDashboard.tsx">
            <h3 className="text-lg font-semibold mb-4" data-unique-id="7477663d-ef9c-4879-b156-cc733064ccac" data-file-name="components/DynamicDashboard.tsx"><span className="editable-text" data-unique-id="d26171da-ed1b-448d-b079-b3a3f387b0ed" data-file-name="components/DynamicDashboard.tsx">Add New Widget</span></h3>
            
            <div className="mb-4" data-unique-id="270de99d-4435-437d-bdb2-fdbad3f01ec2" data-file-name="components/DynamicDashboard.tsx">
              <label className="block text-sm font-medium mb-1" data-unique-id="6ffa5e00-5ea1-44a6-a5d2-d2a8fb26d8df" data-file-name="components/DynamicDashboard.tsx"><span className="editable-text" data-unique-id="34fd36ba-b848-4c65-a128-769dbd356c14" data-file-name="components/DynamicDashboard.tsx">Widget Type</span></label>
              <div className="grid grid-cols-2 gap-2" data-unique-id="f7ffeded-6635-43fd-acdd-550d9fa8e049" data-file-name="components/DynamicDashboard.tsx" data-dynamic-text="true">
                {widgetTypes.map(type => <button key={type.id} className={`p-3 rounded-lg border flex items-center gap-2 transition-colors ${newWidgetType === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`} onClick={() => setNewWidgetType(type.id)} data-is-mapped="true" data-unique-id="b742ab64-d153-4c8f-9f04-50e2d826bdf1" data-file-name="components/DynamicDashboard.tsx">
                    <span className={`${newWidgetType === type.id ? 'text-blue-500' : 'text-gray-500'}`} data-is-mapped="true" data-unique-id="5090eb94-af1a-4b5d-b0a9-989fd35492fd" data-file-name="components/DynamicDashboard.tsx" data-dynamic-text="true">
                      {type.icon}
                    </span>
                    <span className={`${newWidgetType === type.id ? 'font-medium' : ''}`} data-is-mapped="true" data-unique-id="ccdfb206-22ab-4762-a154-5c00b189f70d" data-file-name="components/DynamicDashboard.tsx" data-dynamic-text="true">
                      {type.name}
                    </span>
                  </button>)}
              </div>
            </div>
            
            <div className="flex justify-end gap-2" data-unique-id="a11eb9c2-209b-4091-bc39-a4684b1c9e96" data-file-name="components/DynamicDashboard.tsx">
              <button onClick={() => setShowAddWidgetModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50" data-unique-id="ec42b071-9211-4c3e-aa18-8a0a6936f027" data-file-name="components/DynamicDashboard.tsx"><span className="editable-text" data-unique-id="c611e23d-33ec-4e60-a2c6-94972de4d5eb" data-file-name="components/DynamicDashboard.tsx">
                Cancel
              </span></button>
              <button onClick={() => addWidget(newWidgetType)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" data-unique-id="63517ed5-c44d-4053-bf37-5891ef2e86e3" data-file-name="components/DynamicDashboard.tsx"><span className="editable-text" data-unique-id="b874390b-9e9a-43ac-a673-498349819d30" data-file-name="components/DynamicDashboard.tsx">
                Add Widget
              </span></button>
            </div>
          </div>
        </div>}
      
      {/* Edit Widget Modal */}
      {editingWidget && <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50" data-unique-id="ecb7c19b-3c16-411e-8e4a-e8becee5045d" data-file-name="components/DynamicDashboard.tsx">
          <div className="bg-white rounded-xl p-6 w-96 max-w-full mx-4" data-unique-id="09f4eebf-dea6-4430-8923-c5012febb76a" data-file-name="components/DynamicDashboard.tsx">
            <h3 className="text-lg font-semibold mb-4" data-unique-id="18c1e05d-7a13-4680-8bb8-71225626fae6" data-file-name="components/DynamicDashboard.tsx"><span className="editable-text" data-unique-id="73e9bdbd-f952-4267-8474-74286da88946" data-file-name="components/DynamicDashboard.tsx">Edit Widget</span></h3>
            
            <div className="mb-4" data-unique-id="85ac6b75-534e-4974-8a9a-319c78b4113d" data-file-name="components/DynamicDashboard.tsx">
              <label htmlFor="widget-title" className="block text-sm font-medium mb-1" data-unique-id="ef9b47a8-f693-4bb8-931e-5fa3804ee10d" data-file-name="components/DynamicDashboard.tsx"><span className="editable-text" data-unique-id="b6575c30-0c53-4296-a225-c76cc117c8dc" data-file-name="components/DynamicDashboard.tsx">Widget Title</span></label>
              <input id="widget-title" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" value={widgets.find(w => w.id === editingWidget)?.title || ''} onChange={e => {
            setWidgets(widgets.map(w => w.id === editingWidget ? {
              ...w,
              title: e.target.value
            } : w));
          }} data-unique-id="7e3d3d0e-3a9d-4474-9a67-b1cafabca6de" data-file-name="components/DynamicDashboard.tsx" />
            </div>
            
            <div className="flex justify-end gap-2" data-unique-id="6a88a076-7e48-4ed2-b35e-c723fe6a848f" data-file-name="components/DynamicDashboard.tsx">
              <button onClick={() => setEditingWidget(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50" data-unique-id="3076f411-c2f0-4c1b-bfcb-b5f8501315dd" data-file-name="components/DynamicDashboard.tsx"><span className="editable-text" data-unique-id="bd35fb8c-4244-48f8-9efa-2c755e4d948f" data-file-name="components/DynamicDashboard.tsx">
                Cancel
              </span></button>
              <button onClick={() => setEditingWidget(null)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" data-unique-id="f5093ccb-b7b6-46c8-a719-fe615a57bc0d" data-file-name="components/DynamicDashboard.tsx"><span className="editable-text" data-unique-id="06d18420-5109-49c0-9ba7-f9323b3d945d" data-file-name="components/DynamicDashboard.tsx">
                Save Changes
              </span></button>
            </div>
          </div>
        </div>}
    </div>;
}
