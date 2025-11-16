// src/components/Footer.jsx

import React from 'react';

function Footer() {
    return (
        <footer className="bg-gray-800 text-white mt-12">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="text-center text-sm">
                    © {new Date().getFullYear()} Virtual Marketing Agency. All rights reserved. | Powered by React & FastAPI.
                </div>
            </div>
        </footer>
    );
}

export default Footer;