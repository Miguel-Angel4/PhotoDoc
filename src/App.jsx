// PhotoDoc Main Application
// Triggering new build to resolve deployment clone error
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar'; // Deployment trigger
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import AccountSettings from './components/AccountSettings';
import AppSettings from './components/AppSettings';
import Portfolio from './components/Portfolio';
import SecurityModal from './components/SecurityModal';
import { dataService } from './dataService';
import { supabase } from './supabaseClient';
import { isAdminUser } from './config/roles'; // NEW
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('users');
  const [securitySettings, setSecuritySettings] = useState(() => {
    const saved = localStorage.getItem('securitySettings');
    return saved ? JSON.parse(saved) : { enabled: false, pin: null };
  });
  const [isAppLocked, setIsAppLocked] = useState(securitySettings.enabled);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(securitySettings.enabled);
  const [securityModalMode, setSecurityModalMode] = useState('unlock');
  const [isAdminMode, setIsAdminMode] = useState(false); // NEW

  useEffect(() => {
    localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
  }, [securitySettings]);

  const handleLockApp = () => {
    if (isAppLocked) {
      // App is locked, open unlock modal
      setSecurityModalMode('unlock');
      setIsSecurityModalOpen(true);
    } else {
      // App is unlocked, show management menu
      if (securitySettings.pin) {
        setSecurityModalMode('manage');
        setIsSecurityModalOpen(true);
      } else {
        // No PIN setup yet, go to setup
        setSecurityModalMode('setup');
        setIsSecurityModalOpen(true);
      }
    }
  };

  const handleUnlock = () => {
    setIsAppLocked(false);
    setIsSecurityModalOpen(false);
  };

  const handleSetupComplete = (pin) => {
    setSecuritySettings(prev => ({ ...prev, enabled: true, pin }));
    setIsAppLocked(false);
    setIsSecurityModalOpen(false);
  };

  const handlePinChange = (newPin) => {
    setSecuritySettings(prev => ({ ...prev, pin: newPin }));
    setIsSecurityModalOpen(false);
  };



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
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const loadedAccountRef = React.useRef(null);

  const handleAccountDisconnect = () => {
    try {
      setGoogleAccount(null);
      setPhotos([]);
      setUsers([]);
      localStorage.removeItem('googleAccount');
      // Removed guest data reload to ensure app is empty without an account
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
            setUsers(cloudData.patients || []);
            // Also save to localStorage as backup
            dataService.setLocal('photos', googleAccount.email, cloudData.photos || []);
            dataService.setLocal('patients', googleAccount.email, cloudData.patients || []);
          } else {
            console.log('No cloud data found, checking localStorage');
            // Fallback to local account-specific storage
            const localPhotos = dataService.getLocal('photos', googleAccount.email);
            const localUsers = dataService.getLocal('patients', googleAccount.email);
            setPhotos(localPhotos);
            setUsers(localUsers);

            // If we have local data, sync it to cloud
            if (localPhotos.length > 0 || localUsers.length > 0) {
              console.log('Syncing local data to cloud');
              await dataService.saveToCloud(googleAccount.id, localUsers, localPhotos);
            }
          }
        } catch (error) {
          console.error('Error loading cloud data:', error);
          // Fallback to localStorage on error
          setPhotos(dataService.getLocal('photos', googleAccount.email));
          setUsers(dataService.getLocal('patients', googleAccount.email));
        }
      } else {
        // App should be empty when no account is connected
        setPhotos([]);
        setUsers([]);
      }

      loadedAccountRef.current = email;
      setIsInitialLoadComplete(true);
    };
    loadData();
  }, [googleAccount]);

  // Save data whenever it changes (Only if logged in)
  React.useEffect(() => {
    // Only save if we have finished loading the data and actually have an account
    if (isInitialLoadComplete && googleAccount && googleAccount.email && loadedAccountRef.current === googleAccount.email) {
      dataService.setLocal('photos', googleAccount.email, photos);
      dataService.setLocal('patients', googleAccount.email, users);

      if (googleAccount.id) {
        // ALWAYS use the user's UUID for cloud operations
        console.log('Saving to cloud for user ID:', googleAccount.id);
        dataService.saveToCloud(googleAccount.id, users, photos);
      }
    }
  }, [photos, users, googleAccount, isInitialLoadComplete]);

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

  // Capacitor: Listen for deep links (Mobile OAuth Fix)
  useEffect(() => {
    const setupDeepLinks = async () => {
      // Only run on native platforms
      const { Capacitor } = await import('@capacitor/core');
      if (!Capacitor.isNativePlatform()) return;

      const { App: CapApp } = await import('@capacitor/app');
      const { Browser } = await import('@capacitor/browser');

      CapApp.addListener('appUrlOpen', async (data) => {
        const url = new URL(data.url);
        const params = new URLSearchParams(url.hash.substring(1)); // Supabase uses hash
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) console.error('Error setting session from deep link:', error);
          if (session) {
            console.log('Session set successfully from deep link');
            // Close the browser window
            try {
              await Browser.close();
            } catch (e) {
              console.log('Browser already closed or not available');
            }
            // Navigate to account view or home
            setCurrentView('account');
          }
        }
      });
    };

    setupDeepLinks();
  }, []);

  return (
    <div className="App-layout">
      <Sidebar activeView={currentView} onNavigate={setCurrentView} />
      <div className="main-area">
        <TopBar
          onNavigate={setCurrentView}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onLock={handleLockApp}
          isAdmin={isAdminUser(googleAccount?.email)}
          isAdminMode={isAdminMode}
          setIsAdminMode={setIsAdminMode}
        />
        {currentView === 'users' && (
          <Dashboard
            photos={photos}
            setPhotos={setPhotos}
            users={users}
            setUsers={setUsers}
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
        {currentView === 'portfolio' && <Portfolio photos={photos} users={users} />}
        {currentView === 'settings' && (
          <AppSettings
            googleAccount={googleAccount}
            onConnect={setGoogleAccount}
            onDisconnect={handleAccountDisconnect}
            onBack={() => setCurrentView('users')}
            photos={photos}
            securitySettings={securitySettings}
            setSecuritySettings={setSecuritySettings}
          />
        )}
      </div>

      <SecurityModal
        isOpen={isSecurityModalOpen}
        mode={securityModalMode}
        onUnlock={handleUnlock}
        onSetupComplete={handleSetupComplete}
        onPinChange={handlePinChange}
        onCancel={() => {
          if (!isAppLocked) setIsSecurityModalOpen(false);
        }}
        securitySettings={securitySettings}
      />
    </div>
  );
}

export default App;
