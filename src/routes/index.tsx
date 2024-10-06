import React from 'react';
import { BrowserRouter as Router, Route,Routes } from 'react-router-dom';
import ProductPage from '../pages/ProductPage';

const AppRoutes: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<ProductPage />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
