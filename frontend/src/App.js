import React from 'react';
import InputForm from './components/InputForm';
import AthleteList from './components/AthleteList';

import './App.css'; // Import CSS for styling
const App = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 class="App-header">Decathlon Score Calculator</h1>
      <InputForm />
      <AthleteList />
    </div>
  );
};

export default App;