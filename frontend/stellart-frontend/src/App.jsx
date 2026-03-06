import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import { Layout } from './components/layout/Layout';

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<Layout> <Landing /> </Layout>} />
		</Routes>
	)
}
