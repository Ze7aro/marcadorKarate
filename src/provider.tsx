import { HeroUIProvider } from "@heroui/system";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import OfflineIndicator from "@/components/OfflineIndicator";

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate}>
      <OfflineIndicator />
      {children}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </HeroUIProvider>
  );
}
