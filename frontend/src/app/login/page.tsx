"use client";
export default function LoginPage() {
    function handleGoogleLogin() {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
    }

    return (
        <div className="flex h-screen items-center justify-center">
            <button
                onClick={handleGoogleLogin}
                className="rounded-lg bg-black px-6 py-3 text-white"
            >
                Continue with Google
            </button>
        </div>
    );
}
