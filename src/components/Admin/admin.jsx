import React from 'react';
import { AdminView } from "../../components/adminView";
import Layout from "./layout";
function Admin() {
  return (
    <Layout>    
        <div>
        <AdminView />
    </div>
    </Layout>
  );
}

export default Admin;
