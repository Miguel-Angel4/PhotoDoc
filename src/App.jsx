import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import AccountSettings from './components/AccountSettings';
import AppSettings from './components/AppSettings';
import Portfolio from './components/Portfolio';
import { dataService } from './dataService';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('patients');
  const [currentUser, setCurrentUser] = useState({
    email: 'usuario@ejemplo.com',
    name: 'Usuario'
  });

  const [googleAccount, setGoogleAccount] = useState(() => {
    try {
      const saved = localStorage.getItem('googleAccount');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      // Ensure the object has the expected structure
      return (parsed && typeof parsed === 'object' && parsed.email) ? parsed : null;
    } catch (e) {
      console.error('Error initializing googleAccount state:', e);
      return null;
    }
  });

  const [photos, setPhotos] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const loadedAccountRef = React.useRef(null);

  const handleAccountDisconnect = () => {
    try {
      setGoogleAccount(null);
      setPhotos([]);
      setPatients([]);
      localStorage.removeItem('googleAccount');
      // Force reload guest data immediately if needed
      const guestPhotos = dataService.getLocal('photos', 'guest');
      const guestPatients = dataService.getLocal('patients', 'guest');
      setPhotos(guestPhotos);
      setPatients(guestPatients);
    } catch (e) {
      console.error('Error during account disconnect:', e);
    }
  };

  // Load photos and patients whenever account changes
  React.useEffect(() => {
    const loadData = async () => {
      setIsInitialLoadComplete(false);
      const email = googleAccount?.email || 'guest';

      if (googleAccount && googleAccount.id) {
        // ALWAYS use the user's UUID for cloud operations
        console.log('Loading data from cloud for user ID:', googleAccount.id);

        try {
          const cloudData = await dataService.loadFromCloud(googleAccount.id);

          if (cloudData && (cloudData.photos || cloudData.patients)) {
            console.log('Cloud data found:', cloudData);
            setPhotos(cloudData.photos || []);
            setPatients(cloudData.patients || []);
            // Also save to localStorage as backup
            dataService.setLocal('photos', googleAccount.email, cloudData.photos || []);
            dataService.setLocal('patients', googleAccount.email, cloudData.patients || []);
          } else {
            console.log('No cloud data found, checking localStorage');
            // Fallback to local account-specific storage
            const localPhotos = dataService.getLocal('photos', googleAccount.email);
            const localPatients = dataService.getLocal('patients', googleAccount.email);
            setPhotos(localPhotos);
            setPatients(localPatients);

            // If we have local data, sync it to cloud
            if (localPhotos.length > 0 || localPatients.length > 0) {
              console.log('Syncing local data to cloud');
              await dataService.saveToCloud(googleAccount.id, localPatients, localPhotos);
            }
          }
        } catch (error) {
          console.error('Error loading cloud data:', error);
          // Fallback to localStorage on error
          setPhotos(dataService.getLocal('photos', googleAccount.email));
          setPatients(dataService.getLocal('patients', googleAccount.email));
        }
      } else {
        // Load guest data when no account is connected
        setPhotos(dataService.getLocal('photos', 'guest'));
        setPatients(dataService.getLocal('patients', 'guest'));
      }

      loadedAccountRef.current = email;
      setIsInitialLoadComplete(true);
    };
    loadData();
  }, [googleAccount]);

  // Save data whenever it changes
  React.useEffect(() => {
    const currentEmail = googleAccount?.email || 'guest';

    // Only save if we have finished loading the data for THIS specific account/guest
    if (isInitialLoadComplete && loadedAccountRef.current === currentEmail) {
      dataService.setLocal('photos', currentEmail, photos);
      dataService.setLocal('patients', currentEmail, patients);

      if (googleAccount && googleAccount.id) {
        // ALWAYS use the user's UUID for cloud operations
        console.log('Saving to cloud for user ID:', googleAccount.id);
        dataService.saveToCloud(googleAccount.id, patients, photos);
      }
    }
  }, [photos, patients, googleAccount, isInitialLoadComplete]);

  React.useEffect(() => {
    if (googleAccount) {
      localStorage.setItem('googleAccount', JSON.stringify(googleAccount));
    } else {
      localStorage.removeItem('googleAccount');
    }
  }, [googleAccount]);

  // Listen for Supabase auth state changes (Google OAuth callback)
  React.useEffect(() => {
    if (!supabase) return;

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userEmail = session.user.email;
        const userName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuario';
        const userId = session.user.id;

        // Update googleAccount state with authenticated user
        setGoogleAccount({
          email: userEmail,
          name: userName,
          id: userId
        });
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userEmail = session.user.email;
        const userName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuario';
        const userId = session.user.id;

        setGoogleAccount({
          email: userEmail,
          name: userName,
          id: userId
        });
      } else {
        // User signed out
        setGoogleAccount(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="App-layout">
      <Sidebar activeView={currentView} onNavigate={setCurrentView} />
      <div className="main-area">
        <TopBar onNavigate={setCurrentView} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        {currentView === 'patients' && (
          <Dashboard
            photos={photos}
            setPhotos={setPhotos}
            patients={patients}
            setPatients={setPatients}
            googleAccount={googleAccount}
            searchQuery={searchQuery}
          />
        )}
        {currentView === 'account' && (
          <AccountSettings
            googleAccount={googleAccount}
            onConnect={setGoogleAccount}
            onDisconnect={handleAccountDisconnect}
            photos={photos}
          />
        )}
        {currentView === 'portfolio' && <Portfolio photos={photos} patients={patients} />}
        {currentView === 'settings' && (
          <AppSettings
            googleAccount={googleAccount}
            onConnect={setGoogleAccount}
            onDisconnect={handleAccountDisconnect}
            onBack={() => setCurrentView('patients')}
            photos={photos}
          />
        )}
      </div>
    </div>
  );
}

export default App;
