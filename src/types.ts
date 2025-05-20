export type RootStackParamList = {
  Login: { setIsLoggedIn: (loggedIn: boolean) => void };
  Signup: { setIsLoggedIn: (loggedIn: boolean) => void };
  MainApp: undefined;
  CreateOutfit: undefined;
};