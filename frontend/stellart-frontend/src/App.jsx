import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import { Layout } from './components/layout/Layout';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import UploadArtwork from './pages/UploadArtwork';
import Explore from './pages/Explore';
import Contact from './pages/Contact';

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<Layout> <Landing /> </Layout>} />
			<Route path="/register" element={<Layout> <Register /> </Layout>} />
			<Route path="/login" element={<Layout> <Login /> </Layout>} />
			<Route path="/profile" element={<Layout> <Profile /> </Layout>} />
			<Route path="/profile/upload" element={<Layout> <UploadArtwork /> </Layout>} />
			<Route path="/explore" element={<Layout> <Explore /> </Layout>} />
			<Route path="/contact" element={<Layout> <Contact /> </Layout>} />
		</Routes>
	)
}
