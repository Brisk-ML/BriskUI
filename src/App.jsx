import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ModalProvider } from './contexts/ModalContext'
import HiFiHome from './pages/HiFiHome'
import HiFiEditProject from './pages/HiFiEditProject'
import HiFiDeleteProject from './pages/HiFiDeleteProject'

function App() {
    return (
        <ModalProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HiFiHome />} />
                    <Route path="/edit" element={<HiFiEditProject />} />
                    <Route path="/delete" element={<HiFiDeleteProject />} />
                </Routes>
            </BrowserRouter>
        </ModalProvider>
    )
}

export default App
