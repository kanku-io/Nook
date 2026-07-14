import './App.css'
import Header from './Header'
import BottomNav from './BottomNav'
import Spotlight from './Spotlight'
import Nookpick from './Nookpick'


const App = () => {
  return(
    <div className="appContainer">
      <Header/>
      <Spotlight/>
      <Nookpick/>
      <BottomNav/>
    </div>
  )
}

export default App;