import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import { Layout } from './components/layout/Layout';
import Register from './pages/Register';
import { AuthLayout } from './components/layout/AuthLayout';

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<Layout> <Landing /> </Layout>} />
			<Route path="/register" element={<AuthLayout> <Register /> </AuthLayout>} />
		</Routes>
	)
}