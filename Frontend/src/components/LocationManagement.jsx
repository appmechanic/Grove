// import React, { useState, useMemo } from 'react';
// import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

// // Sample data
// const sampleData = {
//   country: [
//     { id: 1, name: 'Australia', code: 'AU', status: 'Active', createdAt: '2024-01-15' },
//     { id: 2, name: 'United States', code: 'US', status: 'Active', createdAt: '2024-01-10' },
//     { id: 3, name: 'Canada', code: 'CA', status: 'Active', createdAt: '2024-01-12' },
//   ],
//   state: [
//     { id: 1, name: 'New South Wales', code: 'NSW', country: 'Australia', status: 'Active', createdAt: '2024-01-15' },
//     { id: 2, name: 'Victoria', code: 'VIC', country: 'Australia', status: 'Active', createdAt: '2024-01-16' },
//     { id: 3, name: 'Queensland', code: 'QLD', country: 'Australia', status: 'Active', createdAt: '2024-01-17' },
//     { id: 4, name: 'Western Australia', code: 'WA', country: 'Australia', status: 'Active', createdAt: '2024-01-18' },
//   ],
//   city: [
//     { id: 1, name: 'Sydney', state: 'New South Wales', country: 'Australia', status: 'Active', createdAt: '2024-01-15' },
//     { id: 2, name: 'Melbourne', state: 'Victoria', country: 'Australia', status: 'Active', createdAt: '2024-01-16' },
//     { id: 3, name: 'Brisbane', state: 'Queensland', country: 'Australia', status: 'Active', createdAt: '2024-01-17' },
//     { id: 4, name: 'Perth', state: 'Western Australia', country: 'Australia', status: 'Active', createdAt: '2024-01-18' },
//   ],
//   suburb: [
//     { id: 1, name: 'Bondi', city: 'Sydney', state: 'New South Wales', country: 'Australia', status: 'Active', createdAt: '2024-01-15' },
//     { id: 2, name: 'Manly', city: 'Sydney', state: 'New South Wales', country: 'Australia', status: 'Active', createdAt: '2024-01-16' },
//     { id: 3, name: 'Surry Hills', city: 'Sydney', state: 'New South Wales', country: 'Australia', status: 'Active', createdAt: '2024-01-17' },
//   ]
// };

// // Table Component
// const DataTable = ({ data, columns, title, onAdd }) => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(5);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

//   const filteredData = useMemo(() => {
//     return data.filter(item =>
//       Object.values(item).some(value =>
//         value.toString().toLowerCase().includes(searchTerm.toLowerCase())
//       )
//     );
//   }, [data, searchTerm]);

//   const sortedData = useMemo(() => {
//     if (!sortConfig.key) return filteredData;

//     return [...filteredData].sort((a, b) => {
//       if (a[sortConfig.key] < b[sortConfig.key]) {
//         return sortConfig.direction === 'asc' ? -1 : 1;
//       }
//       if (a[sortConfig.key] > b[sortConfig.key]) {
//         return sortConfig.direction === 'asc' ? 1 : -1;
//       }
//       return 0;
//     });
//   }, [filteredData, sortConfig]);

//   const paginatedData = useMemo(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     return sortedData.slice(startIndex, startIndex + itemsPerPage);
//   }, [sortedData, currentPage, itemsPerPage]);

//   const totalPages = Math.ceil(sortedData.length / itemsPerPage);

//   const handleSort = (key) => {
//     setSortConfig(prevConfig => ({
//       key,
//       direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
//     }));
//   };

