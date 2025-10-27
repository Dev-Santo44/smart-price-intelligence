import React from 'react'
import Link from 'next/link'
const Sidebar = () => {
    return (
        <div>   
            <div className="d-flex">
                
                <div className="bg-dark text-white p-3 vh-100 w-250" >
                    <h4 className="text-center">Sidebar</h4>
                    <ul className="nav flex-column">
                        <li className="nav-item"><Link href="#" className="nav-link text-white">Home</Link></li>
                        <li className="nav-item"><Link href="#" className="nav-link text-white">About</Link></li>
                        <li className="nav-item"><Link href="#" className="nav-link text-white">Services</Link></li>
                        <li className="nav-item"><Link href="#" className="nav-link text-white">Contact</Link></li>
                    </ul>
                </div>

                
                <div className="flex-grow-1 p-4">
                    <h2>Main Content</h2>
                    <p>This is the main content area next to the sidebar.</p>
                </div>
            </div>
        </div>
    )
}

export default Sidebar
