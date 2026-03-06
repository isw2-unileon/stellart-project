import Header from './Header.jsx';
import Footer from './Footer.jsx';

export const Layout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            
            <main>
                {children}
            </main>

            <Footer />
        </div>
    );
};