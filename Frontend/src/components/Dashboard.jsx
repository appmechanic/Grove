// import { Outlet } from "react-router-dom";
// import Sidebar from "./SideBar";
// import Header from "./Header";

// const Dashboard = () => {
//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <Sidebar />
//       <div>
//         <Header/>
//       </div>
//       <div className="flex-1">
//         <Outlet />
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import { Outlet } from "react-router-dom";
import Sidebar from "./SideBar";
import Header from "./Header";


const Dashboard = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Fixed Sidebar on the left */}
      <Sidebar />
      
      {/* Main content area with left margin to account for fixed sidebar */}
      <div className="flex-1 flex flex-col">
        {/* Header spans the full width of the content area */}
        <Header />
        
        {/* Content area below header */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
