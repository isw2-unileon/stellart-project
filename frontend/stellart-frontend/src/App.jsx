import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner'; //
import Landing from './pages/Landing';
import { Layout } from './components/layout/Layout';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import UploadArtwork from './pages/UploadArtwork';
import Explore from './pages/Explore';
import Contact from './pages/Contact';
import OpenCommissions from './pages/OpenCommissions';
import FindArtists from './pages/FindArtists';
import StartCommission from './pages/StartCommission';
import Commissions from './pages/Commissions';
import CommissionDetail from './pages/CommissionDetail';
import Wishlist from './pages/Wishlist';

export default function App() {
    return (
        <>
            <Toaster 
                position="top-right" 
                richColors 
                toastOptions={{
                    style: {
                        borderRadius: '12px',
                        padding: '16px',        
                        fontSize: '18px',
                    },
                    className: 'text-lg',
                }}
            />
            
            <Routes>
                <Route path="/" element={<Layout> <Landing /> </Layout>} />
                <Route path="/register" element={<Layout> <Register /> </Layout>} />
                <Route path="/login" element={<Layout> <Login /> </Layout>} />
                <Route path="/profile" element={<Layout> <Profile /> </Layout>} />
                <Route path="/profile/upload" element={<Layout> <UploadArtwork /> </Layout>} />
                <Route path="/explore" element={<Layout> <Explore /> </Layout>} />
                <Route path="/contact" element={<Layout> <Contact /> </Layout>} />
                <Route path="/commissions" element={<Layout> <Commissions /> </Layout>} />
                <Route path="/commissions/settings" element={<Layout> <OpenCommissions /> </Layout>} />
                <Route path="/commissions/find" element={<Layout> <FindArtists /> </Layout>} />
                <Route path="/commission/start/:artistId" element={<Layout> <StartCommission /> </Layout>} />
                <Route path="/commissions/:id" element={<Layout> <CommissionDetail /> </Layout>} />
                <Route path="/wishlist" element={<Layout> <Wishlist /> </Layout>} />
            </Routes>
        </>
    )
}