//   const getSortIcon = (columnKey) => {
//     if (sortConfig.key !== columnKey) return null;
//     return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//       <div className="p-6 border-b border-gray-200">
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
//           <div className="flex flex-col sm:flex-row gap-3">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//               <input
//                 type="text"
//                 placeholder="Search locations..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
//               />
//             </div>
//             <button
//               onClick={onAdd}
//               className="flex items-center px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
//               style={{backgroundColor: '#4A7856'}}
//             >
//               <Plus size={20} className="mr-2" />
//               Add {title.split(' ')[0]}
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead className="bg-gray-50">
//             <tr>
//               {columns.map((column) => (
//                 <th
//                   key={column.key}
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
//                   onClick={() => handleSort(column.key)}
//                 >
//                   <div className="flex items-center space-x-1">
//                     <span>{column.label}</span>
//                     {getSortIcon(column.key)}
//                   </div>
//                 </th>
//               ))}
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {paginatedData.map((item, index) => (
//               <tr key={item.id} className="hover:bg-gray-50">
//                 {columns.map((column) => (
//                   <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {column.key === 'status' ? (
//                       <span className={`px-2 py-1 text-xs font-medium rounded-full ${
//                         item[column.key] === 'Active' 
//                           ? 'bg-green-100 text-green-800' 
//                           : 'bg-red-100 text-red-800'
//                       }`}>
//                         {item[column.key]}
//                       </span>
//                     ) : (
//                       item[column.key]
//                     )}
//                   </td>
//                 ))}
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                   <div className="flex space-x-2">
//                     <button className="text-blue-600 hover:text-blue-900">
//                       <Edit size={16} />
//                     </button>
//                     <button className="text-red-600 hover:text-red-900">
//                       <Trash2 size={16} />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
//         <div className="text-sm text-gray-700">
//           Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} entries
//         </div>
//         <div className="flex items-center space-x-2">
//           <button
//             onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//             className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//           >
//             <ChevronLeft size={16} />
//           </button>
//           <span className="px-3 py-1 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded">
//             {currentPage}
//           </span>
//           <button
//             onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//             disabled={currentPage === totalPages}
//             className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//           >
//             <ChevronRight size={16} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const LocationManagement = () => {
//   const [activeTab, setActiveTab] = useState('country');

//   const tabs = [
//     { id: 'country', label: 'Country' },
//     { id: 'state', label: 'State' },
//     { id: 'city', label: 'City' },
//     { id: 'suburb', label: 'Suburb' }
//   ];

//   const getColumns = (tabId) => {
//     switch (tabId) {
//       case 'country':
//         return [
//           { key: 'name', label: 'Name' },
//           { key: 'code', label: 'Code' },
//           { key: 'status', label: 'Status' },
//           { key: 'createdAt', label: 'Created At' }
//         ];
//       case 'state':
//         return [
//           { key: 'name', label: 'State Name' },
//           { key: 'code', label: 'Code' },
//           { key: 'country', label: 'Country' },
//           { key: 'status', label: 'Status' },
//           { key: 'createdAt', label: 'Created At' }
//         ];
//       case 'city':
//         return [
//           { key: 'name', label: 'City Name' },
//           { key: 'state', label: 'State' },
//           { key: 'country', label: 'Country' },
//           { key: 'status', label: 'Status' },
//           { key: 'createdAt', label: 'Created At' }
//         ];
//       case 'suburb':
//         return [
//           { key: 'name', label: 'Suburb Name' },
//           { key: 'city', label: 'City' },
//           { key: 'state', label: 'State' },
//           { key: 'country', label: 'Country' },
//           { key: 'status', label: 'Status' },
//           { key: 'createdAt', label: 'Created At' }
//         ];
//       default:
//         return [];
//     }
//   };

//   const getTitle = (tabId) => {
//     return `${tabId.charAt(0).toUpperCase() + tabId.slice(1)} Management`;
//   };

//   const handleAdd = (type) => {
//     alert(`Add new ${type} functionality would be implemented here`);
//   };

//   return (
//     <div className="min-h-screen bg-gra-50">
//       {/* <Header 
//         breadcrumbs={['Dashboard', 'Location Management']} 
//         title="Location Management" 
//       /> */}
      
//       <div className="p-6">
//         {/* Tabs */}
//         <div className="mb-6 bg-amber-500">
//           <div className="">
//             <nav className="-mb-px flex space-x-8">
//               {tabs.map((tab) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
//                     activeTab === tab.id
//                       ? 'border-[#D00416] text-[#D00416]'
//                       : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                   } cursor-pointer`}
//                 >
//                   {tab.label}
//                 </button>
//               ))}
//             </nav>
//           </div>
//         </div>

//         {/* Table */}
//         <DataTable
//           data={sampleData[activeTab] || []}
//           columns={getColumns(activeTab)}
//           title={getTitle(activeTab)}
//           onAdd={() => handleAdd(activeTab)}
//         />
//       </div>
//     </div>
//   );
// };

// export default LocationManagement;

import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

// Sample data
const sampleData = {
  country: [
    { id: 1, name: 'Australia', code: 'AU', status: 'Active', createdAt: '2024-01-15' },
    { id: 2, name: 'United States', code: 'US', status: 'Active', createdAt: '2024-01-10' },
    { id: 3, name: 'Canada', code: 'CA', status: 'Active', createdAt: '2024-01-12' },
  ],
  state: [
    { id: 1, name: 'New South Wales', code: 'NSW', country: 'Australia', status: 'Active', createdAt: '2024-01-15' },
    { id: 2, name: 'Victoria', code: 'VIC', country: 'Australia', status: 'Active', createdAt: '2024-01-16' },
    { id: 3, name: 'Queensland', code: 'QLD', country: 'Australia', status: 'Active', createdAt: '2024-01-17' },
    { id: 4, name: 'Western Australia', code: 'WA', country: 'Australia', status: 'Active', createdAt: '2024-01-18' },
  ],
  city: [
    { id: 1, name: 'Sydney', state: 'New South Wales', country: 'Australia', status: 'Active', createdAt: '2024-01-15' },
    { id: 2, name: 'Melbourne', state: 'Victoria', country: 'Australia', status: 'Active', createdAt: '2024-01-16' },
    { id: 3, name: 'Brisbane', state: 'Queensland', country: 'Australia', status: 'Active', createdAt: '2024-01-17' },
    { id: 4, name: 'Perth', state: 'Western Australia', country: 'Australia', status: 'Active', createdAt: '2024-01-18' },
  ],
  suburb: [
    { id: 1, name: 'Bondi', city: 'Sydney', state: 'New South Wales', country: 'Australia', status: 'Active', createdAt: '2024-01-15' },
    { id: 2, name: 'Manly', city: 'Sydney', state: 'New South Wales', country: 'Australia', status: 'Active', createdAt: '2024-01-16' },
    { id: 3, name: 'Surry Hills', city: 'Sydney', state: 'New South Wales', country: 'Australia', status: 'Active', createdAt: '2024-01-17' },
  ]
};

// Table Component
const DataTable = ({ data, columns, title, onAdd }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const filteredData = useMemo(() => {
    return data.filter(item =>
      Object.values(item).some(value =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            <button
              onClick={onAdd}
              className="flex items-center px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
              style={{backgroundColor: '#4A7856'}}
            >
              <Plus size={20} className="mr-2" />
              Add {title.split(' ')[0]}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {getSortIcon(column.key)}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.key === 'status' ? (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item[column.key] === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item[column.key]}
                      </span>
                    ) : (
                      item[column.key]
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 cursor-pointer">
                      <Edit size={16} />
                    </button>
                    <button className="text-red-600 hover:text-red-900 cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-3 py-1 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded">
            {currentPage}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const LocationManagement = () => {
  const [activeTab, setActiveTab] = useState('country');

  const tabs = [
    { id: 'country', label: 'Country' },
    { id: 'state', label: 'State' },
    { id: 'city', label: 'City' },
    { id: 'suburb', label: 'Suburb' }
  ];

  const getColumns = (tabId) => {
    switch (tabId) {
      case 'country':
        return [
          { key: 'name', label: 'Name' },
          { key: 'code', label: 'Code' },
          { key: 'status', label: 'Status' },
          { key: 'createdAt', label: 'Created At' }
        ];
      case 'state':
        return [
          { key: 'name', label: 'State Name' },
          { key: 'code', label: 'Code' },
          { key: 'country', label: 'Country' },
          { key: 'status', label: 'Status' },
          { key: 'createdAt', label: 'Created At' }
        ];
      case 'city':
        return [
          { key: 'name', label: 'City Name' },
          { key: 'state', label: 'State' },
          { key: 'country', label: 'Country' },
          { key: 'status', label: 'Status' },
          { key: 'createdAt', label: 'Created At' }
        ];
      case 'suburb':
        return [
          { key: 'name', label: 'Suburb Name' },
          { key: 'city', label: 'City' },
          { key: 'state', label: 'State' },
          { key: 'country', label: 'Country' },
          { key: 'status', label: 'Status' },
          { key: 'createdAt', label: 'Created At' }
        ];
      default:
        return [];
    }
  };

  const getTitle = (tabId) => {
    return `${tabId.charAt(0).toUpperCase() + tabId.slice(1)} Management`;
  };

  const handleAdd = (type) => {
    alert(`Add new ${type} functionality would be implemented here`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Header 
        breadcrumbs={['Dashboard', 'Location Management']} 
        title="Location Management" 
      /> */}
      
      {/* Tabs - Full width with white background */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#D00416] text-[#D00416]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } cursor-pointer`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {/* Table */}
        <DataTable
          data={sampleData[activeTab] || []}
          columns={getColumns(activeTab)}
          title={getTitle(activeTab)}
          onAdd={() => handleAdd(activeTab)}
        />
      </div>
    </div>
  );
};

export default LocationManagement;