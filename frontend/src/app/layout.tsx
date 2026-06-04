import "./globals.css";
import type { Metadata } from "next";
import QueryProvider from "@/providers/query-provider";
import AuthProvider from "@/providers/auth-provider";
import SocketProvider from "@/providers/socket-provider";
import CreateRoomModal from "@/components/ui/modals/create-room-modal";
export const metadata: Metadata = {
  title: "Orvexa",

  description: "Realtime Chat Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CreateRoomModal />
        <QueryProvider>
          <AuthProvider>
            <SocketProvider>{children}</SocketProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
