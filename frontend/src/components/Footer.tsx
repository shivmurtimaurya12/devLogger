
export default function Footer() {
    return (<>
        <footer className="overflow-hidden border-t border-blue-500/10 bg-[#0f1210]">
            <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">

                <div className="brand-text pointer-events-none mx-auto mt-12 max-w-full select-none text-center text-[clamp(3.4rem,16vw,12rem)] font-black leading-none opacity-30 sm:mt-16"><span style={{ color: "#5fade8" }}>DevLogger</span></div>

            </div>
            <div className="flex gap-5">
                <div style={{ color: "white" }}><span>All right reserved.</span></div>
                <div style={{ color: "white" }}><span>&#9400;2026 DevLogger.</span></div>
            </div>
        </footer>
    </>)
}