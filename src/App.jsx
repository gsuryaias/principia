import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import SimulationView from './components/SimulationView';
import About from './components/About';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sim/*" element={<SimulationView />} />
      </Routes>
    </Layout>
  );
}
