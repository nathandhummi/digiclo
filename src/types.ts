export type RootStackParamList = {
  Login:   { setIsLoggedIn: (loggedIn: boolean) => void };
  Signup:  { setIsLoggedIn: (loggedIn: boolean) => void };
  Home:    undefined;
  Upload:  undefined;
  Tops:    undefined;
  Bottoms: undefined;
  Shoes:   undefined;
  Outfits: undefined;
  CreateOutfit: undefined;
  Item: {
    id: string;
    imageUrl: string;
    isFavorite: boolean;
    tags: string[];
  };
};