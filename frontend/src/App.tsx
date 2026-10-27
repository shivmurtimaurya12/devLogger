
import { AuthProvider } from "./context/AuthContext";
import { PostsProvider } from "./context/PostsContext";
import AppShell from "./components/Appshell"




export default function App() {
  return (
    <AuthProvider>
      <PostsProvider>
        <AppShell />
      </PostsProvider>
    </AuthProvider>
  );
}
