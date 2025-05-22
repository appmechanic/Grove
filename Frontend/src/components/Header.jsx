// import React from 'react';
// import { ChevronRight, Bell, Settings } from 'lucide-react';

// const Header = ({ breadcrumbs, title }) => {

//   return (
//     <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
//       <div className="flex items-center justify-between">
//         {/* Left side - Title and Breadcrumbs */}
//         <div>
//           {/* <h1 className="text-2xl font-semibold text-gray-800 mb-1">{title}</h1> */}
//           <div className="flex items-center text-sm text-gray-500">
//             {/* {breadcrumbs.map((crumb, index) => (
//               <React.Fragment key={index}>
//                 <span className={index === breadcrumbs.length - 1 ? 'text-blue-600' : ''}>
//                   {crumb}
//                 </span>
//                 {index < breadcrumbs.length - 1 && (
//                   <ChevronRight size={14} className="mx-2" />
//                 )}
//               </React.Fragment>
//             ))} */}
//           </div>
//         </div>

//         {/* Right side - User Info */}
//         <div className="flex items-center space-x-4">
//           {/* Notifications */}
//           <button className="p-2 hover:bg-gray-100 rounded-full relative">
//             <Bell size={20} className="text-gray-600" />
//             <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//               3
//             </span>
//           </button>

//           {/* Settings */}
//           <button className="p-2 hover:bg-gray-100 rounded-full">
//             <Settings size={20} className="text-gray-600" />
//           </button>

//           {/* User Profile */}
//           <div className="flex items-center space-x-3">
//             <img
//               src="/api/placeholder/40/40"
//               alt="Alexander Vincent"
//               className="w-10 h-10 rounded-full border border-gray-300"
//             />
//             <div className="text-right">
//               <p className="text-sm font-medium text-gray-800">Alexander Vincent</p>
//               <p className="text-xs text-gray-500">Super Admin</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Header;


import React, { useMemo } from 'react';
import { ChevronRight, Bell, Settings } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
  // Extract path segments and format them for title and breadcrumbs
  const { title, breadcrumbs } = useMemo(() => {
    // Get path without the leading slash
    const path = location.pathname.slice(1);
    const segments = path.split('/');
    
    // Format the last segment as title (if it exists)
    let formattedTitle = '';
    if (segments.length > 1) {
      const lastSegment = segments[segments.length - 1];
      // Replace hyphens with spaces and capitalize each word
      formattedTitle = lastSegment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    // Create breadcrumbs array with formatted segments
    const formattedBreadcrumbs = segments.map(segment => 
      segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    );
    
    return { title: formattedTitle, breadcrumbs: formattedBreadcrumbs };
  }, [location.pathname]);
  
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Title and Breadcrumbs */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">{title}</h1>
          <div className="flex items-center text-sm text-[#6B7280]">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <span className={index === breadcrumbs.length - 1 ? 'text-[#EE0B1A]' : ''}>
                  {crumb}
                </span>
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight size={14} className="mx-2" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Right side - User Info */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 bg-gray-100 rounded-full relative">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute -top-0 -right-0 bg-red-500 text-white text-xs rounded-full h-2 w-2 flex items-center justify-center">
              
            </span>
          </button>


          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <img
              src="/api/placeholder/40/40"
              alt="Alexander Vincent"
              className="w-10 h-10 rounded-full border border-gray-300"
            />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800">Alexander Vincent</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;