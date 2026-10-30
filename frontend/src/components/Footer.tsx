
export default function Footer() {
    return (<>
        <footer className="overflow-hidden border-t border-blue-500/10 bg-[#E5DEC9]">
            <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">

                <div className="brand-text pointer-events-none mx-auto mt-12 max-w-full select-none text-center text-[clamp(3.4rem,16vw,12rem)] font-black leading-none opacity-27 sm:mt-16"><span style={{ color: "#5fade8", textShadow: "2px 2px 20px #f6e1e1" ,opacity:"0.8"}}>Dev</span><span style={{ color: "#133f61", textShadow: "2px 2px 20px #f6e1e1",opacity:"0.8" }}>Logger</span></div>

            </div>
            <div className="flex gap-5">
                <div style={{ color: "black" }}><span>All right reserved.</span></div>
                <div style={{ color: "black" }}><span>&#9400;2026 DevLogger.</span></div>
            </div>
        </footer>
    </>)
}