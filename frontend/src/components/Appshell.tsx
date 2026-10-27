import { useState } from "react";
import type { ViewState } from "../types";

import { usePosts } from "../context/PostsContext";
import Masthead from "./Masthead";
import Feed from "./Feed";
import PostView from "./PostView";
import Editor from "./Editor";
import LoginModal from "./LoginModal";
import Footer from "./Footer"

export default function AppShell() {
    const { posts } = usePosts();
    const [view, setView] = useState<ViewState>({ name: "feed" });
    const [query, setQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [activeTag, setActiveTag] = useState<string | null>(null);

    const [loginState, setLoginState] = useState<{
        show: boolean;
        target: ViewState;
        message: string;
    }>({ show: false, target: { name: "feed" }, message: "" });

    function requireAuth(target: ViewState, message: string) {
        setLoginState({ show: true, target, message });
    }

    function handleLoginSuccess() {
        setView(loginState.target);
        setLoginState((prev) => ({ ...prev, show: false }));
    }

    const activePost =
        view.name === "post"
            ? posts.find((p) => p.id === view.id || p.slug === view.id) ?? null
            : null;

    const editingPost =
        view.name === "editor" && view.id
            ? posts.find((p) => p.id === view.id || p.slug === view.id) ?? null
            : null;

    return (
        <div className="min-h-screen bg-paper flex flex-col justify-between">
            <div>
                <Masthead
                    setView={setView}
                    query={query}
                    setQuery={setQuery}
                    showSearch={showSearch}
                    setShowSearch={setShowSearch}
                    activeTag={activeTag}
                    setActiveTag={setActiveTag}
                    onRequireAuth={requireAuth}
                />

                <main>
                    {view.name === "feed" && (
                        <Feed
                            posts={posts}
                            setView={setView}
                            query={query}
                            activeTag={activeTag}
                            setActiveTag={setActiveTag}
                        />
                    )}

                    {view.name === "post" && activePost && (
                        <PostView
                            post={activePost}
                            setView={setView}
                            onRequireAuth={requireAuth}
                        />
                    )}

                    {view.name === "post" && !activePost && (
                        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
                            <p className="font-display text-[22px] text-ink mb-3 font-semibold">
                                Entry not found
                            </p>
                            <p className="font-body text-[15px] text-inkSoft mb-6">
                                This entry might have been deleted or the link may be inaccurate.
                            </p>
                            <button
                                onClick={() => setView({ name: "feed" })}
                                className="font-mono text-[13px] text-ink underline hover:opacity-75 transition"
                            >
                                Back to all entries
                            </button>
                        </div>
                    )}

                    {view.name === "editor" && (
                        <Editor
                            setView={setView}
                            existingPost={editingPost}
                        />
                    )}
                </main>
            </div>


            {/* // footer */}
            <Footer />

            {loginState.show && (
                <LoginModal
                    message={loginState.message}
                    onClose={() => setLoginState((prev) => ({ ...prev, show: false }))}
                    onSuccess={handleLoginSuccess}
                />
            )}
        </div>
    );
}


