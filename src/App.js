import './App.css';
import SigmaCanvas from "./components/SigmaCanvas";

function App() {
  return (
    <div className="App">
        <SigmaCanvas url={"http://localhost:8080"}/>
    </div>
  );
}

export default App;
