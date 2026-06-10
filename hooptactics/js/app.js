const { useState, useEffect, useRef, useMemo } = React;

    // Theme state using Context API
    const ThemeContext = React.createContext();
    const ThemeProvider = ({ children }) => {
      const [theme, setTheme] = useState(() => {
        return localStorage.getItem('ht_theme') || 'dark';
      });

      useEffect(() => {
        const rootElement = document.documentElement;
        if (theme === 'light') {
          rootElement.classList.remove('dark');
          rootElement.classList.add('light');
          document.body.classList.remove('dark-theme');
          document.body.classList.add('light-theme');
        } else {
          rootElement.classList.remove('light');
          rootElement.classList.add('dark');
          document.body.classList.remove('light-theme');
          document.body.classList.add('dark-theme');
        }
        localStorage.setItem('ht_theme', theme);
      }, [theme]);

      return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
          {children}
        </ThemeContext.Provider>
      );
    };

    // Original HoopTactics Logo rendered in premium black & white, or black on light theme, falling back to SVG if missing.
    const Logo = ({ className = "w-10 h-10" }) => {
      const { theme } = React.useContext(ThemeContext) || { theme: 'dark' };

      // Slab background and border colors based on theme
      const slabBg = theme === 'light' ? 'rgba(240, 242, 245, 0.45)' : 'rgba(10, 10, 12, 0.55)';
      const slabBorder = theme === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)';

      return (
        <div className={`${className} flex items-center justify-center select-none`} style={{ perspective: '1000px' }}>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes logo-shimmer-sweep {
              0% { transform: translateX(-150%) skewX(-20deg); }
              35% { transform: translateX(180%) skewX(-20deg); }
              100% { transform: translateX(180%) skewX(-20deg); }
            }
            .logo-shimmer {
              position: absolute;
              inset: 0;
              mix-blend-mode: color-dodge;
              pointer-events: none;
              z-index: 5;
              background: linear-gradient(
                105deg,
                rgba(255,255,255,0) 20%,
                rgba(255,255,255,0.08) 35%,
                rgba(255,255,255,0.22) 40%,
                rgba(255,255,255,0.12) 45%,
                rgba(255,255,255,0) 60%
              );
              background-size: 200% 200%;
              animation: logo-shimmer-sweep 5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }
            .logo-interactive-slab {
              transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease;
              transform-style: preserve-3d;
              position: relative;
            }
            .logo-interactive-slab:hover {
              transform: rotateX(8deg) rotateY(-8deg) scale(1.06);
              box-shadow: 
                0 15px 30px rgba(0, 0, 0, 0.5),
                0 0 20px rgba(56, 189, 248, 0.15);
            }
            .logo-interactive-slab:hover .logo-shimmer {
              animation-duration: 2.5s;
            }
          `}} />
          
          <div 
            className="logo-interactive-slab h-full overflow-hidden p-[5%] flex flex-col justify-between"
            style={{
              aspectRatio: '3/4',
              borderRadius: '8%',
              border: `1.5px solid ${slabBorder}`,
              background: slabBg,
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Inner card container simulating inset cavity of physical protector */}
            <div 
              className="w-full h-full relative overflow-hidden bg-black/60 border border-white/5"
              style={{ borderRadius: '6%' }}
            >
              <img 
                src="assets/cards/logo.png" 
                className="w-full h-full object-cover absolute inset-0 z-0" 
                alt="HoopTactics Logo"
              />
              
              {/* Holographic Sheen Sweeper Overlay */}
              <div className="logo-shimmer" />
            </div>
          </div>
        </div>
      );
    };



    // Helper to render high-fidelity custom digital card face if image doesn't exist
    // Helper to render high-fidelity custom digital card face
    const renderCardFrontContent = (card) => {
      const isCustomImage = card.frontImg && card.frontImg !== 'assets/card_back.png' && !card.frontImg.startsWith('assets/cards/');
      const c = TEAM_COLORS[card.team] || { primary: '#222222', secondary: '#111111', accent: '#FFFFFF', text: '#FFFFFF' };
      
      const renderPlayerSilhouette = () => {
        if (isCustomImage) {
          return (
            <img 
              src={card.frontImg} 
              alt={`${card.player} Front`} 
              className="absolute inset-0 w-full h-full object-cover z-1"
            />
          );
        }
        
        // Return sport silhouette
        if (card.sport === 'Basketball') {
          return (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-t from-black/60 to-transparent z-1">
              <svg viewBox="0 0 100 100" className="w-[80%] h-[80%] opacity-85" style={{ color: c.primary }}>
                <path fill="currentColor" d="M48,10 A4.5,4.5 0 1,1 48,19 A4.5,4.5 0 1,1 48,10 Z M28,22 L42,26 L51,18 L66,22 L74,16 L77,19 L68,27 L58,24 L55,42 L69,62 L65,65 L52,46 L41,60 L30,75 L26,72 L38,53 L45,39 L36,31 L26,33 Z M82,12 A3.5,3.5 0 1,1 82,19 A3.5,3.5 0 1,1 82,12 Z" />
              </svg>
            </div>
          );
        } else if (card.sport === 'Baseball') {
          return (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-t from-black/60 to-transparent z-1">
              <svg viewBox="0 0 100 100" className="w-[80%] h-[80%] opacity-85" style={{ color: c.primary }}>
                <path fill="currentColor" d="M38,12 A4,4 0 1,1 38,20 A4,4 0 1,1 38,12 Z M16,34 L30,28 L45,20 L52,26 L62,24 L76,20 L78,22 L68,28 L55,27 L47,36 L51,53 L58,68 L54,70 L44,53 L35,60 L25,73 L21,70 L32,55 L40,41 L29,38 Z M60,14 L85,10 L86,12 L61,16 Z" />
              </svg>
            </div>
          );
        } else { // Football
          return (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-t from-black/60 to-transparent z-1">
              <svg viewBox="0 0 100 100" className="w-[80%] h-[80%] opacity-85" style={{ color: c.primary }}>
                <path fill="currentColor" d="M42,10 A4,4 0 1,1 42,18 A4,4 0 1,1 42,10 Z M26,28 L38,22 L46,18 L58,22 L68,31 L76,29 L78,31 L68,37 L56,28 L48,35 L52,52 L56,69 L51,70 L44,53 L32,56 L22,68 L18,65 L28,52 L38,41 L26,35 Z M42,38 L36,35 L38,32 L44,35 Z" />
              </svg>
            </div>
          );
        }
      };

      // RENDER DESIGNS BY SET IDENTIFIERS
      
      // --- Baseball Custom Front Face Renderers ---
      
      // 1. Peck & Snyder (1869)
      if (card.setId === '1869-peck-snyder') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between" style={{ backgroundColor: '#c8b99c', color: '#3e2a14', fontFamily: 'serif' }}>
            <div className="border-[2px] border-[#3e2a14] p-1 flex-1 flex flex-col justify-between bg-[#dfd3b8]">
              <div className="text-[7px] text-center font-bold tracking-widest uppercase border-b border-[#3e2a14]/30 pb-0.5">PECK & SNYDER, NEW YORK</div>
              <div className="w-[85%] aspect-[3/4] mx-auto border border-[#3e2a14] bg-[#bfae8f] overflow-hidden my-auto relative shadow-inner">
                {renderPlayerSilhouette()}
                <div className="absolute inset-0 bg-black/10 mix-blend-color-burn pointer-events-none" />
              </div>
              <div className="text-center pt-1">
                <div className="text-[9px] uppercase font-black tracking-tight">{card.player}</div>
                <div className="text-[6px] uppercase font-bold tracking-wider mt-0.5">CINCINNATI RED STOCKINGS</div>
              </div>
            </div>
          </div>
        );
      }

      // 2. Allen & Ginter (1887)
      if (card.setId === '1887-allen-ginter') {
        return (
          <div className="absolute inset-0 w-full h-full p-2.5 flex flex-col justify-between" style={{ backgroundColor: '#FAF4EB', color: '#2C1D11', fontFamily: 'serif' }}>
            <div className="border border-[#D2C2B3] p-1 flex-1 flex flex-col justify-between bg-white relative">
              <div className="text-[6px] text-center font-extrabold tracking-wider text-neutral-500 uppercase">ALLEN & GINTER'S Richmond Cigarettes</div>
              <div className="w-[75%] aspect-[3/4] mx-auto border-2 border-[#D2C2B3] bg-[#EFEFEF] overflow-hidden my-auto relative shadow-md">
                {renderPlayerSilhouette()}
              </div>
              <div className="text-center pt-1 border-t border-[#D2C2B3]/40">
                <div className="text-[9px] uppercase font-black text-[#8C1D1D]">{card.player}</div>
                <div className="text-[5.5px] uppercase font-extrabold text-neutral-600 mt-0.5">{card.team}</div>
              </div>
            </div>
          </div>
        );
      }

      // 3. T206 White Border (1909)
      if (card.setId === '1909-t206') {
        return (
          <div className="absolute inset-0 w-full h-full p-3 flex flex-col justify-between bg-white" style={{ border: '4px solid #F2ECE1', borderRadius: '4px' }}>
            <div className="flex-1 flex flex-col justify-between bg-[#7EC0EE] relative overflow-hidden">
              {renderPlayerSilhouette()}
              <div className="absolute bottom-0 inset-x-0 bg-white border-t border-neutral-300 py-1 text-center relative z-10">
                <div className="text-[9px] uppercase font-bold tracking-tight text-neutral-800 leading-none">{card.player}</div>
                <div className="text-[5.5px] uppercase font-bold text-neutral-500 mt-0.5">{card.team.toUpperCase()}</div>
              </div>
            </div>
          </div>
        );
      }

      // 4. Cracker Jack (1914)
      if (card.setId === '1914-cracker-jack') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between bg-[#D21F3C]" style={{ border: '2.5px solid #E5C158' }}>
            <div className="border border-white/20 p-1 flex-1 flex flex-col justify-between bg-transparent">
              <div className="text-[8px] font-black text-center text-[#E5C158] tracking-widest font-mono">CRACKER JACK</div>
              <div className="w-[80%] aspect-[3/4] mx-auto border-2 border-white bg-neutral-900 overflow-hidden my-auto relative shadow-2xl">
                {renderPlayerSilhouette()}
              </div>
              <div className="bg-[#FCF8F2] border border-neutral-800 px-1 py-0.5 text-center mt-1">
                <div className="text-[9px] font-black uppercase text-neutral-800 tracking-tight leading-none">{card.player}</div>
                <div className="text-[5.5px] font-bold uppercase text-neutral-500 mt-0.5">{card.team}</div>
              </div>
            </div>
          </div>
        );
      }

      // 5. Goudey Big League (1933)
      if (card.setId === '1933-goudey') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between bg-[#FCF8F2]" style={{ border: '3px solid #1E5631' }}>
            <div className="border border-neutral-300 p-1 flex-1 flex flex-col justify-between bg-[#4C9A2A]">
              <div className="text-[7px] text-center font-mono font-bold text-white uppercase tracking-wider bg-black/30 py-0.5">BIG LEAGUE CHEWING GUM</div>
              <div className="w-[85%] aspect-square mx-auto border-2 border-white bg-white/10 overflow-hidden my-auto relative shadow-lg">
                {renderPlayerSilhouette()}
              </div>
              <div className="bg-white border-2 border-neutral-800 p-1 text-center">
                <div className="text-[9px] font-black uppercase text-[#D21F3C] leading-none">{card.player}</div>
                <div className="text-[5.5px] font-bold uppercase text-neutral-600 mt-0.5">{card.team}</div>
              </div>
            </div>
          </div>
        );
      }

      // 6. Play Ball (1939)
      if (card.setId === '1939-play-ball') {
        return (
          <div className="absolute inset-0 w-full h-full p-2.5 flex flex-col justify-between" style={{ backgroundColor: '#EADBC8', color: '#111' }}>
            <div className="border-[3px] border-neutral-700 p-1.5 flex-1 flex flex-col justify-between bg-white relative">
              <div className="text-[8px] font-mono font-black text-neutral-500 text-left leading-none">NO. {card.specs.cardNum}</div>
              <div className="w-[85%] aspect-[4/5] mx-auto border-2 border-neutral-800 bg-[#D3D3D3] overflow-hidden my-auto relative shadow-inner">
                {renderPlayerSilhouette()}
                <div className="absolute inset-0 bg-black/5 pointer-events-none" />
              </div>
              <div className="bg-[#FAF0DD] border-t border-neutral-400 p-1 text-center font-bold tracking-tight">
                <span className="text-[9px] uppercase font-black text-black leading-none">{card.player}</span>
              </div>
            </div>
          </div>
        );
      }

      // 7. 1975 Topps Baseball
      if (card.setId === '1975-topps-baseball') {
        const topColor = '#FF69B4'; // hot pink
        const bottomColor = '#39FF14'; // neon green
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between bg-white" style={{ border: '2px solid #111' }}>
            <div className="border-2 border-black flex-1 flex flex-col justify-between relative overflow-hidden" style={{ background: `linear-gradient(to bottom, ${topColor} 50%, ${bottomColor} 50%)` }}>
              <div className="flex justify-between items-center text-[7.5px] font-black text-black px-1.5 pt-0.5 select-none">
                <span>TOPPS '75</span>
                <span>#{card.specs.cardNum}</span>
              </div>
              <div className="w-[82%] aspect-[4/5] mx-auto border-2 border-black bg-white overflow-hidden my-auto relative shadow-md">
                {renderPlayerSilhouette()}
              </div>
              <div className="bg-[#FFEA00] border-t-2 border-black p-1 text-center relative z-10 shadow-[2px_-2px_0px_#000]">
                <div className="text-[9px] uppercase font-black text-black leading-none">{card.player}</div>
                <div className="text-[5.5px] font-bold uppercase text-neutral-700 mt-0.5 leading-none">{card.team}</div>
              </div>
            </div>
          </div>
        );
      }

      // 8. 1987 Topps Wood-grain
      if (card.setId === '1987-topps-baseball') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between" style={{ backgroundColor: '#8B5A2B', border: '3px solid #5C3A21', borderRadius: '4px' }}>
            <div className="border-2 border-[#3E2723] flex-1 flex flex-col justify-between relative overflow-hidden bg-white/95">
              <div className="absolute inset-0 opacity-15 pointer-events-none bg-[repeating-linear-gradient(0deg,#8B5A2B,#8B5A2B_2px,transparent_2px,transparent_10px)]" />
              <div className="flex justify-between items-center text-[7.5px] font-black text-amber-950 px-2 pt-1 relative z-10">
                <span>TOPPS '87</span>
                <span>#{card.specs.cardNum}</span>
              </div>
              <div className="w-[85%] aspect-[4/5] mx-auto border-2 border-[#3E2723] bg-neutral-100 overflow-hidden my-auto relative shadow-inner z-10">
                {renderPlayerSilhouette()}
              </div>
              <div className="bg-white border-t border-[#3E2723] px-2 py-1 text-left relative z-10 flex justify-between items-center leading-none">
                <div>
                  <div className="text-[9px] font-black uppercase text-amber-950">{card.player}</div>
                  <div className="text-[5.5px] text-neutral-400 font-extrabold uppercase mt-0.5">{card.team}</div>
                </div>
                <div className="w-5 h-5 rounded-full bg-amber-900 flex items-center justify-center border text-white text-[7px] font-black">
                  {card.specs.position[0]}
                </div>
              </div>
            </div>
          </div>
        );
      }

      // 9. Topps NOW Baseball
      if (card.setId === 'topps-now-baseball') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between bg-black text-white" style={{ border: '2px solid #222', borderRadius: '10px' }}>
            <div className="flex-1 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start border-b border-white/20 pb-1.5 z-10">
                <div className="text-left leading-tight">
                  <span className="text-[8px] font-black text-yellow-400 tracking-wider">TOPPS NOW</span>
                  <span className="text-[5px] font-mono text-neutral-400 block uppercase">2024 MILESTONE</span>
                </div>
                <span className="text-[8px] font-mono font-bold text-neutral-400">#{card.specs.cardNum}</span>
              </div>
              <div className="w-full aspect-[4/3] relative border border-white/10 bg-neutral-900 overflow-hidden my-auto rounded">
                {renderPlayerSilhouette()}
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:4px_4px]" />
              </div>
              <div className="mt-1 flex items-center gap-2 bg-gradient-to-r from-neutral-800 to-neutral-900 text-white rounded p-1 border-t border-neutral-700 relative z-10">
                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[7px] font-black border" style={{ backgroundColor: c.primary, borderColor: c.accent }}>
                  TN
                </div>
                <div className="text-left leading-none">
                  <div className="text-[9px] font-black uppercase tracking-tight">{card.player}</div>
                  <div className="text-[6px] text-neutral-400 font-bold uppercase tracking-wider">{card.team}</div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // --- Basketball Custom Front Face Renderers ---
      
      // 1. 1948 Bowman (Basketball)
      if (card.setId === '1948-bowman') {
        const pastelBgs = ['#E28743', '#76B5C5', '#873E23', '#1E3D59', '#15B7B9', '#F5A962'];
        const cardBg = pastelBgs[card.player.charCodeAt(0) % pastelBgs.length];
        return (
          <div className="absolute inset-0 w-full h-full p-3 flex flex-col justify-between" style={{ backgroundColor: '#DCD4C4', color: '#111' }}>
            <div className="border-[3px] border-neutral-800 p-1 flex-1 flex flex-col justify-between relative overflow-hidden bg-white/40" style={{ boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)' }}>
              <div className="text-[9px] font-mono font-extrabold text-neutral-800 text-left pl-1">
                NO. {card.specs.cardNum}
              </div>
              <div className="w-[85%] aspect-[4/5] mx-auto border-[3px] border-neutral-800 relative bg-neutral-200 overflow-hidden shadow-[3px_3px_0px_#111] my-auto">
                <div className="absolute inset-0" style={{ backgroundColor: cardBg }} />
                {renderPlayerSilhouette()}
                <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:5px_5px]" />
              </div>
              <div className="w-full bg-[#F4D068] border-t-2 border-neutral-800 p-1 text-center font-bold tracking-tight relative z-10 flex flex-col justify-center items-center">
                <span className="text-[11px] uppercase font-black tracking-wider text-black font-sans leading-none">{card.player}</span>
              </div>
            </div>
          </div>
        );
      }

      // 2. 1957 Topps (Basketball)
      if (card.setId === '1957-topps') {
        const topColor = '#CE1141';
        const bottomColor = '#FDB927';
        return (
          <div className="absolute inset-0 w-full h-full p-2.5 flex flex-col justify-between" style={{ backgroundColor: '#FCF8F2', color: '#111' }}>
            <div className="border-2 border-neutral-800 p-1 flex-1 flex flex-col justify-between relative overflow-hidden bg-white">
              <div className="absolute inset-0 flex flex-col">
                <div className="h-1/2 w-full" style={{ backgroundColor: topColor }} />
                <div className="h-1/2 w-full border-t border-neutral-800" style={{ backgroundColor: bottomColor }} />
              </div>
              
              <div className="w-[82%] aspect-[4/5] mx-auto border-2 border-neutral-800 relative bg-[#FCF8F2] overflow-hidden my-auto z-10 shadow-lg">
                {renderPlayerSilhouette()}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:4px_4px]" />
              </div>
              
              <div className="bg-[#FCF8F2] border-2 border-neutral-800 px-2 py-0.5 text-center relative z-10 flex justify-between items-center w-full">
                <div className="text-left leading-tight">
                  <div className="text-[9px] font-black uppercase text-black font-sans">{card.player}</div>
                  <div className="text-[6.5px] text-neutral-600 font-bold uppercase tracking-wider">{card.team}</div>
                </div>
                <div className="w-5 h-5 rounded-full bg-neutral-800 text-white text-[8px] font-mono font-bold flex items-center justify-center border border-neutral-800">
                  {card.specs.cardNum}
                </div>
              </div>
            </div>
          </div>
        );
      }

      // 3. 1961 Fleer (Basketball)
      if (card.setId === '1961-fleer') {
        return (
          <div className="absolute inset-0 w-full h-full p-2.5 flex flex-col justify-between" style={{ backgroundColor: '#FDF9F0', color: '#111' }}>
            <div className="border-[3px] border-neutral-800 p-1.5 flex-1 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#D82A2A] via-[#FDF9F0] to-[#1E4C9A]">
              <div className="flex justify-between items-center text-[7px] font-mono font-black text-neutral-800 relative z-10 bg-white/80 px-1 border border-neutral-800 rounded">
                <span>FLEER BASKETBALL</span>
                <span>#{card.specs.cardNum}</span>
              </div>
              
              <div className="w-28 h-28 rounded-full border-[3px] border-neutral-800 bg-[#FCF8F2] overflow-hidden mx-auto my-auto relative shadow-md z-10">
                {renderPlayerSilhouette()}
              </div>
              
              <div className="bg-white border-2 border-neutral-800 p-1 text-center relative z-10 shadow-[2px_2px_0px_rgba(0,0,0,0.85)]">
                <div className="text-[10px] font-black uppercase text-[#D82A2A] tracking-tighter leading-none">{card.player}</div>
                <div className="text-[6.5px] font-extrabold uppercase text-[#1E4C9A] tracking-wide mt-0.5 leading-none">{card.team}</div>
              </div>
            </div>
          </div>
        );
      }

      // 4. 1969 Topps (Basketball)
      if (card.setId === '1969-topps') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between" style={{ backgroundColor: '#EADBC8', color: '#111' }}>
            <div className="border-[3px] border-amber-950 p-1 flex-1 flex flex-col justify-between relative overflow-hidden bg-[#FF8B94]">
              <div className="absolute inset-1 border border-amber-950/20 pointer-events-none" />
              
              <div className="text-center bg-white border-2 border-amber-950 py-0.5 relative z-10 shadow-[2px_2px_0px_#111]">
                <span className="text-[9px] font-mono font-black tracking-widest text-[#D21F3C]">{card.team.toUpperCase()}</span>
              </div>
              
              <div className="w-[85%] aspect-[3/4] border-2 border-amber-950 bg-white rounded-[40px] overflow-hidden mx-auto my-auto relative shadow-inner z-10">
                {renderPlayerSilhouette()}
              </div>
              
              <div className="absolute bottom-12 right-2 w-8 h-8 z-20 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full text-yellow-400 drop-shadow-[1px_1px_0px_#111]">
                  <circle cx="50" cy="50" r="40" fill="currentColor" stroke="#111" strokeWidth="6" />
                  <path d="M20,50 Q50,80 80,50 M20,40 Q50,10 80,40" stroke="#111" strokeWidth="4" fill="none" />
                </svg>
              </div>
              
              <div className="bg-[#FFF6E6] border-2 border-amber-950 p-1 text-center relative z-10 shadow-[2px_2px_0px_#111]">
                <div className="text-[10px] font-black uppercase text-amber-950 tracking-tight leading-none">{card.player}</div>
              </div>
            </div>
          </div>
        );
      }


      // 6. 1986-87 Fleer (Basketball)
      if (card.setId === '1986-fleer') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between" style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="border-[6px] border-r-[6px] border-l-[6px] border-t-[#D82A2A] border-b-[#D82A2A] border-l-[#1E4C9A] border-r-[#1E4C9A] p-1 flex-1 flex flex-col justify-between relative overflow-hidden bg-black">
              <div className="absolute inset-[1px] border border-yellow-400/50 pointer-events-none" />
              
              <div className="absolute top-1 right-1.5 z-20 flex flex-col items-end">
                <span className="text-[8px] font-serif font-black text-yellow-400 drop-shadow">FLEER</span>
                <span className="text-[5px] font-mono font-bold text-white bg-[#D82A2A] px-1 rounded-sm">PREMIER</span>
              </div>
              
              <div className="absolute top-1 left-2 z-20 text-[7px] font-mono text-white/90">
                #{card.specs.cardNum}
              </div>

              <div className="w-[90%] aspect-[4/5] mx-auto my-auto relative border border-white/20 bg-neutral-900 overflow-hidden shadow-md">
                {renderPlayerSilhouette()}
              </div>
              
              <div className="bg-yellow-400 border-2 border-black rounded text-black p-1 text-center font-bold tracking-tight relative z-10 shadow-[2px_2px_0px_#000]">
                <div className="text-[10px] uppercase font-black leading-none">{card.player}</div>
                <div className="text-[6.5px] uppercase tracking-wider opacity-90 leading-none mt-0.5">{card.team}</div>
              </div>
            </div>
          </div>
        );
      }

      // 7. 1989-90 NBA Hoops (Basketball)
      if (card.setId === '1989-hoops') {
        return (
          <div className="absolute inset-0 w-full h-full p-2.5 flex flex-col justify-between" style={{ backgroundColor: '#ECE9E2', color: '#111' }}>
            <div className="border border-neutral-400 p-1 flex-1 flex flex-col justify-between relative overflow-hidden bg-white">
              <div className="absolute inset-0 opacity-[0.1] bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] bg-[size:10px_10px] bg-[position:0_0,8px_8px]" />
              
              <div className="flex justify-between items-center text-[7px] font-mono font-bold text-neutral-400 relative z-10 px-1">
                <span>NBA HOOPS</span>
                <span>#{card.specs.cardNum}</span>
              </div>
              
              <div className="w-[85%] aspect-[4/5] mx-auto my-auto relative border-2 border-neutral-800 bg-[#ECE9E2] overflow-hidden shadow-inner z-10" style={{ borderRadius: '100px 100px 0 0' }}>
                {renderPlayerSilhouette()}
                <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
              
              <div className="border-t-2 border-neutral-800 pt-1 text-left relative z-10 leading-none" style={{ borderTopColor: c.primary }}>
                <div className="text-[11px] font-black uppercase text-neutral-900 tracking-tight">{card.player}</div>
                <div className="text-[6.5px] text-neutral-400 font-extrabold uppercase mt-0.5">{card.team}</div>
              </div>
            </div>
          </div>
        );
      }

      // 8. 1990-91 SkyBox (Basketball)
      if (card.setId === '1990-skybox') {
        return (
          <div className="absolute inset-0 w-full h-full p-2.5 flex flex-col justify-between bg-gradient-to-b from-[#14142B] to-[#3B154C]" style={{ border: '3px solid #EAA824', borderRadius: '8px' }}>
            <div className="flex-1 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-2 left-6 w-20 h-[1px] bg-cyan-400 rotate-[-15deg] opacity-70" />
              <div className="absolute bottom-16 right-4 w-12 h-12 rounded-full border border-pink-500/30 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border border-yellow-500/20" />
              </div>
              <div className="absolute top-8 right-8 w-4 h-4 rounded-full bg-gradient-to-tr from-amber-600 to-orange-400 opacity-60 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              
              <div className="flex justify-between items-center text-[7px] text-[#EAA824] font-mono tracking-widest">
                <span>SKYBOX '90</span>
                <span>#{card.specs.cardNum}</span>
              </div>

              <div className="w-[85%] aspect-[4/5] mx-auto border-2 border-[#EAA824]/60 bg-black/40 overflow-hidden relative shadow-2xl my-auto rounded">
                {renderPlayerSilhouette()}
              </div>

              <div className="text-center pt-1.5 leading-none relative z-10 border-t border-[#EAA824]/30">
                <div className="text-[11px] font-black uppercase text-white tracking-widest">{card.player}</div>
                <div className="text-[6px] text-[#EAA824] font-bold uppercase tracking-widest mt-0.5">{card.team}</div>
              </div>
            </div>
          </div>
        );
      }

      // 9. 1991-92 Upper Deck (Basketball)
      if (card.setId === '1991-upper-deck') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between" style={{ backgroundColor: '#FFFFFF', color: '#111', border: '1px solid #CCC' }}>
            <div className="border border-neutral-300 p-1 flex-1 flex flex-col justify-between relative overflow-hidden bg-white">
              <div className="absolute inset-y-0 left-0 w-2 bg-[#00572C] z-10" />
              
              <div className="flex justify-between items-center text-[7px] font-mono font-bold text-neutral-400 pl-3">
                <span>UPPER DECK '91</span>
                <span>#{card.specs.cardNum}</span>
              </div>

              <div className="w-[90%] aspect-[4/5] ml-auto my-auto relative border border-neutral-200 bg-neutral-50 overflow-hidden shadow-inner">
                {renderPlayerSilhouette()}
              </div>
              
              <div className="h-6 w-full bg-[#E8C28E] border-t border-b border-[#B38F5F] flex items-center justify-between px-3 pl-5 relative z-10">
                <div className="text-left leading-tight">
                  <span className="text-[9px] font-extrabold uppercase text-amber-950 block truncate">{card.player}</span>
                </div>
                <div className="w-4 h-3 bg-gradient-to-r from-neutral-300 via-neutral-100 to-neutral-400 border border-neutral-400 rounded-sm flex items-center justify-center opacity-85 shadow">
                  <span className="text-[4px] font-mono font-black text-neutral-600">UD</span>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // 10. 1993-94 Topps Finest (Basketball)
      if (card.setId === '1993-finest') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between" style={{ backgroundColor: '#002B24', border: '2px solid #5A8F76' }}>
            <div className="border border-neutral-500/20 p-1 flex-1 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#1E5631] via-[#4C9A2A] to-[#0A2F1D]">
              <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-cyan-400/30 via-transparent to-pink-500/30" />
              
              <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-neutral-400 border border-neutral-600 shadow" />
              <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-neutral-400 border border-neutral-600 shadow" />
              <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-neutral-400 border border-neutral-600 shadow" />
              <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-neutral-400 border border-neutral-600 shadow" />
              
              <div className="absolute top-6 inset-x-0 text-center select-none opacity-40 z-20">
                <span className="text-[5.5px] font-mono tracking-widest text-yellow-300 font-bold uppercase">PEEL OFF PROTECTIVE COATING</span>
              </div>

              <div className="flex justify-between items-center text-[7px] text-yellow-300 font-mono font-black relative z-10 px-2 mt-1">
                <span>FINEST '93</span>
                <span>#{card.specs.cardNum}</span>
              </div>

              <div className="w-[85%] aspect-square mx-auto relative border-2 border-neutral-400 bg-neutral-900 overflow-hidden my-auto rounded">
                {renderPlayerSilhouette()}
              </div>

              <div className="bg-[#121212]/90 border-2 border-yellow-400/80 rounded text-yellow-300 p-1 text-center font-bold tracking-tight relative z-10 shadow-[2px_2px_0px_#000]">
                <div className="text-[10px] uppercase font-black leading-none">{card.player}</div>
                <div className="text-[6.5px] uppercase tracking-wider opacity-90 leading-none mt-0.5">{card.team}</div>
              </div>
            </div>
          </div>
        );
      }

      // 11. 1996-97 Topps Chrome (Basketball)
      if (card.setId === '1996-topps-chrome') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between bg-gradient-to-b from-[#2A2A2A] to-[#121212]" style={{ border: '2px solid #A5ACAF' }}>
            <div className="border border-white/5 p-1 flex-1 flex flex-col justify-between relative overflow-hidden bg-black/60">
              <div className="absolute inset-0 opacity-[0.25] bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-cyan-400 via-pink-400 to-yellow-300 pointer-events-none" />
              
              <div className="flex justify-between items-center text-[7px] text-neutral-400 font-mono tracking-widest">
                <span>TOPPS CHROME</span>
                <span>#{card.specs.cardNum}</span>
              </div>

              <div className="w-[85%] aspect-[4/5] mx-auto my-auto relative border border-white/10 bg-neutral-900 rounded overflow-hidden shadow-md">
                {renderPlayerSilhouette()}
              </div>
              
              <div className="w-full bg-[#111] border border-white/10 rounded-full px-2 py-0.5 flex items-center justify-between relative z-10 shadow-lg mt-1" style={{ borderLeftColor: c.primary, borderLeftWidth: '4px' }}>
                <span className="text-[9px] font-black uppercase text-white tracking-wider truncate">{card.player}</span>
                <span className="text-[6px] font-bold text-neutral-400 truncate">{card.team}</span>
              </div>
            </div>
          </div>
        );
      }

      // 12. 1997-98 Precious Metal Gems (Basketball)
      if (card.setId === '1997-pmg') {
        const isGreen = card.parallel.includes('Green');
        const pmgBg = isGreen ? '#00A36C' : '#D21F3C';
        return (
          <div className="absolute inset-0 w-full h-full p-2 bg-black flex flex-col justify-between" style={{ border: `2.5px solid ${pmgBg}`, borderRadius: '10px' }}>
            <div className="flex-1 flex flex-col justify-between relative overflow-hidden p-1 rounded" style={{ backgroundColor: pmgBg }}>
              <div className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(circle,#000_10%,transparent_11%)] bg-[size:4px_4px]" />
              
              <div className="flex justify-between items-center text-[7px] text-white font-mono tracking-widest relative z-10">
                <span className="font-extrabold uppercase">METAL UNIVERSE PMG</span>
                <span>#{card.specs.cardNum}</span>
              </div>

              <div className="w-[85%] aspect-[4/5] mx-auto my-auto relative border border-black/30 bg-black/60 overflow-hidden rounded shadow-2xl">
                {renderPlayerSilhouette()}
              </div>

              <div className="bg-black/80 border border-white/10 rounded p-1 text-center relative z-10 shadow-lg">
                <div className="text-[10px] font-black uppercase text-white tracking-widest">{card.player}</div>
                <div className="text-[6px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">{card.team}</div>
              </div>
            </div>
          </div>
        );
      }

      // 13. 2003-04 Exquisite Collection (Basketball)
      if (card.setId === '2003-exquisite') {
        return (
          <div className="absolute inset-0 w-full h-full p-3 flex flex-col justify-between bg-[#F8F5EE]" style={{ border: '3px solid #C5A059', borderRadius: '14px' }}>
            <div className="flex-1 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-center text-[7px] text-[#C5A059] font-mono font-bold">
                <span>EXQUISITE COLLECTION</span>
                <span>#{card.specs.cardNum}</span>
              </div>

              <div className="w-full aspect-[5/4] border border-[#C5A059]/40 bg-neutral-900 overflow-hidden relative rounded my-auto">
                {renderPlayerSilhouette()}
              </div>

              <div className="grid grid-cols-2 gap-2 my-auto items-center mt-1">
                <div className="aspect-square bg-neutral-950 border border-[#C5A059]/30 p-1 flex items-center justify-center relative overflow-hidden rounded shadow-inner">
                  <div className="w-full h-full flex flex-col">
                    <div className="h-1/3 w-full" style={{ backgroundColor: c.primary }} />
                    <div className="h-1/3 w-full bg-white" />
                    <div className="h-1/3 w-full" style={{ backgroundColor: c.secondary || c.primary }} />
                  </div>
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:3px_3px]" />
                  <span className="absolute bottom-0.5 right-1 text-[5px] font-mono text-white/50 tracking-wider">PATCH</span>
                </div>
                <div className="h-12 border-b border-[#C5A059]/60 flex flex-col justify-end items-center relative pb-1">
                  <span className="text-[5px] font-mono uppercase text-[#C5A059] absolute top-0 tracking-widest">AUTHENTIC AUTO</span>
                  <span className="text-base rotate-[-2deg] font-medium tracking-wide" style={{ fontFamily: "'Dancing Script', cursive", color: '#1A237E' }}>
                    {card.player}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[7px] font-mono font-bold mt-1 border-t border-[#C5A059]/20 pt-1 text-[#C5A059]">
                <span className="uppercase">{card.specs.position}</span>
                <span className="font-bold text-[8px]" style={{ color: '#C8102E' }}>
                  {card.player.charCodeAt(0) % 90 + 1}/99
                </span>
              </div>
            </div>
          </div>
        );
      }

      // 14. 2012-13 Panini Prizm (Basketball)
      if (card.setId === '2012-prizm') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between bg-[#1D1D23]" style={{ border: '2.5px solid #8E9499', borderRadius: '12px' }}>
            <div className="border border-white/5 p-1.5 flex-1 flex flex-col justify-between relative overflow-hidden rounded bg-[#101014]">
              <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(ellipse_at_center,#fff_1px,transparent_1px)] bg-[size:8px_8px]" />
              
              <div className="absolute inset-1 border border-white/10 pointer-events-none rounded opacity-30" />
              <div className="absolute inset-0 pointer-events-none z-10" style={{ border: `1.5px solid ${c.primary}40` }} />

              <div className="absolute top-2 left-2 z-20 flex items-center justify-center w-5 h-5 bg-gradient-to-b from-yellow-500 to-amber-700 border border-yellow-300 rounded-sm shadow-md">
                <span className="text-[6px] font-mono text-white font-extrabold tracking-tighter">RC</span>
              </div>

              <div className="flex justify-end text-[7px] font-mono font-bold tracking-widest text-[#8E9499] relative z-10">
                <span>PANINI PRIZM</span>
              </div>

              <div className="w-full aspect-[5/6] relative bg-neutral-950 border border-white/10 rounded overflow-hidden my-auto flex items-center justify-center">
                {renderPlayerSilhouette()}
                <div className="absolute bottom-1 right-1 bg-white/10 border border-white/20 px-1 rounded">
                  <span className="text-[5px] text-white font-bold">{card.parallel}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-1.5 leading-none text-left relative z-10 flex justify-between items-center">
                <div>
                  <div className="text-[9px] font-black uppercase text-white tracking-wide">{card.player}</div>
                  <div className="text-[5px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">{card.team}</div>
                </div>
                <span className="text-[6px] font-mono text-white/60 bg-white/5 border border-white/10 px-1 py-0.5 rounded">
                  {card.specs.position.split(' ')[0]}
                </span>
              </div>
            </div>
          </div>
        );
      }

      // 15. 2012-13 Panini Select (Basketball)
      if (card.setId === '2012-select') {
        return (
          <div className="absolute inset-0 w-full h-full p-2.5 flex flex-col justify-between bg-gradient-to-b from-[#18181A] to-black" style={{ border: '2.5px solid #C4CED4', borderRadius: '12px' }}>
            <div className="border border-white/5 p-1 flex-1 flex flex-col justify-between relative overflow-hidden bg-black/60 rounded">
              <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(45deg,#fff_25%,transparent_25%,transparent_75%,#fff_75%,#fff),linear-gradient(45deg,#fff_25%,transparent_25%,transparent_75%,#fff_75%,#fff)] bg-[size:16px_16px] bg-[position:0_0,8px_8px]" />
              
              <div className="absolute -left-10 top-0 w-40 h-40 opacity-25 rotate-45" style={{ backgroundColor: c.primary }} />
              <div className="absolute -right-10 bottom-0 w-40 h-40 opacity-25 rotate-45" style={{ backgroundColor: c.secondary || c.primary }} />

              <div className="flex justify-between items-center text-[7px] text-white/60 font-mono font-bold tracking-wider relative z-10">
                <span>PANINI SELECT</span>
                <span>#{card.specs.cardNum}</span>
              </div>

              <div className="w-[85%] aspect-[4/5] mx-auto my-auto relative border border-white/10 bg-neutral-900 rounded overflow-hidden shadow-2xl z-10">
                {renderPlayerSilhouette()}
              </div>

              <div className="bg-[#18181A] border-t-2 border-white/20 p-1 text-center relative z-10 mt-1 shadow-lg" style={{ borderTopColor: c.primary }}>
                <div className="text-[9px] font-black uppercase text-white tracking-widest">{card.player}</div>
                <div className="text-[5.5px] text-neutral-400 font-extrabold uppercase mt-0.5 tracking-wider">{card.team}</div>
              </div>
            </div>
          </div>
        );
      }

      // 16. 2013-14 Panini National Treasures (Basketball)
      if (card.setId === '2013-national-treasures') {
        return (
          <div className="absolute inset-0 w-full h-full p-3 flex flex-col justify-between bg-[#FCFAF5]" style={{ border: '3.5px solid #D4AF37', borderRadius: '14px' }}>
            <div className="flex-1 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-center text-[7px] text-[#A67C1E] font-serif font-black tracking-widest">
                <span>NATIONAL TREASURES</span>
                <span>#{card.specs.cardNum}</span>
              </div>

              <div className="grid grid-cols-5 gap-2 my-auto items-center mt-1">
                <div className="col-span-3 aspect-[4/3] border border-neutral-300 bg-neutral-900 relative rounded overflow-hidden shadow-inner">
                  {renderPlayerSilhouette()}
                </div>
                <div className="col-span-2 aspect-square bg-neutral-950 border border-neutral-300 p-1 flex items-center justify-center relative overflow-hidden rounded shadow-inner">
                  <div className="w-full h-full flex flex-col">
                    <div className="h-1/3 w-full" style={{ backgroundColor: c.primary }} />
                    <div className="h-1/3 w-full bg-white" />
                    <div className="h-1/3 w-full" style={{ backgroundColor: c.secondary || c.primary }} />
                  </div>
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:3px_3px]" />
                  <span className="absolute bottom-0.5 right-1 text-[4px] font-mono text-white/50 tracking-wider">PATCH</span>
                </div>
              </div>

              <div className="h-12 border-b border-[#D4AF37]/50 flex flex-col justify-end items-center relative pb-1">
                <span className="text-[5px] font-mono uppercase text-neutral-400 absolute top-0.5 tracking-widest">ON-CARD AUTOGRAPH</span>
                <span className="text-base rotate-[-1deg] font-medium tracking-wide" style={{ fontFamily: "'Dancing Script', cursive", color: '#1B264F' }}>
                  {card.player}
                </span>
              </div>

              <div className="flex justify-between items-center text-[7px] font-mono font-bold mt-1 border-t border-[#D4AF37]/20 pt-1 text-neutral-500">
                <span className="uppercase">{card.specs.position}</span>
                <span className="font-bold text-[8px]" style={{ color: '#D4AF37', fontFamily: "'Space Mono', monospace" }}>
                  1/99
                </span>
              </div>
            </div>
          </div>
        );
      }

      // 17. 2014-15 Panini Donruss Optic (Basketball)
      if (card.setId === '2014-optic') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between bg-[#151518]" style={{ border: '2.5px solid #8A8D8F', borderRadius: '12px' }}>
            <div className="border border-white/5 p-1.5 flex-1 flex flex-col justify-between relative overflow-hidden rounded bg-[#101012]">
              <div className="absolute inset-0 opacity-15 bg-gradient-to-tr from-cyan-400 via-transparent to-pink-500" />
              
              <div className="absolute top-2 left-2 z-20 flex flex-col items-center justify-center bg-gradient-to-br from-[#1053A8] to-[#164380] border-2 border-[#ECB814] rounded-sm px-1 shadow-md rotate-[-4deg]">
                <span className="text-[4px] font-sans text-white font-bold tracking-tighter">RATED</span>
                <span className="text-[6px] font-sans text-[#ECB814] font-black leading-none tracking-tight">ROOKIE</span>
              </div>

              <div className="flex justify-end text-[7px] font-mono font-bold tracking-widest text-neutral-400 relative z-10">
                <span>DONRUSS OPTIC</span>
              </div>

              <div className="w-full aspect-[5/6] relative bg-neutral-950 border border-white/10 rounded overflow-hidden my-auto flex items-center justify-center z-10">
                {renderPlayerSilhouette()}
              </div>

              <div className="border-t border-white/10 pt-1.5 leading-none text-left relative z-10 flex justify-between items-center">
                <div>
                  <div className="text-[9px] font-black uppercase text-white tracking-wide">{card.player}</div>
                  <div className="text-[5px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">{card.team}</div>
                </div>
                <span className="text-[6.5px] font-mono text-white/70 bg-white/5 border border-white/10 px-1 py-0.5 rounded uppercase">
                  {card.specs.position.split(' ')[0]}
                </span>
              </div>
            </div>
          </div>
        );
      }

      // 18. 2019-20 Panini Mosaic (Basketball)
      if (card.setId === '2019-mosaic') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between bg-[#151515]" style={{ border: '2.5px solid #8A9A9F', borderRadius: '12px' }}>
            <div className="border border-white/5 p-1.5 flex-1 flex flex-col justify-between relative overflow-hidden rounded bg-black/60">
              <div className="absolute inset-0 opacity-[0.25] bg-[linear-gradient(60deg,rgba(255,255,255,0.05)_25%,transparent_25%),linear-gradient(-60deg,rgba(255,255,255,0.05)_25%,transparent_25%),linear-gradient(180deg,rgba(255,255,255,0.05)_50%,transparent_50%)] bg-[size:12px_10px]" />
              
              <div className="absolute inset-1 border border-white/10 pointer-events-none rounded opacity-35" />
              <div className="absolute -right-8 top-12 w-20 h-2 bg-gradient-to-r from-transparent to-[#8A9A9F]/40 rotate-[-45deg]" />

              <div className="flex justify-between items-center text-[7px] text-[#C4CED4] font-mono font-bold tracking-widest relative z-10">
                <span>PANINI MOSAIC</span>
                <span>#{card.specs.cardNum}</span>
              </div>

              <div className="w-[85%] aspect-[4/5] mx-auto my-auto relative border border-white/10 bg-neutral-900 rounded overflow-hidden shadow-2xl z-10">
                {renderPlayerSilhouette()}
              </div>

              <div className="bg-[#1E1E1E] border-t-2 border-white/20 p-1 text-center relative z-10 mt-1 shadow-lg" style={{ borderTopColor: c.primary }}>
                <div className="text-[9px] font-black uppercase text-white tracking-widest">{card.player}</div>
                <div className="text-[5px] text-neutral-400 font-extrabold uppercase mt-0.5 tracking-wider">{card.team}</div>
              </div>
            </div>
          </div>
        );
      }

      // 18b. 2012-13 Panini Flawless (Basketball)
      if (card.setId === '2012-flawless') {
        return (
          <div className="absolute inset-0 w-full h-full p-3 flex flex-col justify-between bg-gradient-to-b from-[#FCFAF8] to-[#F2EFE9]" style={{ border: '3px solid #D4AF37', borderRadius: '14px', boxShadow: '0 0 15px rgba(0,0,0,0.1)' }}>
            <div className="border border-[#D4AF37]/30 p-1 flex-1 flex flex-col justify-between relative overflow-hidden bg-white/40 rounded-lg">
              {/* Gemstone Badging */}
              <div className="flex justify-between items-center text-[7px] text-[#A67C1E] font-serif font-black tracking-widest relative z-10 select-none">
                <span className="flex items-center gap-1">
                  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current text-cyan-500"><path d="M12 2L2 9l10 13 10-13L12 2zm0 3.8L17.8 9 12 16.5 6.2 9 12 5.8z"/></svg>
                  FLAWLESS
                </span>
                <span>#{card.specs.cardNum}</span>
              </div>

              {/* Player Image area with luxury frame */}
              <div className="w-[85%] aspect-[5/4] mx-auto my-auto relative border border-neutral-300 bg-neutral-900 overflow-hidden rounded shadow-inner z-10">
                {renderPlayerSilhouette()}
              </div>

              {/* Patch & Autograph Section */}
              <div className="grid grid-cols-5 gap-2 items-center my-auto px-1">
                {/* Patch */}
                <div className="col-span-2 aspect-square bg-neutral-950 border border-neutral-300 p-0.5 flex items-center justify-center relative overflow-hidden rounded shadow-inner">
                  <div className="w-full h-full flex flex-col">
                    <div className="h-1/2 w-full" style={{ backgroundColor: c.primary }} />
                    <div className="h-1/2 w-full" style={{ backgroundColor: c.secondary || c.primary }} />
                  </div>
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.15)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.15)_75%),linear-gradient(45deg,rgba(0,0,0,0.15)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.15)_75%)] bg-[size:4px_4px]" />
                  <span className="absolute bottom-0.5 right-1 text-[4px] font-mono text-white/50 tracking-wider">PATCH</span>
                </div>
                
                {/* On-card Auto */}
                <div className="col-span-3 h-10 border-b border-[#D4AF37]/50 flex flex-col justify-end items-center relative pb-1">
                  <span className="text-[4px] font-mono uppercase text-neutral-400 absolute top-0 tracking-widest select-none">HAND-SIGNED</span>
                  <span className="text-sm rotate-[-1deg] font-medium tracking-wide" style={{ fontFamily: "'Dancing Script', cursive", color: '#1A237E' }}>
                    {card.player}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[7px] font-mono font-bold mt-1 border-t border-[#D4AF37]/20 pt-1 text-neutral-500">
                <span className="uppercase">{card.specs.position}</span>
                <span className="font-bold text-[8px]" style={{ color: '#D4AF37', fontFamily: "'Space Mono', monospace" }}>
                  15/25
                </span>
              </div>
            </div>
          </div>
        );
      }

      // 18c. 2012-13 Panini Gold Standard (Basketball)
      if (card.setId === '2012-gold-standard') {
        const isLimited = card.parallel.includes('Limited') || card.id.includes('-limited');
        return (
          <div className="absolute inset-0 w-full h-full p-2.5 flex flex-col justify-between" style={{ background: 'linear-gradient(135deg, #A37A2C 0%, #E6C687 25%, #B8903C 50%, #FDF3CD 75%, #926E25 100%)', border: '3px solid #6A4E1A', borderRadius: '12px', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }}>
            <div className="border-[1.5px] border-[#503A12]/40 p-1 flex-1 flex flex-col justify-between bg-black/10 rounded">
              {/* Header */}
              <div className="flex justify-between items-center text-[7.5px] text-[#503A12] font-black tracking-widest font-sans">
                <span>GOLD STANDARD</span>
                <span>#{card.specs.cardNum}</span>
              </div>

              {/* Player Image with Golden Border */}
              <div className="w-[85%] aspect-[4/5] mx-auto border-2 border-[#503A12] bg-[#FAF0CD]/10 overflow-hidden relative shadow-md my-auto">
                {renderPlayerSilhouette()}
                <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(ellipse_at_center,#000_1px,transparent_1px)] bg-[size:8px_8px] pointer-events-none" />
              </div>

              {/* Bottom Card details / signature area */}
              {isLimited ? (
                <div className="bg-black/90 border border-[#503A12]/40 rounded text-center py-1 mt-1 shadow-lg">
                  <div className="text-[9px] font-black uppercase text-[#E6C687] tracking-widest">{card.player}</div>
                  <div className="text-[5.5px] text-[#FAF0CD]/60 font-extrabold uppercase mt-0.5 tracking-wider">{card.team}</div>
                </div>
              ) : (
                <div className="h-11 border-b border-[#503A12]/60 flex flex-col justify-end items-center relative pb-1 my-1">
                  <span className="text-[4px] font-mono uppercase text-[#503A12]/80 absolute top-0 tracking-widest select-none">GOLD INK AUTOGRAPH</span>
                  <span className="text-sm font-semibold tracking-wide" style={{ fontFamily: "'Dancing Script', cursive", color: '#000000' }}>
                    {card.player}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-[7px] font-mono font-bold mt-1 text-[#503A12]">
                <span className="uppercase">{card.specs.position}</span>
                <span className="font-bold text-[8px]" style={{ fontFamily: "'Space Mono', monospace" }}>
                  {isLimited ? '07/79' : '21/99'}
                </span>
              </div>
            </div>
          </div>
        );
      }

      // 18d. 2012-13 Panini Immaculate (Basketball)
      if (card.setId === '2012-immaculate') {
        const isAutoOnly = card.type === 'Autograph Card';
        const isPatchOnly = card.type === 'Patch Card';
        return (
          <div className="absolute inset-0 w-full h-full p-3 flex flex-col justify-between bg-[#FCFAF5]" style={{ border: '3.5px solid #8E9499', borderRadius: '14px', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)' }}>
            <div className="flex-1 flex flex-col justify-between relative overflow-hidden rounded-lg">
              {/* Bold diagonal team stripe accent */}
              <div className="absolute top-0 right-0 w-24 h-24 opacity-80 pointer-events-none transform translate-x-4 -translate-y-4 rotate-45" style={{ background: `linear-gradient(to bottom, ${c.primary}, ${c.secondary || c.primary})` }} />
              
              <div className="flex justify-between items-center text-[7px] text-neutral-500 font-serif font-black tracking-widest relative z-10 select-none">
                <span>IMMACULATE</span>
                <span className="text-[#FCFAF5] drop-shadow">#{card.specs.cardNum}</span>
              </div>

              {/* Player Image / Relic layout */}
              <div className="grid grid-cols-5 gap-2 my-auto items-center mt-1.5 z-10">
                <div className={`${isAutoOnly ? 'col-span-5' : 'col-span-3'} aspect-[4/3] border border-neutral-300 bg-neutral-900 relative rounded overflow-hidden shadow-inner`}>
                  {renderPlayerSilhouette()}
                </div>
                {!isAutoOnly && (
                  <div className={`${isPatchOnly ? 'col-span-5 aspect-[4/3]' : 'col-span-2 aspect-square'} bg-neutral-950 border border-neutral-300 p-0.5 flex items-center justify-center relative overflow-hidden rounded shadow-inner`}>
                    <div className="w-full h-full flex flex-col">
                      <div className="h-1/3 w-full" style={{ backgroundColor: c.primary }} />
                      <div className="h-1/3 w-full bg-white" />
                      <div className="h-1/3 w-full" style={{ backgroundColor: c.secondary || c.primary }} />
                    </div>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:4px_4px]" />
                    <span className="absolute bottom-0.5 right-1 text-[4px] font-mono text-white/50 tracking-wider">PATCH</span>
                  </div>
                )}
              </div>

              {/* Autograph signature line */}
              {!isPatchOnly ? (
                <div className="h-11 border-b border-neutral-300 flex flex-col justify-end items-center relative pb-1 my-1">
                  <span className="text-[4px] font-mono uppercase text-neutral-400 absolute top-0.5 tracking-widest select-none">IMMACULATE SIGNATURES</span>
                  <span className="text-base rotate-[-1.5deg] font-medium tracking-wide" style={{ fontFamily: "'Dancing Script', cursive", color: '#1A237E' }}>
                    {card.player}
                  </span>
                </div>
              ) : (
                <div className="bg-neutral-900/5 border border-neutral-300 rounded text-center py-1.5 my-1">
                  <div className="text-[9px] font-black uppercase text-neutral-800 tracking-widest">{card.player}</div>
                  <div className="text-[5.5px] text-neutral-400 font-extrabold uppercase mt-0.5 tracking-wider">{card.team}</div>
                </div>
              )}

              <div className="flex justify-between items-center text-[7px] font-mono font-bold mt-1 border-t border-neutral-200 pt-1 text-neutral-500">
                <span className="uppercase">{card.specs.position}</span>
                <span className="font-bold text-[8px]" style={{ color: c.primary, fontFamily: "'Space Mono', monospace" }}>
                  {isPatchOnly ? '10/99' : '05/99'}
                </span>
              </div>
            </div>
          </div>
        );
      }

      // 18e. 2023-24 Panini Select (Basketball)
      if (card.setId === '2023-select') {
        return (
          <div className="absolute inset-0 w-full h-full p-2.5 flex flex-col justify-between bg-neutral-950 text-white" style={{ border: '3px solid #5C6370', borderRadius: '12px', boxShadow: '0 0 10px rgba(0,0,0,0.8)' }}>
            <div className="border border-white/10 p-1 flex-1 flex flex-col justify-between relative overflow-hidden bg-black/60 rounded-lg">
              {/* Carbon fiber grid pattern */}
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#fff_25%,transparent_25%),linear-gradient(-45deg,#fff_25%,transparent_25%),linear-gradient(135deg,#fff_25%,transparent_25%)] bg-[size:6px_6px]" />
              
              {/* Glowing side neon lines */}
              <div className="absolute top-4 left-0 w-1 h-[75%] rounded-r" style={{ backgroundColor: c.primary, boxShadow: `0 0 8px ${c.primary}` }} />
              <div className="absolute top-4 right-0 w-1 h-[75%] rounded-l" style={{ backgroundColor: c.secondary || c.primary, boxShadow: `0 0 8px ${c.secondary || c.primary}` }} />

              <div className="flex justify-between items-center text-[7px] text-neutral-400 font-mono tracking-widest relative z-10 font-bold select-none">
                <span>SELECT '23</span>
                <span>#{card.specs.cardNum}</span>
              </div>

              {/* Hexagonal Player Image container */}
              <div className="w-[85%] aspect-[4/5] mx-auto my-auto relative border border-white/20 bg-neutral-900 overflow-hidden shadow-2xl z-10" style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)' }}>
                {renderPlayerSilhouette()}
              </div>

              {/* Signature Box */}
              <div className="h-10 border-b border-white/20 flex flex-col justify-end items-center relative pb-1 my-1">
                <span className="text-[4px] font-mono uppercase text-neutral-500 absolute top-0 tracking-widest select-none">SELECT SIGNATURES</span>
                <span className="text-sm rotate-[-1deg] font-medium tracking-wide" style={{ fontFamily: "'Dancing Script', cursive", color: '#64B5F6' }}>
                  {card.player}
                </span>
              </div>

              <div className="flex justify-between items-center text-[7px] font-mono font-bold mt-1 border-t border-white/10 pt-1 text-neutral-400">
                <span className="uppercase">{card.specs.position}</span>
                <span className="font-bold text-[8px]" style={{ color: c.primary, fontFamily: "'Space Mono', monospace" }}>
                  1/10
                </span>
              </div>
            </div>
          </div>
        );
      }

      // 19. 2025-26 Topps Now Basketball (Basketball)
      if (card.setId === '2025-topps-now') {
        return (
          <div className="absolute inset-0 w-full h-full p-2.5 flex flex-col justify-between bg-black text-white" style={{ border: '2px solid #222', borderRadius: '10px' }}>
            <div className="flex-1 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start border-b border-white/20 pb-1.5 z-10">
                <div className="text-left leading-tight">
                  <span className="text-[8px] font-black text-yellow-400 tracking-wider">TOPPS NOW</span>
                  <span className="text-[5px] font-mono text-neutral-400 block uppercase">OCTOBER 22, 2025</span>
                </div>
                <span className="text-[8px] font-mono font-bold text-neutral-400">#{card.specs.cardNum}</span>
              </div>

              <div className="w-full aspect-[4/5] my-auto relative border border-white/10 bg-neutral-950 overflow-hidden shadow-2xl">
                {renderPlayerSilhouette()}
                
                <div className="absolute bottom-1 left-1 bg-black/80 px-1 py-0.5 rounded text-[5px] font-mono border border-white/10">
                  {card.player.includes('Wembanyama') ? 'WEMBY: 25 PTS • 9 REB • 5 BLK' : 'SGA: 28 PTS • 7 AST • 8 REB'}
                </div>
              </div>

              <div className="text-left pt-1 relative z-10 leading-none">
                <div className="text-[10px] font-black uppercase text-white tracking-wide">{card.player}</div>
                <div className="text-[6px] text-yellow-400 font-bold uppercase tracking-wider mt-1">{card.team}</div>
              </div>
            </div>
          </div>
        );
      }



      // 20. 2025-26 Topps Flagship Basketball
      if (card.setId === '2025-topps-flagship') {
        const teamAbbrev = card.team.split(' ').pop().toUpperCase();
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between bg-[#F4F1EA]" style={{ border: '3px solid #1c1c1f', borderRadius: '14px' }}>
            <div className="border border-neutral-300 p-1 flex-1 flex flex-col justify-between relative overflow-hidden bg-[#FAF9F5] rounded-lg">
              {/* Curve line effect */}
              <div className="absolute inset-0 border-l-[3.5px] border-b-[3.5px] pointer-events-none rounded-bl-xl z-20" style={{ borderColor: c.primary, borderLeftColor: c.primary, borderBottomColor: c.primary }} />
              
              {/* Top Bar with Topps Logo and Card Number */}
              <div className="flex justify-between items-center text-[7px] text-neutral-600 font-bold relative z-10 select-none">
                <span className="text-[6px] tracking-wide text-neutral-500">2025-26 flagship</span>
                <span className="font-mono">#{card.specs.cardNum}</span>
              </div>

              {/* Vertical bubble text on left border */}
              <div className="absolute top-[12%] left-1 z-20 flex flex-col select-none" style={{ height: '70%', justifyContent: 'center' }}>
                <span 
                  className="text-[12px] font-black tracking-widest font-sans whitespace-nowrap uppercase"
                  style={{
                    transform: 'rotate(-90deg) translateY(-14px)',
                    transformOrigin: 'left center',
                    color: 'transparent',
                    WebkitTextStrokeWidth: '0.8px',
                    WebkitTextStrokeColor: c.secondary || '#888',
                    letterSpacing: '0.15em',
                    opacity: 0.85
                  }}
                >
                  {teamAbbrev}
                </span>
              </div>

              {/* Player Image Area */}
              <div className="w-[85%] aspect-[4/5] mx-auto my-auto relative border border-neutral-300 bg-neutral-100 rounded overflow-hidden shadow z-10">
                {renderPlayerSilhouette()}
              </div>

              {/* Bottom Strip with Name and Logo */}
              <div className="flex justify-between items-center relative z-10 mt-1 select-none">
                {/* Small circular logo at bottom-left */}
                <div 
                  className="w-5 h-5 rounded-full border border-neutral-300 flex items-center justify-center font-bold text-[7px] text-white shadow-inner bg-gradient-to-tr"
                  style={{ backgroundImage: `linear-gradient(135deg, ${c.primary}, ${c.secondary})` }}
                >
                  {teamAbbrev.substring(0, 3)}
                </div>
                
                {/* Horizontal Nameplate strip */}
                <div className="flex-1 bg-[#1e1e1f] text-left border-l-[3px] rounded px-2 py-0.5 ml-1.5 flex items-center justify-between" style={{ borderLeftColor: c.primary }}>
                  <span className="text-[9px] font-black uppercase text-white tracking-wider truncate">{card.player}</span>
                  <span className="text-[5px] text-neutral-400 font-extrabold uppercase ml-1">TOPPS</span>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // 21. 2025-26 Topps Chrome Basketball
      if (card.setId === '2025-topps-chrome') {
        const teamAbbrev = card.team.split(' ').pop().toUpperCase();
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between bg-gradient-to-b from-[#1c1c1f] via-[#2c2c2f] to-[#0c0c0d]" style={{ border: '2.5px solid #C4CED4', borderRadius: '12px', boxShadow: 'inset 0 0 10px rgba(255,255,255,0.06)' }}>
            <div className="border border-white/5 p-1 flex-1 flex flex-col justify-between relative overflow-hidden bg-black/50 rounded-lg">
              {/* Iridescent gloss overlay */}
              <div className="absolute inset-0 opacity-[0.25] bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-cyan-400 via-pink-400 to-yellow-300 pointer-events-none" />
              
              {/* Left and bottom shiny team-colored chrome piping */}
              <div className="absolute inset-0 border-l-[3.5px] border-b-[3.5px] pointer-events-none rounded-bl-xl z-20" style={{ borderColor: c.primary, borderLeftColor: c.primary, borderBottomColor: c.primary, opacity: 0.95, filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.2))' }} />

              {/* Top Bar with Chrome Logo and Card Number */}
              <div className="flex justify-between items-center text-[7px] text-white/50 font-mono tracking-widest relative z-10">
                <span>TOPPS CHROME '25</span>
                <span>#{card.specs.cardNum}</span>
              </div>

              {/* Vertical shiny bubble text on left border */}
              <div className="absolute top-[12%] left-1 z-20 flex flex-col select-none" style={{ height: '70%', justifyContent: 'center' }}>
                <span 
                  className="text-[12px] font-black tracking-widest font-sans whitespace-nowrap uppercase"
                  style={{
                    transform: 'rotate(-90deg) translateY(-14px)',
                    transformOrigin: 'left center',
                    color: 'transparent',
                    WebkitTextStrokeWidth: '0.8px',
                    WebkitTextStrokeColor: c.secondary || '#fff',
                    letterSpacing: '0.15em',
                    textShadow: '0 0 2px rgba(255,255,255,0.3)',
                    opacity: 0.9
                  }}
                >
                  {teamAbbrev}
                </span>
              </div>

              {/* Player Image Area with Refractor Logo */}
              <div className="w-[85%] aspect-[4/5] mx-auto my-auto relative border border-white/10 bg-neutral-900 rounded overflow-hidden shadow-2xl z-10">
                {renderPlayerSilhouette()}
                <div className="absolute top-1 left-1 w-4 h-4 rounded bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-[4px] font-black text-white">REF</span>
                </div>
              </div>

              {/* Bottom Strip with Name and Chrome Logo */}
              <div className="flex justify-between items-center relative z-10 mt-1 select-none">
                {/* Circular logo at bottom-left */}
                <div 
                  className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center font-bold text-[7px] text-white shadow-inner bg-gradient-to-tr"
                  style={{ backgroundImage: `linear-gradient(135deg, ${c.primary}, ${c.secondary})` }}
                >
                  {teamAbbrev.substring(0, 3)}
                </div>

                {/* Horizontal Nameplate strip with metallic chrome style */}
                <div className="flex-1 bg-gradient-to-r from-[#151517] to-[#252528] text-left border-l-[3px] rounded px-2 py-0.5 ml-1.5 flex items-center justify-between shadow-lg" style={{ borderLeftColor: c.primary, borderLeftWidth: '3px' }}>
                  <span className="text-[9px] font-black uppercase text-white tracking-wider truncate">{card.player}</span>
                  <span className="text-[5.5px] font-extrabold text-[#C5A059] uppercase tracking-wider">CHROME</span>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // 21b. 2025-26 Topps Woven Wonders Set
      if (card.setId === '2025-topps-woven-wonders') {
        return (
          <div className="absolute inset-0 w-full h-full p-2.5 flex flex-col justify-between bg-gradient-to-br from-[#2D1F17] via-[#1A110B] to-[#120B07]" style={{ border: '3px solid #D4AF37', borderRadius: '14px', boxShadow: 'inset 0 0 12px rgba(212,175,55,0.2)' }}>
            <div className="border border-white/5 p-1 flex-1 flex flex-col justify-between relative overflow-hidden bg-black/60 rounded-lg">
              <div className="flex justify-between items-center text-[7px] text-[#D4AF37] font-mono tracking-widest relative z-10 font-black">
                <span>WOVEN WONDERS</span>
                <span>#{card.specs.cardNum}</span>
              </div>

              <div className="w-[85%] aspect-[5/4] mx-auto my-auto relative border border-[#D4AF37]/30 bg-neutral-950 overflow-hidden shadow-2xl rounded">
                {renderPlayerSilhouette()}
              </div>

              <div className="grid grid-cols-5 gap-2 items-center px-1 my-1">
                <div className="col-span-2 aspect-[4/3] bg-neutral-900 border border-[#D4AF37]/40 p-1 flex items-center justify-center relative overflow-hidden rounded shadow-inner">
                  <div className="w-full h-full flex flex-col">
                    <div className="h-1/2 w-full" style={{ backgroundColor: c.primary }} />
                    <div className="h-1/2 w-full" style={{ backgroundColor: c.secondary || c.primary }} />
                  </div>
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.15)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.15)_75%),linear-gradient(45deg,rgba(0,0,0,0.15)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.15)_75%)] bg-[size:4px_4px] bg-[position:0_0,2px_2px]" />
                  <span className="absolute bottom-0.5 right-1 text-[4px] font-mono text-white/50 tracking-wider">PATCH</span>
                </div>
                <div className="col-span-3 text-left pl-1">
                  <span className="text-[5px] font-mono uppercase text-[#D4AF37] tracking-widest block leading-none">MEMORABILIA</span>
                  <span className="text-[6.5px] font-mono font-bold text-white uppercase block leading-tight mt-0.5">GAME-WORN RELIC</span>
                </div>
              </div>

              <div className="bg-[#1C130E] border-t border-[#D4AF37]/40 p-1 text-center relative z-10 shadow-lg rounded">
                <div className="text-[9px] font-black uppercase text-[#D4AF37] tracking-widest leading-none">{card.player}</div>
                <div className="text-[5.5px] text-neutral-400 font-extrabold uppercase mt-1 leading-none">{card.team}</div>
              </div>
            </div>
          </div>
        );
      }

      // 21c. 2025-26 Topps Signature Series Set
      if (card.setId === '2025-topps-signature-series') {
        const teamAbbrev = card.team.split(' ').pop().toUpperCase();
        return (
          <div className="absolute inset-0 w-full h-full p-2.5 flex flex-col justify-between bg-gradient-to-b from-[#F9F6F0] to-[#EAE3D2]" style={{ border: '3.5px solid #C5A059', borderRadius: '14px', boxShadow: '0 0 10px rgba(0,0,0,0.15)' }}>
            <div className="border border-[#C5A059]/30 p-1 flex-1 flex flex-col justify-between relative overflow-hidden bg-white/40 rounded-lg">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(197,160,89,0.04)_1px,transparent_1px),linear-gradient(rgba(197,160,89,0.04)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />

              <div className="flex justify-between items-center text-[7px] text-[#C5A059] font-serif font-black tracking-wider relative z-10">
                <span>SIGNATURE SERIES</span>
                <span>#{card.specs.cardNum}</span>
              </div>

              <div className="w-[85%] aspect-[4/5] mx-auto my-auto relative border border-[#C5A059]/30 bg-neutral-900 rounded overflow-hidden shadow-md z-10">
                {renderPlayerSilhouette()}
              </div>

              <div className="h-10 border-b border-[#C5A059]/40 flex flex-col justify-end items-center relative pb-1 my-1">
                <span className="text-[4px] font-mono uppercase text-neutral-400 absolute top-0 tracking-widest select-none">OFFICIAL AUTOGRAPH</span>
                <span className="text-sm rotate-[-2deg] font-medium tracking-wide" style={{ fontFamily: "'Dancing Script', cursive", color: '#1B264F' }}>
                  {card.player}
                </span>
              </div>

              <div className="flex justify-between items-center text-[6px] font-mono font-bold mt-1 border-t border-[#C5A059]/20 pt-1 text-neutral-500">
                <span className="uppercase">{card.team}</span>
                <span className="font-extrabold text-[#C5A059] tracking-widest">{teamAbbrev.substring(0, 3)}</span>
              </div>
            </div>
          </div>
        );
      }

      // 21d. 2025-26 Topps Finest Basketball
      if (card.setId === '2025-topps-finest') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between bg-gradient-to-b from-[#111] to-[#000]" style={{ border: '2.5px solid #EAA824', borderRadius: '12px', boxShadow: 'inset 0 0 10px rgba(234,168,36,0.1)' }}>
            <div className="border border-white/5 p-1 flex-1 flex flex-col justify-between relative overflow-hidden bg-black/60 rounded-lg">
              <div className="absolute top-2 right-2 w-16 h-16 rounded-full bg-pink-500/20 blur-md pointer-events-none" />
              <div className="absolute bottom-6 left-2 w-20 h-20 rounded-full bg-cyan-500/20 blur-md pointer-events-none" />
              <div className="absolute top-1/3 left-1/4 w-12 h-12 rounded-full bg-yellow-500/15 blur-sm pointer-events-none" />
              
              <div className="flex justify-between items-center text-[7px] text-[#EAA824] font-mono tracking-widest relative z-10 font-extrabold">
                <span>FINEST '25</span>
                <span>#{card.specs.cardNum}</span>
              </div>

              <div className="w-[85%] aspect-[4/5] mx-auto my-auto relative border border-white/10 bg-neutral-900 rounded overflow-hidden shadow-2xl z-10">
                {renderPlayerSilhouette()}
              </div>

              <div className="bg-[#121212]/90 border-2 border-[#EAA824]/85 rounded text-white p-1 text-center font-bold tracking-tight relative z-10 shadow-[2px_2px_0px_#000] mt-1">
                <div className="text-[9px] uppercase font-black leading-none text-[#EAA824]">{card.player}</div>
                <div className="text-[5.5px] uppercase tracking-wider opacity-85 leading-none mt-0.5">{card.team}</div>
              </div>
            </div>
          </div>
        );
      }

      // --- Football Custom Front Face Renderers ---
      
      // 1. Goodwin Champions (1888)
      if (card.setId === '1888-goodwin-champions') {
        return (
          <div className="absolute inset-0 w-full h-full p-2.5 flex flex-col justify-between" style={{ backgroundColor: '#FDF7E7', color: '#3A2711', fontFamily: 'serif' }}>
            <div className="border-2 border-[#C09F6E] p-1 flex-1 flex flex-col justify-between bg-white relative">
              <div className="text-[6.5px] text-center font-extrabold tracking-widest text-[#8C1D1D] uppercase">GOODWIN CHAMPIONS</div>
              <div className="w-[80%] aspect-[3/4] mx-auto border border-[#C09F6E] bg-[#EBE0C7] overflow-hidden my-auto relative shadow-inner">
                {renderPlayerSilhouette()}
                <div className="absolute inset-0 bg-yellow-900/5 mix-blend-color-burn pointer-events-none" />
              </div>
              <div className="text-center pt-1 border-t border-[#C09F6E]/40 leading-none">
                <div className="text-[9px] uppercase font-black tracking-tight text-[#3A2711]">{card.player}</div>
                <div className="text-[5.5px] uppercase font-bold text-neutral-500 mt-1">{card.team}</div>
              </div>
            </div>
          </div>
        );
      }

      // 2. National Chicle (1935)
      if (card.setId === '1935-national-chicle') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between bg-[#E9E4D4]" style={{ border: '3.5px solid #2B4E38' }}>
            <div className="border border-black/10 p-1 flex-1 flex flex-col justify-between bg-gradient-to-tr from-[#2B4E38]/20 via-transparent to-[#9C382A]/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-4 h-4 border-b border-r border-[#2B4E38]/40 pointer-events-none" />
              <div className="absolute top-0 right-0 w-4 h-4 border-b border-l border-[#2B4E38]/40 pointer-events-none" />
              <div className="text-[8px] font-sans font-bold text-center tracking-widest text-[#2B4E38] uppercase">NATIONAL CHICLE</div>
              
              <div className="w-[85%] aspect-square mx-auto border border-[#2B4E38] bg-neutral-900 overflow-hidden my-auto relative shadow-md">
                {renderPlayerSilhouette()}
              </div>
              
              <div className="bg-[#FAF8F5] border border-[#2B4E38] p-1.5 text-center shadow-sm z-10">
                <div className="text-[10px] font-black uppercase text-neutral-800 tracking-tight leading-none">{card.player}</div>
                <div className="text-[5.5px] font-bold uppercase text-neutral-500 mt-1 leading-none">{card.team}</div>
              </div>
            </div>
          </div>
        );
      }

      // 3. 1948 Bowman & Leaf Football
      if (card.setId === '1948-bowman-leaf-football') {
        const isBowman = card.brand.includes('Bowman');
        const pastelBgs = ['#E4B7A0', '#A5CAD6', '#C7D9A0', '#E5CAD6'];
        const cardBg = pastelBgs[card.player.charCodeAt(0) % pastelBgs.length];
        return (
          <div className="absolute inset-0 w-full h-full p-3 flex flex-col justify-between bg-[#ECE6D5]" style={{ border: '1.5px solid #A59B85' }}>
            <div className="border-[2.5px] border-neutral-800 p-1 flex-1 flex flex-col justify-between relative bg-white/40">
              <div className="text-[8px] font-mono font-extrabold text-neutral-800 text-left">
                NO. {card.specs.cardNum}
              </div>
              <div className="w-[85%] aspect-[4/5] mx-auto border-2 border-neutral-800 bg-neutral-200 overflow-hidden my-auto relative shadow-md">
                <div className="absolute inset-0" style={{ backgroundColor: cardBg }} />
                {renderPlayerSilhouette()}
              </div>
              <div className="bg-neutral-800 text-white p-1 text-center font-bold tracking-tight relative z-10 leading-none">
                <div className="text-[9.5px] uppercase font-black tracking-wider leading-none">{card.player}</div>
                <div className="text-[5px] uppercase text-neutral-300 mt-1 tracking-widest">{isBowman ? 'BOWMAN' : 'LEAF'} FOOTBALL</div>
              </div>
            </div>
          </div>
        );
      }

      // 4. 1952 Bowman Large
      if (card.setId === '1952-bowman-large-football') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between bg-[#FCF8F2]" style={{ border: '2.5px solid #8D765E', borderRadius: '4px' }}>
            <div className="border border-[#8D765E] flex-1 flex flex-col justify-between relative overflow-hidden bg-white/70">
              <div className="text-[7.5px] font-serif font-black text-[#5C4533] px-2 pt-1 text-left leading-none uppercase">BOWMAN LARGE</div>
              <div className="w-[88%] aspect-[4/5] mx-auto border border-[#8D765E] bg-[#E6DBC9] overflow-hidden my-auto relative shadow-md">
                {renderPlayerSilhouette()}
                <div className="absolute inset-0 bg-[#A68F74]/10 mix-blend-color-burn pointer-events-none" />
              </div>
              <div className="bg-[#FAF0DD] border-t border-[#8D765E] px-2 py-1 text-left relative z-10 flex justify-between items-center leading-none">
                <div>
                  <div className="text-[9px] font-black uppercase text-neutral-800">{card.player}</div>
                  <div className="text-[5px] text-neutral-400 font-extrabold uppercase mt-0.5">{card.team}</div>
                </div>
                <span className="text-[8px] font-serif italic text-neutral-500">#{card.specs.cardNum}</span>
              </div>
            </div>
          </div>
        );
      }

      // 5. 1962 Topps Football
      if (card.setId === '1962-topps-football') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between bg-[#111111]" style={{ border: '4.5px solid #222222' }}>
            <div className="border border-[#333333] flex-1 flex flex-col justify-between relative overflow-hidden bg-black">
              <div className="flex justify-between items-center text-[7px] text-[#A3E635] px-2 pt-1 relative z-10 font-bold select-none">
                <span>TOPPS '62</span>
                <span>#{card.specs.cardNum}</span>
              </div>
              <div className="w-[85%] aspect-[4/5] mx-auto border-2 border-neutral-800 bg-neutral-900 overflow-hidden my-auto relative shadow-inner">
                {renderPlayerSilhouette()}
                <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
              </div>
              <div className="bg-[#A3E635] border-t border-black p-1 text-center relative z-10">
                <div className="text-[9.5px] uppercase font-black text-black leading-none">{card.player}</div>
                <div className="text-[5.5px] font-bold uppercase text-neutral-800 mt-0.5 leading-none">{card.team}</div>
              </div>
            </div>
          </div>
        );
      }

      // 6. 1965 Topps AFL Football ("Tall Boys")
      if (card.setId === '1965-topps-football') {
        return (
          <div className="absolute inset-0 w-full h-full p-1.5 flex flex-col justify-between bg-white text-black" style={{ border: '2.5px solid #E28743' }}>
            <div className="border border-black flex-1 flex flex-col justify-between relative overflow-hidden bg-[#E2B173]">
              <div className="text-center font-mono font-black text-[7.5px] text-white bg-[#C94A29] py-0.5 select-none">
                TALL BOY • AFL PREMIER
              </div>
              <div className="w-[85%] aspect-[3/5] mx-auto border border-black bg-white overflow-hidden my-auto relative shadow-inner">
                {renderPlayerSilhouette()}
              </div>
              <div className="bg-[#C94A29] border-t border-black p-1 text-center relative z-10 leading-none">
                <div className="text-[9.5px] uppercase font-black text-white leading-none">{card.player}</div>
                <div className="text-[5px] font-bold uppercase text-yellow-300 mt-1 leading-none">{card.team} • #{card.specs.cardNum}</div>
              </div>
            </div>
          </div>
        );
      }

      // 7. 1981 Topps Football
      if (card.setId === '1981-topps-football') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between bg-white" style={{ border: '2px solid #ddd' }}>
            <div className="border border-black flex-1 flex flex-col justify-between relative overflow-hidden bg-neutral-50">
              <div className="flex justify-between items-center text-[7.5px] font-sans font-bold text-neutral-400 px-2 pt-1">
                <span>TOPPS FOOTBALL '81</span>
                <span>#{card.specs.cardNum}</span>
              </div>
              <div className="w-[86%] aspect-[4/5] mx-auto border border-black bg-neutral-200 overflow-hidden my-auto relative shadow-inner">
                {renderPlayerSilhouette()}
              </div>
              <div className="bg-neutral-900 text-white border-t border-black p-1 text-center relative z-10">
                <div className="text-[9px] uppercase font-black tracking-wide leading-none">{card.player}</div>
                <div className="text-[5.5px] font-bold uppercase text-neutral-400 mt-0.5 leading-none">{card.team}</div>
              </div>
            </div>
          </div>
        );
      }

      // 8. 1986 Topps Football (Green field border)
      if (card.setId === '1986-topps-football') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between bg-[#1A4C24]" style={{ border: '3px solid #2B6C39' }}>
            <div className="border border-white/20 flex-1 flex flex-col justify-between relative overflow-hidden bg-[#2D7A43]">
              <div className="absolute top-4 inset-x-0 h-[1px] bg-white/40 border-dashed pointer-events-none" />
              <div className="absolute top-12 inset-x-0 h-[1px] bg-white/40 pointer-events-none" />
              <div className="absolute bottom-16 inset-x-0 h-[1px] bg-white/40 pointer-events-none" />
              
              <div className="flex justify-between items-center text-[7.5px] font-mono font-black text-white px-2 pt-0.5 relative z-10 bg-black/40">
                <span>10 YARD</span>
                <span>#{card.specs.cardNum}</span>
              </div>
              
              <div className="w-[85%] aspect-[4/5] mx-auto border-2 border-white bg-neutral-950 overflow-hidden my-auto relative shadow-xl z-10">
                {renderPlayerSilhouette()}
              </div>
              
              <div className="bg-[#D82A2A] border-t-2 border-white p-1 text-center relative z-10 leading-none">
                <div className="text-[9.5px] uppercase font-black text-white leading-none tracking-tight">{card.player}</div>
                <div className="text-[5.5px] font-bold uppercase text-yellow-300 mt-0.5 leading-none">{card.team}</div>
              </div>
            </div>
          </div>
        );
      }

      // 9. 1989 Pro Set Football
      if (card.setId === '1989-pro-set-football') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between bg-neutral-900" style={{ border: '2.5px solid #222' }}>
            <div className="border border-white/10 flex-1 flex flex-col justify-between bg-black relative">
              <div className="flex justify-between items-center text-[7px] text-neutral-400 px-2 pt-1 font-bold">
                <span className="text-[#D82A2A]">PRO SET NFL</span>
                <span>#{card.specs.cardNum}</span>
              </div>
              <div className="w-[86%] aspect-[4/5] mx-auto border border-neutral-800 bg-neutral-900 overflow-hidden my-auto relative shadow-inner">
                {renderPlayerSilhouette()}
              </div>
              <div className="bg-[#1E4C9A] border-t border-neutral-800 p-1 text-center relative z-10 leading-none">
                <div className="text-[9px] uppercase font-black text-white leading-none">{card.player}</div>
                <div className="text-[5px] text-neutral-400 font-bold uppercase mt-0.5 leading-none">{card.team} • {card.specs.position}</div>
              </div>
            </div>
          </div>
        );
      }

      // 10. 1991 Upper Deck Football
      if (card.setId === '1991-upper-deck-football') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between bg-white text-black" style={{ border: '1px solid #ccc' }}>
            <div className="border border-neutral-300 p-1 flex-1 flex flex-col justify-between relative overflow-hidden bg-[#fafafa]">
              <div className="absolute inset-y-0 left-0 w-2.5 bg-[#1E4C9A] z-10" />
              <div className="flex justify-between items-center text-[7.5px] font-mono font-bold text-neutral-400 pl-3.5">
                <span>UPPER DECK '91</span>
                <span>#{card.specs.cardNum}</span>
              </div>
              <div className="w-[86%] aspect-[4/5] ml-auto my-auto border border-neutral-300 bg-neutral-900 overflow-hidden relative shadow-inner">
                {renderPlayerSilhouette()}
                <div className="absolute bottom-1 right-1 w-5 h-3 bg-gradient-to-r from-neutral-300 via-neutral-100 to-neutral-400 border border-neutral-400 rounded-sm flex items-center justify-center opacity-85 shadow pointer-events-none">
                  <span className="text-[4px] font-mono font-black text-neutral-600">UD</span>
                </div>
              </div>
              <div className="h-6 w-full bg-[#ECEFF1] border-t border-neutral-300 flex items-center justify-between px-3 pl-4 relative z-10">
                <span className="text-[9px] font-black uppercase text-neutral-800 truncate">{card.player}</span>
                <span className="text-[5.5px] font-bold text-neutral-500 uppercase">{card.specs.position}</span>
              </div>
            </div>
          </div>
        );
      }

      // 11. 1997 Topps Chrome Football
      if (card.setId === '1997-topps-chrome-football') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between bg-gradient-to-b from-[#2A2A2A] to-[#121212]" style={{ border: '2.5px solid #A5ACAF' }}>
            <div className="border border-white/5 p-1.5 flex-1 flex flex-col justify-between relative overflow-hidden rounded bg-black/60">
              <div className="absolute inset-0 opacity-[0.25] bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-cyan-400 via-pink-400 to-yellow-300 pointer-events-none" />
              <div className="flex justify-between items-center text-[7.5px] text-neutral-400 font-mono tracking-widest">
                <span>TOPPS CHROME</span>
                <span>#{card.specs.cardNum}</span>
              </div>
              <div className="w-[85%] aspect-[4/5] mx-auto my-auto relative border border-white/10 bg-neutral-900 rounded overflow-hidden shadow-md">
                {renderPlayerSilhouette()}
              </div>
              <div className="w-full bg-[#111] border border-white/10 rounded-full px-2 py-0.5 flex items-center justify-between relative z-10 shadow-lg mt-1" style={{ borderLeftColor: c.primary, borderLeftWidth: '4px' }}>
                <span className="text-[9px] font-black uppercase text-white tracking-wider truncate">{card.player}</span>
                <span className="text-[6px] font-bold text-neutral-400 truncate">{card.team}</span>
              </div>
            </div>
          </div>
        );
      }

      // 12. 1998 Playoff Contenders Football
      if (card.setId === '1998-contenders-football') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between bg-white text-black" style={{ border: '1.5px solid #bbb', borderRadius: '12px' }}>
            <div className="border border-neutral-300 p-2 flex-1 flex flex-col justify-between relative overflow-hidden rounded bg-[#fcfcf9]">
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-neutral-300 to-transparent pointer-events-none" />
              <div className="flex justify-between items-start border-b border-dashed border-neutral-400 pb-1.5 text-[7px] font-mono font-bold leading-none">
                <div className="text-left">
                  <span className="text-[#C94A29] block uppercase">ROOKIE TICKET</span>
                  <span className="text-neutral-500 block uppercase">SECURE PASS</span>
                </div>
                <span>#{card.specs.cardNum}</span>
              </div>
              <div className="w-full aspect-[5/4] border border-neutral-300 bg-neutral-900 overflow-hidden relative shadow-inner my-auto">
                {renderPlayerSilhouette()}
              </div>
              <div className="border-t border-dashed border-neutral-400 pt-1 flex flex-col items-center justify-end h-8 relative">
                <span className="text-[5px] font-mono text-neutral-400 absolute top-0.5 uppercase tracking-widest">ON-CARD AUTOGRAPH</span>
                <span className="text-[13px] font-medium leading-none mt-1" style={{ fontFamily: "'Dancing Script', cursive", color: '#15317e' }}>
                  {card.player}
                </span>
              </div>
            </div>
          </div>
        );
      }

      // 13. 2012 Panini Prizm Football
      if (card.setId === '2012-prizm-football') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between bg-[#1D1D23]" style={{ border: '2.5px solid #8E9499', borderRadius: '12px' }}>
            <div className="border border-white/5 p-1.5 flex-1 flex flex-col justify-between relative overflow-hidden rounded bg-[#101014]">
              <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(ellipse_at_center,#fff_1px,transparent_1px)] bg-[size:8px_8px] pointer-events-none" />
              <div className="absolute top-2 left-2 z-20 flex items-center justify-center w-5 h-5 bg-gradient-to-b from-yellow-500 to-amber-700 border border-yellow-300 rounded-sm shadow-md">
                <span className="text-[6px] font-mono text-white font-extrabold tracking-tighter">RC</span>
              </div>
              <div className="flex justify-end text-[7px] font-mono font-bold tracking-widest text-[#8E9499] relative z-10">
                <span>PANINI PRIZM</span>
              </div>
              <div className="w-full aspect-[5/6] relative bg-neutral-950 border border-white/10 rounded overflow-hidden my-auto flex items-center justify-center">
                {renderPlayerSilhouette()}
              </div>
              <div className="border-t border-white/10 pt-1.5 leading-none text-left relative z-10 flex justify-between items-center">
                <div>
                  <div className="text-[9px] font-black uppercase text-white tracking-wide">{card.player}</div>
                  <div className="text-[5px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">{card.team}</div>
                </div>
                <span className="text-[6px] font-mono text-white/60 bg-white/5 border border-white/10 px-1 py-0.5 rounded uppercase">
                  {card.specs.position}
                </span>
              </div>
            </div>
          </div>
        );
      }

      // 14. 2016 Panini Donruss Optic Football
      if (card.setId === '2016-optic-football') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between bg-[#151518]" style={{ border: '2.5px solid #8A8D8F', borderRadius: '12px' }}>
            <div className="border border-white/5 p-1.5 flex-1 flex flex-col justify-between relative overflow-hidden rounded bg-[#101012]">
              <div className="absolute inset-0 opacity-15 bg-gradient-to-tr from-cyan-400 via-transparent to-pink-500 pointer-events-none" />
              <div className="absolute top-2 left-2 z-20 flex flex-col items-center justify-center bg-gradient-to-br from-[#1053A8] to-[#164380] border-2 border-[#ECB814] rounded-sm px-1 shadow-md rotate-[-4deg]">
                <span className="text-[4px] font-sans text-white font-bold tracking-tighter">RATED</span>
                <span className="text-[6px] font-sans text-[#ECB814] font-black leading-none tracking-tight">ROOKIE</span>
              </div>
              <div className="flex justify-end text-[7px] font-mono font-bold tracking-widest text-neutral-400 relative z-10">
                <span>DONRUSS OPTIC</span>
              </div>
              <div className="w-full aspect-[5/6] relative bg-neutral-950 border border-white/10 rounded overflow-hidden my-auto flex items-center justify-center z-10">
                {renderPlayerSilhouette()}
              </div>
              <div className="border-t border-white/10 pt-1.5 leading-none text-left relative z-10 flex justify-between items-center">
                <div>
                  <div className="text-[9.5px] font-black uppercase text-white tracking-wide">{card.player}</div>
                  <div className="text-[5px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">{card.team}</div>
                </div>
                <span className="text-[6.5px] font-mono text-white/70 bg-white/5 border border-white/10 px-1 py-0.5 rounded uppercase">
                  {card.specs.position}
                </span>
              </div>
            </div>
          </div>
        );
      }

      // 15. 2016 Panini National Treasures Football
      if (card.setId === '2016-national-treasures-football') {
        return (
          <div className="absolute inset-0 w-full h-full p-3 flex flex-col justify-between bg-[#FCFAF5]" style={{ border: '3.5px solid #D4AF37', borderRadius: '14px' }}>
            <div className="flex-1 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-center text-[7px] text-[#A67C1E] font-serif font-black tracking-widest">
                <span>NATIONAL TREASURES</span>
                <span>#{card.specs.cardNum}</span>
              </div>
              <div className="grid grid-cols-5 gap-2 my-auto items-center mt-1">
                <div className="col-span-3 aspect-[4/3] border border-neutral-300 bg-neutral-900 relative rounded overflow-hidden shadow-inner">
                  {renderPlayerSilhouette()}
                </div>
                <div className="col-span-2 aspect-square bg-neutral-950 border border-neutral-300 p-1 flex items-center justify-center relative overflow-hidden rounded shadow-inner">
                  <div className="w-full h-full flex flex-col">
                    <div className="h-1/3 w-full" style={{ backgroundColor: c.primary }} />
                    <div className="h-1/3 w-full bg-white" />
                    <div className="h-1/3 w-full" style={{ backgroundColor: c.secondary || c.primary }} />
                  </div>
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:3px_3px] pointer-events-none" />
                  <span className="absolute bottom-0.5 right-1 text-[4px] font-mono text-white/50 tracking-wider">PATCH</span>
                </div>
              </div>
              <div className="h-10 border-b border-[#D4AF37]/50 flex flex-col justify-end items-center relative pb-1">
                <span className="text-[5px] font-mono uppercase text-neutral-400 absolute top-0.5 tracking-widest">ON-CARD AUTOGRAPH</span>
                <span className="text-[13px] rotate-[-1deg] font-medium leading-none" style={{ fontFamily: "'Dancing Script', cursive", color: '#1B264F' }}>
                  {card.player}
                </span>
              </div>
              <div className="flex justify-between items-center text-[7px] font-mono font-bold mt-1 border-t border-[#D4AF37]/20 pt-1 text-neutral-500">
                <span className="uppercase">{card.specs.position}</span>
                <span className="font-bold text-[8px]" style={{ color: '#D4AF37', fontFamily: "'Space Mono', monospace" }}>
                  1/99
                </span>
              </div>
            </div>
          </div>
        );
      }

      // 16. Topps NOW Football
      if (card.setId === 'topps-now-football') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between bg-black text-white" style={{ border: '2px solid #222', borderRadius: '10px' }}>
            <div className="flex-1 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start border-b border-white/20 pb-1.5 z-10">
                <div className="text-left leading-none">
                  <span className="text-[8px] font-black text-yellow-400 tracking-wider">TOPPS NOW</span>
                  <span className="text-[5px] font-mono text-neutral-400 block uppercase">2025 SEASON</span>
                </div>
                <span className="text-[8px] font-mono font-bold text-neutral-400">#{card.specs.cardNum}</span>
              </div>
              <div className="w-full aspect-[4/3] relative border border-white/10 bg-neutral-900 overflow-hidden my-auto rounded">
                {renderPlayerSilhouette()}
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:4px_4px]" />
              </div>
              <div className="mt-1 flex items-center gap-2 bg-gradient-to-r from-neutral-800 to-neutral-900 text-white rounded p-1 border-t border-neutral-700 relative z-10">
                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[7px] font-black border" style={{ backgroundColor: c.primary, borderColor: c.accent }}>
                  TN
                </div>
                <div className="text-left leading-none">
                  <div className="text-[9.5px] font-black uppercase tracking-tight">{card.player}</div>
                  <div className="text-[6px] text-neutral-400 font-bold uppercase tracking-wider">{card.team}</div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // 17. 2025-26 Topps Chrome Football (Chrome Only)
      if (card.setId === '2025-topps-chrome-football') {
        const isChrome = true;
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between" style={{ background: 'linear-gradient(to bottom, #18181A, #000)', border: '2.5px solid #C4CED4', borderRadius: '12px' }}>
            <div className="border border-white/5 p-1.5 flex-1 flex flex-col justify-between relative overflow-hidden bg-black/60 rounded">
              <div className="absolute inset-0 opacity-[0.22] bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-cyan-400 via-pink-400 to-yellow-300 pointer-events-none" />
              <div className="flex justify-between items-center text-[7px] font-mono tracking-widest relative z-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <span>TOPPS CHROME '25</span>
                <span>#{card.specs.cardNum}</span>
              </div>
              <div className="w-full aspect-[4/5] my-auto relative border border-white/10 bg-neutral-900 rounded overflow-hidden">
                {renderPlayerSilhouette()}
                <div className="absolute top-1 left-1 w-4 h-4 rounded bg-white/20 border border-white/30 flex items-center justify-center">
                  <span className="text-[4px] font-black text-white">REF</span>
                </div>
              </div>
              <div className="border-t border-white/10 pt-1.5 relative z-10 flex justify-between items-center">
                <div>
                  <div className="text-[9.5px] font-black uppercase tracking-tight text-white">{card.player}</div>
                  <div className="text-[5.5px] font-extrabold uppercase tracking-wider mt-0.5" style={{ color: c.primary }}>{card.team}</div>
                </div>
                <span className="text-[6px] font-mono border border-white/10 px-1 py-0.5 rounded uppercase text-white/60 bg-white/5">
                  {card.specs.position}
                </span>
              </div>
            </div>
          </div>
        );
      }

      // --- Non-Basketball Retro Sets Fallbacks ---

      // 1. Vintage Baseball (1952 / 1954 Topps)
      if (card.setId === '1952-topps' || card.setId === '1954-topps') {
        const bgColors = ['#f5e6d3', '#eadecc', '#ecdcc8'];
        const cardBg = bgColors[card.player.charCodeAt(0) % bgColors.length];
        const innerCircleColor = card.setId === '1952-topps' ? c.primary : c.secondary;
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between" style={{ backgroundColor: cardBg, color: '#1a1a1a' }}>
            <div className="border border-neutral-400 p-1 flex-1 flex flex-col justify-between relative overflow-hidden bg-white/40">
              <div className="flex justify-between items-center text-[8px] font-bold font-mono tracking-widest text-neutral-700">
                <span>{card.brand}</span>
                <span>{card.number}</span>
              </div>
              
              <div className="w-full aspect-[4/3] my-auto border-2 border-double border-neutral-600 relative bg-neutral-100 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 rounded-full scale-90" style={{ backgroundColor: `${innerCircleColor}35` }} />
                {renderPlayerSilhouette()}
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:4px_4px]" />
              </div>
              
              <div className="absolute bottom-16 inset-x-0 flex justify-center pointer-events-none select-none z-10">
                <span className="font-semibold text-xl tracking-wide rotate-[-3deg] opacity-80" style={{ fontFamily: "'Reenie Beanie', cursive", color: '#142a5c' }}>
                  {card.player}
                </span>
              </div>

              <div className="mt-1 flex items-center gap-2 bg-gradient-to-r from-neutral-800 to-neutral-900 text-white rounded p-1 border-t border-neutral-700 relative z-10">
                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[7px] font-black border" style={{ backgroundColor: c.primary, borderColor: c.accent }}>
                  {card.player.split(' ').map(p => p[0]).join('')}
                </div>
                <div className="text-left leading-none">
                  <div className="text-[10px] font-black uppercase tracking-tight">{card.player}</div>
                  <div className="text-[7px] text-neutral-400 font-bold uppercase tracking-wider">{card.team}</div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // 2. Vintage Football (1957 Topps & 1976 Topps Football)
      if (card.setId === '1957-topps-football' || card.setId === '1976-topps-football') {
        const is57 = card.setId === '1957-topps-football';
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between" style={{ backgroundColor: '#ebdcb9', color: '#111' }}>
            <div className="border border-neutral-500 p-1 flex-1 flex flex-col justify-between relative overflow-hidden bg-white/20">
              {is57 ? (
                <div className="absolute inset-0 flex">
                  <div className="w-1/2 h-full flex flex-col justify-end p-2 relative overflow-hidden" style={{ backgroundColor: c.primary }}>
                    <span className="text-[28px] font-black opacity-20 text-white select-none absolute top-4 left-2">RC</span>
                    <span className="text-[8px] font-mono text-white/80">{card.player.split(' ')[0]}</span>
                  </div>
                  <div className="w-1/2 h-full bg-white/50 border-l border-neutral-400 relative overflow-hidden">
                    {renderPlayerSilhouette()}
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col justify-between p-2">
                  <div className="flex justify-between items-center text-[8px] font-mono font-bold text-neutral-600">
                    <span>TOPPS '76</span>
                    <span>{card.number}</span>
                  </div>
                  <div className="w-full aspect-square border-2 border-neutral-700 bg-neutral-200/50 rounded-lg overflow-hidden relative my-auto">
                    {renderPlayerSilhouette()}
                  </div>
                </div>
              )}

              <div className="bg-[#ebdcb9] border border-neutral-700 p-1 mt-auto relative z-10 flex justify-between items-center">
                <div className="text-left leading-none">
                  <span className="text-[9px] font-black uppercase text-black block">{card.player}</span>
                  <span className="text-[6px] text-neutral-500 font-extrabold uppercase">{card.team}</span>
                </div>
                <div className="text-[8px] font-mono bg-black text-white px-1.5 py-0.5 rounded font-black">{card.specs.position.split(' ')[0]}</div>
              </div>
            </div>
          </div>
        );
      }

      // 3. Junk Wax Baseball (1989 Upper Deck & 1993 SP Foil)
      if (card.setId === '1989-upper-deck' || card.setId === '1993-sp-foil') {
        const is89 = card.setId === '1989-upper-deck';
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between" style={{ backgroundColor: '#fff', color: '#111' }}>
            <div className="border border-neutral-300 p-1 flex-1 flex flex-col justify-between relative overflow-hidden bg-white font-sans">
              {is89 ? (
                <div className="absolute inset-0 flex flex-col justify-between p-1">
                  <div className="absolute top-0 right-8 w-1.5 h-full bg-emerald-700/80 pointer-events-none" />
                  <div className="flex justify-between items-center text-[8px] font-extrabold text-neutral-500">
                    <span>UPPER DECK</span>
                    <span>{card.number}</span>
                  </div>
                  <div className="w-full aspect-[4/5] my-auto border border-neutral-200 bg-neutral-100 overflow-hidden relative">
                    {renderPlayerSilhouette()}
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-4 bg-gradient-to-r from-neutral-300 via-neutral-100 to-neutral-400 border border-neutral-400 rounded-sm flex items-center justify-center opacity-90 shadow-md">
                      <span className="text-[5px] font-mono text-neutral-600 font-black">UD</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-amber-200 via-yellow-100 to-amber-300 p-2 flex flex-col justify-between">
                  <div className="border border-amber-400/40 p-1 flex-1 flex flex-col justify-between relative overflow-hidden">
                    <div className="text-right text-[7px] font-black text-amber-900">SP '93 PREMIUM</div>
                    <div className="w-full aspect-square border border-amber-400/60 bg-neutral-900 overflow-hidden relative my-auto shadow-inner">
                      {renderPlayerSilhouette()}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white border-t border-neutral-200 p-1 relative z-10 flex justify-between items-center">
                <div className="text-left leading-none">
                  <div className="text-[10px] font-black uppercase text-neutral-800">{card.player}</div>
                  <div className="text-[6px] text-neutral-400 font-bold uppercase mt-0.5">{card.team}</div>
                </div>
                <div className="w-4 h-4 rounded-full bg-neutral-100 flex items-center justify-center border text-[8px] font-bold">
                  {card.specs.position[0]}
                </div>
              </div>
            </div>
          </div>
        );
      }

      // 4. Junk Wax Football (1984 Topps & 1989 Score Football)
      if (card.setId === '1984-topps-football' || card.setId === '1989-score-football') {
        const is84 = card.setId === '1984-topps-football';
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between" style={{ backgroundColor: '#fff', color: '#111' }}>
            <div className="border border-neutral-400 p-1 flex-1 flex flex-col justify-between relative overflow-hidden" style={{ backgroundColor: is84 ? '#fff' : '#f0f3f8' }}>
              {is84 ? (
                <div className="absolute inset-0 flex">
                  <div className="w-1.5 h-full flex flex-col gap-1" style={{ backgroundColor: c.primary }} />
                  <div className="w-1.5 h-full flex flex-col gap-1" style={{ backgroundColor: c.secondary }} />
                </div>
              ) : (
                <div className="absolute inset-0 border-[6px] border-emerald-500 pointer-events-none" />
              )}

              <div className="flex justify-between items-center text-[8px] font-mono font-bold text-neutral-500 relative z-10 px-2">
                <span>{is84 ? 'TOPPS' : 'SCORE'}</span>
                <span>{card.number}</span>
              </div>

              <div className="w-full aspect-[4/5] my-auto border border-neutral-300 bg-neutral-900 overflow-hidden relative z-10">
                {renderPlayerSilhouette()}
              </div>

              <div className="bg-[#f0e6d2] border border-neutral-700 p-1 text-center relative z-10 mt-1">
                <div className="text-[10px] font-black uppercase text-black tracking-tight">{card.player}</div>
                <div className="text-[6px] text-neutral-500 font-extrabold uppercase mt-0.5">{card.team}</div>
              </div>
            </div>
          </div>
        );
      }

      // 5. High End Football / Fallback Exquisite (2005 Exquisite Football)
      if (['2005-exquisite-football'].includes(card.setId)) {
        return (
          <div className="absolute inset-0 w-full h-full p-2.5 flex flex-col justify-between" style={{ background: '#141414', border: '2px solid #dfb76c', borderRadius: '14px' }}>
            <div className="flex-1 flex flex-col justify-between relative overflow-hidden p-1">
              <div className="flex justify-between items-center font-mono text-[7px] font-bold text-[#dfb76c]">
                <span className="tracking-widest">EXQUISITE COLLECTION</span>
                <span>{card.number}</span>
              </div>

              <div className="w-full aspect-[5/4] relative bg-black/40 rounded-lg overflow-hidden border border-white/5 my-auto flex items-center justify-center">
                {renderPlayerSilhouette()}
              </div>

              <div className="grid grid-cols-2 gap-2 my-auto items-center">
                <div className="aspect-square bg-neutral-950 border border-white/10 p-1 flex items-center justify-center relative overflow-hidden rounded shadow-inner">
                  <div className="w-full h-full flex flex-col">
                    <div className="h-1/3 w-full" style={{ backgroundColor: c.primary }} />
                    <div className="h-1/3 w-full bg-white" />
                    <div className="h-1/3 w-full" style={{ backgroundColor: c.secondary || c.primary }} />
                  </div>
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:3px_3px]" />
                  <span className="absolute bottom-0.5 right-1 text-[5px] font-mono text-white/50 tracking-wider">PATCH</span>
                </div>

                <div className="h-12 border-b border-[#dfb76c]/40 flex flex-col justify-end items-center relative pb-1">
                  <span className="text-[6px] font-mono uppercase text-neutral-500 absolute top-0 tracking-widest">AUTHENTIC AUTO</span>
                  <span className="text-lg rotate-[-2deg] tracking-wide font-medium" style={{ fontFamily: "'Dancing Script', cursive", color: '#ffd700' }}>
                    {card.player}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[7px] font-mono font-bold mt-1 border-t border-white/5 pt-1.5 text-neutral-400">
                <span className="uppercase">{card.specs.position}</span>
                <span className="font-bold text-[8px]" style={{ color: '#d9534f', fontFamily: "'Space Mono', monospace" }}>
                  {card.player.charCodeAt(0) % 90 + 1}/99
                </span>
              </div>
            </div>
          </div>
        );
      }

      // 6. Modern Ticket (2000 Playoff Contenders Rookie Ticket)
      if (card.setId === '2000-contenders') {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between" style={{ backgroundColor: '#fff', color: '#1a1a1a', border: '1.5px solid #bbb', borderRadius: '12px' }}>
            <div className="border border-neutral-300 p-2 flex-1 flex flex-col justify-between relative overflow-hidden rounded bg-[#fcfcf9]">
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-neutral-300 to-transparent" />
              
              <div className="flex justify-between items-start border-b border-dashed border-neutral-400 pb-1.5 text-[8px] font-mono font-bold">
                <div className="text-left">
                  <span className="text-red-600 block">ROOKIE TICKET</span>
                  <span className="text-neutral-500 block">ADMIT ONE</span>
                </div>
                <span>{card.number}</span>
              </div>

              <div className="my-1.5 flex flex-col items-center">
                <div className="w-full h-4 bg-black flex gap-[1px] p-[1px] overflow-hidden">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div key={i} className="h-full bg-white" style={{ width: i % 3 === 0 ? '3px' : '1px' }} />
                  ))}
                </div>
                <span className="text-[5px] font-mono text-neutral-400 mt-0.5">VAULT SECURE BARCODE</span>
              </div>

              <div className="w-full aspect-[5/4] border border-neutral-300 bg-neutral-900 overflow-hidden relative shadow-inner">
                {renderPlayerSilhouette()}
              </div>

              <div className="border-t border-dashed border-neutral-400 pt-1.5 flex flex-col items-center justify-end h-10 relative">
                <span className="text-[5px] font-mono text-neutral-400 absolute top-0.5 uppercase tracking-widest">ON-CARD AUTOGRAPH</span>
                <span className="text-lg rotate-[-1deg] font-medium" style={{ fontFamily: "'Dancing Script', cursive", color: '#15317e' }}>
                  {card.player}
                </span>
              </div>
            </div>
          </div>
        );
      }

      // 7. General Modern Prizm / Optic / Donruss (Football & Fallbacks)
      if (card.setId.includes('prizm') || card.setId.includes('donruss')) {
        return (
          <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between" style={{ backgroundColor: '#0f0f12', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="border border-white/5 p-1.5 flex-1 flex flex-col justify-between relative overflow-hidden rounded bg-[#131317]">
              <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(ellipse_at_center,#fff_1px,transparent_1px)] bg-[size:8px_8px]" />
              <div className="absolute inset-1 border border-white/10 pointer-events-none rounded opacity-30" />
              <div className="absolute inset-0 pointer-events-none z-10" style={{ border: `1.5px solid ${c.primary}40` }} />

              <div className="absolute top-2 left-2 z-20 flex items-center justify-center w-5 h-5 bg-gradient-to-b from-yellow-500 to-amber-700 border border-yellow-300 rounded-sm shadow-md">
                <span className="text-[6px] font-mono text-white font-extrabold tracking-tighter">RC</span>
              </div>

              <div className="flex justify-end text-[7px] font-mono font-bold tracking-widest text-neutral-400 relative z-10">
                <span>PANINI OPTI-CHROME</span>
              </div>

              <div className="w-full aspect-[5/6] relative bg-neutral-950 border border-white/10 rounded overflow-hidden my-auto flex items-center justify-center">
                <div className="absolute -inset-1 bg-gradient-to-tr from-white/10 to-transparent" />
                {renderPlayerSilhouette()}
                <div className="absolute bottom-1 right-1 bg-white/10 border border-white/20 px-1 rounded">
                  <span className="text-[5px] text-white font-bold">{card.parallel}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-1.5 leading-none text-left relative z-10 flex justify-between items-center">
                <div>
                  <div className="text-[9px] font-black uppercase text-white tracking-wide">{card.player}</div>
                  <div className="text-[5px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">{card.team}</div>
                </div>
                <div className="text-[6px] font-mono text-white/60 bg-white/5 border border-white/10 px-1 py-0.5 rounded uppercase">
                  {card.specs.position.split(' ')[0]}
                </div>
              </div>
            </div>
          </div>
        );
      }

      // 8. General Chrome Refractor / Fallback
      return (
        <div className="absolute inset-0 w-full h-full p-2 flex flex-col justify-between" style={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="border border-white/10 p-1.5 flex-1 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#151515] to-[#0c0c0c]">
            <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-cyan-500/20 via-pink-500/20 to-yellow-500/20 pointer-events-none" />

            <div className="flex justify-between items-center text-[7px] text-neutral-500 font-mono tracking-widest relative z-10">
              <span>{card.brand.toUpperCase()}</span>
              <span>{card.number}</span>
            </div>

            <div className="w-full aspect-[4/5] my-auto relative border border-white/10 bg-neutral-900 rounded overflow-hidden">
              {renderPlayerSilhouette()}
              {card.type.includes('1st') ? (
                <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black border-2 border-yellow-400 flex items-center justify-center shadow-lg">
                  <span className="text-[5.5px] font-extrabold text-yellow-400 leading-none">1st</span>
                </div>
              ) : (card.type.includes('Rookie') || card.type.includes('ROOKIE') || card.type.includes('Rated Rookie')) ? (
                <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-amber-400 border border-black flex items-center justify-center shadow-lg">
                  <span className="text-[6px] font-black text-black">RC</span>
                </div>
              ) : null}
            </div>

            <div className="border-t border-white/10 pt-1.5 text-left leading-none">
              <div className="text-[10px] font-black uppercase text-white tracking-wide">{card.player}</div>
              <div className="text-[6px] text-neutral-400 font-bold uppercase mt-0.5">{card.team}</div>
            </div>
          </div>
        </div>
      );
    };;

// getPlayerStats moved to js/data.js

// getCardGameStats moved to js/data.js

// Helper for authentic basketball stats and bio
const getBasketballStatsAndBio = (card) => {
  let rows = [];
  let bio = "";
  
  const nameLower = card.player.toLowerCase();
  
  // Set Biography
  if (nameLower.includes("mikan")) {
    bio = "The first true superstar of professional basketball, Mikan dominated the key so thoroughly that the league eventually widened it from 6 to 12 feet.";
  } else if (nameLower.includes("russell")) {
    bio = "In his rookie campaign, Russell revolutionized defensive basketball, leading the Celtics to their first NBA Championship and launching the greatest dynasty in sports history.";
  } else if (nameLower.includes("chamberlain")) {
    bio = "Wilt took the league by storm in 1959, averaging 37.6 points as a rookie. By 1961, his dominant scoring and rebounding had rewritten every single record in the books.";
  } else if (nameLower.includes("west")) {
    bio = "Known as 'Mr. Clutch' for his late-game heroics, West made his first of 14 consecutive All-Star appearances as a rookie and eventually became the silhouette of the NBA logo.";
  } else if (nameLower.includes("kareem") || nameLower.includes("alcindor")) {
    bio = "Entering the league as Lew Alcindor, Kareem immediately established himself as a force, capturing the ROTY award and leading Milwaukee to a 56-win season.";
  } else if (nameLower.includes("havlicek")) {
    bio = "'Hondo' was the ultimate sixth man, combining relentless energy with defensive tenacity. He would lead the Celtics to 8 NBA titles during his Hall of Fame career.";
  } else if (nameLower.includes("bird")) {
    bio = "Larry Legend's 1980 Topps rookie marks the arrival of one of the greatest shooters and fiercest competitors in basketball history, leading Boston to a title in 1981.";
  } else if (nameLower.includes("erving")) {
    bio = "Dr. J's high-flying style and artistic dunks captivated fans and revolutionized the sport, paving the way for the modern athletic wing player.";
  } else if (nameLower.includes("magic")) {
    bio = "Magic's 1980 Topps rookie showcases the revolutionary 6'9 point guard who defined 'Showtime' and led the Lakers to the 1980 championship as a rookie.";
  } else if (nameLower.includes("jordan")) {
    if (card.year === 1986) {
      bio = "The most iconic card in basketball history. Jordan's 1986 Fleer rookie captures his raw athletic brilliance, highlighted by his historic 63-point playoff game against Boston.";
    } else if (card.year === 1990) {
      bio = "Following his fourth consecutive scoring title, Jordan led the Bulls to the threshold of their historic championship run, averaging 33.6 points per game.";
    } else if (card.year === 1991) {
      bio = "Fresh off his first NBA Championship, Jordan's Upper Deck release captured the global phenomenon at his absolute athletic and competitive peak.";
    } else if (card.year === 1993) {
      bio = "Topps Finest introduced Chromium technology to the hobby, featuring this stunning refractor of Jordan just as he completed his first historic Three-Peat.";
    } else if (card.year === 1997) {
      bio = "Precious Metal Gems represents the pinnacle of 90s insert collecting. The Red PMG Jordan is a legendary masterpiece from the Bulls' second championship run.";
    } else {
      bio = "Relentless competitor, global icon, and widely considered the greatest of all time, Jordan dominated both ends of the floor with historic scoring and elite defense.";
    }
  } else if (nameLower.includes("barkley")) {
    bio = "The 'Round Mound of Rebound' proved that height was no barrier to dominance in the paint, averaging a double-double and earning All-Rookie honors in Philly.";
  } else if (nameLower.includes("olajuwon")) {
    bio = "Drafted #1 overall in the legendary 1984 draft class, 'The Dream' anchored the Rockets' Twin Towers, showcasing his signature 'Dream Shake' footwork.";
  } else if (nameLower.includes("robinson")) {
    bio = "'The Admiral' served two years in the U.S. Navy before joining the Spurs. He immediately turned the franchise around, winning Rookie of the Year by unanimous vote.";
  } else if (nameLower.includes("bryant")) {
    if (card.year === 1996) {
      bio = "Straight out of Lower Merion High School, Kobe's Chrome rookie marks the beginning of the Mamba era, featuring his legendary vertical leap and scoring instincts.";
    } else if (card.year === 1997) {
      bio = "This ultra-rare green PMG is one of the most coveted modern cards in existence, capturing Kobe in his second season as the league's youngest All-Star starter.";
    } else {
      bio = "The Black Mamba, a 5-time Champion and 18-time All-Star, inspired a generation with his unmatched work ethic, scoring wizardry, and elite competitive drive.";
    }
  } else if (nameLower.includes("lebron") || nameLower.includes("james")) {
    bio = "The king of modern luxury trading cards. LeBron's Exquisite RPA is the holy grail of 21st-century collecting, marking his debut as the Chosen One.";
  } else if (nameLower.includes("wade")) {
    bio = "'Flash' emerged from Marquette to lead the Heat back to relevance, showcasing elite slashing ability that would soon yield three NBA championships.";
  } else if (nameLower.includes("davis")) {
    bio = "AD joined the league as the consensus #1 overall pick and Olympic gold medalist, launching a career defined by defensive dominance and elite post scoring.";
  } else if (nameLower.includes("irving")) {
    bio = "Irving's rookie campaign was highlighted by his dazzling handles and clutch play, taking home Rookie of the Year honors for Cleveland.";
  } else if (nameLower.includes("giannis")) {
    bio = "Entering as a raw, skinny teenager from Greece, Giannis's National Treasures RPA traces the humble beginnings of the future two-time MVP and champion.";
  } else if (nameLower.includes("embiid")) {
    bio = "Despite missing his first two seasons to injury, 'The Process' proved well worth the wait, displaying historic per-minute scoring and defensive dominance.";
  } else if (nameLower.includes("zion")) {
    bio = "Zion's high-flying rookie campaign matched the unprecedented hype, showing historic efficiency and paint dominance for the Pelicans.";
  } else if (nameLower.includes("gilgeous-alexander") || nameLower.includes("shai")) {
    bio = "Topps Now captured Shai's opening night masterclass in real-time, commemorating the OKC superstar's campaign for MVP honors.";
  } else if (nameLower.includes("wembanyama") || nameLower.includes("wemby")) {
    bio = "Celebrating the official return of licensed Topps basketball cards, this release captures the alien-like dominance of Wemby in his sophomore campaign.";
  } else if (nameLower.includes("flagg")) {
    bio = "The most anticipated rookie in over two decades, Flagg's Topps debut marks his arrival on the hardwood, combining elite playmaking and defensive instincts.";
  } else if (nameLower.includes("frazier")) {
    bio = "Known as 'Clyde', Frazier was the ultimate cool point guard, combining flashy style off the court with tenacious defense and elite playmaking on it. He led the Knicks to two NBA titles.";
  } else if (nameLower.includes("ewing")) {
    bio = "Ewing was the cornerstone of the Knicks franchise for fifteen seasons. The 1985 #1 pick immediately established himself as an elite shot-blocker and post scorer, winning Rookie of the Year.";
  } else if (nameLower.includes("carmelo") || nameLower.includes("anthony")) {
    bio = "One of the most lethal scorers in NBA history, Anthony captured the 2012-13 NBA scoring title while leading the Knicks to 54 wins and the Atlantic Division title.";
  } else if (nameLower.includes("brunson")) {
    bio = "Brunson took New York by storm, transforming the Knicks with his crafty footwork, elite mid-range scoring, and leadership, earning back-to-back All-NBA and All-Star honors.";
  } else if (nameLower.includes("butler")) {
    bio = "Famous for his relentless work ethic, elite two-way play, and legendary playoff heroics, 'Jimmy Buckets' has established himself as one of the NBA's ultimate competitors and clutch performers.";
  } else if (nameLower.includes("stoudemire")) {
    bio = "One of the most explosive and athletic pick-and-roll finishers of his era, Stoudemire dominated the paint with thunderous dunks, earning Rookie of the Year and six All-Star nods.";
  } else if (nameLower.includes("vucevic")) {
    bio = "A highly skilled scoring center and double-double machine, Vucevic has anchored NBA frontcourts for over a decade with his smooth shooting touch, post moves, and elite rebounding.";
  } else {
    bio = "A standout performer whose skill and court vision make him a critical asset and fan favorite in the modern league.";
  }
  
  // Set Rows
  const isActive = window.isActivePlayer(card.player);
  if (isActive) {
    const yr1 = card.year - 2;
    const yr2 = card.year - 1;
    const isOneSeason = card.type.includes('Rookie') || card.year - card.specs.draftYear <= 1;
    const statYears = isOneSeason ? [yr2] : [yr1, yr2];
    
    rows = statYears.map(yr => {
      const stats = window.getActivePlayerSeasonStats(card.player, yr);
      const yrStr = window.getSeasonStr(yr);
      if (stats) {
        return { yr: yrStr, team: stats.team, gp: String(stats.gp), pts: String(stats.pts), reb: String(stats.reb), ast: String(stats.ast) };
      } else {
        const hash = window.hashString(card.player) + yr;
        const gp = String(70 + (Math.abs(hash) % 12));
        const ppg = (14 + (Math.abs(hash) % 12) + (Math.abs(hash) % 10) / 10).toFixed(1);
        const rpg = (3 + (Math.abs(hash >> 2) % 6) + (Math.abs(hash) % 10) / 10).toFixed(1);
        const apg = (2 + (Math.abs(hash >> 3) % 6) + (Math.abs(hash) % 10) / 10).toFixed(1);
        return { yr: yrStr, team: "NBA", gp, pts: ppg, reb: rpg, ast: apg };
      }
    });
  } else {
    // Retired player fallback placeholder (will be overwritten by window.getRetiredPlayerSeasonStatsRow in post-processing anyway)
    rows = [
      { yr: "Career-1", team: "NBA", gp: "72", pts: "18.5", reb: "6.2", ast: "4.5" },
      { yr: "Career-2", team: "NBA", gp: "75", pts: "20.1", reb: "6.8", ast: "5.1" }
    ];
  }
  
  // Active vs Retired post-processing
  if (!isActive) {
    // Retired player: simply showcase the season that the card/set came out.
    const row = window.getRetiredPlayerSeasonStatsRow(card);
    rows = [{
      yr: row.yr,
      team: row.team,
      gp: row.gp,
      pts: row.pts,
      reb: row.reb,
      ast: row.ast
    }];
  } else {
    // Active player: show the latest 2025-26 season as well.
    const alreadyHas2025 = rows.some(r => r.yr === "2025-26" || r.yr === 2025);
    if (!alreadyHas2025) {
      const newRow = window.get2025_26StatsRow(card.player, true);
      rows.push({
        yr: newRow.yr,
        team: newRow.team,
        gp: newRow.gp,
        pts: newRow.pts,
        reb: newRow.reb,
        ast: newRow.ast
      });
    }
  }

  return { rows, bio };
};

    // Helper to render high-fidelity custom digital card back
    const renderCardBackContent = (card, size = 'md', theme = 'dark') => {
      const c = TEAM_COLORS[card.team] || { primary: '#222222', secondary: '#111111', accent: '#FFFFFF', text: '#FFFFFF' };
      const stats = getPlayerStats(card);
      const labels = stats[0]?.labels || ['YR', 'TEAM', 'GP', 'PTS', 'REB', 'AST'];

      // Basketball Custom Card Back Render (HoopTactics ratings and attributes)
      if (card.sport === 'Basketball') {
        const { rows, bio } = getBasketballStatsAndBio(card);
        const { off, def, rimDef, perDef, sta, pos, ovr, perks, primaryBadge, tpt, mid, rim, ath, clu } = getCardGameStats(card);
        
        // Compact mini-card back for search index grids
        if (size === 'sm') {
          const isLight = theme === 'light';
          return (
            <div className={`absolute inset-0 w-full h-full p-2 flex flex-col justify-between text-left ${isLight ? 'text-neutral-600 bg-white' : 'text-neutral-300 bg-[#0A0A0C]'}`} style={{ border: isLight ? '1.5px solid #E5E7EB' : '1.5px solid #2A2E35', borderRadius: '12px' }}>
              <div className={`flex justify-between items-center text-[7px] font-mono border-b ${isLight ? 'border-neutral-200' : 'border-white/5'} pb-1`}>
                <span className={isLight ? 'text-neutral-500 font-semibold' : ''}>{pos}</span>
                <div className="ovr-avatar sm">
                  <div className="ovr-avatar-spin"></div>
                  <div className="ovr-avatar-mask"></div>
                  <div className="ovr-avatar-content">
                    <span className="ovr-val text-[9px]">{ovr}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-0.5 my-auto text-[7px]">
                <div className="flex justify-between"><span>OFF:</span><span className={`font-black ${isLight ? 'text-neutral-900' : 'text-white'}`}>{off}</span></div>
                <div className="flex justify-between"><span>PRD:</span><span className={`font-black ${isLight ? 'text-neutral-900' : 'text-white'}`}>{perDef}</span></div>
                <div className="flex justify-between"><span>RMP:</span><span className={`font-black ${isLight ? 'text-neutral-900' : 'text-white'}`}>{rimDef}</span></div>
                <div className="flex justify-between"><span>STA:</span><span className={`font-black ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>{sta}</span></div>
                <div className={`mt-1 flex items-center justify-between border-t ${isLight ? 'border-neutral-200' : 'border-white/5'} pt-1 scale-95 origin-left`}>
                  <span className={isLight ? 'text-[5.5px] text-neutral-400 uppercase font-semibold' : 'text-[5.5px] text-neutral-500 uppercase'}>Style:</span>
                  <div className={`flex items-center gap-0.5 ${isLight ? 'text-neutral-800' : 'text-white'} font-bold text-[5.5px]`}>
                    <iconify-icon icon={primaryBadge.icon} width="7" className={primaryBadge.type === 'three_pointer' ? 'text-amber-500' : 'text-purple-500'}></iconify-icon>
                    <span className="truncate max-w-[40px]">{primaryBadge.type === 'three_pointer' ? 'Shooter' : 'Athletic'}</span>
                  </div>
                </div>
              </div>
              <div className={`text-[5px] text-center ${isLight ? 'text-neutral-400' : 'text-neutral-600'} uppercase tracking-tighter truncate`}>HoopTactics</div>
            </div>
          );
        }

        if (size === 'md') {
          const isLight = theme === 'light';
          return (
            <div className={`absolute inset-0 w-full h-full p-3 flex flex-col justify-between text-left ${isLight ? 'text-neutral-600 bg-[#F9FAFB]' : 'text-neutral-300 bg-[#0A0A0C]'}`} style={{ border: isLight ? '2px solid #E5E7EB' : '2px solid #2A2E35', borderRadius: '14px', boxShadow: isLight ? 'inset 0 0 12px rgba(0,0,0,0.02)' : 'inset 0 0 12px rgba(0,0,0,0.8)' }}>
              <div className={`flex justify-between items-center border-b ${isLight ? 'border-neutral-200' : 'border-white/10'} pb-1 text-[8px] font-mono`}>
                <span className={isLight ? 'text-neutral-400 uppercase tracking-widest font-semibold' : 'text-neutral-500 uppercase tracking-widest'}>HT ATTRIBUTES</span>
                <span className={`${isLight ? 'bg-neutral-100 text-neutral-800 border-neutral-200' : 'bg-[#1C2028] text-white border-white/10'} px-1.5 py-0.5 rounded text-[8px] font-black border`}>{card.number}</span>
              </div>

              <div className="flex justify-between items-center my-1">
                <div className="flex flex-col">
                  <span className={`text-[9px] font-bold uppercase truncate max-w-[90px] ${isLight ? 'text-neutral-900' : 'text-white'}`}>{card.player.split(' ')[1] || card.player}</span>
                  <span className={isLight ? 'text-[6.5px] uppercase font-semibold text-neutral-400' : 'text-[6.5px] uppercase font-semibold text-neutral-500'}>{card.brand}</span>
                </div>
                <div className="flex gap-1.5 items-center">
                  <span className={`text-[7.5px] font-extrabold px-1.5 py-0.5 rounded-md border ${isLight ? 'bg-neutral-100 text-neutral-700 border-neutral-200' : 'bg-[#1E293B] text-slate-300 border-slate-700/50'}`}>{pos}</span>
                  <div className="ovr-avatar md">
                    <div className="ovr-avatar-spin"></div>
                    <div className="ovr-avatar-mask"></div>
                    <div className="ovr-avatar-content">
                      <span className="ovr-val text-[12px]">{ovr}</span>
                      <span className="ovr-lbl text-[5px] -mt-0.5">OVR</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 my-auto py-1 text-[8px] font-mono">
                <div>
                  <div className={`flex justify-between font-semibold mb-0.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    <span>OFFENSE (OFF)</span>
                    <span className={isLight ? 'text-neutral-900 font-bold' : 'text-white font-bold'}>{off}</span>
                  </div>
                  <div className={`h-1.5 w-full ${isLight ? 'bg-neutral-200' : 'bg-neutral-900'} rounded overflow-hidden`}>
                    <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400" style={{ width: `${off}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className={`flex justify-between font-semibold mb-0.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    <span>PERIMETER DEF (PRD)</span>
                    <span className={isLight ? 'text-neutral-900 font-bold' : 'text-white font-bold'}>{perDef}</span>
                  </div>
                  <div className={`h-1.5 w-full ${isLight ? 'bg-neutral-200' : 'bg-neutral-900'} rounded overflow-hidden`}>
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${perDef}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className={`flex justify-between font-semibold mb-0.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    <span>RIM PROTECTION (RMP)</span>
                    <span className={isLight ? 'text-neutral-900 font-bold' : 'text-white font-bold'}>{rimDef}</span>
                  </div>
                  <div className={`h-1.5 w-full ${isLight ? 'bg-neutral-200' : 'bg-neutral-900'} rounded overflow-hidden`}>
                    <div className="h-full bg-gradient-to-r from-indigo-600 to-blue-500" style={{ width: `${rimDef}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className={`flex justify-between font-semibold mb-0.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    <span>STAMINA (STA)</span>
                    <span className={isLight ? 'text-neutral-900 font-bold' : 'text-white font-bold'}>{sta}</span>
                  </div>
                  <div className={`h-1.5 w-full ${isLight ? 'bg-neutral-200' : 'bg-neutral-900'} rounded overflow-hidden`}>
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400" style={{ width: `${(sta/110)*100}%` }}></div>
                  </div>
                </div>

                {/* Detailed Attributes Strip */}
                <div className={`grid grid-cols-5 gap-1 text-center font-mono text-[7px] border-t border-b py-1 ${isLight ? 'border-neutral-200 bg-neutral-50/50 text-neutral-600' : 'border-white/5 bg-white/5 text-neutral-300'} rounded-md`}>
                  <div>
                    <span className="block text-[5.5px] uppercase text-neutral-500 font-bold">3PT</span>
                    <span className={`font-black ${isLight ? 'text-neutral-800' : 'text-white'}`}>{tpt}</span>
                  </div>
                  <div>
                    <span className="block text-[5.5px] uppercase text-neutral-500 font-bold">MID</span>
                    <span className={`font-black ${isLight ? 'text-neutral-800' : 'text-white'}`}>{mid}</span>
                  </div>
                  <div>
                    <span className="block text-[5.5px] uppercase text-neutral-500 font-bold">RIM</span>
                    <span className={`font-black ${isLight ? 'text-neutral-800' : 'text-white'}`}>{rim}</span>
                  </div>
                  <div>
                    <span className="block text-[5.5px] uppercase text-neutral-500 font-bold">ATH</span>
                    <span className={`font-black ${isLight ? 'text-neutral-800' : 'text-white'}`}>{ath}</span>
                  </div>
                  <div>
                    <span className="block text-[5.5px] uppercase text-neutral-500 font-bold">CLU</span>
                    <span className={`font-black ${isLight ? 'text-neutral-800' : 'text-white'}`}>{clu}</span>
                  </div>
                </div>

                <div className={`border-t ${isLight ? 'border-neutral-200' : 'border-white/5'} pt-1.5 mt-1`}>
                  <div className={`flex items-center justify-between border rounded-xl px-2.5 py-1.5 ${isLight ? 'bg-white border-neutral-200' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex items-center gap-1.5">
                      <iconify-icon 
                        icon={primaryBadge.icon} 
                        width="14" 
                        className={primaryBadge.type === 'three_pointer' ? 'text-amber-500' : 'text-purple-500'}
                      ></iconify-icon>
                      <div className="flex flex-col text-left">
                        <span className={isLight ? 'text-[6.5px] uppercase font-mono text-neutral-400 leading-none' : 'text-[6.5px] uppercase font-mono text-neutral-500 leading-none'}>Playstyle Badge</span>
                        <span className={`text-[8px] font-bold mt-0.5 leading-none ${isLight ? 'text-neutral-900' : 'text-white'}`}>{primaryBadge.name}</span>
                      </div>
                    </div>
                    <span className={`text-[7px] border px-1.5 py-0.5 rounded font-mono ${isLight ? 'text-neutral-600 bg-neutral-100 border-neutral-200' : 'text-neutral-400 bg-neutral-900/60 border-white/5'}`}>
                      {primaryBadge.type === 'three_pointer' ? 'Limit 6 3PT' : 'Limit 6 AND-1'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`text-[6.5px] text-center uppercase tracking-widest border-t ${isLight ? 'border-neutral-200 text-neutral-400' : 'border-white/5 text-neutral-600'} pt-1.5 flex-shrink-0`}>
                HoopTactics Attributes Binder
              </div>
            </div>
          );
        }

        // Expanded view detail card back (xl size)
        const isLight = theme === 'light';
        return (
          <div className={`absolute inset-0 w-full h-full p-4 flex flex-col justify-between text-left ${isLight ? 'text-neutral-600 bg-white' : 'text-neutral-300 bg-[#0A0A0C]'}`} style={{ border: isLight ? '3.5px solid #E5E7EB' : '3.5px solid #2A2E35', borderRadius: '16px', boxShadow: isLight ? 'inset 0 0 24px rgba(0,0,0,0.02)' : 'inset 0 0 24px rgba(0,0,0,0.9)' }}>
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              
              {/* Header Slab registry */}
              <div className={`flex justify-between items-center border-b ${isLight ? 'border-neutral-200 text-neutral-500' : 'border-white/10 text-neutral-400'} pb-2 text-[8px] font-mono tracking-widest flex-shrink-0`}>
                <span className={`font-extrabold ${isLight ? 'text-neutral-800' : 'text-white'}`}>~. HOOPTACTICS GAMEPLAY SLAB ~.</span>
                <span className={`${isLight ? 'bg-neutral-100 text-amber-600 border-neutral-200' : 'bg-[#1C2028] text-amber-400 border-white/10'} px-2 py-0.5 rounded text-[9px] font-mono font-black border`}>{card.number}</span>
              </div>
              
              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto pr-1 my-2 space-y-3 hide-scrollbar">
                {/* Player Profile & OVR */}
                <div className="mt-2 flex justify-between items-center leading-tight">
                  <div>
                    <h3 className={`font-black text-[15px] uppercase tracking-wide ${isLight ? 'text-neutral-900' : 'text-white'}`}>{card.player}</h3>
                    <div className="text-[8px] font-bold uppercase tracking-wider mt-0.5" style={{ color: isLight ? '#C2410C' : c.primary }}>{card.team}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-md border ${isLight ? 'bg-neutral-100 text-neutral-600 border-neutral-200' : 'bg-neutral-800 text-neutral-300 border-neutral-700'}`}>{pos}</span>
                    <div className="ovr-avatar lg shadow-xl">
                      <div className="ovr-avatar-spin"></div>
                      <div className="ovr-avatar-mask"></div>
                      <div className="ovr-avatar-content">
                        <span className="ovr-val text-[15px]">{ovr}</span>
                        <span className="ovr-lbl text-[6px] -mt-0.5">OVR</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attributes block */}
                <div className="grid grid-cols-6 gap-1.5 my-2 font-mono text-[8px]">
                  <div className={`border p-2 rounded-lg text-center flex flex-col justify-center ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900/60 border-white/5'}`}>
                    <span className="text-neutral-500 font-bold block uppercase mb-1">OFF</span>
                    <span className={`text-[14px] font-black ${isLight ? 'text-orange-600' : 'text-orange-500'}`}>{off}</span>
                  </div>
                  <div className={`border p-2 rounded-lg text-center flex flex-col justify-center ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900/60 border-white/5'}`}>
                    <span className="text-neutral-500 font-bold block uppercase mb-1">PRD</span>
                    <span className={`text-[14px] font-black ${isLight ? 'text-blue-600' : 'text-blue-500'}`}>{perDef}</span>
                  </div>
                  <div className={`border p-2 rounded-lg text-center flex flex-col justify-center ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900/60 border-white/5'}`}>
                    <span className="text-neutral-500 font-bold block uppercase mb-1">RMP</span>
                    <span className={`text-[14px] font-black ${isLight ? 'text-indigo-600' : 'text-indigo-500'}`}>{rimDef}</span>
                  </div>
                  <div className={`border p-2 rounded-lg text-center flex flex-col justify-center ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900/60 border-white/5'}`}>
                    <span className="text-neutral-500 font-bold block uppercase mb-1">STA</span>
                    <span className={`text-[14px] font-black ${isLight ? 'text-emerald-600' : 'text-emerald-500'}`}>{sta}</span>
                  </div>
                  <div className={`col-span-2 border p-2 rounded-lg text-left flex items-center gap-2 ${isLight ? 'bg-neutral-50/70 border-neutral-200' : 'bg-[#1C1C24]/50 border-white/5'}`}>
                    <iconify-icon 
                      icon={primaryBadge.icon} 
                      width="18" 
                      className={primaryBadge.type === 'three_pointer' ? 'text-amber-500' : 'text-purple-500'}
                    ></iconify-icon>
                    <div className="leading-tight">
                      <span className="text-neutral-500 font-bold block uppercase text-[7px]">Primary Style</span>
                      <span className={`text-[9.5px] font-black ${isLight ? 'text-neutral-900' : 'text-white'}`}>{primaryBadge.name}</span>
                    </div>
                  </div>
                </div>

                {/* Detailed Attributes block */}
                <div className="grid grid-cols-5 gap-1.5 my-2 font-mono text-[8px]">
                  <div className={`border p-2 rounded-lg text-center flex flex-col justify-center ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900/60 border-white/5'}`}>
                    <span className="text-neutral-500 font-bold block uppercase mb-1">3PT</span>
                    <span className={`text-[13px] font-black ${isLight ? 'text-neutral-800' : 'text-white'}`}>{tpt}</span>
                  </div>
                  <div className={`border p-2 rounded-lg text-center flex flex-col justify-center ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900/60 border-white/5'}`}>
                    <span className="text-neutral-500 font-bold block uppercase mb-1">MID</span>
                    <span className={`text-[13px] font-black ${isLight ? 'text-neutral-800' : 'text-white'}`}>{mid}</span>
                  </div>
                  <div className={`border p-2 rounded-lg text-center flex flex-col justify-center ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900/60 border-white/5'}`}>
                    <span className="text-neutral-500 font-bold block uppercase mb-1">RIM</span>
                    <span className={`text-[13px] font-black ${isLight ? 'text-neutral-800' : 'text-white'}`}>{rim}</span>
                  </div>
                  <div className={`border p-2 rounded-lg text-center flex flex-col justify-center ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900/60 border-white/5'}`}>
                    <span className="text-neutral-500 font-bold block uppercase mb-1">ATH</span>
                    <span className={`text-[13px] font-black ${isLight ? 'text-neutral-800' : 'text-white'}`}>{ath}</span>
                  </div>
                  <div className={`border p-2 rounded-lg text-center flex flex-col justify-center ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900/60 border-white/5'}`}>
                    <span className="text-neutral-500 font-bold block uppercase mb-1">CLU</span>
                    <span className={`text-[13px] font-black ${isLight ? 'text-neutral-800' : 'text-white'}`}>{clu}</span>
                  </div>
                </div>

                {/* Sleek Perks Panel */}
                <div className={`border p-2.5 rounded-lg text-[8px] my-1 ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#121215] border-white/5'}`}>
                  <span className={`font-extrabold block uppercase tracking-wider mb-1.5 border-b pb-1 ${isLight ? 'text-neutral-800 border-neutral-200' : 'text-white border-white/5'}`}>⚡ Active Gameplay Perks</span>
                  {perks.length > 0 ? (
                    <div className="space-y-1.5">
                      {perks.map((p, idx) => (
                        <div key={idx} className="flex flex-col">
                          <span className={`font-bold ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>⚡ {p.name}</span>
                          <span className={`text-[7px] leading-tight mt-0.5 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>{p.desc}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className={`text-[7.5px] italic ${isLight ? 'text-neutral-400' : 'text-neutral-600'}`}>No special abilities (Standard Roster player)</span>
                  )}
                </div>
                
                {/* Original Stats Table */}
                <div className={`border p-2 rounded-lg text-[7.5px] font-mono ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-black/40 border-white/5'}`}>
                  <div className={`grid grid-cols-6 font-bold border-b pb-1 uppercase text-center ${isLight ? 'border-neutral-200 text-neutral-800' : 'border-white/10 text-white'}`}>
                    <span>YR</span>
                    <span>TEAM</span>
                    <span>GP</span>
                    <span>PTS</span>
                    <span>REB</span>
                    <span>AST</span>
                  </div>
                  {rows.map((r, idx) => (
                    <div key={idx} className={`grid grid-cols-6 pt-1 text-center ${isLight ? 'text-neutral-600' : 'text-neutral-300'}`}>
                      <span className="font-bold">{r.yr}</span>
                      <span className={`truncate font-semibold ${isLight ? 'text-neutral-800' : 'text-white'}`}>{r.team}</span>
                      <span>{r.gp}</span>
                      <span className={`font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>{r.pts}</span>
                      <span>{r.reb}</span>
                      <span>{r.ast}</span>
                    </div>
                  ))}
                </div>

                {/* Bio block */}
                <div className={`border p-2 rounded-lg text-[7px] leading-relaxed ${isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-600' : 'bg-[#0D0D10] border-white/5 text-neutral-400'}`}>
                  <span className={`font-bold block uppercase tracking-wider mb-0.5 ${isLight ? 'text-neutral-800' : 'text-white'}`}>Highlights:</span>
                  {bio}
                </div>
              </div>

              {/* Barcode & license */}
              <div className={`flex justify-between items-center border-t pt-2.5 mt-2 flex-shrink-0 ${isLight ? 'border-neutral-200' : 'border-white/10'}`}>
                <div className={`text-[5.5px] font-mono uppercase tracking-widest leading-none ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  OFFICIAL LICENSEE • HOOPTACTICS VIRTUAL BINDER SYSTEM
                </div>
                <div className={`w-14 h-3 flex gap-[1px] p-[1.5px] overflow-hidden rounded-sm ${isLight ? 'bg-neutral-900/10' : 'bg-white opacity-25'}`}>
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div key={i} className={`h-full ${isLight ? 'bg-neutral-800' : 'bg-black'}`} style={{ width: i % 3 === 0 ? '2px' : '1px' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }

      // --- Non-Basketball Custom Card Back Renderers (Retained) ---
      
      if (card.setId === '1952-topps' || card.setId === '1954-topps') {
        return (
          <div className="absolute inset-0 w-full h-full p-3 flex flex-col justify-between text-left text-neutral-800" style={{ backgroundColor: '#ebdcb9', backgroundImage: 'url("assets/cards/' + card.setId + '_back.png")', backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', border: '3px solid #dfc699', borderRadius: '12px', fontFamily: 'serif' }}>
            <div className="border border-neutral-600 p-1.5 flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-center border-b border-neutral-600 pb-1 font-bold text-[9px]">
                <span>TOPPS BASEBALL SLAB REGISTRY</span>
                <span className="bg-neutral-800 text-white px-1.5 py-0.5 rounded text-[8px] font-mono font-bold">{card.number}</span>
              </div>
              
              <div className="mt-1 leading-tight">
                <h3 className="font-black text-[12px] uppercase text-neutral-900">{card.player}</h3>
                <div className="text-[7px] text-neutral-600 font-bold uppercase">{card.team} — {card.specs.position}</div>
                <div className="text-[6px] text-neutral-500 font-mono mt-0.5">BATS: R | THROWS: R | HT: {card.specs.height} | WT: {card.specs.weight}</div>
              </div>
              
              <div className="my-1.5 bg-white/40 p-1.5 rounded border border-neutral-600 text-[7px] font-mono">
                <div className="grid grid-cols-6 font-bold border-b border-neutral-500 pb-0.5">
                  {labels.map(l => <span key={l}>{l}</span>)}
                </div>
                {stats.map((s, idx) => (
                  <div key={idx} className="grid grid-cols-6 pt-0.5">
                    <span>{s.yr}</span>
                    <span className="truncate">{card.team.split(' ')[0]}</span>
                    <span>{s.gp}</span>
                    <span>{s.col1}</span>
                    <span>{s.col2}</span>
                    <span>{s.col3}</span>
                  </div>
                ))}
              </div>
              
              <div className="bg-amber-100/50 border border-neutral-500/50 rounded p-1.5 text-[6.5px] leading-snug flex gap-2 items-center">
                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">⚾</div>
                <div>
                  <span className="font-bold text-red-800 uppercase block">Milestone Fact:</span>
                  His historic performance captured the imagination of fans coast to coast in {card.year}.
                </div>
              </div>
              
              <div className="text-[5px] text-center border-t border-neutral-400 pt-1 font-mono text-neutral-600 uppercase tracking-widest leading-none mt-1">
                © TOPPS CHEWING GUM INC. DETAILED REPLICA MINTED IN HOOPTACTICS REGISTRY
              </div>
            </div>
          </div>
        );
      }
      
      if (card.setId === '1961-fleer' || card.setId === '1969-topps') {
        return (
          <div className="absolute inset-0 w-full h-full p-3 flex flex-col justify-between text-left text-orange-950" style={{ backgroundColor: '#fcdcb0', backgroundImage: 'url("assets/cards/' + card.setId + '_back.png")', backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', border: '3px solid #e0be8d', borderRadius: '12px' }}>
            <div className="border border-orange-900/30 p-1.5 flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-center border-b border-orange-900/30 pb-1 font-mono text-[9px] font-bold">
                <span>{card.year} FLEER BASKETBALL</span>
                <span>{card.number}</span>
              </div>
              
              <div className="mt-1 leading-tight">
                <h3 className="font-black text-[12px] uppercase text-orange-900">{card.player}</h3>
                <div className="text-[7.5px] font-bold uppercase opacity-80">{card.team}</div>
                <p className="text-[6.5px] mt-0.5">COLLEGE: {card.specs.draftYear - 4} - {card.specs.draftYear}</p>
              </div>
              
              <div className="my-1 bg-[#fff6e6] p-1.5 rounded border border-orange-950/20 text-[7px] font-mono">
                <div className="grid grid-cols-6 font-bold border-b border-orange-950/20 pb-0.5">
                  {labels.map(l => <span key={l}>{l}</span>)}
                </div>
                {stats.map((s, idx) => (
                  <div key={idx} className="grid grid-cols-6 pt-0.5">
                    <span>{s.yr}</span>
                    <span className="truncate">{card.team.split(' ')[0]}</span>
                    <span>{s.gp}</span>
                    <span>{s.col1}</span>
                    <span>{s.col2}</span>
                    <span>{s.col3}</span>
                  </div>
                ))}
              </div>
              
              <div className="bg-orange-100 border border-orange-900/10 p-1.5 rounded text-[6.5px] leading-tight">
                <span className="font-bold text-orange-900 uppercase block mb-0.5">💡 DID YOU KNOW?</span>
                Known for his high basketball IQ and outstanding leadership qualities, this player commanded respect from teammates and opponents alike.
              </div>
              
              <div className="text-[5.5px] text-center border-t border-orange-900/20 pt-1 font-mono text-orange-900/60 uppercase">
                FLEER CORP. CERTIFIED HISTORIC SLAB REPLICA
              </div>
            </div>
          </div>
        );
      }
      
      if (card.setId === '1957-topps-football' || card.setId === '1976-topps-football') {
        return (
          <div className="absolute inset-0 w-full h-full p-3 flex flex-col justify-between text-left text-neutral-800" style={{ backgroundColor: '#ebdac2', backgroundImage: 'url("assets/cards/' + card.setId + '_back.png")', backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', border: '3px solid #c2b095', borderRadius: '12px' }}>
            <div className="border border-neutral-600 p-1.5 flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-center border-b border-neutral-600 pb-1 font-mono text-[9px] font-bold">
                <span>{card.year} FOOTBALL BACK</span>
                <span>{card.number}</span>
              </div>
              
              <div className="mt-1 leading-tight flex justify-between items-start">
                <div>
                  <h3 className="font-black text-[12px] uppercase text-neutral-900">{card.player}</h3>
                  <div className="text-[7px] text-neutral-600 font-bold uppercase">{card.team} • {card.specs.position}</div>
                </div>
                <div className="text-right text-[6px] font-mono">
                  <div>Draft: {card.specs.draftYear}</div>
                </div>
              </div>
              
              <div className="my-1 bg-[#f5ebe0] p-1.5 rounded border border-neutral-500 text-[7px] font-mono">
                <div className="grid grid-cols-6 font-bold border-b border-neutral-400 pb-0.5">
                  {labels.map(l => <span key={l}>{l}</span>)}
                </div>
                {stats.map((s, idx) => (
                  <div key={idx} className="grid grid-cols-6 pt-0.5">
                    <span>{s.yr}</span>
                    <span className="truncate">{card.team.split(' ')[0]}</span>
                    <span>{s.gp}</span>
                    <span>{s.col1}</span>
                    <span>{s.col2}</span>
                    <span>{s.col3}</span>
                  </div>
                ))}
              </div>
              
              <div className="bg-amber-50 border border-neutral-400 p-1.5 rounded text-[6.5px] leading-tight flex gap-2 items-center">
                <div className="text-[14px]">🏈</div>
                <div>
                  <span className="font-bold text-amber-900 uppercase">GRIDIRON TALES:</span>
                  He made headlines in college before breaking into professional football with his physical style.
                </div>
              </div>
              
              <div className="text-[5px] text-center border-t border-neutral-400 pt-1 font-mono text-neutral-500 uppercase tracking-wider">
                CERTIFIED RETRO SLAB REPLICA PRINT
              </div>
            </div>
          </div>
        );
      }
      
      if (card.setId === '1986-fleer' || card.setId === '1990-fleer') {
        const isLight = theme === 'light';
        return (
          <div className={`absolute inset-0 w-full h-full p-3 flex flex-col justify-between text-left ${isLight ? 'text-neutral-700 bg-[#f0f4f8]' : 'text-neutral-300 bg-[#0d0f14]'}`} style={{ border: isLight ? '2.5px solid #d1d5db' : '2.5px solid #232a3b', borderRadius: '12px', backgroundImage: 'url("assets/cards/' + card.setId + '_back.png")', backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
            <div className={`flex justify-between items-center border-b ${isLight ? 'border-neutral-300' : 'border-white/10'} pb-1 text-[8px] font-mono`}>
              <span className={isLight ? 'text-blue-600 font-bold' : 'text-blue-400'}>FLEER PRO BASKETBALL</span>
              <span>{card.number}</span>
            </div>
            
            <div className="leading-tight mt-1">
              <h3 className={`font-black text-xs uppercase ${isLight ? 'text-neutral-900' : 'text-white'}`}>{card.player}</h3>
              <p className={`text-[7.5px] uppercase ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>{card.team} • {card.specs.position}</p>
            </div>
            
            <div className={`my-auto border p-2 rounded text-[7px] font-mono ${isLight ? 'bg-white border-neutral-200 text-neutral-700' : 'bg-black/40 border-white/5 text-neutral-300'}`}>
              <div className={`grid grid-cols-6 font-bold border-b pb-1 ${isLight ? 'border-neutral-200 text-blue-700' : 'border-white/10 text-blue-400'}`}>
                {labels.map(l => <span key={l}>{l}</span>)}
              </div>
              {stats.map((s, idx) => (
                <div key={idx} className="grid grid-cols-6 pt-1">
                  <span>{s.yr}</span>
                  <span className={`truncate font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>{card.team.split(' ')[0]}</span>
                  <span>{s.gp}</span>
                  <span>{s.col1}</span>
                  <span>{s.col2}</span>
                  <span>{s.col3}</span>
                </div>
              ))}
            </div>
            
            <div className={`p-1.5 rounded text-[6.5px] leading-snug ${isLight ? 'bg-blue-50 border border-blue-200 text-neutral-600' : 'bg-blue-950/20 border-blue-900/30 text-neutral-400'}`}>
              <span className={`font-bold block uppercase mb-0.5 ${isLight ? 'text-blue-800' : 'text-white'}`}>COLLEGE CAREER HIGHLIGHT:</span>
              Led his squad in points and minutes played, showing extraordinary resilience and defensive ability.
            </div>
            
            <div className={`text-[5.5px] text-center border-t pt-1 font-mono uppercase tracking-widest ${isLight ? 'border-neutral-300 text-neutral-400' : 'border-white/10 text-neutral-500'}`}>
              FLEER CORP. OFFICIAL REGISTRY REPLICA SLAB
            </div>
          </div>
        );
      }
      
      if (card.setId === '1989-upper-deck' || card.setId === '1993-sp-foil') {
        return (
          <div className="absolute inset-0 w-full h-full p-4 flex flex-col justify-between text-left text-neutral-800 bg-[#fafafa]" style={{ border: '2.5px solid #d4d4d4', borderRadius: '12px', backgroundImage: 'url("assets/cards/' + card.setId + '_back.png")', backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
            <div className="flex justify-between items-center border-b border-neutral-300 pb-1 text-[8px] font-sans font-bold">
              <span className="text-emerald-700">UPPER DECK DEBUT EDITION</span>
              <span>{card.number}</span>
            </div>
            
            <div className="leading-tight">
              <h3 className="font-extrabold text-sm text-neutral-900 uppercase">{card.player}</h3>
              <p className="text-[8px] text-neutral-500 uppercase font-semibold">{card.team} • {card.specs.position}</p>
            </div>
            
            <div className="my-auto bg-neutral-100 border border-neutral-200 p-2 rounded text-[7.5px] font-mono text-neutral-700">
              <div className="grid grid-cols-6 font-bold border-b border-neutral-300 pb-1 text-emerald-800">
                {labels.map(l => <span key={l}>{l}</span>)}
              </div>
              {stats.map((s, idx) => (
                <div key={idx} className="grid grid-cols-6 pt-1">
                  <span>{s.yr}</span>
                  <span className="truncate font-bold text-neutral-800">{card.team.split(' ')[0]}</span>
                  <span>{s.gp}</span>
                  <span>{s.col1}</span>
                  <span>{s.col2}</span>
                  <span>{s.col3}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center border-t border-neutral-200 pt-2">
              <span className="text-[6px] font-mono text-neutral-400 uppercase tracking-widest">UD Anti-Counterfeit Hologram</span>
              <div className="w-8 h-4 bg-gradient-to-r from-neutral-300 via-neutral-100 to-neutral-400 border border-neutral-400 rounded-sm flex items-center justify-center opacity-90 shadow-md">
                <span className="text-[5px] font-mono text-neutral-600 font-bold">UD</span>
              </div>
            </div>
          </div>
        );
      }
      
      if (card.setId === '1984-topps-football' || card.setId === '1989-score-football') {
        return (
          <div className="absolute inset-0 w-full h-full p-3 flex flex-col justify-between text-left text-neutral-800 bg-[#f9f9f9]" style={{ border: '2.5px solid #d4d4d4', borderRadius: '12px', backgroundImage: 'url("assets/cards/' + card.setId + '_back.png")', backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
            <div className="flex justify-between items-center border-b border-neutral-300 pb-1 text-[8px] font-bold text-red-600">
              <span>{card.brand.toUpperCase()} FOOTBALL</span>
              <span className="text-neutral-500 font-mono">{card.number}</span>
            </div>
            
            <div className="leading-tight">
              <h3 className="font-black text-xs text-neutral-900 uppercase">{card.player}</h3>
              <p className="text-[7.5px] text-neutral-500 uppercase">{card.team} • {card.specs.position}</p>
            </div>
            
            <div className="my-auto bg-neutral-50 border border-neutral-200 p-2 rounded text-[7px] font-mono text-neutral-700">
              <div className="grid grid-cols-6 font-bold border-b border-neutral-300 pb-1 text-red-700">
                {labels.map(l => <span key={l}>{l}</span>)}
              </div>
              {stats.map((s, idx) => (
                <div key={idx} className="grid grid-cols-6 pt-1">
                  <span>{s.yr}</span>
                  <span className="truncate">{card.team.split(' ')[0]}</span>
                  <span>{s.gp}</span>
                  <span>{s.col1}</span>
                  <span>{s.col2}</span>
                  <span>{s.col3}</span>
                </div>
              ))}
            </div>
            
            <div className="text-[5.5px] text-center border-t border-neutral-200 pt-1 font-mono text-neutral-400 uppercase tracking-widest">
              OFFICIALLY LICENSED BY NFL & NFLPA
            </div>
          </div>
        );
      }
      
      if (card.setId === '2000-contenders') {
        return (
          <div className="absolute inset-0 w-full h-full p-4 flex flex-col justify-between text-left text-neutral-800 bg-[#f7f5f0]" style={{ border: '2px solid #ccc', borderRadius: '12px', backgroundImage: 'url("assets/cards/' + card.setId + '_back.png")', backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
            <div className="border border-neutral-300 p-2.5 flex-1 flex flex-col justify-between overflow-hidden rounded bg-white relative">
              <div className="flex justify-between items-start border-b border-dashed border-neutral-300 pb-1 text-[7px] font-mono">
                <div>
                  <span className="text-red-600 font-bold block">ROOKIE TICKET AUDIT</span>
                  <span className="text-neutral-400 block">VOID IF REMOVED</span>
                </div>
                <span>{card.number}</span>
              </div>
              
              <div className="my-2 text-[7px] leading-relaxed text-neutral-500">
                <span className="font-bold text-neutral-800 block uppercase mb-0.5">Autograph Certification:</span>
                This card contains a certified authentic signature of {card.player} directly signed in the presence of Playoff Contenders representatives.
              </div>
              
              <div className="my-1.5 flex flex-col items-center">
                <div className="w-full h-5 bg-black flex gap-[1px] p-[1px] overflow-hidden">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div key={i} className="h-full bg-white" style={{ width: i % 4 === 0 ? '2px' : '1px' }} />
                  ))}
                </div>
                <span className="text-[4px] font-mono text-neutral-400 mt-0.5">MINT ID #VAULT-2000-SECURE</span>
              </div>
              
              <div className="text-[5px] text-center border-t border-neutral-300 pt-1 font-mono text-neutral-400 uppercase tracking-widest leading-none mt-1">
                PLAYOFF CONTENDERS SECURE REGISTRY
              </div>
            </div>
          </div>
        );
      }
      
      if (['2005-exquisite-football'].includes(card.setId)) {
        const isLight = theme === 'light';
        return (
          <div className={`absolute inset-0 w-full h-full p-4 flex flex-col justify-between text-left ${isLight ? 'text-neutral-800 bg-[#fbf9f4]' : 'text-white bg-[#0e0e0f]'}`} style={{ border: isLight ? '3px solid #c5a059' : '3px solid #dfb76c', borderRadius: '14px', backgroundImage: 'url("assets/cards/' + card.setId + '_back.png")', backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
            <div className={`flex justify-between items-center border-b pb-1 text-[7px] font-mono ${isLight ? 'border-[#c5a059]/40 text-[#a37f37]' : 'border-[#dfb76c]/40 text-[#dfb76c]'}`}>
              <span>EXQUISITE CERTIFICATE OF AUTHENTICITY</span>
              <span>{card.number}</span>
            </div>
            
            <div className="leading-tight mt-1 text-center">
              <h3 className={`font-black text-xs uppercase tracking-wider ${isLight ? 'text-neutral-900' : 'text-white'}`}>{card.player}</h3>
              <p className={`text-[7px] uppercase font-semibold ${isLight ? 'text-[#a37f37]' : 'text-[#dfb76c]'}`}>ROOKIE PATCH AUTOGRAPH SLAB</p>
            </div>
            
            <div className={`my-auto p-2 border rounded text-[7px] text-center font-mono leading-relaxed ${isLight ? 'border-[#c5a059]/30 bg-[#c5a059]/5 text-neutral-700' : 'border-[#dfb76c]/30 bg-[#dfb76c]/5 text-[#dfb76c]'}`}>
              <p className={`font-bold ${isLight ? 'text-[#8c6c2b]' : ''}`}>CONGRATULATIONS!</p>
              <p className="mt-1">This card showcases a game-worn memorabilia jersey patch and an authentic signature of {card.player} certified by HoopTactics Registry.</p>
            </div>
            
            <div className={`flex justify-between items-center border-t pt-2 text-[6px] font-mono ${isLight ? 'border-[#c5a059]/20 text-neutral-400' : 'border-[#dfb76c]/20 text-neutral-500'}`}>
              <span>EXQUISITE COLLECTION REGISTRY</span>
              <span className={`font-bold ${isLight ? 'text-[#8c6c2b]' : 'text-[#dfb76c]'}`} style={{ fontFamily: "'Space Mono', monospace" }}>
                SERIAL: {card.player.charCodeAt(0) % 90 + 1}/99
              </span>
            </div>
          </div>
        );
      }
      
      if (card.setId.includes('prizm') || card.setId.includes('donruss')) {
        const isLight = theme === 'light';
        return (
          <div className={`absolute inset-0 w-full h-full p-4 flex flex-col justify-between text-left ${isLight ? 'text-neutral-700 bg-white' : 'text-white bg-[#0d0d0f]'}`} style={{ border: isLight ? '2px solid #e5e7eb' : '2px solid rgba(255,255,255,0.06)', borderRadius: '12px', backgroundImage: 'url("assets/cards/' + card.setId + '_back.png")', backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
            
            <div className={`flex justify-between items-start border-b pb-1.5 ${isLight ? 'border-neutral-200' : 'border-white/10'}`}>
              <div>
                <h3 className={`font-black text-[11px] uppercase tracking-wider ${isLight ? 'text-neutral-900' : 'text-white'}`}>{card.player}</h3>
                <p className={`text-[7.5px] uppercase tracking-widest mt-0.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>{card.team} • {card.specs.position}</p>
              </div>
              <span className={`font-mono text-[9px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>{card.number}</span>
            </div>
            
            <div className={`my-1.5 border p-2 rounded text-[7px] font-mono ${isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-700' : 'bg-white/5 border-white/5 text-neutral-300'}`}>
              <div className={`grid grid-cols-6 font-bold border-b pb-1 uppercase ${isLight ? 'border-neutral-200 text-neutral-900' : 'border-white/10 text-white'}`}>
                {labels.map(l => <span key={l}>{l}</span>)}
              </div>
              {stats.map((s, idx) => (
                <div key={idx} className="grid grid-cols-6 pt-1">
                  <span>{s.yr}</span>
                  <span className={`truncate font-bold ${isLight ? 'text-neutral-800' : 'text-white'}`}>{card.team.split(' ')[0]}</span>
                  <span>{s.gp}</span>
                  <span>{s.col1}</span>
                  <span>{s.col2}</span>
                  <span>{s.col3}</span>
                </div>
              ))}
            </div>
            
            <p className={`text-[6px] leading-normal ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              Drafted in {card.specs.draftYear}, this standout player made an immediate impact, showcasing elite talent. Opti-chrome technology captures the shine of his career.
            </p>
            
            <div className={`flex justify-between items-center border-t pt-2 text-[6px] font-mono ${isLight ? 'border-neutral-200 text-neutral-400' : 'border-white/10 text-neutral-500'}`}>
              <span>SOCIAL: @{card.team.toLowerCase().replace(/ /g, '')} • @panini</span>
              <div className="w-8 h-4 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 rounded border border-white/20 animate-pulse shadow-lg" />
            </div>
          </div>
        );
      }
      
      const isLight = theme === 'light';
      return (
        <div className={`absolute inset-0 w-full h-full p-4 flex flex-col justify-between text-left ${isLight ? 'text-neutral-700 bg-white' : 'text-white bg-[#0a0a0c]'}`} style={{ border: isLight ? '2px solid #e5e7eb' : '2px solid rgba(255,255,255,0.06)', borderRadius: '12px', backgroundImage: 'url("assets/cards/' + card.setId + '_back.png")', backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
          
          <div className={`flex justify-between items-start border-b pb-2 ${isLight ? 'border-neutral-200' : 'border-white/10'}`}>
            <div>
              <h3 className={`font-black text-xs uppercase tracking-wider ${isLight ? 'text-neutral-900' : 'text-white'}`}>{card.player}</h3>
              <p className={`text-[7.5px] uppercase tracking-widest mt-0.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>{card.team} • {card.specs.position}</p>
            </div>
            <span className={`font-mono text-[10px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>{card.number}</span>
          </div>
          
          <div className={`my-auto border p-2 rounded text-[7px] font-mono ${isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-700' : 'bg-white/5 border-white/5 text-neutral-300'}`}>
            <div className={`grid grid-cols-6 font-bold border-b pb-1 uppercase ${isLight ? 'border-neutral-200 text-neutral-900' : 'border-white/10 text-white'}`}>
              {labels.map(l => <span key={l}>{l}</span>)}
            </div>
            {stats.map((s, idx) => (
              <div key={idx} className="grid grid-cols-6 pt-1 text-neutral-400">
                <span>{s.yr}</span>
                <span className={`truncate font-bold ${isLight ? 'text-neutral-800' : 'text-white'}`}>{card.team.split(' ')[0]}</span>
                <span>{s.gp}</span>
                <span>{s.col1}</span>
                <span>{s.col2}</span>
                <span>{s.col3}</span>
              </div>
            ))}
          </div>
          
          <div className={`text-[6.5px] leading-snug ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Certificate: This authentic chrome refractor card features state-of-the-art metallic coatings reflecting the player's performance. Certified by Topps slab registry.
          </div>
          <div className={`flex justify-between items-center border-t pt-2 text-[7px] font-mono ${isLight ? 'border-neutral-200 text-neutral-400' : 'border-white/10 text-neutral-500'}`}>
            <span>OFFICIAL LICENSEE • TOPPS CHROME REGISTRY</span>
            <div className="w-8 h-4 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 rounded border border-white/20 animate-pulse shadow-lg" />
          </div>
        </div>
      );
    };

    // Global image cache to prevent image reload flicker during list scroll/re-renders
    const loadedImagesCache = new Set();

    // Card component rendering single-sided interactive 3D card
    const HoloCard = ({ card, size = 'md', interactive = true, hideAttributes = false, onClick }) => {
      const { theme } = React.useContext(ThemeContext) || { theme: 'dark' };
      const cardRef = useRef(null);
      const [frontImgErr, setFrontImgErr] = React.useState(false);
      const [frontImgSrc, setFrontImgSrc] = React.useState('');
      const [imageLoaded, setImageLoaded] = React.useState(() => {
        const baseId = card.id.includes('::') ? card.id.split('::')[0] : card.id;
        const parallelName = card.id.includes('::') ? card.id.split('::')[1] : (card.parallel || 'Base');
        
        let fileSuffix = parallelName.toLowerCase().replace(/ /g, '-');
        if (fileSuffix === 'base-card') fileSuffix = 'base';
        if (fileSuffix === 'refractor-parallel' || fileSuffix === 'refractor' || fileSuffix === 'silver-prizm') fileSuffix = 'silver';
        if (fileSuffix === 'prismatic-patch') fileSuffix = 'prismatic';
        if (fileSuffix.includes('1/1') || fileSuffix.includes('one-of-one') || fileSuffix.includes('1-of-1')) {
          fileSuffix = 'one-of-one';
        }
        const initialSrc = `assets/cards/${baseId}_${fileSuffix}_front.png`;
        return loadedImagesCache.has(initialSrc);
      });

      const cardStats = getCardGameStats(card);
      const displaySta = typeof card.currentSta === 'number' ? card.currentSta : cardStats.sta;

      React.useEffect(() => {
        const baseId = card.id.includes('::') ? card.id.split('::')[0] : card.id;
        const parallelName = card.id.includes('::') ? card.id.split('::')[1] : (card.parallel || 'Base');
        
        // Normalize parallel name for filenames
        let fileSuffix = parallelName.toLowerCase().replace(/ /g, '-');
        if (fileSuffix === 'base-card') fileSuffix = 'base';
        if (fileSuffix === 'refractor-parallel' || fileSuffix === 'refractor' || fileSuffix === 'silver-prizm') fileSuffix = 'silver';
        if (fileSuffix === 'prismatic-patch') fileSuffix = 'prismatic';
        if (fileSuffix.includes('1/1') || fileSuffix.includes('one-of-one') || fileSuffix.includes('1-of-1')) {
          fileSuffix = 'one-of-one';
        }
        
        const nextSrc = `assets/cards/${baseId}_${fileSuffix}_front.png`;
        setFrontImgSrc(prev => {
          if (prev !== nextSrc) {
            setImageLoaded(loadedImagesCache.has(nextSrc));
            return nextSrc;
          }
          return prev;
        });
        setFrontImgErr(false);
      }, [card.id, card.parallel]);

      const handleFrontError = () => {
        const baseId = card.id.includes('::') ? card.id.split('::')[0] : card.id;
        const baseSrc = `assets/cards/${baseId}_base_front.png`;
        if (frontImgSrc !== baseSrc) {
          setFrontImgSrc(baseSrc);
          setImageLoaded(loadedImagesCache.has(baseSrc));
        } else {
          setFrontImgErr(true);
        }
      };
      // Refs for direct DOM style animations to prevent React state re-render lag
      const cardInnerRef = React.useRef(null);
      const shimmerRef = React.useRef(null);
      const refractorRef = React.useRef(null);
      const glareRef = React.useRef(null);
      const rectRef = React.useRef(null);
      const frameIdRef = React.useRef(null);

      React.useEffect(() => {
        return () => {
          if (frameIdRef.current) {
            cancelAnimationFrame(frameIdRef.current);
          }
        };
      }, []);

      const parallelName = card.id.includes('::') ? card.id.split('::')[1] : (card.parallel || 'Base');
      const isParallel = (parallelName && !parallelName.toLowerCase().includes('base')) || card.setId === '2025-topps-finest';
      const isLegendarySet = card.year <= 1993 || card.setId === '1997-pmg' || card.setId === '1996-topps-chrome';

      const typeLower = (card.type || '').toLowerCase();
      const parallelLower = (parallelName || '').toLowerCase();
      const idLower = (card.id || '').toLowerCase();
      const brandLower = (card.brand || '').toLowerCase();
      const setId = card.setId || '';

      const hasParallelVal = 
        (card.frontImg && card.frontImg.toLowerCase().includes('parallel')) ||
        (frontImgSrc && frontImgSrc.toLowerCase().includes('parallel')) ||
        (card.parallel && card.parallel.toLowerCase().includes('parallel')) ||
        (card.id && card.id.toLowerCase().includes('parallel'));

      const hasAutoOrPatchVal =
        (card.frontImg && (card.frontImg.toLowerCase().includes('auto') || card.frontImg.toLowerCase().includes('patch'))) ||
        (frontImgSrc && (frontImgSrc.toLowerCase().includes('auto') || frontImgSrc.toLowerCase().includes('patch'))) ||
        (card.type && (card.type.toLowerCase().includes('auto') || card.type.toLowerCase().includes('patch'))) ||
        (card.parallel && (card.parallel.toLowerCase().includes('auto') || card.parallel.toLowerCase().includes('patch'))) ||
        (card.id && (card.id.toLowerCase().includes('auto') || card.id.toLowerCase().includes('patch')));

      const isAutoPatchParallel = hasParallelVal && hasAutoOrPatchVal;

      const isMosaicParallel = 
        card.setId === '2019-mosaic' && (
          isParallel ||
          (card.parallel && (
            card.parallel.toLowerCase().includes('parallel') ||
            card.parallel.toLowerCase().includes('refractor') ||
            card.parallel.toLowerCase().includes('prizm')
          ))
        );

      const isToppsChromeParallel = 
        card.setId === '2025-topps-chrome' && 
        card.rarity && 
        card.rarity !== 'base';
      
      const isToppsFinestParallel = card.setId === '2025-topps-finest';

      const hasParallelEffect = 
        (card.frontImg && card.frontImg.toLowerCase().includes('parallel')) ||
        (frontImgSrc && frontImgSrc.toLowerCase().includes('parallel')) || 
        isMosaicParallel ||
        isToppsChromeParallel ||
        isToppsFinestParallel ||
        (card.parallel && (
          card.parallel.toLowerCase().includes('parallel') ||
          card.parallel.toLowerCase().includes('refractor') ||
          card.parallel.toLowerCase().includes('prizm') ||
          card.parallel.toLowerCase().includes('one-of-one')
        ) && !card.parallel.toLowerCase().includes('base'));

      const isGoldShimmer = 
        isAutoPatchParallel || (
          !hasParallelEffect && (
            typeLower.includes('auto') || 
            parallelLower.includes('auto') || 
            idLower.includes('-auto') || 
            typeLower.includes('patch') || 
            parallelLower.includes('patch') || 
            idLower.includes('-patch') || 
            typeLower.includes('swatch') || 
            parallelLower.includes('swatch') || 
            idLower.includes('-swatch') || 
            parallelLower.includes('limited') || 
            idLower.includes('-limited') || 
            isParallel || 
            parallelLower.includes('cosmic') || 
            brandLower.includes('cosmic') || 
            brandLower.includes('skybox') || 
            setId === '1986-fleer' ||
            idLower.includes('1986-fleer')
          )
        );

      const handleMouseEnter = () => {
        if (!interactive) return;
        if (window.innerWidth < 768) return;
        const cardEl = cardRef.current;
        if (!cardEl) return;
        rectRef.current = cardEl.getBoundingClientRect();
      };

      // Handle Mouse/Touch tilt controls (direct DOM manipulation style updates)
      const handleMouseMove = (e) => {
        if (!interactive) return;
        if (window.innerWidth < 768) return;
        
        let rect = rectRef.current;
        if (!rect) {
          const cardEl = cardRef.current;
          if (!cardEl) return;
          rect = cardEl.getBoundingClientRect();
          rectRef.current = rect;
        }

        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left - width / 2;
        const mouseY = e.clientY - rect.top - height / 2;
        
        // Normalize rotation to max 22 degrees
        const rotX = -(mouseY / (height / 2)) * 22;
        const rotY = (mouseX / (width / 2)) * 22;

        // Map glare coordinates
        const glareX = ((e.clientX - rect.left) / width) * 100;
        const glareY = ((e.clientY - rect.top) / height) * 100;

        // Map shimmer shift
        const shimmerX = ((e.clientX - rect.left) / width) * 140 - 20;
        const shimmerY = ((e.clientY - rect.top) / height) * 140 - 20;

        // Cancel previous frame if it's still pending
        if (frameIdRef.current) {
          cancelAnimationFrame(frameIdRef.current);
        }

        // Run updates inside requestAnimationFrame for maximum FPS
        frameIdRef.current = requestAnimationFrame(() => {
          if (cardInnerRef.current) {
            cardInnerRef.current.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
          }
          if (glareRef.current) {
            glareRef.current.style.setProperty('--glare-x', `${glareX}%`);
            glareRef.current.style.setProperty('--glare-y', `${glareY}%`);
          }
          if (shimmerRef.current) {
            shimmerRef.current.style.setProperty('--shimmer-x', `${shimmerX}%`);
            shimmerRef.current.style.setProperty('--shimmer-y', `${shimmerY}%`);
          }
          if (refractorRef.current) {
            refractorRef.current.style.setProperty('--refractor-opacity', '0.8');
            refractorRef.current.style.setProperty('--refractor-x', `${shimmerX * 2}%`);
            refractorRef.current.style.setProperty('--refractor-y', `${shimmerY * 2}%`);
          }
        });
      };

      const handleMouseLeave = () => {
        if (window.innerWidth < 768) return;
        rectRef.current = null;
        if (frameIdRef.current) {
          cancelAnimationFrame(frameIdRef.current);
        }
        if (cardInnerRef.current) {
          cardInnerRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
        }
        if (refractorRef.current) {
          refractorRef.current.style.setProperty('--refractor-opacity', '0');
        }
      };

      // Determine size dimensions
      const sizeClasses = {
        sm: 'w-24 h-32 min-[400px]:w-28 min-[400px]:h-38 sm:w-32 sm:h-44',
        md: 'w-[130px] h-[190px] min-[400px]:w-[160px] min-[400px]:h-[230px] sm:w-44 sm:h-64',
        lg: 'w-44 h-64 min-[400px]:w-52 min-[400px]:h-72 sm:w-60 sm:h-84',
        xl: 'w-[180px] h-[260px] min-[400px]:w-[220px] min-[400px]:h-[310px] sm:w-[260px] sm:h-[370px] md:w-72 md:h-[410px]',
        game: 'w-full aspect-[3/4]'
      }[size];

      // Define toploader border/glow variables based on card parallel rarity
      const isGameSize = size === 'game';
      const shouldHideAttributes = hideAttributes || isGameSize;
      
      let finalRarityStyle;
      if (isGameSize) {
        // Determine gameplay miniature card rarity category (emerald, gold, iridescent, base)
        let gameRarity = 'base';
        if (isLegendarySet || 
            (card.rarity && (card.rarity.includes('green') || card.rarity.includes('emerald'))) || 
            (parallelName && (parallelName.toLowerCase().includes('green') || parallelName.toLowerCase().includes('emerald')))) {
          gameRarity = 'emerald';
        } else if (
            (card.rarity && (card.rarity.includes('gold') || card.rarity.includes('one-of-one') || card.rarity.includes('prismatic'))) || 
            (parallelName && (parallelName.toLowerCase().includes('gold') || parallelName.toLowerCase().includes('one-of-one') || parallelName.toLowerCase().includes('prismatic') || parallelName.toLowerCase().includes('1/1'))) ||
            isAutoPatchParallel || isGoldShimmer) {
          gameRarity = 'gold';
        } else if (
            hasParallelEffect || isParallel ||
            (card.rarity && (card.rarity.includes('silver') || card.rarity.includes('cosmic') || card.rarity.includes('pink'))) ||
            (parallelName && (parallelName.toLowerCase().includes('silver') || parallelName.toLowerCase().includes('cosmic') || parallelName.toLowerCase().includes('pink') || parallelName.toLowerCase().includes('refractor') || parallelName.toLowerCase().includes('prizm')))) {
          gameRarity = 'iridescent';
        }

        finalRarityStyle = {
          emerald: {
            '--toploader-border': 'rgba(16, 185, 129, 0.85)',
            '--toploader-glow': '0 0 10px rgba(16, 185, 129, 0.5)',
            '--toploader-border-light': 'rgba(16, 185, 129, 0.75)',
            '--toploader-glow-light': '0 0 8px rgba(16, 185, 129, 0.35)',
            '--toploader-border-width': '1.5px'
          },
          gold: {
            '--toploader-border': 'rgba(255, 214, 10, 0.85)',
            '--toploader-glow': '0 0 10px rgba(255, 214, 10, 0.5)',
            '--toploader-border-light': 'rgba(218, 165, 32, 0.8)',
            '--toploader-glow-light': '0 0 8px rgba(218, 165, 32, 0.35)',
            '--toploader-border-width': '1.5px'
          },
          iridescent: {
            '--toploader-border': 'rgba(192, 132, 252, 0.85)',
            '--toploader-glow': '0 0 10px rgba(192, 132, 252, 0.5)',
            '--toploader-border-light': 'rgba(236, 72, 153, 0.8)',
            '--toploader-glow-light': '0 0 8px rgba(236, 72, 153, 0.35)',
            '--toploader-border-width': '1.5px'
          },
          base: {
            '--toploader-border': 'rgba(255, 255, 255, 0.15)',
            '--toploader-glow': '0 0 5px rgba(255, 255, 255, 0.05)',
            '--toploader-border-light': 'rgba(0, 0, 0, 0.15)',
            '--toploader-glow-light': '0 0 5px rgba(0, 0, 0, 0.03)',
            '--toploader-border-width': '1.5px'
          }
        }[gameRarity];
      } else {
        const rawRarity = card.rarity || 'base';
        let selectedRarity = isLegendarySet ? 'legendary' : rawRarity;
        
        // Normalize rarity strings to ensure correct lookup
        if (selectedRarity.includes('prismatic')) selectedRarity = 'prismatic';
        if (selectedRarity.includes('gold')) selectedRarity = 'gold';
        if (selectedRarity.includes('one-of-one') || selectedRarity.includes('1/1')) selectedRarity = 'one-of-one';
        if (selectedRarity.includes('silver') || selectedRarity.includes('refractor') || selectedRarity.includes('prizm')) selectedRarity = 'silver';

        finalRarityStyle = {
          legendary: {
            '--toploader-border': 'rgba(16, 185, 129, 0.4)',
            '--toploader-glow': '0 0 20px rgba(16, 185, 129, 0.25)',
            '--toploader-border-light': 'rgba(16, 185, 129, 0.3)',
            '--toploader-glow-light': '0 0 15px rgba(16, 185, 129, 0.15)'
          },
          base: {
            '--toploader-border': 'rgba(255, 255, 255, 0.08)',
            '--toploader-glow': '0 0 15px rgba(56, 189, 248, 0.05)',
            '--toploader-border-light': 'rgba(0, 0, 0, 0.08)',
            '--toploader-glow-light': '0 0 12px rgba(56, 189, 248, 0.03)'
          },
          silver: {
            '--toploader-border': 'rgba(255, 255, 255, 0.3)',
            '--toploader-glow': '0 0 20px rgba(255, 255, 255, 0.15)',
            '--toploader-border-light': 'rgba(0, 0, 0, 0.2)',
            '--toploader-glow-light': '0 0 15px rgba(0, 0, 0, 0.08)'
          },
          gold: {
            '--toploader-border': 'rgba(255, 214, 10, 0.3)',
            '--toploader-glow': '0 0 20px rgba(255, 214, 10, 0.15)',
            '--toploader-border-light': 'rgba(218, 165, 32, 0.25)',
            '--toploader-glow-light': '0 0 15px rgba(218, 165, 32, 0.1)'
          },
          prismatic: {
            '--toploader-border': 'rgba(255, 214, 10, 0.3)',
            '--toploader-glow': '0 0 20px rgba(255, 214, 10, 0.15)',
            '--toploader-border-light': 'rgba(218, 165, 32, 0.25)',
            '--toploader-glow-light': '0 0 15px rgba(218, 165, 32, 0.1)'
          },
          'one-of-one': {
            '--toploader-border': 'rgba(255, 214, 10, 0.3)',
            '--toploader-glow': '0 0 20px rgba(255, 214, 10, 0.15)',
            '--toploader-border-light': 'rgba(218, 165, 32, 0.25)',
            '--toploader-glow-light': '0 0 15px rgba(218, 165, 32, 0.1)'
          },
          iridescent: {
            '--toploader-border': 'rgba(192, 132, 252, 0.4)',
            '--toploader-glow': '0 0 25px rgba(192, 132, 252, 0.25)',
            '--toploader-border-light': 'rgba(236, 72, 153, 0.3)',
            '--toploader-glow-light': '0 0 18px rgba(236, 72, 153, 0.15)'
          }
        }[selectedRarity] || {
          '--toploader-border': 'rgba(255, 255, 255, 0.08)',
          '--toploader-glow': '0 0 15px rgba(56, 189, 248, 0.05)',
          '--toploader-border-light': 'rgba(0, 0, 0, 0.08)',
          '--toploader-glow-light': '0 0 12px rgba(56, 189, 248, 0.03)'
        };
      }

      return (
        <div 
          ref={cardRef}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={onClick}
          className={`card-3d-wrapper ${sizeClasses} cursor-pointer select-none ${size === 'xl' ? 'is-xl' : ''}`}
        >
          <div 
            ref={cardInnerRef}
            className="card-3d-inner"
            style={{
              transform: 'rotateX(0deg) rotateY(0deg)'
            }}
          >
            {/* Front Face - digital toploader frame */}
            <div 
              className={`card-face absolute inset-0 w-full h-full flex flex-col justify-between overflow-hidden digital-toploader bg-[#060608]/40 ${isGameSize ? 'p-1 is-game-card' : 'p-2'}`}
              style={finalRarityStyle}
            >
              {/* Inner card container simulating inset cavity of physical protector */}
              <div className="w-full h-full relative rounded-[8px] overflow-hidden bg-black/60 border border-white/5 flex flex-col justify-between">
                {/* Render fallback CSS content in the background while loading or on error */}
                {(!imageLoaded || frontImgErr) && (
                  <div className="absolute inset-0 flex flex-col justify-between z-0">
                    {renderCardFrontContent(card)}
                  </div>
                )}

                {!frontImgErr && (
                  <img 
                    src={frontImgSrc} 
                    onError={handleFrontError}
                    onLoad={() => {
                      loadedImagesCache.add(frontImgSrc);
                      setImageLoaded(true);
                    }}
                    className={`w-full h-full object-cover absolute inset-0 z-10 transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} 
                    loading="lazy"
                    decoding="async"
                    alt={card.player}
                  />
                )}

                {/* Overlaid Attributes for Basketball Cards */}
                {card.sport === 'Basketball' && !shouldHideAttributes && (
                  <div className="absolute inset-0 z-20 flex flex-col justify-between pointer-events-none p-1.5 md:p-2">
                    {/* Top Row: POS & OVR */}
                    <div className="flex justify-between items-center w-full">
                      {/* Position Badge */}
                      <span className={`pos-badge bg-black/80 backdrop-blur-sm text-white font-extrabold px-1.5 py-0.5 rounded border border-white/10 tracking-wider shadow-md ${
                        (size === 'sm' || size === 'game') ? 'text-[7px]' : size === 'md' ? 'text-[8.5px]' : 'text-[10px]'
                      }`}>
                        {cardStats.pos}
                      </span>
                      {/* OVR Ring/Badge */}
                      <div className={`ovr-avatar ${(size === 'sm' || size === 'game') ? 'sm' : size === 'md' ? 'md' : 'lg'} shadow-md`}>
                        <div className="ovr-avatar-spin"></div>
                        <div className="ovr-avatar-mask"></div>
                        <div className="ovr-avatar-content">
                          <span className="ovr-val">
                            {cardStats.ovr}
                          </span>
                          {size !== 'sm' && size !== 'game' && (
                            <span className="ovr-lbl">OVR</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Stats HUD */}
                    <div className={`flex justify-around items-center w-full bg-black/85 backdrop-blur-sm border border-white/10 rounded-md py-1 px-1 shadow-lg`}>
                      <div className="text-center">
                        <span className={`text-neutral-500 font-bold uppercase block leading-none ${(size === 'sm' || size === 'game') ? 'text-[4px]' : 'text-[5.5px]'}`}>OFF</span>
                        <span className={`font-black text-orange-400 font-mono leading-none ${(size === 'sm' || size === 'game') ? 'text-[7.5px]' : 'text-[9.5px]'}`}>{cardStats.off}</span>
                      </div>
                      <div className="w-[1px] h-3 bg-white/15"></div>
                      <div className="text-center">
                        <span className={`text-neutral-500 font-bold uppercase block leading-none ${(size === 'sm' || size === 'game') ? 'text-[4px]' : 'text-[5.5px]'}`}>DEF</span>
                        <span className={`font-black text-blue-400 font-mono leading-none ${(size === 'sm' || size === 'game') ? 'text-[7.5px]' : 'text-[9.5px]'}`}>{cardStats.def}</span>
                      </div>
                      <div className="w-[1px] h-3 bg-white/15"></div>
                      <div className="text-center">
                        <span className={`text-neutral-500 font-bold uppercase block leading-none ${(size === 'sm' || size === 'game') ? 'text-[4px]' : 'text-[5.5px]'}`}>STA</span>
                        <span className={`font-black text-emerald-400 font-mono leading-none ${(size === 'sm' || size === 'game') ? 'text-[7.5px]' : 'text-[9.5px]'}`}>{displaySta}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Gloss Shimmer overlays */}
              <div 
                ref={shimmerRef}
                className={`holo-shimmer ${
                  isLegendarySet ? 'is-emerald-shimmer' : 
                  (card.rarity === 'prismatic' || card.rarity === 'gold' || card.rarity === 'one-of-one') ? 'is-gold' : 
                  isAutoPatchParallel ? 'is-gold' : 
                  hasParallelEffect ? 'is-iridescent' : 
                  isGoldShimmer ? 'is-gold' : ''
                }`}
              />
              {(isParallel || hasParallelEffect || isLegendarySet) && (
                <div 
                  ref={refractorRef}
                  className="holo-refractor"
                />
              )}
              <div 
                ref={glareRef}
                className="holo-glare"
              />
            </div>
          </div>
        </div>
      );
    };

    const CatalogCard = ({ card, isOwned, onToggle, onOpenDetail, className = "", hideAttributes = false, showAnalyticsButton = false }) => {
      return (
        <div className={`amp-card p-2.5 min-[400px]:p-3 sm:p-4 flex flex-col items-center gap-2 sm:gap-3 bg-black/60 relative ${className} ${!isOwned ? 'unowned-card-style' : ''}`}>
          {/* Badge showing if this specific card is owned */}
          <div className="absolute top-2 left-2 z-10">
            {isOwned ? (
              <span className="text-[8px] bg-white text-black font-black uppercase px-1.5 py-0.5 rounded tracking-wider shadow-md">Owned</span>
            ) : (
              <span className="text-[8px] locked-badge bg-neutral-800 text-neutral-500 font-bold uppercase px-1.5 py-0.5 rounded tracking-wider border border-white/5">Locked</span>
            )}
          </div>

          <HoloCard 
            card={card} 
            size="md" 
            interactive={true} 
            hideAttributes={hideAttributes} 
            onClick={() => onOpenDetail && onOpenDetail(card.id, showAnalyticsButton ? 'analytics' : 'attributes')}
          />

          {/* Simple header info for the specific parallel card */}
          <div className="w-full text-center leading-tight">
            <div className="text-[10px] font-black uppercase text-white truncate">{card.player}</div>
            <div className="text-[8px] text-neutral-400 font-semibold truncate mt-0.5">{card.brand} - {card.parallel}{card.number && card.number !== '#1' && card.setId === '2025-topps-now' ? ` (${card.number.replace('#', '').replace(/-Auto$/, '')})` : ''}</div>
          </div>

          {showAnalyticsButton ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail && onOpenDetail(card.id, 'analytics');
              }}
              className="conic-btn primary dramatic-hover w-full py-1.5 mt-2"
            >
              <div className="conic-spin-bg"></div>
              <div className="conic-btn-mask bg-[#0c0c0c]/85"></div>
              <span className="relative z-10 text-[8px] min-[400px]:text-[9px] font-black uppercase tracking-wider text-white flex items-center justify-center gap-1">
                <iconify-icon icon="solar:chart-square-linear" width="12"></iconify-icon>
                View Analytics
              </span>
            </button>
          ) : (
            onOpenDetail && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetail(card.id, 'attributes');
                }}
                className="conic-btn primary dramatic-hover w-full py-1.5 mt-2"
              >
                <div className="conic-spin-bg"></div>
                <div className="conic-btn-mask bg-[#0c0c0c]/85"></div>
                <span className="relative z-10 text-[8px] min-[400px]:text-[9px] font-black uppercase tracking-wider text-white flex items-center justify-center gap-1">
                  <iconify-icon icon="solar:eye-bold" width="12"></iconify-icon>
                  View Attributes
                </span>
              </button>
            )
          )}
        </div>
      );
    };

    // SportIcon custom inline SVGs matching stylistically (linear stroke, premium design)
    // SportIcon using premium, high-fidelity Iconify outline icons
    const SportIcon = ({ sport, active }) => {
      const baseClass = `w-9 h-9 transition-all duration-300 ${
        active ? 'text-white' : 'text-neutral-400 group-hover:text-white'
      }`;

      let iconName = '';
      let sportClass = '';
      
      if (sport === 'Basketball') {
        iconName = 'ion:basketball-outline';
        sportClass = 'basketball-icon';
      } else if (sport === 'Football') {
        iconName = 'ion:american-football-outline';
        sportClass = 'football-icon';
      } else if (sport === 'Baseball') {
        iconName = 'ion:baseball-outline';
        sportClass = 'baseball-icon';
      }

      if (!iconName) return null;

      return (
        <iconify-icon 
          icon={iconName} 
          className={`${baseClass} ${sportClass} block`} 
          width="36"
        />
      );
    };

    // Onboarding Screen Component
    const Onboarding = ({ onComplete }) => {
      const [step, setStep] = useState(0);
      const [isLogin, setIsLogin] = useState(false);
      const [username, setUsername] = useState('');
      const [email, setEmail] = useState('');
      const [emailOrUsername, setEmailOrUsername] = useState('');
      const [password, setPassword] = useState('');
      const [team, setTeam] = useState('');
      const [level, setLevel] = useState('');

      const handleLogin = () => {
        const usernameVal = emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername;
        const emailVal = emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@hooptactics.com`;
        
        const savedFavs = localStorage.getItem('ht_favorites');
        let favs = { sports: ['Basketball'], team: '', level: 'hobbyist', username: usernameVal || 'Collector', email: emailVal };
        if (savedFavs) {
          try {
            const parsed = JSON.parse(savedFavs);
            if (parsed) {
              favs = { ...favs, ...parsed };
              if (usernameVal) favs.username = usernameVal;
              if (emailVal) favs.email = emailVal;
            }
          } catch (e) {}
        }
        onComplete(favs);
      };

      const handleNext = () => {
        if (isLogin) {
          handleLogin();
        } else if (step === 2) {
          onComplete({ sports: ['Basketball'], team, level, username, email });
        } else {
          setStep(step + 1);
        }
      };

      const isNextDisabled = () => {
        if (isLogin) {
          return !emailOrUsername.trim() || password.length < 6;
        }
        if (step === 0) {
          return !username.trim() || !email.trim() || !email.includes('@') || password.length < 6;
        }
        if (step === 2) {
          return !level;
        }
        return false;
      };

      const popularTeams = [
        'Los Angeles Lakers', 'Boston Celtics', 'New York Knicks', 
        'Golden State Warriors', 'Chicago Bulls', 'Dallas Mavericks'
      ];

      return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-lg mx-auto glass-panel p-5 sm:p-8 rounded-3xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-600" />
            
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <Logo className="w-24 h-32 mb-3 text-white" />
              <h1 className="text-2xl font-bold tracking-widest uppercase text-white">HoopTactics</h1>
              <p className="text-[10px] tracking-widest text-neutral-500 uppercase">Tactical Basketball Vault</p>
            </div>

            {/* Tabs for Sign Up / Sign In */}
            {step === 0 && (
              <div className="flex border-b border-white/5 mb-6">
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                    !isLogin 
                      ? 'border-orange-500 text-white font-black' 
                      : 'border-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                    isLogin 
                      ? 'border-orange-500 text-white font-black' 
                      : 'border-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Sign In
                </button>
              </div>
            )}

            {step === 0 && !isLogin && (
              <div className="space-y-4">
                <div className="text-center mb-2">
                  <h2 className="text-lg font-semibold mb-1">Create Your Account</h2>
                  <p className="text-xs text-neutral-400">Initialize your HoopTactics basketball binder</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">Username / Name</label>
                    <input 
                      type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. CourtMaster99"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-white transition-all text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">Email Address</label>
                    <input 
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. collector@hooptactics.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-white transition-all text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">Password</label>
                    <input 
                      type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="•••••••• (Min 6 characters)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-white transition-all text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 0 && isLogin && (
              <div className="space-y-4">
                <div className="text-center mb-2">
                  <h2 className="text-lg font-semibold mb-1">Welcome Back</h2>
                  <p className="text-xs text-neutral-400">Sign in to access your HoopTactics basketball binder</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">Email / Username</label>
                    <input 
                      type="text" value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)}
                      placeholder="e.g. collector@hooptactics.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-white transition-all text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">Password</label>
                    <input 
                      type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="•••••••• (Min 6 characters)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-white transition-all text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-lg font-semibold mb-1">Favorite Franchise</h2>
                  <p className="text-xs text-neutral-400">Tailors your collection registry and dashboard</p>
                </div>
                <div className="space-y-4">
                  <input 
                    type="text" value={team} onChange={(e) => setTeam(e.target.value)}
                    placeholder="Search or enter team (e.g. Los Angeles Lakers)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-white transition-all text-center text-white font-semibold"
                  />
                  <div className="space-y-2">
                    <div className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider text-center">Suggested Franchises</div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {popularTeams.map(t => (
                        <button
                          key={t}
                          onClick={() => setTeam(t)}
                          className={`px-3 py-1.5 rounded-full border text-[10px] font-semibold transition-all ${
                            team === t 
                              ? 'border-white bg-white text-black shadow-md' 
                              : 'border-white/5 bg-white/5 text-neutral-400 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-lg font-semibold mb-1">Collector Experience</h2>
                  <p className="text-xs text-neutral-400">Select your knowledge level in basketball card collecting</p>
                </div>
                <div className="space-y-3">
                  {[
                    { id: 'casual', title: 'Casual Collector', desc: 'Starting out or collecting for fun' },
                    { id: 'hobbyist', title: 'Dedicated Hobbyist', desc: 'Familiar with sets, pricing & grading' },
                    { id: 'whale', title: 'Whale Master', desc: 'High-end investing, 1/1s & master sets' }
                  ].map(item => (
                    <button 
                      key={item.id} onClick={() => setLevel(item.id)}
                      className={`w-full text-left p-4 rounded-xl border flex justify-between items-center transition-all ${level === item.id ? 'border-white bg-white/5' : 'border-white/5 bg-transparent hover:border-white/20'}`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{item.title}</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">{item.desc}</div>
                      </div>
                      <iconify-icon icon="solar:check-circle-linear" width="16" className={level === item.id ? 'text-white' : 'text-neutral-800'}></iconify-icon>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between items-center">
              {step > 0 ? (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="conic-btn orange dramatic-hover"
                >
                  <div className="conic-spin-bg"></div>
                  <div className="conic-btn-mask"></div>
                  <span className="relative z-10 flex items-center justify-center gap-1 text-xs font-semibold px-4 py-2.5 text-white font-bold uppercase">
                    <iconify-icon icon="solar:arrow-left-linear" width="14"></iconify-icon>
                    Back
                  </span>
                </button>
              ) : <div />}
              
              <button 
                onClick={handleNext}
                disabled={isNextDisabled()}
                className="conic-btn primary dramatic-hover w-full md:w-36 disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="conic-spin-bg"></div>
                <div className="conic-btn-mask"></div>
                <span className="relative z-10 flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2.5 text-white font-bold uppercase">
                  {isLogin ? 'Sign In' : step === 2 ? 'Enter Vault' : 'Next'} 
                  <iconify-icon icon="solar:arrow-right-linear" width="14"></iconify-icon>
                </span>
              </button>
            </div>
          </div>
        </div>
      );
    };

// SPORTS_SETS moved to js/data.js

    // Seeded random helper functions for realistic dynamic price comp history
// price history math moved to js/data.js

    // Reusable 3D U.S. Quarter Coin Component for Matchup Resolution
    const QuarterCoin = ({ flipping, result, size = 'md', flipId = 0 }) => {
      const tossClass = flipping
        ? (result === 'heads' ? 'coin-3d-tossing-heads' : 'coin-3d-tossing-tails')
        : '';
        
      const shadowClass = flipping ? 'coin-3d-shadow-tossing' : '';
      const sizeScale = size === 'sm' ? 'scale-75' : size === 'lg' ? 'scale-125' : 'scale-100';

      return (
        <div className={`coin-3d-scene ${sizeScale} transform transition-transform duration-300`}>
          {/* Parabolic dynamic shadow */}
          <div className="coin-3d-shadow-wrapper">
            <div key={`shadow-${flipId}`} className={`coin-3d-shadow ${shadowClass}`} />
          </div>
          
          {/* 3D spinning coin cylinder */}
          <div 
            key={`coin-${flipId}`} 
            className={`coin-3d-box ${tossClass}`}
            style={{
              transform: !flipping && result
                ? (result === 'heads' ? 'rotateX(0deg)' : 'rotateX(180deg)')
                : undefined
            }}
          >
            {/* Ribbed reeded edge ring */}
            <div className="coin-3d-edge-ring" />
            
            {/* FRONT FACE (HEADS) */}
            <div className="coin-3d-face coin-3d-front">
              <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none">
                <defs>
                  {/* Embossed metal lighting filter */}
                  <filter id="metal-emboss-heads" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0.6" dy="0.6" stdDeviation="0.4" flood-color="#000000" flood-opacity="0.65" result="shadow"/>
                    <feDropShadow dx="-0.6" dy="-0.6" stdDeviation="0.4" flood-color="#ffffff" flood-opacity="0.8" result="highlight"/>
                    <feMerge>
                      <feMergeNode in="shadow"/>
                      <feMergeNode in="highlight"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Polished outer border rim */}
                <circle cx="50" cy="50" r="47" fill="none" stroke="#3f3f46" stroke-width="1.5" />
                <circle cx="50" cy="50" r="45.5" fill="none" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.4" />
                
                {/* Dotted decorative inner border */}
                <circle cx="50" cy="50" r="43" fill="none" stroke="#52525b" stroke-width="1.2" stroke-dasharray="1.5, 2" />
                <circle cx="50" cy="50" r="41" fill="none" stroke="#ffffff" stroke-width="0.5" stroke-opacity="0.2" />

                {/* Heads Icon: Stylized Washington Profile Silhouette (large & crisp) */}
                <g filter="url(#metal-emboss-heads)" fill="#e4e4e7">
                  <path d="M 33,65 
                           C 33,60 35,58 37,56 
                           C 39,54 38,51 38,49 
                           C 38,47 39.5,45 41,43 
                           C 42.5,41 43,39 45,37 
                           C 47,35 51,34 54,35 
                           C 57,36 59,38 60,41 
                           C 61,44 60,47 59.5,49 
                           C 59,51 60.5,53 60.5,55 
                           C 60.5,57 59,58.5 59,60 
                           C 59,61.5 60,62 60,63.5 
                           C 60,65 58,67 56,68 
                           C 54,69 52.5,68.5 51,68.5 
                           C 50.5,70 51.5,71.5 52.5,73.5 
                           C 53.5,75.5 54.5,77 55,79 
                           H 45 
                           C 41,74 38,71 36.5,69.5 
                           C 35,68 33.5,67 33,65.5 Z" />
                  {/* Hair bun */}
                  <circle cx="41.5" cy="52" r="3.5" fill="#a1a1aa" />
                  {/* Hair bow ribbon */}
                  <path d="M 38,52 L 34,55 L 36,52 L 34,49 Z" fill="#71717a" />
                </g>
              </svg>
            </div>
            
            {/* BACK FACE (TAILS) */}
            <div className="coin-3d-face coin-3d-back">
              <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none">
                <defs>
                  <filter id="metal-emboss-tails" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0.6" dy="0.6" stdDeviation="0.4" flood-color="#000000" flood-opacity="0.65" result="shadow"/>
                    <feDropShadow dx="-0.6" dy="-0.6" stdDeviation="0.4" flood-color="#ffffff" flood-opacity="0.8" result="highlight"/>
                    <feMerge>
                      <feMergeNode in="shadow"/>
                      <feMergeNode in="highlight"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Polished outer border rim */}
                <circle cx="50" cy="50" r="47" fill="none" stroke="#3f3f46" stroke-width="1.5" />
                <circle cx="50" cy="50" r="45.5" fill="none" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.4" />
                
                {/* Dotted decorative inner border */}
                <circle cx="50" cy="50" r="43" fill="none" stroke="#52525b" stroke-width="1.2" stroke-dasharray="1.5, 2" />
                <circle cx="50" cy="50" r="41" fill="none" stroke="#ffffff" stroke-width="0.5" stroke-opacity="0.2" />

                {/* Tails Icon: Bald Eagle with Spread Wings (clean, geometric, prominent) */}
                <g filter="url(#metal-emboss-tails)" fill="#e4e4e7">
                  <path d="M 50,28 
                           L 36,39 
                           H 20 
                           C 18,39 16.5,41 17.5,44 
                           L 24,59 
                           C 25,61 27,63 29,63 
                           H 42 
                           L 50,71 
                           L 58,63 
                           H 71 
                           C 73,63 75,61 76,59 
                           L 82.5,44 
                           C 83.5,41 82,39 80,39 
                           H 64 
                           L 50,28 Z" />
                  {/* Shield graphic on breast of the eagle */}
                  <path d="M 45,46 H 55 V 53 C 55,57 50,60 50,60 C 50,60 45,57 45,53 Z" fill="#71717a" />
                  <path d="M 45,46 H 55 V 53 C 55,57 50,60 50,60 C 50,60 45,57 45,53 Z" fill="none" stroke="#e4e4e7" stroke-width="0.8" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      );
    };

    // Standalone Price Chart Component (rules of hooks compliant)
    const PriceChart = ({ card, timeline = '1D', data = [] }) => {
      const canvasRef = useRef(null);
      const { theme } = React.useContext(ThemeContext) || { theme: 'dark' };

      useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const draw = () => {
          const ctx = canvas.getContext('2d');
          const dpr = window.devicePixelRatio || 1;
          const rect = canvas.getBoundingClientRect();
          const width = rect.width || 340;
          const height = rect.height || 140;
          
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          ctx.scale(dpr, dpr);

          ctx.clearRect(0, 0, width, height);

          if (data.length === 0) return;

          const maxVal = Math.max(...data.map(d => d.price));
          const minVal = Math.min(...data.map(d => d.price));
          const range = maxVal - minVal || 10;

          // Margins for labels
          const marginX = 55;
          const marginY = 22;
          const chartWidth = width - marginX - 15;
          const chartHeight = height - marginY * 2;

          const isDark = theme !== 'light';
          const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';
          const textColor = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.5)';
          const lineColor = isDark ? '#FFFFFF' : '#1F2937';
          const activeColor = isDark ? '#FFFFFF' : '#111827';
          const gradStart = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(31, 41, 55, 0.08)';

          // Draw horizontal grid lines and prices on y-axis
          ctx.strokeStyle = gridColor;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          
          const gridPoints = [minVal, minVal + range / 2, maxVal];
          gridPoints.forEach(val => {
            const y = height - ((val - minVal) / range) * chartHeight - marginY;
            ctx.beginPath();
            ctx.moveTo(marginX, y);
            ctx.lineTo(width - 15, y);
            ctx.stroke();
            
            // Grid labels
            ctx.fillStyle = textColor;
            ctx.font = '7.5px "Space Mono", monospace';
            ctx.textAlign = 'right';
            ctx.fillText('$' + Math.round(val).toLocaleString(), marginX - 6, y + 2.5);
          });
          
          ctx.setLineDash([]); // Reset

          // Draw line chart path
          ctx.beginPath();
          ctx.lineWidth = 2;
          ctx.strokeStyle = lineColor;

          data.forEach((d, i) => {
            const x = (i / (data.length - 1)) * chartWidth + marginX;
            const y = height - ((d.price - minVal) / range) * chartHeight - marginY;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();

          // Gradient fill below the line
          ctx.lineTo((data.length - 1) / (data.length - 1) * chartWidth + marginX, height - marginY);
          ctx.lineTo(marginX, height - marginY);
          ctx.closePath();
          const grad = ctx.createLinearGradient(0, marginY, 0, height - marginY);
          grad.addColorStop(0, gradStart);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.fill();
          
          // Draw points and values
          data.forEach((d, i) => {
            const x = (i / (data.length - 1)) * chartWidth + marginX;
            const y = height - ((d.price - minVal) / range) * chartHeight - marginY;
            
            // Draw dot
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = lineColor;
            ctx.fill();

            // Draw price text above first, middle, and last points
            if (i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)) {
              ctx.fillStyle = i === data.length - 1 ? activeColor : textColor;
              ctx.font = i === data.length - 1 ? 'bold 8px "Space Mono", monospace' : '7.5px "Space Mono", monospace';
              ctx.textAlign = 'center';
              ctx.fillText('$' + Math.round(d.price).toLocaleString(), x, y - 8);
            }

            // Draw date labels along x-axis
            ctx.fillStyle = textColor;
            ctx.font = '7.5px "Space Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(d.date, x, height - 6);
          });

          // Add active timeline label in top right of the canvas
          ctx.fillStyle = textColor;
          ctx.font = 'bold 7px "Outfit", sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(`${timeline.toUpperCase()} TIMELAPSE`, width - 15, 10);
        };

        const resizeObserver = new ResizeObserver(() => {
          requestAnimationFrame(draw);
        });

        resizeObserver.observe(canvas);
        draw();

        return () => {
          resizeObserver.disconnect();
        };
      }, [data, timeline, theme]);

      return <canvas ref={canvasRef} className="w-full h-36" />;
    };

    // HoopTactics Arena Turn-Based Tabletop Basketball Card Game Component
    const HoopTacticsArenaContainer = ({ 
      onOpenDetail,
      collection, 
      userCollection, 
      activeCards, 
      toggleCollection, 
      triggerToast, 
      getCardGameStats,
      level, 
      setLevel, 
      xp, 
      setXp, 
      favorites,
      setActiveTab,
      prestige,
      wasOvertime,
      setWasOvertime,
      matchStats,
      setMatchStats,
      avatarIcon,
      avatarGradient,
      setIsGameActive
    }) => {
      const { theme } = React.useContext(ThemeContext) || { theme: 'dark' };
      const isLight = theme === 'light';
      const [gameState, setGameState] = useState('lobby'); // 'lobby', 'deck_select', 'mode_select', 'searching', 'playing', 'ended'
      const [opponentType, setOpponentType] = useState('cpu'); // 'cpu' or 'online'
      const [cpuDifficulty, setCpuDifficulty] = useState('veteran'); // 'rookie', 'veteran', 'hall-famer'
      const [opponentName, setOpponentName] = useState('CPU Coach');
      
      // Match score and possessions
      const [possessionCount, setPossessionCount] = useState(1); // 1 to 32
      const [playerScore, setPlayerScore] = useState(0);
      const [opponentScore, setOpponentScore] = useState(0);
      const [playerPossession, setPlayerPossession] = useState(true); // Player starts on offense if Center OFF is higher
      const [playerTimeouts, setPlayerTimeouts] = useState(4);
      const [opponentTimeouts, setOpponentTimeouts] = useState(4);
      const [lastScorer, setLastScorer] = useState(null); // 'player', 'opponent', or null
      
      // Team rosters
      const [selectedDeckIds, setSelectedDeckIds] = useState([]); // 10 card IDs
      const [starters, setStarters] = useState([]); // 5 card IDs
      const [bench, setBench] = useState([]); // 5 card IDs
      const [vaultSearchQuery, setVaultSearchQuery] = useState('');
      const [vaultOwnedOnly, setVaultOwnedOnly] = useState(false);
      
      // Live game card states (dynamic stamina, gassed, custom stats)
      const [playerCards, setPlayerCards] = useState([]); // 10 cards with stamina, gassed, position
      const [opponentCards, setOpponentCards] = useState([]); // 10 cards
      const [selectedGrailUsed, setSelectedGrailUsed] = useState(false); // Player HoF Aura once per game
      const [oppGrailUsed, setOppGrailUsed] = useState(false); // Opponent HoF Aura once per game
      
      // Possession phase states
      const [gamePhase, setGamePhase] = useState('tactical'); // 'tactical', 'attack', 'contest', 'resolve', 'next'
      const [selectedAttackerId, setSelectedAttackerId] = useState(null);
      const [selectedDefenderId, setSelectedDefenderId] = useState(null);
      const [reboundRetained, setReboundRetained] = useState(false);
      const [shotType, setShotType] = useState(2); // 2 or 3 pointer
      const [isTimeoutWindow, setIsTimeoutWindow] = useState(false);
      const [subsActive, setSubsActive] = useState(false);
      
      // Drag & drop & click states for timeout substitutions
      const [draggedCardId, setDraggedCardId] = useState(null);
      const [dragOverCardId, setDragOverCardId] = useState(null);
      const [selectedSubId, setSelectedSubId] = useState(null);
      
      // Animations & Logs
      const [coinFlipping, setCoinFlipping] = useState(false);
      const [coinResult, setCoinResult] = useState(null); // 'heads' or 'tails'
      const [coinFlipId, setCoinFlipId] = useState(0);
      const [gameLog, setGameLog] = useState([]); // Play by play logs
      const [logScrollRef, setLogScrollRef] = useState(null);
      const [matchmakingProgress, setMatchmakingProgress] = useState(0);
      const [matchmakingLogs, setMatchmakingLogs] = useState([]);
      const [mockChatLog, setMockChatLog] = useState([]); // Chat notifications
      
      // Sudden Death Overtime state
      const [isOvertime, setIsOvertime] = useState(false);
      
      // Timeout active animation states
      const [timeoutActive, setTimeoutActive] = useState(false);
      const [timeoutCaller, setTimeoutCaller] = useState(null);
      
      // Collapsible bench roster states
      const [isBenchCollapsed, setIsBenchCollapsed] = useState(true);
      
      useEffect(() => {
        if (subsActive) {
          setIsBenchCollapsed(false);
        }
      }, [subsActive]);

      // Tutorial overlay system
      const isTutorialMatch = level === 1 && xp === 0 && (matchStats.cpuMatches || 0) === 0 && (matchStats.onlineMatches || 0) === 0;
      const [tutorialStep, setTutorialStep] = useState(null);
      const [tutorialPopupOpen, setTutorialPopupOpen] = useState(true);

      useEffect(() => {
        if (tutorialStep !== null) {
          setTutorialPopupOpen(true);
        }
      }, [tutorialStep]);

      // Effect to auto-start tutorial when game begins
      useEffect(() => {
        if (gameState === 'playing' && isTutorialMatch && tutorialStep === null) {
          setTutorialStep(1);
        }
      }, [gameState]);

      // Effect to auto-advance tutorial steps contextually based on game progression
      useEffect(() => {
        if (!isTutorialMatch || tutorialStep === null) return;

        if (possessionCount === 1) {
          if (gamePhase === 'tactical') {
            setTutorialStep(1);
          } else if (gamePhase === 'attack') {
            if (!selectedAttackerId) {
              setTutorialStep(2);
            } else {
              setTutorialStep(3);
            }
          } else if (gamePhase === 'contest') {
            if (!playerPossession) {
              if (!selectedDefenderId) {
                setTutorialStep(2);
              }
            } else {
              setTutorialStep(4);
            }
          } else if (gamePhase === 'resolve') {
            setTutorialStep(5);
          } else if (gamePhase === 'next') {
            setTutorialStep(6);
          }
        } else if (possessionCount === 2) {
          if (gamePhase === 'tactical') {
            setTutorialStep(7);
          } else {
            setTutorialStep(null);
          }
        } else {
          setTutorialStep(null);
        }
      }, [gamePhase, selectedAttackerId, selectedDefenderId, possessionCount, gameState, playerPossession]);

      const getTutorialTitle = () => {
        switch (tutorialStep) {
          case 1: return "1. Tactical Phase Overview";
          case 2: return playerPossession ? "2. Select Your Attacker" : "2. Assign Your Defender";
          case 3: return "3. Choose Shot Type";
          case 4: return "4. Defensive Contest";
          case 5: return "5. Coin Flip & Matchup Resolution";
          case 6: return "6. Analyze the Play Result";
          case 7: return "7. Stamina & Timeouts";
          default: return "";
        }
      };

      const getTutorialText = () => {
        switch (tutorialStep) {
          case 1:
            return "You are now in the Tactical Phase. Here you can inspect team chemistry, view bench depth, or call timeouts. At the start of a quarter, you can make substitutions without using a timeout. Click the button in the Action Console to start the play!";
          case 2:
            return playerPossession
              ? "You have the ball! Click on one of your active starters on the court (the bottom row of cards) to designate them as the shooter. Tip: Pick a player with a high rating in the shot type you want to take (like 3PT or Rim) to beat the defender's contest!"
              : "Opponent has declared an attack! Click on any of your active starters to match up as the defender. You are free to choose any defender you want! Pick a player with high Perimeter Defense (PRD) to contest mid-range or 3pt shots, or a player with high Rim Protection (RMP) to contest rim attacks or 3-point plays.";
          case 3:
            return "Now choose your shot in the Action Console: choose between a Mid-Range Pull-Up (2 pts, uses MID), an Attack to the Basket (2 pts, uses RIM), a 3-Pointer (3 pts, uses 3PT, limit 6), or a 3-Point Play (3 pts, uses ATH, limit 6). Pick a shooter with high attributes for that specific shot!";
          case 4:
            return "You selected your shot! Now the CPU is matching up a defender on court. Prepare for the contest roll in the center spotlight.";
          case 5:
            return "It's time for the matchup roll! Attacker's shot rating and Defender's hybrid contest (70% of Perimeter/Rim Defense + 30% of shot rating) are compiled with active perks (like Stepback Maestro or Glove Defense). In the 4th Quarter, Clutch ratings add a boost! Then, a coin flip is spun: HEADS grants offense +4 (or +6), while TAILS grants defense +4. Highest final rating wins the bucket! Click the button to flip.";
          case 6:
            return "The play is resolved! Check the Play-by-Play Commentary log at the top right to see exactly which perks triggered and what scores were reached. Click the button in the Action Console to advance to the next possession.";
          case 7:
            return "Possession 2 is starting! Notice your active players' Stamina has depleted. Each matchup drains stamina. If a player drops to 20 or below, they get Gassed and suffer a heavy -15 ratings penalty. Click the stopwatch button below to call a Timeout; this rests starters and heals bench cards (+20 Stamina) so you can rotate them in!";
          default:
            return "";
        }
      };

      const getTutorialAlignmentClass = () => {
        switch (tutorialStep) {
          case 1: return "fixed top-16 left-1/2 -translate-x-1/2 w-[92%] max-w-sm sm:max-w-md lg:absolute lg:top-auto lg:bottom-[340px] lg:right-6 lg:left-auto lg:translate-x-0 lg:max-w-xs z-50";
          case 2: return "fixed top-16 left-1/2 -translate-x-1/2 w-[92%] max-w-sm sm:max-w-md lg:absolute lg:top-[20%] lg:left-[24%] lg:bottom-auto lg:right-auto lg:translate-x-0 lg:max-w-xs z-50";
          case 3: return "fixed top-16 left-1/2 -translate-x-1/2 w-[92%] max-w-sm sm:max-w-md lg:absolute lg:top-auto lg:bottom-[340px] lg:right-6 lg:left-auto lg:translate-x-0 lg:max-w-xs z-50";
          case 4: return "fixed top-16 left-1/2 -translate-x-1/2 w-[92%] max-w-sm sm:max-w-md lg:absolute lg:top-[30%] lg:left-[24%] lg:bottom-auto lg:right-auto lg:translate-x-0 lg:max-w-xs z-50";
          case 5: return "fixed top-16 left-1/2 -translate-x-1/2 w-[92%] max-w-sm sm:max-w-md lg:absolute lg:top-auto lg:bottom-[340px] lg:right-6 lg:left-auto lg:translate-x-0 lg:max-w-xs z-50";
          case 6: return "fixed top-16 left-1/2 -translate-x-1/2 w-[92%] max-w-sm sm:max-w-md lg:absolute lg:top-auto lg:bottom-[340px] lg:right-6 lg:left-auto lg:translate-x-0 lg:max-w-xs z-50";
          case 7: return "fixed top-16 left-1/2 -translate-x-1/2 w-[92%] max-w-sm sm:max-w-md lg:absolute lg:top-auto lg:bottom-[340px] lg:right-6 lg:left-auto lg:translate-x-0 lg:max-w-xs z-50";
          default: return "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 z-50";
        }
      };

      const getTutorialBtnText = () => {
        switch (tutorialStep) {
          case 4: return "See Contest Matchup";
          case 7: return "End Tutorial";
          default: return null;
        }
      };

      const handleTutorialBtnAction = () => {
        if (tutorialStep === 4) {
          const attCard = playerCards.find(x => x.id === selectedAttackerId);
          if (attCard) {
            makeCpuDefensiveContest(attCard);
          }
        } else if (tutorialStep === 7) {
          setTutorialStep(null);
        }
      };
      
      // Set up auto scroll for log
      useEffect(() => {
        if (logScrollRef) {
          logScrollRef.scrollTop = logScrollRef.scrollHeight;
        }
      }, [gameLog, logScrollRef]);

      // Online Matchmaker search text simulator
      useEffect(() => {
        let timer;
        if (gameState === 'searching') {
          setMatchmakingProgress(0);
          setMatchmakingLogs(['Initializing HoopTactics Matchmaking Protocol...', 'Searching for active coaches...']);
          
          const names = ['MambaMentality8', 'CurryChef30', 'NYKnicksFanatic', 'KingJamesFan', 'CelticsPride04', 'LobCityRetro', 'WindyCityGlory'];
          const pickedName = names[Math.floor(Math.random() * names.length)];
          setOpponentName(pickedName);

          let step = 0;
          timer = setInterval(() => {
            step += 1;
            setMatchmakingProgress(step * 20);
            
            if (step === 1) {
              setMatchmakingLogs(prev => [...prev, 'Matching queue latency: 28ms...']);
            } else if (step === 2) {
              setMatchmakingLogs(prev => [...prev, `Virtual server linked. Found Coach: ${pickedName}...`]);
            } else if (step === 3) {
              setMatchmakingLogs(prev => [...prev, 'Exchanging sports card registries...']);
            } else if (step === 4) {
              setMatchmakingLogs(prev => [...prev, 'Validating 10-card deck composition...']);
            } else if (step === 5) {
              clearInterval(timer);
              triggerToast(`Match Found! Playing against ${pickedName}`);
              startMatch(pickedName);
            }
          }, 1000);
        }
        return () => clearInterval(timer);
      }, [gameState]);

      // Mock chat text bubbles popping up during online matches
      useEffect(() => {
        let chatTimer;
        if (gameState === 'playing' && opponentType === 'online') {
          const chats = [
            "Good luck, Coach!",
            "Whoa, nice card!",
            "I need a timeout, my guys are gassed.",
            "Defense wins championships!",
            "Brunson is automatic from there!",
            "Wow, coin flip saved you!",
            "Close match, let's go!",
            "Sudden Death? OMG."
          ];
          
          chatTimer = setInterval(() => {
            if (Math.random() > 0.6) {
              const msg = chats[Math.floor(Math.random() * chats.length)];
              setMockChatLog(prev => [...prev, { sender: opponentName, msg, id: Date.now() }]);
              // Filter after 4 seconds
              setTimeout(() => {
                setMockChatLog(prev => prev.filter(x => Date.now() - x.id < 4000));
              }, 4000);
            }
          }, 12000);
        }
        return () => clearInterval(chatTimer);
      }, [gameState, opponentName, opponentType]);

      // Claim Starter Deck
      const claimStarterDeck = () => {
        const starIds = [
          'george-mikan-1948-bowman',
          'bill-russell-1957-topps',
          'jerry-west-1961-fleer',
          'michael-jordan-1986-fleer',
          'larry-bird-1980-topps',
          'magic-johnson-1980-topps',
          'stephen-curry-2012-prizm',
          'lebron-james-1996-topps-chrome',
          'jalen-brunson-2025-topps-finest',
          'tim-duncan-1996-topps-chrome'
        ];
        
        starIds.forEach(id => {
          if (!userCollection.includes(`${id}::Base`)) {
            toggleCollection(`${id}::Base`);
          }
        });
        
        triggerToast('Claimed HoopTactics 10-Card Starter Deck!');
      };

      // Helper to generate optimized and randomized 10-card deck
      const getOptimizedDeck = (isCpu, ownedOnly = false) => {
        const basketCards = (isCpu && !ownedOnly) 
          ? SPORTS_CARDS.filter(c => c.sport === 'Basketball')
          : collection.map(id => SPORTS_CARDS.find(c => c.id === id)).filter(Boolean);
        
        if (basketCards.length < 10) return null;

        const startersSelection = [];
        const benchSelection = [];
        const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
        const assignedIds = new Set();

        // Shuffle the pool of basketball cards to ensure randomness
        const shuffledPool = basketCards
          .map(value => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value);

        // 1. Assign starters by finding one card of each position from the pool first to optimize chemistry
        positions.forEach(pos => {
          const candidate = shuffledPool.find(c => getCardGameStats(c).pos === pos && !assignedIds.has(c.id));
          if (candidate) {
            startersSelection.push(candidate.id);
            assignedIds.add(candidate.id);
          }
        });

        // 2. If starters not full, backfill from the remaining cards in the shuffled pool
        shuffledPool.forEach(c => {
          if (startersSelection.length < 5 && !assignedIds.has(c.id)) {
            startersSelection.push(c.id);
            assignedIds.add(c.id);
          }
        });

        // 3. Fill bench with 5 cards from the remaining pool
        shuffledPool.forEach(c => {
          if (benchSelection.length < 5 && !assignedIds.has(c.id)) {
            benchSelection.push(c.id);
            assignedIds.add(c.id);
          }
        });

        return { starters: startersSelection, bench: benchSelection };
      };

      // Auto build deck maximizing chemistry with randomized options
      const autoBuildDeck = () => {
        const isCpu = opponentType === 'cpu';
        const deck = getOptimizedDeck(isCpu, vaultOwnedOnly);
        if (!deck) {
          triggerToast(isCpu ? 'Database does not contain enough basketball cards.' : 'Not enough cards in collection. Need at least 10.');
          return;
        }

        setSelectedDeckIds([...deck.starters, ...deck.bench]);
        setStarters(deck.starters);
        setBench(deck.bench);
        triggerToast('Auto-built randomized lineup with optimized chemistry!');
      };

      // Chemistry Penalty Calculator
      const getChemistryPenalty = (startersList) => {
        if (startersList.length === 0) return 0;
        const requiredPositions = ['PG', 'SG', 'SF', 'PF', 'C'];
        const currentPositions = new Set(startersList.map(id => {
          const c = SPORTS_CARDS.find(x => x.id === id);
          return getCardGameStats(c).pos;
        }));
        
        let missing = 0;
        requiredPositions.forEach(p => {
          if (!currentPositions.has(p)) missing++;
        });
        return missing * -5;
      };

      // Opponent Deck Generator (CPU or simulated online)
      const generateOpponentDeck = (isCPU, diff) => {
        // Pull 10 random/themed basketball cards from SPORTS_CARDS
        const basketballPool = SPORTS_CARDS.filter(c => c.sport === 'Basketball');
        let selectedOppCards = [];

        // Different themes based on difficulty/mode
        if (!isCPU) {
          // Online themed teams
          const themes = [
            // 3-point shooters
            ['stephen-curry-2012-prizm::Base', 'kyrie-irving-1980-topps::Base', 'ray-allen-2003-exquisite::Base', 'dirk-nowitzki-2003-exquisite::Base', 'nikola-jokic-2019-mosaic::Base'],
            // Physical superstars
            ['magic-johnson-1980-topps::Base', 'michael-jordan-1986-fleer::Base', 'lebron-james-1996-topps-chrome::Base', 'giannis-antetokounmpo-2012-select::Base', 'shaquille-oneal-2003-exquisite::Base'],
            // New Knicks era
            ['jalen-brunson-2025-topps-finest::Base', 'john-starks-1993-finest::Base', 'mikal-bridges::Base', 'carmelo-anthony-2012-prizm::Base', 'patrick-ewing-1991-upper-deck::Base']
          ];
          const chosenTheme = themes[Math.floor(Math.random() * themes.length)];
          
          chosenTheme.forEach(id => {
            const c = SPORTS_CARDS.find(x => x.id === id || x.id.startsWith(id.split('::')[0]));
            if (c) selectedOppCards.push(c);
          });
          
          // Backfill bench randomly
          while (selectedOppCards.length < 10) {
            const rand = basketballPool[Math.floor(Math.random() * basketballPool.length)];
            if (!selectedOppCards.some(x => x.id === rand.id)) {
              selectedOppCards.push(rand);
            }
          }
        } else {
          // CPU deck scaling by difficulty
          let sortedPool = [...basketballPool].sort((a, b) => getCardGameStats(b).ovr - getCardGameStats(a).ovr);
          
          if (diff === 'rookie') {
            // Pick mediocre cards
            const slice = sortedPool.slice(Math.floor(sortedPool.length * 0.4), Math.floor(sortedPool.length * 0.8));
            for (let i = 0; i < 10; i++) {
              selectedOppCards.push(slice[i % slice.length]);
            }
          } else if (diff === 'veteran') {
            // Mid-tier cards
            const slice = sortedPool.slice(Math.floor(sortedPool.length * 0.15), Math.floor(sortedPool.length * 0.5));
            for (let i = 0; i < 10; i++) {
              selectedOppCards.push(slice[i % slice.length]);
            }
          } else {
            // Hall of famer gets whales/superstars
            for (let i = 0; i < 10; i++) {
              selectedOppCards.push(sortedPool[i % sortedPool.length]);
            }
          }
        }

        // Optimize chemistry for CPU starters (first 5 cards) by selecting PG, SG, SF, PF, C from the 10 cards
        const optimizedOppCards = [];
        const oppAssigned = new Set();
        const positionsList = ['PG', 'SG', 'SF', 'PF', 'C'];
        
        positionsList.forEach(pos => {
          const cand = selectedOppCards.find(c => getCardGameStats(c).pos === pos && !oppAssigned.has(c.id));
          if (cand) {
            optimizedOppCards.push(cand);
            oppAssigned.add(cand.id);
          }
        });
        
        selectedOppCards.forEach(c => {
          if (optimizedOppCards.length < 5 && !oppAssigned.has(c.id)) {
            optimizedOppCards.push(c);
            oppAssigned.add(c.id);
          }
        });
        
        selectedOppCards.forEach(c => {
          if (!oppAssigned.has(c.id)) {
            optimizedOppCards.push(c);
            oppAssigned.add(c.id);
          }
        });

        // Map to dynamic state rosters
        return optimizedOppCards.map(c => ({
          ...c,
          currentSta: getCardGameStats(c).sta,
          gassed: false,
          usedGrailPerk: false,
          threesAttempted: 0,
          and1sAttempted: 0
        }));
      };

      // Start Match logic
      const startMatch = (oppName = 'CPU Coach', customStarters = null, customBench = null) => {
        const activeStarters = customStarters || starters;
        const activeBench = customBench || bench;
        
        // Form player deck dynamic state
        const pStarters = activeStarters.map(id => {
          const c = SPORTS_CARDS.find(x => x.id === id) || SPORTS_CARDS[0];
          return { ...c, currentSta: getCardGameStats(c).sta, gassed: false, usedGrailPerk: false, threesAttempted: 0, and1sAttempted: 0 };
        });
        const pBench = activeBench.map(id => {
          const c = SPORTS_CARDS.find(x => x.id === id) || SPORTS_CARDS[1];
          return { ...c, currentSta: getCardGameStats(c).sta, gassed: false, usedGrailPerk: false, threesAttempted: 0, and1sAttempted: 0 };
        });
        
        setPlayerCards([...pStarters, ...pBench]);
        setSelectedGrailUsed(false);
        setOppGrailUsed(false);

        // Opponent deck
        const isCPU = opponentType === 'cpu';
        const oppRoster = generateOpponentDeck(isCPU, cpuDifficulty);
        setOpponentCards(oppRoster);

        // Tip off logic
        // Find starting Centers
        const pCenter = pStarters.find(c => getCardGameStats(c).pos === 'C') || pStarters[0];
        const oCenter = oppRoster.slice(0, 5).find(c => getCardGameStats(c).pos === 'C') || oppRoster[0];

        const pCenterOff = getCardGameStats(pCenter).off + getChemistryPenalty(activeStarters);
        const oCenterOff = getCardGameStats(oCenter).off + getChemistryPenalty(oppRoster.slice(0, 5).map(x => x.id));

        const pWinsTip = pCenterOff > oCenterOff || (pCenterOff === oCenterOff && Math.random() > 0.5);
        
        setPlayerPossession(pWinsTip);
        setPossessionCount(1);
        setPlayerScore(0);
        setOpponentScore(0);
        setPlayerTimeouts(4);
        setOpponentTimeouts(4);
        setLastScorer(null);
        setGamePhase('tactical');
        setIsOvertime(false);
        setWasOvertime(false);
        
        // Initial comment logs
        const initialLogs = [
          "----------------------------------------",
          "🏟️ WELCOME TO THE HOOPTACTICS ARENA 🏟️",
          `Teams take the court! Coach ${favorites?.username || 'Player'} vs Coach ${oppName}`,
          `Player Team Chemistry Rating: ${getChemistryPenalty(activeStarters)} Bonus/Penalty`,
          `Opponent Team Chemistry Rating: ${getChemistryPenalty(oppRoster.slice(0, 5).map(x => x.id))} Bonus/Penalty`,
          "----------------------------------------",
          `Tip-Off: ${pCenter.player} vs ${oCenter.player}`,
          pWinsTip 
            ? `🔥 ${pCenter.player} wins the jump ball! Possession: PLAYER.` 
            : `🛑 ${oCenter.player} wins the jump ball! Possession: OPPONENT.`
        ];
        
        setGameLog(initialLogs);
        setGameState('playing');
        setIsGameActive(true);
      };

      // Substitute player swap handler
      const executeSub = (onCourtId, benchId, isPlayer) => {
        if (isPlayer) {
          const courtIdx = starters.indexOf(onCourtId);
          const benchIdx = bench.indexOf(benchId);
          
          if (courtIdx !== -1 && benchIdx !== -1) {
            const newStarters = [...starters];
            const newBench = [...bench];
            
            newStarters[courtIdx] = benchId;
            newBench[benchIdx] = onCourtId;
            
            setStarters(newStarters);
            setBench(newBench);

            // Log change
            const outC = SPORTS_CARDS.find(x => x.id === onCourtId);
            const inC = SPORTS_CARDS.find(x => x.id === benchId);
            setGameLog(prev => [...prev, `🔄 SUB: ${inC.player} comes in for ${outC.player}.`]);
          }
        } else {
          // CPU substitution
          const oppStarters = opponentCards.slice(0, 5);
          const oppBench = opponentCards.slice(5, 10);
          
          const courtIdx = oppStarters.findIndex(x => x.id === onCourtId);
          const benchIdx = oppBench.findIndex(x => x.id === benchId);

          if (courtIdx !== -1 && benchIdx !== -1) {
            const newOppRoster = [...opponentCards];
            
            // Swap places
            const temp = newOppRoster[courtIdx];
            newOppRoster[courtIdx] = newOppRoster[5 + benchIdx];
            newOppRoster[5 + benchIdx] = temp;
            
            setOpponentCards(newOppRoster);

            const outC = opponentCards[courtIdx];
            const inC = opponentCards[5 + benchIdx];
            setGameLog(prev => [...prev, `🔄 CPU SUB: ${inC.player} comes in for ${outC.player}.`]);
          }
        }
      };

      // Swap logic for timeout substitutions (drag & drop and tap-to-swap)
      const handleDragDropSwap = (idA, idB) => {
        const isStarterA = starters.includes(idA);
        const isStarterB = starters.includes(idB);
        
        if (isStarterA === isStarterB) {
          triggerToast("To substitute, drag a starter to the bench or a bench player to a starter.");
          return;
        }
        
        const starterId = isStarterA ? idA : idB;
        const benchId = isStarterA ? idB : idA;
        
        executeSub(starterId, benchId, true);
      };

      // Timeout triggering
      const callTimeout = (isPlayer) => {
        if (isPlayer) {
          if (playerTimeouts <= 0) return;
          
          if (isTutorialMatch && tutorialStep === 7) {
            setTutorialStep(null);
          }
          
          // Check requirements: on Offense or entering Defense immediately after opponent scores
          const allowed = playerPossession || (!playerPossession && lastScorer === 'opponent') || (isTutorialMatch && tutorialStep === 7);
          if (!allowed) {
            triggerToast("Can only call timeout on Offense or immediately after opponent scores.");
            return;
          }

          setPlayerTimeouts(playerTimeouts - 1);
          
          // Heal resting bench players by +20 Stamina
          const updatedCards = playerCards.map((c, idx) => {
            const isStarter = starters.includes(c.id);
            if (!isStarter) {
              const maxS = getCardGameStats(c).sta;
              const newS = Math.min(maxS, c.currentSta + 20);
              return { ...c, currentSta: newS, gassed: newS <= 20 };
            }
            return c;
          });
          setPlayerCards(updatedCards);
          
          setGameLog(prev => [...prev, "🚨 TIMEOUT: Player calls a Timeout! Rested bench players recover +20 Stamina."]);
          setSubsActive(true);
          
          // Trigger timeout overlay sequence
          setTimeoutActive(true);
          setTimeoutCaller('player');
          // Note: No auto-dismiss for player timeout, so player has time to sub and view stamina guide!
        } else {
          // CPU calls timeout
          if (opponentTimeouts <= 0) return;
          setOpponentTimeouts(opponentTimeouts - 1);

          // CPU bench heals
          const newOppRoster = opponentCards.map((c, idx) => {
            if (idx >= 5) {
              const maxS = getCardGameStats(c).sta;
              const newS = Math.min(maxS, c.currentSta + 20);
              return { ...c, currentSta: newS, gassed: newS <= 20 };
            }
            return c;
          });
          setOpponentCards(newOppRoster);

          setGameLog(prev => [...prev, `🚨 TIMEOUT: Coach ${opponentName} calls a Timeout! CPU bench recovers +20 Stamina.`]);
          
          // CPU smart rotation
          // Swap gassed starters with healthiest bench players
          const startersList = newOppRoster.slice(0, 5);
          const benchList = newOppRoster.slice(5, 10);
          
          startersList.forEach((c, cIdx) => {
            if (c.currentSta <= 25) {
              // Find healthiest matching position or best bench card
              const posToMatch = getCardGameStats(c).pos;
              let bestBenchIdx = -1;
              let maxBenchSta = -1;

              benchList.forEach((bc, bcIdx) => {
                if (bc.currentSta > maxBenchSta) {
                  maxBenchSta = bc.currentSta;
                  bestBenchIdx = bcIdx;
                }
              });

              if (bestBenchIdx !== -1 && maxBenchSta > 40) {
                // Swap in the database representation
                const courtId = c.id;
                const benchId = benchList[bestBenchIdx].id;
                
                const temp = newOppRoster[cIdx];
                newOppRoster[cIdx] = newOppRoster[5 + bestBenchIdx];
                newOppRoster[5 + bestBenchIdx] = temp;
                
                setGameLog(prev => [...prev, `🔄 CPU SUB: ${newOppRoster[cIdx].player} enters for gassed ${temp.player}.`]);
              }
            }
          });

          setOpponentCards(newOppRoster);

          // Trigger timeout overlay sequence
          setTimeoutActive(true);
          setTimeoutCaller('opponent');
          setTimeout(() => {
            setTimeoutActive(false);
            setTimeoutCaller(null);
          }, 6500);
        }
      };

      // CPU Offensive move selection
      const makeCpuOffensiveMove = () => {
        const oppStarters = opponentCards.slice(0, 5);
        if (oppStarters.length === 0) {
          console.warn("makeCpuOffensiveMove: opponent starters are empty!");
          return;
        }
        
        // Select shooter: best OVR/OFF starter that is not gassed
        const eligibleShooters = oppStarters.sort((a, b) => {
          const statsA = getCardGameStats(a);
          const statsB = getCardGameStats(b);
          return statsB.off - statsA.off;
        });

        // Pick the top shooter
        const shooter = eligibleShooters[0];
        if (!shooter) return;
        const shooterStats = getCardGameStats(shooter);
        setSelectedAttackerId(shooter.id);

        const isGassed = shooter.currentSta <= 20 && !shooterStats.perks.some(p => p.name === 'Heavy Duty');

        // Decide 2pt vs 3-point attempt
        let select3pt = false;
        if (!isGassed) {
          const rate = cpuDifficulty === 'rookie' ? 0.2 : cpuDifficulty === 'veteran' ? 0.35 : 0.5;
          select3pt = Math.random() < rate;
        }

        let chosenShotType = 'mid_range';

        if (select3pt) {
          if (shooterStats.primaryBadge.type === 'three_pointer') {
            const limit = 6 + (shooterStats.perks.some(p => p.name === 'Sniper Zone') ? 1 : 0);
            if ((shooter.threesAttempted || 0) < limit) {
              chosenShotType = 'three_pointer';
            } else {
              select3pt = false;
            }
          } else {
            if ((shooter.and1sAttempted || 0) < 6) {
              chosenShotType = 'three_point_play';
            } else {
              select3pt = false;
            }
          }
        }

        // If 2pt (either chosen initially or fallback from 3pt limit)
        if (!select3pt) {
          // Choose between mid-range and rim attack based on higher rating
          if (shooterStats.mid >= shooterStats.rim) {
            chosenShotType = 'mid_range';
          } else {
            chosenShotType = 'attack_rim';
          }
        }

        setShotType(chosenShotType);
        setGamePhase('contest');
        
        if (chosenShotType === 'three_pointer') {
          setGameLog(prev => [...prev, `🏀 Opponent Declares Attack: ${shooter.player} (${shooterStats.pos}) fires a 3-Pointer.`]);
        } else if (chosenShotType === 'three_point_play') {
          setGameLog(prev => [...prev, `⚡ Opponent Declares Attack: ${shooter.player} (${shooterStats.pos}) drives for a 3-Point Play opportunity.`]);
        } else if (chosenShotType === 'mid_range') {
          setGameLog(prev => [...prev, `🏀 Opponent Declares Attack: ${shooter.player} (${shooterStats.pos}) attempts a Mid-Range Pull-Up.`]);
        } else {
          setGameLog(prev => [...prev, `🏀 Opponent Declares Attack: ${shooter.player} (${shooterStats.pos}) attacks the Basket.`]);
        }
      };

      // CPU Defensive Matchup selector
      const makeCpuDefensiveContest = (attackerCard) => {
        const oppStarters = opponentCards.slice(0, 5);
        if (oppStarters.length === 0) {
          console.warn("makeCpuDefensiveContest: opponent starters are empty!");
          return;
        }

        // Pick based on difficulty and shot type
        let defender;
        if (cpuDifficulty === 'rookie') {
          // Pick a random defender from starters
          defender = oppStarters[Math.floor(Math.random() * oppStarters.length)];
        } else {
          // Choose based on shot type: Rim plays check Rim Protection (rimDef), Perimeter plays check Perimeter Defense (perDef)
          const isRimPlay = shotType === 'attack_rim' || shotType === 'three_point_play';
          if (isRimPlay) {
            defender = [...oppStarters].sort((a, b) => getCardGameStats(b).rimDef - getCardGameStats(a).rimDef)[0];
          } else {
            defender = [...oppStarters].sort((a, b) => getCardGameStats(b).perDef - getCardGameStats(a).perDef)[0];
          }
        }

        if (!defender) {
          defender = oppStarters[0];
        }
        if (!defender) return;

        setSelectedDefenderId(defender.id);
        setGameLog(prev => [...prev, `🛡️ Opponent Contest: Coach ${opponentName} matches ${defender.player} (${getCardGameStats(defender).pos}) on defense.`]);
        setGamePhase('resolve');
      };

      // Action: Continue from Phase 1 to Phase 2 (Attack)
      const handleProceedToAttack = () => {
        setSubsActive(false);
        setIsTimeoutWindow(false);
        
        if (playerPossession) {
          setGamePhase('attack');
        } else {
          // CPU makes its shooter choice
          makeCpuOffensiveMove();
        }
      };

      // Action: Offense shooter selected
      const handleSelectShooter = (cardId, typeOfShot) => {
        setSelectedAttackerId(cardId);
        setShotType(typeOfShot);
        
        const card = SPORTS_CARDS.find(x => x.id === cardId);
        const stats = getCardGameStats(card);
        let shotText = '';
        if (typeOfShot === 'three_pointer') shotText = 'fires a 3-Pointer';
        else if (typeOfShot === 'three_point_play') shotText = 'drives for a 3-Point Play (And-1)';
        else if (typeOfShot === 'mid_range') shotText = 'attempts a Mid-Range Pull-Up';
        else shotText = 'attacks the Basket';

        setGameLog(prev => [...prev, `🏀 Player Declares Attack: ${card.player} (${stats.pos}) ${shotText}.`]);
        
        setGamePhase('contest');

        // CPU defending: CPU responds with defender selection
        if (!playerPossession) {
          // should not happen since player is on offense
        } else {
          if (isTutorialMatch && tutorialStep !== null) {
            // In the tutorial, do not trigger CPU contest choice automatically.
            // Let the player read step 4 and click "See Contest Matchup".
          } else {
            // Run CPU defender contest choice after a 600ms tactical delay
            setTimeout(() => {
              makeCpuDefensiveContest(card);
            }, 600);
          }
        }
      };

      // Action: Defense defender selected (User choice)
      const handleSelectDefender = (cardId) => {
        const defenderCard = playerCards.find(x => x.id === cardId);
        if (!defenderCard) return;

        setSelectedDefenderId(cardId);
        setGameLog(prev => [...prev, `🛡️ Player Contest: You assign ${defenderCard.player} to guard the play.`]);
        setGamePhase('resolve');
      };

      // Helper to compute matchup ratings including all bonuses/penalties
      const getMatchupRatings = (attCard, defCard, activeShotType, possessionCount, playerPossession) => {
        if (!attCard || !defCard) return { finalAtt: 0, finalDef: 0, isInteriorPlay: false, attClutchBoost: 0, defClutchBoost: 0, positionMatch: 0 };
        
        const attackerHT = getCardGameStats(attCard);
        const defenderHT = getCardGameStats(defCard);

        const attackerRoster = playerPossession ? playerCards.slice(0, 5) : opponentCards.slice(0, 5);
        let floorGeneralBoost = 0;
        attackerRoster.forEach(tm => {
          if (tm.id !== attCard.id) {
            const tmStats = getCardGameStats(tm);
            if (tmStats.perks.some(p => p.name === 'Floor General')) {
              floorGeneralBoost += 3;
            }
          }
        });

        const hasShinyReflector = defenderHT.perks.some(p => p.name === 'Shiny Reflector');
        const hasEraser = defenderHT.perks.some(p => p.name === 'Eraser');
        const hasAnkleBreaker = attackerHT.perks.some(p => p.name === 'Ankle Breaker');
        const hasHeavyDutyAtt = attackerHT.perks.some(p => p.name === 'Heavy Duty');
        const hasHeavyDutyDef = defenderHT.perks.some(p => p.name === 'Heavy Duty');

        const pChem = playerPossession ? getChemistryPenalty(starters) : getChemistryPenalty(opponentCards.slice(0, 5).map(x => x.id));
        const oChem = playerPossession ? getChemistryPenalty(opponentCards.slice(0, 5).map(x => x.id)) : getChemistryPenalty(starters);

        const attGassed = attCard.currentSta <= 20 && !hasHeavyDutyAtt;
        const defGassed = defCard.currentSta <= 20 && !hasHeavyDutyDef;

        const isQ4 = possessionCount >= 25 && possessionCount <= 32;
        const attClutch = isQ4 && attackerHT.perks.some(p => p.name === 'Clutch Gene');
        const defClutch = isQ4 && defenderHT.perks.some(p => p.name === 'Clutch Gene');
        const attSigClutch = isQ4 && attackerHT.perks.some(p => p.name === 'Signature Clutch');
        const defSigClutch = isQ4 && defenderHT.perks.some(p => p.name === 'Signature Clutch');

        let tnOffBonus = 0;
        let tnDefBonus = 0;
        if (isQ4) {
          if (attackerHT.perks.some(p => p.name === 'Topps Now: Clutch Master')) tnOffBonus += 5;
          if (defenderHT.perks.some(p => p.name === 'Topps Now: ECF MVP')) tnDefBonus += 10;
        }

        let cpuDifficultyModifier = 0;
        if (cpuDifficulty === 'hall-famer') {
          cpuDifficultyModifier = 2;
        }

        let attBaseVal = 0;
        let defBaseVal = 0;
        const isInteriorPlay = activeShotType === 'attack_rim' || activeShotType === 'three_point_play';

        if (activeShotType === 'mid_range') {
          attBaseVal = attackerHT.mid;
          defBaseVal = defenderHT.perDef * 0.7 + defenderHT.mid * 0.3;
        } else if (activeShotType === 'attack_rim') {
          attBaseVal = attackerHT.rim;
          defBaseVal = defenderHT.rimDef * 0.7 + defenderHT.ath * 0.3;
        } else if (activeShotType === 'three_pointer') {
          attBaseVal = attackerHT.tpt;
          defBaseVal = defenderHT.perDef * 0.7 + defenderHT.tpt * 0.3;
        } else if (activeShotType === 'three_point_play') {
          attBaseVal = attackerHT.ath;
          defBaseVal = defenderHT.rimDef * 0.7 + defenderHT.ath * 0.3;
        }

        const positionMatch = defenderHT.pos === attackerHT.pos ? 2 : 0;
        const attClutchBoost = isQ4 ? Math.round((attackerHT.clu - 50) / 4) : 0;
        const defClutchBoost = isQ4 ? Math.round((defenderHT.clu - 50) / 4) : 0;

        let finalAtt = attBaseVal + (playerPossession ? pChem : oChem) + (attGassed ? -15 : 0) + (attClutch ? 10 : 0) + (attSigClutch ? 8 : 0) + attClutchBoost + floorGeneralBoost + tnOffBonus + (!playerPossession ? cpuDifficultyModifier : 0);
        let finalDef = defBaseVal + (playerPossession ? oChem : pChem) + (defGassed ? -15 : 0) + (defClutch ? 10 : 0) + (defSigClutch ? 8 : 0) + defClutchBoost + positionMatch + (hasShinyReflector ? 5 : 0) + (hasEraser && isInteriorPlay ? 8 : 0) + tnDefBonus + (playerPossession ? cpuDifficultyModifier : 0);

        if (hasAnkleBreaker) {
          finalDef -= 8;
        }

        return {
          finalAtt: Math.max(0, Math.round(finalAtt)),
          finalDef: Math.max(0, Math.round(finalDef)),
          isInteriorPlay,
          attClutchBoost,
          defClutchBoost,
          positionMatch
        };
      };

      // Execute Shot Resolution
      const resolveShotPlay = (useGrailPerk = false) => {
        const grailUser = useGrailPerk === true ? (playerPossession ? 'player' : 'opponent') : useGrailPerk;
        
        // Pre-determine coin flip result for rendering & animation
        const flip = Math.random() > 0.5 ? 'heads' : 'tails';
        setCoinResult(flip);
        setCoinFlipId(prev => prev + 1);
        setCoinFlipping(true);

        const attacker = playerPossession 
          ? playerCards.find(x => x.id === selectedAttackerId) 
          : opponentCards.slice(0, 5).find(x => x.id === selectedAttackerId);
          
        const defender = playerPossession
          ? opponentCards.slice(0, 5).find(x => x.id === selectedDefenderId)
          : playerCards.find(x => x.id === selectedDefenderId);

        // Core stats
        const attackerHT = getCardGameStats(attacker);
        const defenderHT = getCardGameStats(defender);

        const attackerRoster = playerPossession ? playerCards.slice(0, 5) : opponentCards.slice(0, 5);
        let floorGeneralBoost = 0;
        attackerRoster.forEach(tm => {
          if (tm.id !== attacker.id) {
            const tmStats = getCardGameStats(tm);
            if (tmStats.perks.some(p => p.name === 'Floor General')) {
              floorGeneralBoost += 3;
            }
          }
        });

        // Other active defense/offense perks
        const hasAnkleBreaker = attackerHT.perks.some(p => p.name === 'Ankle Breaker');
        const hasEraser = defenderHT.perks.some(p => p.name === 'Eraser');
        const hasGlove = defenderHT.perks.some(p => p.name === 'Glove Defense');
        const hasShinyReflector = defenderHT.perks.some(p => p.name === 'Shiny Reflector');
        const hasHeavyDutyAtt = attackerHT.perks.some(p => p.name === 'Heavy Duty');
        const hasHeavyDutyDef = defenderHT.perks.some(p => p.name === 'Heavy Duty');

        const attGassed = attacker.currentSta <= 20 && !hasHeavyDutyAtt;
        const defGassed = defender.currentSta <= 20 && !hasHeavyDutyDef;
        const isQ4 = possessionCount >= 25 && possessionCount <= 32;

        // Defensive Anchor restriction check
        let activeShotType = shotType;
        const hasDefensiveAnchor = defenderHT.perks.some(p => p.name === 'Defensive Anchor');
        if (hasDefensiveAnchor && (activeShotType === 'three_pointer' || activeShotType === 'three_point_play')) {
          if (activeShotType === 'three_pointer') {
            activeShotType = 'mid_range';
            setGameLog(prev => [...prev, `🛡️ DEFENSIVE ANCHOR: ${defender.player} locks down the perimeter! Shot downgraded to a Mid-Range Pull-Up.`]);
          } else {
            activeShotType = 'attack_rim';
            setGameLog(prev => [...prev, `🛡️ DEFENSIVE ANCHOR: ${defender.player} prevents the drive and-one! Play downgraded to an Attack to the Basket.`]);
          }
        }

        // Calculate matchup ratings using helper
        const { finalAtt, finalDef, isInteriorPlay, attClutchBoost, defClutchBoost, positionMatch } = getMatchupRatings(attacker, defender, activeShotType, possessionCount, playerPossession);

        // Set delay for simulated coin spin
        setTimeout(() => {
          let scoreGained = false;
          let pointsScored = 0;
          let isAnd1Opportunity = activeShotType === 'three_point_play';
          let isFouled3ptOpportunity = false;
          let ftMade = false;
          let commentary = [];

          // Log passive modifiers
          if (floorGeneralBoost > 0) {
            commentary.push(`📣 FLOOR GENERAL: Starting teammates boost Offense by +${floorGeneralBoost}!`);
          }
          if (hasAnkleBreaker) {
            commentary.push(`⚡ ANKLE BREAKER: ${attacker.player} crosses up the defender! Defender DEF -8.`);
          }
          if (hasEraser && isInteriorPlay) {
            commentary.push(`🛑 ERASER: ${defender.player} locks down the paint! Defender DEF +8.`);
          }
          if (hasShinyReflector) {
            commentary.push(`✨ SHINY REFLECTOR: Parallel card shimmer grants Defender DEF +5.`);
          }
          if (positionMatch > 0) {
            commentary.push(`🛡️ POSITION MATCHUP: Exact matchup guards PG-PG / C-C! Defender DEF +${positionMatch}.`);
          }
          if (isQ4) {
            commentary.push(`🕒 CLUTCH MOMENT (Q4): Attacker Clutch Boost +${attClutchBoost} | Defender Clutch Boost +${defClutchBoost}.`);
          }
          if (hasHeavyDutyAtt && attacker.currentSta <= 20) {
            commentary.push(`💪 HEAVY DUTY: Jersey patch shields ${attacker.player} from gassed penalty!`);
          }
          if (hasHeavyDutyDef && defender.currentSta <= 20) {
            commentary.push(`💪 HEAVY DUTY: Jersey patch shields ${defender.player} from gassed penalty!`);
          }

          let initialBucketMade = false;

          if (grailUser) {
            // Grail Bypass Roll
            if (grailUser === 'player') {
              setSelectedGrailUsed(true);
              if (playerPossession) {
                initialBucketMade = true;
                commentary.push(`👑 HALL OF FAME AURA: Attacker ${attacker.player} taps into their legends status to claim an automatic bucket!`);
              } else {
                initialBucketMade = false;
                commentary.push(`🛡️ HALL OF FAME AURA: Defender ${defender.player} invokes their legends status for an automatic stop!`);
              }
            } else {
              setOppGrailUsed(true);
              if (playerPossession) {
                initialBucketMade = false;
                commentary.push(`🛡️ OPPONENT HOF AURA: Defender ${defender.player} locks down the play for an automatic stop!`);
              } else {
                initialBucketMade = true;
                commentary.push(`👑 OPPONENT HOF AURA: Attacker ${attacker.player} taps into their legends status to claim an automatic bucket!`);
              }
            }
          } else {
            // Normal coin flip resolution (flip was pre-determined)
            
            let attackerAdjusted = finalAtt;
            let defenderAdjusted = finalDef;

            // Topps Now On Fire check / Glove Defense reduction
            const hasOnFire = attackerHT.perks.some(p => p.name === 'Topps Now: On Fire');
            let headsBonus = hasOnFire ? 6 : 4;
            if (hasGlove && flip === 'heads') {
              headsBonus = Math.max(0, headsBonus - 2);
              commentary.push(`🥊 GLOVE DEFENSE: ${defender.player} smothers the shooter! Coin flip HEADS bonus reduced to +${headsBonus}.`);
            }

            if (flip === 'heads') {
              attackerAdjusted += headsBonus;
              commentary.push(`🪙 Coin Flip: HEADS! Offensive Momentum! (+${headsBonus} OFF)`);
            } else {
              defenderAdjusted += 4;
              commentary.push(`🪙 Coin Flip: TAILS! Defensive Lockdown! (+4 DEF)`);
            }

            // Tie in 3-point Shot / Play Success Rate Scaling
            if (activeShotType === 'three_pointer') {
              const hasSniper = attackerHT.perks.some(p => p.name === 'Sniper Zone');
              let tptModifier = Math.round((attackerHT.tpt - 85) * 0.5) - 3;
              if (hasSniper && tptModifier < 0) {
                tptModifier = Math.round(tptModifier / 2);
                commentary.push(`🏀 SNIPER ZONE: 3-point shooting penalty halved for ${attacker.player}.`);
              }
              attackerAdjusted += tptModifier;
              if (tptModifier >= 0) {
                commentary.push(`🏀 3-Point Shot: ${attacker.player} (3PT: ${attackerHT.tpt}) receives a +${tptModifier} bonus.`);
              } else {
                commentary.push(`🏀 3-Point Shot: ${attacker.player} (3PT: ${attackerHT.tpt}) receives a ${tptModifier} penalty.`);
              }
            } else if (activeShotType === 'three_point_play') {
              commentary.push(`⚡ 3-Point Play Drive: ${attacker.player} (ATH: ${attackerHT.ath}) charges the rim looking for contact.`);
            }

            // Stepback Maestro perk check
            const hasStepback = attackerHT.perks.some(p => p.name === 'Stepback Maestro');
            if (hasStepback && activeShotType === 'three_pointer') {
              attackerAdjusted += 6;
              commentary.push(`⚡ STEPBACK MAESTRO: ${attacker.player} creates space! Gains +6 OFF on the 3-point attempt.`);
            }

            // Microwave perk check
            const hasMicrowave = attackerHT.perks.some(p => p.name === 'Microwave');
            const attackerScoredLast = lastScorer === (playerPossession ? 'player' : 'opponent');
            if (hasMicrowave && attackerScoredLast) {
              attackerAdjusted += 6;
              commentary.push(`🔥 MICROWAVE: ${attacker.player} is heating up! Gains +6 OFF because their team scored on the last possession.`);
            }

            commentary.push(`Final Comparison: Attack OFF [${attackerAdjusted}] vs Defense DEF [${defenderAdjusted}]`);

            // Check tiebreaker: Offensive Superstar & Posterizer perks
            const hasOffensiveSuperstar = attackerHT.perks.some(p => p.name === 'Offensive Superstar');
            const hasPosterizer = attackerHT.perks.some(p => p.name === 'Posterizer');
            
            const activeShotValue = (activeShotType === 'three_pointer' || activeShotType === 'three_point_play') ? 3 : 2;

            if (attackerAdjusted > defenderAdjusted) {
              initialBucketMade = true;
            } else if (attackerAdjusted === defenderAdjusted && (hasOffensiveSuperstar || (hasPosterizer && (activeShotValue === 2 || isAnd1Opportunity)))) {
              initialBucketMade = true;
              commentary.push(`🛡️ POSTERIZER/SUPERSTAR: Tie breaker goes to ${attacker.player}!`);
            }
          }

          if (initialBucketMade) {
            scoreGained = true;
            if (isAnd1Opportunity) {
              commentary.push(`🏀 BUCKET IS GOOD! ${attacker.player} scores the 2-pointer and draws contact inside!`);
              // Shoot free throw based on Athleticism (ATH)
              const ftChance = Math.min(0.95, Math.max(0.40, 0.75 + (attackerHT.ath - 85) * 0.01 - (attGassed ? 0.15 : 0)));
              const ftPercent = Math.round(ftChance * 100);
              commentary.push(`🪙 Free Throw Chance: ${ftPercent}% (based on Attacker ATH and Stamina)`);
              ftMade = Math.random() < ftChance;
              if (ftMade) {
                pointsScored = 3;
                commentary.push(`⚡ FREE THROW GOOD! ${attacker.player} completes the 3-Point Play (And-1)!`);
              } else {
                pointsScored = 2;
                commentary.push(`⚡ FREE THROW MISSED! ${attacker.player} misses the free throw, but keeps the 2 points from the bucket.`);
              }
            } else if (activeShotType === 'three_pointer') {
              // 3-point shot check for rare foul (10% chance)
              isFouled3ptOpportunity = Math.random() < 0.10;
              if (isFouled3ptOpportunity) {
                commentary.push(`🚨 FOUL ON THE SHOT! ${attacker.player} is fouled while releasing the 3-pointer! The shot drops!`);
                const ftChance = Math.min(0.95, Math.max(0.40, 0.75 + (attackerHT.tpt - 85) * 0.01 - (attGassed ? 0.15 : 0)));
                const ftPercent = Math.round(ftChance * 100);
                commentary.push(`🪙 Free Throw Chance: ${ftPercent}% for the Rare 4-Point Play...`);
                ftMade = Math.random() < ftChance;
                if (ftMade) {
                  pointsScored = 4;
                  commentary.push(`👑 4-POINT PLAY COMPLETE! ${attacker.player} sinks the free throw!`);
                } else {
                  pointsScored = 3;
                  commentary.push(`⚡ FREE THROW MISSED! ${attacker.player} misses the free throw, but keeps the 3-pointer.`);
                }
              } else {
                pointsScored = 3;
                commentary.push(`🏀 SCORE! The 3-point shot is GOOD for 3 Points.`);
              }
            } else {
              // Standard 2-pointer (Mid-Range or Rim Attack) or Grail automatic make
              pointsScored = (activeShotType === 'three_pointer' || activeShotType === 'three_point_play') ? 3 : 2;
              commentary.push(`🏀 SCORE! The shot is GOOD for ${pointsScored} Points.`);
            }
          } else {
            scoreGained = false;
            pointsScored = 0;
            if (isAnd1Opportunity) {
              commentary.push(`⚡ PLAY DENIED! The defense stops ${attacker.player} at the rim.`);
            } else {
              commentary.push(`🏀 MISS/TURNOVER! The defense locks down the bucket.`);
            }
          }

          if (scoreGained) {
            if (playerPossession) {
              setPlayerScore(prev => prev + pointsScored);
              setLastScorer('player');
            } else {
              setOpponentScore(prev => prev + pointsScored);
              setLastScorer('opponent');
            }
            setReboundRetained(false);
          } else {
            setLastScorer(null);

            // Rebound Check for Chairman of the Boards perk
            const hasChairman = attackerHT.perks.some(p => p.name === 'Chairman of the Boards');
            if (hasChairman && Math.random() < 0.5) {
              setReboundRetained(true);
              commentary.push(`🏀 REBOUND: ${attacker.player} (Chairman of the Boards) secures the offensive board! Possession retained.`);
            } else {
              setReboundRetained(false);
            }
          }

          // Dynamic Stamina Drain & Shot Attempt Counters
          const updatePlayerStamina = (roster) => {
            return roster.map(c => {
              const isActiveAttacker = playerPossession && c.id === selectedAttackerId;
              const isActiveDefender = !playerPossession && c.id === selectedDefenderId;
              
              let updated = { ...c };
              if (isActiveAttacker || isActiveDefender) {
                const cStats = getCardGameStats(c);
                const hasIronMan = cStats.perks.some(p => p.name === 'Iron Man');
                const drainAmt = hasIronMan ? 5 : 10;

                let extraDrain = 0;
                if (isActiveDefender && !playerPossession && (activeShotType === 'mid_range' || activeShotType === 'attack_rim' || activeShotType === 'three_point_play')) {
                  const attStats = getCardGameStats(attacker);
                  if (attStats.perks.some(p => p.name === 'Posterizer')) {
                    extraDrain = 5;
                  }
                }
                
                const newSta = Math.max(0, c.currentSta - drainAmt - extraDrain);
                updated = { ...c, currentSta: newSta, gassed: newSta <= 20 && !cStats.perks.some(p => p.name === 'Heavy Duty') };
              }
              if (isActiveAttacker) {
                if (activeShotType === 'three_pointer') {
                  updated.threesAttempted = (updated.threesAttempted || 0) + 1;
                } else if (activeShotType === 'three_point_play') {
                  updated.and1sAttempted = (updated.and1sAttempted || 0) + 1;
                }
              }
              return updated;
            });
          };

          const updateOpponentStamina = (roster) => {
            return roster.map(c => {
              const isActiveAttacker = !playerPossession && c.id === selectedAttackerId;
              const isActiveDefender = playerPossession && c.id === selectedDefenderId;

              let updated = { ...c };
              if (isActiveAttacker || isActiveDefender) {
                const cStats = getCardGameStats(c);
                const hasIronMan = cStats.perks.some(p => p.name === 'Iron Man');
                const drainAmt = hasIronMan ? 5 : 10;

                let extraDrain = 0;
                if (isActiveDefender && playerPossession && (activeShotType === 'mid_range' || activeShotType === 'attack_rim' || activeShotType === 'three_point_play')) {
                  const attStats = getCardGameStats(attacker);
                  if (attStats.perks.some(p => p.name === 'Posterizer')) {
                    extraDrain = 5;
                  }
                }
                
                const newSta = Math.max(0, c.currentSta - drainAmt - extraDrain);
                updated = { ...c, currentSta: newSta, gassed: newSta <= 20 && !cStats.perks.some(p => p.name === 'Heavy Duty') };
              }
              if (isActiveAttacker) {
                if (activeShotType === 'three_pointer') {
                  updated.threesAttempted = (updated.threesAttempted || 0) + 1;
                } else if (activeShotType === 'three_point_play') {
                  updated.and1sAttempted = (updated.and1sAttempted || 0) + 1;
                }
              }
              return updated;
            });
          };

          setPlayerCards(updatePlayerStamina(playerCards));
          setOpponentCards(updateOpponentStamina(opponentCards));

          // Log commentary
          setGameLog(prev => [...prev, ...commentary]);
          setCoinFlipping(false);
          setGamePhase('next');
        }, 2000);
      };

      // Proceed to Next Possession / Quarter Break
      const handleNextPossession = () => {
        // Rebound Check
        if (reboundRetained) {
          setReboundRetained(false);
          setSelectedAttackerId(null);
          setSelectedDefenderId(null);
          setGamePhase('tactical');
          
          setGameLog(prev => [
            ...prev,
            "----------------------------------------",
            `Possession ${possessionCount} • Second-Chance Board!`,
            `Offensive rebound secured! Possession remains with: ${playerPossession ? 'PLAYER' : 'OPPONENT'}`
          ]);
          return;
        }

        const nextPos = possessionCount + 1;
        
        // Check for Quarter Break
        // Quarters: Q1 ends at 8, Q2 (Halftime) at 16, Q3 at 24, Q4 (End Game) at 32
        const isEndQ1 = possessionCount === 8;
        const isEndQ2 = possessionCount === 16;
        const isEndQ3 = possessionCount === 24;
        const isEndGame = possessionCount === 32;

        if (isEndGame) {
          // If scores are tied, trigger Sudden Death Overtime
          if (playerScore === opponentScore) {
            setIsOvertime(true);
            setWasOvertime(true);
            setGamePhase('tactical');
            setGameLog(prev => [
              ...prev,
              "----------------------------------------",
              "🚨 END OF REGULATION: GAME IS TIED!",
              "🔥 WE ARE GOING TO SUDDEN DEATH OVERTIME! 🔥",
              "Pick your single best player card for a 1-on-1 matchup roll!",
              "----------------------------------------"
            ]);
          } else {
            // End Match
            setGameState('ended');
            setIsGameActive(false);
          }
          return;
        }

        // Apply Stamina recoveries on Quarter Break
        if (isEndQ1 || isEndQ2 || isEndQ3) {
          setGamePhase('tactical');
          
          let healCourt = 10;
          let healBench = 20;
          let breakName = "Quarter Break";
          
          if (isEndQ2) {
            healCourt = 30;
            healBench = 30;
            breakName = "Halftime Break";
          }

          // Dynamic recovery mapping
          const pRecovered = playerCards.map(c => {
            const isStarter = starters.includes(c.id);
            const amt = isStarter ? healCourt : healBench;
            
            // Topps Now Debut Fire check (+10 extra recovery)
            const extra = getCardGameStats(c).perks.some(p => p.name === 'Topps Now: Debut Fire') ? 10 : 0;
            
            const maxS = getCardGameStats(c).sta;
            const newS = Math.min(maxS, c.currentSta + amt + extra);
            return { ...c, currentSta: newS, gassed: newS <= 20 };
          });
          setPlayerCards(pRecovered);

          const oRecovered = opponentCards.map((c, idx) => {
            const isStarter = idx < 5;
            const amt = isStarter ? healCourt : healBench;
            
            const extra = getCardGameStats(c).perks.some(p => p.name === 'Topps Now: Debut Fire') ? 10 : 0;

            const maxS = getCardGameStats(c).sta;
            const newS = Math.min(maxS, c.currentSta + amt + extra);
            return { ...c, currentSta: newS, gassed: newS <= 20 };
          });
          setOpponentCards(oRecovered);

          setGameLog(prev => [
            ...prev,
            "----------------------------------------",
            `🔔 END OF QUARTER: Entering ${breakName}.`,
            `Recovery: On-Court +${healCourt} STA | Bench +${healBench} STA.`,
            "Make free substitutions without timeouts.",
            "----------------------------------------"
          ]);

          setPossessionCount(nextPos);
          setPlayerPossession(!playerPossession);
          setSubsActive(true);
          return;
        }

        // Normal alternate possession
        setPossessionCount(nextPos);
        setPlayerPossession(!playerPossession);
        
        setSelectedAttackerId(null);
        setSelectedDefenderId(null);
        setGamePhase('tactical');
        
        setGameLog(prev => [
          ...prev,
          "----------------------------------------",
          `Possession ${nextPos} / 32 • Quarter ${Math.ceil(nextPos / 8)}`,
          `Ball Possession: ${!playerPossession ? 'PLAYER' : 'OPPONENT'}`
        ]);
        
        // Smart CPU Timeout call in Phase 1 if CPU gassed
        if (playerPossession) { // Opponent is next on offense
          // CPU can call timeout if gassed
          const oppStarters = opponentCards.slice(0, 5);
          const oppGassedCount = oppStarters.filter(x => x.currentSta <= 20).length;
          
          if (oppGassedCount >= 2 && opponentTimeouts > 0 && Math.random() > 0.4) {
            callTimeout(false);
          }
        }
      };

      // Sudden Death Overtime execution handler
      const resolveSuddenDeathMatchup = (playerId, oppId) => {
        const pCard = playerCards.find(x => x.id === playerId);
        const oCard = opponentCards.find(x => x.id === oppId);
        
        const pStats = getCardGameStats(pCard);
        const oStats = getCardGameStats(oCard);

        const flip = Math.random() > 0.5 ? 'heads' : 'tails';
        setCoinResult(flip);
        setCoinFlipId(prev => prev + 1);
        setCoinFlipping(true);
        setGameLog(prev => [...prev, `⚔️ 1-on-1 SUDDEN DEATH: ${pCard.player} (${pStats.pos}) vs ${oCard.player} (${oStats.pos})!`]);

        setTimeout(() => {
          let pVal = pStats.off;
          let oVal = oStats.def;

          if (flip === 'heads') {
            pVal += 4;
            setGameLog(prev => [...prev, `🪙 Coin Flip: HEADS! Player adds +4 to OFF.`]);
          } else {
            oVal += 4;
            setGameLog(prev => [...prev, `🪙 Coin Flip: TAILS! Opponent adds +4 to DEF.`]);
          }

          setGameLog(prev => [...prev, `Sudden Death Matchup: Player OFF [${pVal}] vs Opponent DEF [${oVal}]`]);

          if (pVal > oVal) {
            setPlayerScore(prev => prev + 2);
            setGameLog(prev => [...prev, `🎉 SCORE! ${pCard.player} scores the sudden death winner!`]);
            triggerToast("You win in Overtime!");
          } else {
            setOpponentScore(prev => prev + 2);
            setGameLog(prev => [...prev, `😭 Opponent Scores! ${oCard.player} scores the game winner.`]);
            triggerToast("Opponent wins in Overtime.");
          }
          
          setCoinFlipping(false);
          setIsOvertime(false);
          setGameState('ended');
          setIsGameActive(false);
        }, 2000);
      };

      // End Game calculations (Reward XP)
      const handleReturnToLobby = () => {
        const won = playerScore > opponentScore;
        const xpEarned = opponentType === 'online'
          ? (won ? 300 : 120)
          : (cpuDifficulty === 'rookie' ? (won ? 80 : 30) : cpuDifficulty === 'veteran' ? (won ? 120 : 50) : (won ? 180 : 70));
        
        // Update stats
        const newStats = { ...matchStats };
        if (opponentType === 'online') {
          newStats.onlineMatches = (newStats.onlineMatches || 0) + 1;
          if (won) {
            newStats.onlineWins = (newStats.onlineWins || 0) + 1;
          } else {
            newStats.onlineLosses = (newStats.onlineLosses || 0) + 1;
          }
        } else {
          newStats.cpuMatches = (newStats.cpuMatches || 0) + 1;
          if (won) {
            newStats.cpuWins = (newStats.cpuWins || 0) + 1;
          } else {
            newStats.cpuLosses = (newStats.cpuLosses || 0) + 1;
          }
        }
        newStats.totalXpEarned = (newStats.totalXpEarned || 0) + xpEarned;
        
        if (won && (playerScore - opponentScore >= 15)) {
          newStats.hasWinBy15 = true;
        }
        if (won && wasOvertime) {
          newStats.hasOvertimeWin = true;
        }
        setMatchStats(newStats);
        localStorage.setItem('ht_match_stats', JSON.stringify(newStats));

        // Add XP and handle leveling
        let newXp = xp + xpEarned;
        let newLevel = level;
        const xpNeeded = 500; // Flat 500 XP per level

        if (newLevel >= 20) {
          if (newXp > xpNeeded) {
            newXp = xpNeeded;
          }
          setXp(newXp);
          triggerToast(`Match Finished! +${xpEarned} XP gained. You are at max level 20! Prestige to reset.`);
        } else {
          let leveledUp = false;
          while (newXp >= xpNeeded && newLevel < 20) {
            newXp -= xpNeeded;
            newLevel += 1;
            leveledUp = true;
          }
          if (newLevel === 20 && newXp > xpNeeded) {
            newXp = xpNeeded;
          }
          setLevel(newLevel);
          setXp(newXp);
          if (leveledUp) {
            triggerToast(`Level Up! You reached Level ${newLevel}!`);
          } else {
            triggerToast(`Match Finished! +${xpEarned} XP gained.`);
          }
        }

        // Run achievements check
        setTimeout(() => {
          checkAndAwardAchievements(newStats, userCollection, newLevel, prestige);
        }, 100);

        setGameState('lobby');
        setIsGameActive(false);
      };

      return (
        <div className="w-full flex flex-col gap-6">
          
          {/* 1. ARENA LOBBY WINDOW */}
          {gameState === 'lobby' && (
            <div className="glass-panel p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/5 space-y-4 sm:space-y-6 text-center max-w-xl mx-auto w-full">
              <div className="flex flex-col items-center">
                <iconify-icon icon="solar:gamepad-linear" width="48" className="text-white animate-float"></iconify-icon>
                <h3 className="text-xl font-bold tracking-widest uppercase text-white mt-4">HoopTactics Tabletop Arena</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                  Turn-based digital card game. Explore physical mismatches, stamina fatigue, and tactical chemistry.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setGameState('deck_select')}
                  className="amp-card p-4 sm:p-6 flex flex-col items-center justify-center gap-2 sm:gap-3 bg-black/40 hover:bg-white/5"
                >
                  <iconify-icon icon="solar:users-group-two-rounded-bold" width="28" className="text-amber-500"></iconify-icon>
                  <div>
                    <div className="text-xs font-bold text-white uppercase">Build Roster</div>
                    <div className="text-[9px] text-neutral-500 mt-0.5">Select 5 starters & 5 bench</div>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    if (starters.length !== 5 || bench.length !== 5) {
                      const isCpu = opponentType === 'cpu';
                      const deck = getOptimizedDeck(isCpu, vaultOwnedOnly);
                      if (deck) {
                        setSelectedDeckIds([...deck.starters, ...deck.bench]);
                        setStarters(deck.starters);
                        setBench(deck.bench);
                      }
                    }
                    setGameState('mode_select');
                  }}
                  className="amp-card p-4 sm:p-6 flex flex-col items-center justify-center gap-2 sm:gap-3 bg-black/40 hover:bg-white/5"
                >
                  <iconify-icon icon="solar:basketball-bold" width="28" className="text-orange-500"></iconify-icon>
                  <div>
                    <div className="text-xs font-bold text-white uppercase">Play Match</div>
                    <div className="text-[9px] text-neutral-500 mt-0.5">Enter Arena queue</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* 2. DECK SELECT PANEL */}
          {gameState === 'deck_select' && (
            <div className="glass-panel p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-white/5 space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-md font-bold uppercase tracking-wider text-white">Deck Builder</h3>
                  <p className="text-[10px] text-neutral-500 uppercase mt-0.5">Assign exactly 5 starters & 5 bench players</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={autoBuildDeck}
                    className="conic-btn dramatic-hover"
                  >
                    <div className="conic-spin-bg"></div>
                    <div className="conic-btn-mask bg-black/60 backdrop-blur-md"></div>
                    <span className="relative z-10 text-[10px] font-bold text-white px-4 py-2 uppercase">
                      Auto-Build Lineup
                    </span>
                  </button>
                  <button 
                    onClick={() => {
                      if (starters.length === 5 && bench.length === 5) {
                        setGameState('mode_select');
                      } else {
                        triggerToast("Deck invalid. Select exactly 5 starters and 5 bench cards.");
                      }
                    }}
                    className="conic-btn px-1 py-1"
                  >
                    <div className="conic-spin-bg"></div>
                    <div className="conic-btn-mask"></div>
                    <span className="relative z-10 text-[10px] font-bold text-white px-4 py-2 uppercase">Lock Deck</span>
                  </button>
                </div>
              </div>

              {/* Roster visual summaries - Starters */}
              <div className="bg-black/40 p-4 md:p-6 rounded-2xl border border-white/5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-white/5 pb-2">
                  <span className="text-xs font-bold uppercase text-orange-500 flex items-center gap-1.5">
                    🔥 Starters ({starters.length} / 5)
                  </span>
                  <span className="text-[10px] font-mono font-black text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 w-fit">
                    Team Chemistry Penalty: {getChemistryPenalty(starters)} OVR
                  </span>
                </div>
                <div className="flex overflow-x-auto sm:grid sm:grid-cols-5 gap-4 justify-start sm:justify-items-center pb-2 no-scrollbar snap-x snap-mandatory">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const id = starters[idx];
                    if (id) {
                      const c = SPORTS_CARDS.find(x => x.id === id);
                      return (
                        <div key={id} className="relative group w-24 min-[400px]:w-28 sm:w-32 flex-shrink-0 snap-start">
                          <HoloCard 
                            card={c} 
                            size="sm" 
                            interactive={true} 
                            onClick={() => onOpenDetail && onOpenDetail(c.id, 'attributes')}
                          />
                          <button
                            onClick={() => setStarters(starters.filter(x => x !== id))}
                            className="absolute -top-1.5 -right-1.5 z-30 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center shadow-lg border border-white/10"
                          >
                            ✕
                          </button>
                          <div 
                            onClick={() => onOpenDetail && onOpenDetail(c.id, 'attributes')}
                            className="text-center text-[9px] font-bold text-neutral-400 mt-1 truncate cursor-pointer hover:text-white"
                          >
                            {c.player.split(' ').pop()} ({getCardGameStats(c).pos})
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={`empty-starter-${idx}`} className="w-24 h-32 min-[400px]:w-28 min-[400px]:h-38 sm:w-32 sm:h-44 rounded-xl border border-dashed border-white/10 bg-neutral-900/30 flex flex-col items-center justify-center text-center p-1 sm:p-2 text-neutral-600 flex-shrink-0 snap-start">
                        <iconify-icon icon="solar:user-plus-bold-duotone" width="20" className="opacity-30 mb-1"></iconify-icon>
                        <span className="text-[8px] font-black uppercase tracking-wider">Empty Starter</span>
                        <span className="text-[7px] text-neutral-700 mt-0.5">Slot {idx + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Roster visual summaries - Bench */}
              <div className="bg-black/40 p-4 md:p-6 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-xs font-bold uppercase text-blue-400 flex items-center gap-1.5">
                    📋 Bench ({bench.length} / 5)
                  </span>
                </div>
                <div className="flex overflow-x-auto sm:grid sm:grid-cols-5 gap-4 justify-start sm:justify-items-center pb-2 no-scrollbar snap-x snap-mandatory">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const id = bench[idx];
                    if (id) {
                      const c = SPORTS_CARDS.find(x => x.id === id);
                      return (
                        <div key={id} className="relative group w-24 min-[400px]:w-28 sm:w-32 flex-shrink-0 snap-start">
                          <HoloCard 
                            card={c} 
                            size="sm" 
                            interactive={true} 
                            onClick={() => onOpenDetail && onOpenDetail(c.id, 'attributes')}
                          />
                          <button
                            onClick={() => setBench(bench.filter(x => x !== id))}
                            className="absolute -top-1.5 -right-1.5 z-30 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center shadow-lg border border-white/10"
                          >
                            ✕
                          </button>
                          <div 
                            onClick={() => onOpenDetail && onOpenDetail(c.id, 'attributes')}
                            className="text-center text-[9px] font-bold text-neutral-400 mt-1 truncate cursor-pointer hover:text-white"
                          >
                            {c.player.split(' ').pop()} ({getCardGameStats(c).pos})
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={`empty-bench-${idx}`} className="w-24 h-32 min-[400px]:w-28 min-[400px]:h-38 sm:w-32 sm:h-44 rounded-xl border border-dashed border-white/10 bg-neutral-900/30 flex flex-col items-center justify-center text-center p-1 sm:p-2 text-neutral-600 flex-shrink-0 snap-start">
                        <iconify-icon icon="solar:user-plus-bold-duotone" width="20" className="opacity-30 mb-1"></iconify-icon>
                        <span className="text-[8px] font-black uppercase tracking-wider">Empty Bench</span>
                        <span className="text-[7px] text-neutral-700 mt-0.5">Slot {idx + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Basket list catalog selection with search, filter, and carousel per brand */}
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                  <div className="text-left w-full md:w-auto">
                    <h4 className="text-xs uppercase font-extrabold text-neutral-300 tracking-wider">Basketball Vault</h4>
                    <p className="text-[9px] text-neutral-500 uppercase mt-0.5">Filter cards by player, team, set, or owned status</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center justify-end">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-64 h-10">
                      <input 
                        type="text" 
                        placeholder="Search Player or Team..." 
                        value={vaultSearchQuery} 
                        onChange={(e) => setVaultSearchQuery(e.target.value)}
                        className="w-full h-full bg-neutral-900 border border-white/10 rounded-xl pl-10 pr-4 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-all placeholder-neutral-500"
                      />
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 flex items-center justify-center pointer-events-none">
                        <iconify-icon icon="solar:magnifer-linear" width="16"></iconify-icon>
                      </div>
                    </div>
                    {/* Owned Only Filter */}
                    {opponentType === 'cpu' && (
                      <button 
                        onClick={() => setVaultOwnedOnly(!vaultOwnedOnly)}
                        className={`flex items-center gap-2 px-4 h-10 rounded-xl border text-[9px] uppercase font-black tracking-wider transition-all w-full sm:w-auto justify-center ${
                          vaultOwnedOnly 
                            ? 'border-amber-400 bg-amber-400/10 text-amber-400' 
                            : 'border-white/10 bg-neutral-900 text-neutral-400 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <iconify-icon icon={vaultOwnedOnly ? "solar:check-square-bold" : "solar:square-linear"} width="15"></iconify-icon>
                        Owned Cards Only
                      </button>
                    )}
                  </div>
                </div>

                {/* Carousels Grouped by Set */}
                <div className="space-y-6 max-h-[550px] overflow-y-auto pr-2">
                  {(() => {
                    const isCpu = opponentType === 'cpu';
                    let pool = isCpu 
                      ? SPORTS_CARDS.filter(c => c.sport === 'Basketball')
                      : collection.map(id => SPORTS_CARDS.find(x => x.id === id)).filter(Boolean);

                    // Filter by Search Query
                    if (vaultSearchQuery) {
                      const q = vaultSearchQuery.toLowerCase();
                      pool = pool.filter(c => c.player.toLowerCase().includes(q) || c.team.toLowerCase().includes(q));
                    }

                    // Filter by Owned Only
                    if (isCpu && vaultOwnedOnly) {
                      pool = pool.filter(c => collection.includes(c.id));
                    }

                    if (pool.length === 0) {
                      return (
                        <div className="text-center py-8 text-neutral-600 text-xs">
                          No matching basketball cards found in your vault.
                        </div>
                      );
                    }

                    // Group by Set
                    const grouped = {};
                    pool.forEach(c => {
                      const setId = c.setId || 'other';
                      if (!grouped[setId]) grouped[setId] = [];
                      grouped[setId].push(c);
                    });

                    // Sort cards within each set: OVR descending first, then rarity priority, then year descending, then value descending
                    Object.keys(grouped).forEach(setId => {
                      grouped[setId].sort((a, b) => {
                        const ovrA = getCardGameStats(a).ovr;
                        const ovrB = getCardGameStats(b).ovr;
                        if (ovrB !== ovrA) {
                          return ovrB - ovrA;
                        }
                        const pA = window.getCardRarityPriority ? window.getCardRarityPriority(a) : 5;
                        const pB = window.getCardRarityPriority ? window.getCardRarityPriority(b) : 5;
                        if (pA !== pB) {
                          return pA - pB;
                        }
                        if (b.year !== a.year) {
                          return b.year - a.year;
                        }
                        return b.value - a.value;
                      });
                    });

                    // Get basketball sets from SPORTS_SETS and sort them chronologically (year descending)
                    const basketballSets = SPORTS_SETS.filter(s => s.sport === 'Basketball');
                    const sortedSets = basketballSets
                      .filter(s => grouped[s.id] && grouped[s.id].length > 0)
                      .sort((a, b) => b.year - a.year);

                    // Add a fallback for other sets if any cards don't match
                    const matchedSetIds = new Set(basketballSets.map(s => s.id));
                    const otherCards = pool.filter(c => !matchedSetIds.has(c.setId));
                    if (otherCards.length > 0) {
                      grouped['other'] = otherCards;
                      sortedSets.push({
                        id: 'other',
                        name: 'Other Sets',
                        year: 0,
                        era: ''
                      });
                    }

                    return sortedSets.map(set => {
                      const setCards = grouped[set.id];
                      return (
                        <div key={set.id} className="space-y-3 border-b border-white/5 pb-6 last:border-b-0">
                          <div className="flex justify-between items-center pr-2">
                            <div className="text-left font-sans">
                              <h5 className="text-[10px] md:text-xs font-black uppercase tracking-wider text-white">
                                {set.name} ({setCards.length} {setCards.length === 1 ? 'Card' : 'Cards'})
                              </h5>
                              {set.year > 0 && (
                                <p className="text-[8px] text-neutral-500 uppercase font-semibold mt-0.5">
                                  {set.year} • {set.era}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Carousel row */}
                          <div className="relative">
                            <div 
                              className="flex gap-4 overflow-x-auto select-none snap-x snap-mandatory scroll-smooth pb-3 pr-2 no-scrollbar"
                            >
                              {setCards.map(c => {
                                const isStarter = starters.includes(c.id);
                                const isBench = bench.includes(c.id);
                                
                                return (
                                  <div 
                                    key={c.id} 
                                    className="flex-shrink-0 w-[130px] min-[400px]:w-[160px] sm:w-44 snap-start flex flex-col items-center gap-2"
                                  >
                                    <HoloCard 
                                      card={c} 
                                      size="md" 
                                      interactive={true} 
                                      onClick={() => onOpenDetail && onOpenDetail(c.id, 'attributes')}
                                    />
                                    
                                    {/* Player Name and Brand label */}
                                    <div className="w-full text-center leading-tight">
                                      <div className="text-[10px] font-black uppercase text-white truncate">{c.player}</div>
                                      <div className="text-[8.5px] text-neutral-400 font-semibold truncate mt-0.5">{c.brand} - {c.parallel}{c.number && c.number !== '#1' && c.setId === '2025-topps-now' ? ` (${c.number.replace('#', '').replace(/-Auto$/, '')})` : ''}</div>
                                    </div>
                                    
                                    {/* View Attributes Button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenDetail && onOpenDetail(c.id, 'attributes');
                                      }}
                                      className="conic-btn primary dramatic-hover w-full py-1.5 mt-1"
                                    >
                                      <div className="conic-spin-bg"></div>
                                      <div className="conic-btn-mask bg-[#0c0c0c]/85"></div>
                                      <span className="relative z-10 text-[8px] min-[400px]:text-[9px] font-black uppercase tracking-wider text-white flex items-center justify-center gap-1">
                                        <iconify-icon icon="solar:eye-bold" width="12"></iconify-icon>
                                        View Attributes
                                      </span>
                                    </button>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex gap-2 w-full">
                                      <button
                                        onClick={() => {
                                          if (isStarter) {
                                            setStarters(starters.filter(x => x !== c.id));
                                          } else {
                                            if (starters.length >= 5) {
                                              triggerToast("Starters full! Remove one first.");
                                              return;
                                            }
                                            setBench(bench.filter(x => x !== c.id));
                                            setStarters([...starters, c.id]);
                                          }
                                        }}
                                        className={`flex-1 py-1.5 rounded-full text-[8.5px] font-extrabold uppercase transition-all duration-300 transform active:scale-95 shadow-md ${
                                          isStarter 
                                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-none shadow-[0_0_12px_rgba(249,115,22,0.4)] hover:brightness-110 hover:-translate-y-[1px]' 
                                            : 'bg-neutral-900 text-neutral-400 border border-white/5 hover:border-white/10 hover:text-white hover:bg-white/5 hover:-translate-y-[0.5px]'
                                        }`}
                                      >
                                        Starter
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (isBench) {
                                            setBench(bench.filter(x => x !== c.id));
                                          } else {
                                            if (bench.length >= 5) {
                                              triggerToast("Bench full! Remove one first.");
                                              return;
                                            }
                                            setStarters(starters.filter(x => x !== c.id));
                                            setBench([...bench, c.id]);
                                          }
                                        }}
                                        className={`flex-1 py-1.5 rounded-full text-[8.5px] font-extrabold uppercase transition-all duration-300 transform active:scale-95 shadow-md ${
                                          isBench 
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-none shadow-[0_0_12px_rgba(59,130,246,0.4)] hover:brightness-110 hover:-translate-y-[1px]' 
                                            : 'bg-neutral-900 text-neutral-400 border border-white/5 hover:border-white/10 hover:text-white hover:bg-white/5 hover:-translate-y-[0.5px]'
                                        }`}
                                      >
                                        Bench
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/5">
                <button 
                  onClick={() => setGameState('lobby')}
                  className="px-4 py-2.5 rounded-full border border-white/10 hover:border-white/20 text-xs font-bold text-neutral-400 hover:text-white uppercase"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* 3. OPPONENT / MODE SELECT PANEL */}
          {gameState === 'mode_select' && (
            <div className="glass-panel p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/5 space-y-4 sm:space-y-6 text-center max-w-md mx-auto w-full">
              <h3 className="text-md font-bold uppercase tracking-wider text-white">Select Battle Mode</h3>
              
              <div className="space-y-4">
                <div className="amp-card p-5 text-left border border-white/5 bg-black/45">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                      <iconify-icon icon="solar:cpu-bold" className="text-neutral-400"></iconify-icon> Single Player CPU Match
                    </span>
                    <input 
                      type="radio" name="battleMode" checked={opponentType === 'cpu'}
                      onChange={() => setOpponentType('cpu')}
                      className="accent-white cursor-pointer"
                    />
                  </div>
                  
                  {opponentType === 'cpu' && (
                    <div className="mt-4 space-y-2 border-t border-white/5 pt-3">
                      <div className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider">AI Difficulty Level</div>
                      <div className="grid grid-cols-3 gap-2">
                        {['rookie', 'veteran', 'hall-famer'].map(diff => (
                          <button
                            key={diff}
                            onClick={() => setCpuDifficulty(diff)}
                            className={`py-2 rounded-xl text-[9px] font-bold uppercase border transition-all ${
                              cpuDifficulty === diff 
                                ? 'border-amber-400 bg-amber-400/10 text-amber-400' 
                                : 'border-white/5 bg-white/5 text-neutral-400 hover:border-white/10'
                            }`}
                          >
                            {diff === 'hall-famer' ? 'H.O.F' : diff}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className={`amp-card p-5 text-left border border-white/5 bg-black/45 flex justify-between items-center ${collection.length < 10 ? 'opacity-40 pointer-events-none' : ''}`}>
                  <span className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                    <iconify-icon icon={collection.length < 10 ? "solar:lock-keyhole-minimalistic-bold" : "solar:dialog-linear"} className="text-neutral-400"></iconify-icon> 
                    Online Matchmaking Lobby {collection.length < 10 && <span className="text-[8px] bg-red-950/20 text-red-500 font-bold uppercase px-1 py-0.5 rounded border border-red-500/10 tracking-wider ml-1.5">Locked (10 Cards)</span>}
                  </span>
                  <input 
                    type="radio" name="battleMode" checked={opponentType === 'online'}
                    onChange={() => {
                      if (collection.length >= 10) {
                        setOpponentType('online');
                      }
                    }}
                    disabled={collection.length < 10}
                    className="accent-white cursor-pointer disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => {
                    if (opponentType === 'online' && collection.length < 10) {
                      triggerToast("Online deck building requires at least 10 owned basketball cards. Claim Starter Deck first!");
                      return;
                    }
                    setGameState('deck_select');
                  }}
                  className="flex-1 py-3 rounded-xl border border-white/10 hover:border-white/20 text-xs font-bold text-neutral-400 hover:text-white uppercase transition-all"
                >
                  Adjust Deck
                </button>
                <button 
                  onClick={() => {
                    let activeStarters = starters;
                    let activeBench = bench;
                    
                    if (activeStarters.length !== 5 || activeBench.length !== 5) {
                      const isCpu = opponentType === 'cpu';
                      const deck = getOptimizedDeck(isCpu, vaultOwnedOnly);
                      if (deck) {
                        setSelectedDeckIds([...deck.starters, ...deck.bench]);
                        setStarters(deck.starters);
                        setBench(deck.bench);
                        activeStarters = deck.starters;
                        activeBench = deck.bench;
                      } else {
                        // Fallback to all basketball cards if owned deck build failed
                        const fallbackDeck = getOptimizedDeck(true, false);
                        if (fallbackDeck) {
                          setSelectedDeckIds([...fallbackDeck.starters, ...fallbackDeck.bench]);
                          setStarters(fallbackDeck.starters);
                          setBench(fallbackDeck.bench);
                          activeStarters = fallbackDeck.starters;
                          activeBench = fallbackDeck.bench;
                        } else {
                          triggerToast("Lineup incomplete! Lock your lineup first (5 Starters, 5 Bench).");
                          return;
                        }
                      }
                    }
                    
                    const isCpu = opponentType === 'cpu';
                    if (isCpu) {
                      const diffName = cpuDifficulty === 'rookie' ? 'Rookie CPU' : cpuDifficulty === 'veteran' ? 'Veteran CPU' : 'Hall of Famer CPU';
                      setOpponentName(diffName);
                      startMatch(diffName, activeStarters, activeBench);
                    } else {
                      // Online Match
                      if (collection.length < 10) {
                        triggerToast("Online play requires at least 10 owned basketball cards. Claim Starter Deck first!");
                        return;
                      }
                      // Check if current deck contains unowned cards
                      const invalidStarters = activeStarters.filter(id => !collection.includes(id));
                      const invalidBench = activeBench.filter(id => !collection.includes(id));
                      if (invalidStarters.length > 0 || invalidBench.length > 0) {
                        triggerToast("Online match requires 10 owned cards. Please adjust your deck.");
                        setGameState('deck_select');
                        return;
                      }
                      setGameState('searching');
                    }
                  }}
                  className="flex-1 conic-btn"
                >
                  <div className="conic-spin-bg"></div>
                  <div className="conic-btn-mask"></div>
                  <span className="relative z-10 text-xs font-black text-white px-6 py-3 uppercase flex items-center justify-center gap-1">
                    Play Now
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* 4. SIMULATED MATCHMAKING SEARCH */}
          {gameState === 'searching' && (
            <div className="glass-panel p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/5 text-center max-w-md mx-auto w-full space-y-4 sm:space-y-6">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-dashed border-neutral-800 animate-spin-slow" />
                <div className="absolute inset-2 rounded-full border border-dashed border-amber-400/50 animate-spin" />
                <iconify-icon icon="solar:gamepad-linear" width="28" className="text-white animate-pulse"></iconify-icon>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Matchmaker</h3>
                <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-white/5 mt-4">
                  <div className="h-full bg-amber-400 transition-all duration-700" style={{ width: `${matchmakingProgress}%` }}></div>
                </div>
              </div>

              <div className="bg-black/60 p-4 rounded-2xl border border-white/5 text-left font-mono text-[9px] text-neutral-500 space-y-1 max-h-36 overflow-y-auto pr-2">
                {matchmakingLogs.map((l, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-amber-500">&gt;</span>
                    <span>{l}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setGameState('mode_select')}
                className="w-full py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-[10px] font-bold text-neutral-500 hover:text-white uppercase transition-all"
              >
                Cancel Queue
              </button>
            </div>
          )}

          {/* 5. ACTIVE ARENA GAMEPLAY PANEL */}
          {gameState === 'playing' && (
            <div className="relative animate-fade-in lg:flex-1 lg:flex lg:flex-col lg:min-h-0 lg:h-full">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6 items-stretch lg:flex-1 lg:min-h-0 lg:h-full">
              
              {/* Left & Center: Scoreboard + Basketball Court */}
              <div className="lg:col-span-2 flex flex-col gap-3 lg:gap-4 lg:min-h-0 lg:h-full">
                
                {/* scoreboard */}
                <div className="game-scoreboard glass-panel p-4 rounded-2xl border border-white/5 flex items-center justify-between bg-black/60 shadow-xl relative overflow-hidden flex-shrink-0">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-600 via-yellow-500 to-blue-600" />
                  
                  {/* Player Team Score */}
                  <div className="flex items-center gap-3 w-1/3">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${avatarGradient} ${avatarGradient === 'from-neutral-800 to-neutral-950' ? 'avatar-obsidian' : ''} flex items-center justify-center font-bold text-white text-sm select-none shadow border border-white/10`}>
                      {avatarIcon === 'letter' ? (
                        favorites?.username?.charAt(0).toUpperCase() || 'P'
                      ) : (
                        <iconify-icon icon={avatarIcon} width="18"></iconify-icon>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] font-bold text-white uppercase truncate max-w-[90px]">{favorites?.username || 'Player'}</div>
                      <div className="text-[9px] text-neutral-500 font-semibold uppercase">TOs: {playerTimeouts} / 4</div>
                    </div>
                  </div>

                  {/* Center Score Clock */}
                  <div className="flex flex-col items-center w-1/3 text-center">
                    <div className="text-[8px] font-mono tracking-widest text-neutral-500 uppercase">Quarter {Math.ceil(possessionCount / 8)}</div>
                    <div className="flex gap-3 items-center justify-center my-0.5">
                      <span className="text-2xl font-black font-mono text-white tracking-tighter">{playerScore}</span>
                      <span className="text-neutral-600 font-bold font-mono text-sm">:</span>
                      <span className="text-2xl font-black font-mono text-white tracking-tighter">{opponentScore}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <iconify-icon icon="solar:stopwatch-linear" width="9" className="text-neutral-500"></iconify-icon>
                      <span className="text-[8px] font-mono text-neutral-400">Possession {possessionCount} / 32</span>
                    </div>
                  </div>

                  {/* Opponent Team Score */}
                  <div className="flex items-center gap-3 w-1/3 justify-end text-right">
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-white uppercase truncate max-w-[90px]">{opponentName}</div>
                      <div className="text-[9px] text-neutral-500 font-semibold uppercase">TOs: {opponentTimeouts} / 4</div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-sm select-none shadow">
                      {opponentName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Scrollable Court & Bench Container */}
                <div className="lg:flex-1 lg:overflow-y-auto lg:pr-1 space-y-3 sm:space-y-6 lg:space-y-4 lg:min-h-0">
                  {/* Court Container */}
                  <div className="game-court glass-panel p-2.5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-white/5 relative bg-gradient-to-b from-neutral-950 to-black overflow-hidden flex flex-col justify-between aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[640px] lg:gap-8">
                  {/* Basketball Court Line Overlays */}
                  <div className="absolute inset-x-8 top-0 bottom-0 border-x border-white/[0.03] pointer-events-none" />
                  <div className="absolute inset-y-12 left-0 right-0 border-y border-white/[0.03] pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white/[0.04] pointer-events-none" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 border-b border-x border-white/[0.03] rounded-b-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-32 border-t border-x border-white/[0.03] rounded-t-3xl pointer-events-none" />
                  
                  {/* Possession arrow overlay indicator */}
                  <div className="absolute inset-x-0 top-1.5 flex justify-center pointer-events-none">
                    <div className="bg-black/80 px-3 py-1 rounded-full border border-white/10 text-[7px] uppercase font-bold tracking-widest text-neutral-400 flex items-center gap-1.5 shadow">
                      <span className={`w-1.5 h-1.5 rounded-full ${playerPossession ? 'bg-orange-500 animate-ping' : 'bg-neutral-600'}`} />
                      <span>{playerPossession ? 'Player Ball' : 'Opponent Ball'}</span>
                    </div>
                  </div>

                  {/* 1. Opponent Half Lineup */}
                  <div className="space-y-1 relative z-10">
                    <div className="text-[7.5px] uppercase font-bold text-neutral-600 tracking-widest text-center mb-1">Opponent Active Lineup</div>
                    <div className="flex justify-around items-end gap-2 lg:gap-3">
                      {opponentCards.slice(0, 5).map((c, idx) => {
                        const stats = getCardGameStats(c);
                        const isAttacker = !playerPossession && c.id === selectedAttackerId;
                        const isDefender = playerPossession && c.id === selectedDefenderId;
                        const nameLabel = c.player.split('(')[0].trim().split(' ').pop();
                        
                        return (
                          <div 
                            key={c.id + '_opp_' + idx} 
                            className="w-[17.5%] min-[400px]:w-[18%] lg:w-[112px] xl:w-[128px] flex flex-col items-center gap-1.5"
                          >
                            <div className={`relative w-full rounded-xl transition-all ${
                              isAttacker ? 'ring-4 ring-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.6)]' 
                              : isDefender ? 'ring-4 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]' 
                              : ''
                            }`}>
                              <HoloCard 
                                card={c} 
                                size="game" 
                                interactive={true}
                                hideAttributes={false}
                              />
                              
                              {/* Gassed Overlay */}
                              {c.currentSta <= 20 && (
                                <div className="absolute inset-0 bg-red-950/80 rounded-xl flex items-center justify-center z-30 border border-red-500/30 pointer-events-none">
                                  <span className="text-[8px] font-black uppercase text-red-500 font-mono tracking-widest rotate-[-12deg]">GASSED</span>
                                </div>
                              )}
                            </div>

                            {/* Name & Stamina Gauge */}
                            <div className="w-full flex flex-col items-center leading-none gap-1">
                              <span className="text-[7.5px] font-bold text-neutral-400 truncate max-w-[72px]">
                                <span className="text-amber-400 font-extrabold mr-0.5">{stats.pos}</span> {nameLabel}
                              </span>
                              <div className="h-1.5 w-full max-w-[72px] bg-neutral-950 rounded-full overflow-hidden relative border border-white/5">
                                <div 
                                  className={`h-full ${c.currentSta <= 20 ? 'bg-red-500' : c.currentSta <= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                  style={{ width: `${(c.currentSta/stats.sta)*100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Court Center Comment Log Overlay */}
                  <div className="my-2 py-1.5 flex flex-col items-center justify-center text-center">
                    {coinFlipping ? (
                      <div className="flex flex-col items-center gap-2">
                        <QuarterCoin flipping={true} result={coinResult} size="sm" flipId={coinFlipId} />
                        <div className="text-[9px] uppercase font-bold text-amber-400 animate-pulse tracking-widest mt-1">Flipping coin...</div>
                      </div>
                    ) : coinResult && gamePhase === 'next' ? (
                      <div className="flex flex-col items-center gap-1 animate-scale-up">
                        <QuarterCoin flipping={false} result={coinResult} size="sm" flipId={coinFlipId} />
                        <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400 mt-1">Flip Outcome: {coinResult.toUpperCase()}</span>
                      </div>
                    ) : null}
                  </div>

                  {/* 3. Player Half Lineup */}
                  <div className="space-y-1 relative z-10">
                    <div className="text-[7.5px] uppercase font-bold text-neutral-600 tracking-widest text-center mb-1">Your Active Lineup</div>
                    <div className="flex justify-around items-start gap-2 lg:gap-3">
                      {starters.map((id, idx) => {
                        const c = playerCards.find(x => x.id === id);
                        if (!c) return null;
                        
                        const stats = getCardGameStats(c);
                        const isAttacker = playerPossession && c.id === selectedAttackerId;
                        const isDefender = !playerPossession && c.id === selectedDefenderId;
                        
                        // Selectable highlight flags
                        const canBeShooter = playerPossession && gamePhase === 'attack';
                        
                        // Defender restriction validation check
                        let canBeDefender = false;
                        if (!playerPossession && gamePhase === 'contest') {
                          canBeDefender = true;
                        }

                        const isHighlighted = isTutorialMatch && tutorialStep === 2 && !tutorialPopupOpen && (playerPossession ? canBeShooter : canBeDefender);
                        const highlightClass = playerPossession ? 'tutorial-highlight-orange' : 'tutorial-highlight-teal';
                        const borderStyle = isAttacker ? 'ring-4 ring-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.6)]'
                          : isDefender ? 'ring-4 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]'
                          : isHighlighted
                            ? `${highlightClass} scale-105 z-50 cursor-pointer relative`
                          : subsActive 
                            ? (selectedSubId === c.id 
                                ? 'ring-4 ring-amber-400 animate-pulse scale-105 z-20 shadow-[0_0_20px_rgba(245,158,11,0.7)] cursor-pointer' 
                                : 'ring-2 ring-blue-500/40 hover:ring-blue-500 cursor-pointer')
                            : canBeShooter ? 'ring-2 ring-orange-500/40 hover:ring-orange-500 cursor-pointer'
                            : canBeDefender ? 'ring-2 ring-blue-500/40 hover:ring-blue-500 cursor-pointer'
                            : '';
                        
                        const nameLabel = c.player.split('(')[0].trim().split(' ').pop();

                        return (
                          <div 
                            key={c.id + '_player_' + idx} 
                            className="w-[17.5%] min-[400px]:w-[18%] lg:w-[112px] xl:w-[128px] flex flex-col items-center gap-1.5"
                          >
                            <div 
                              onClick={() => {
                                if (subsActive) {
                                  if (selectedSubId === c.id) {
                                    setSelectedSubId(null);
                                  } else if (selectedSubId) {
                                    handleDragDropSwap(selectedSubId, c.id);
                                    setSelectedSubId(null);
                                  } else {
                                    setSelectedSubId(c.id);
                                  }
                                } else if (canBeShooter) {
                                  // Set the selected attacker so the user can choose the shot type in the Action Console
                                  setSelectedAttackerId(c.id);
                                } else if (canBeDefender) {
                                  handleSelectDefender(c.id);
                                }
                              }}
                              className={`relative w-full rounded-xl transition-all ${borderStyle}`}
                            >
                              <HoloCard 
                                card={c} 
                                size="game" 
                                interactive={true}
                                hideAttributes={false}
                              />
                              
                              {/* Gassed Overlay */}
                              {c.currentSta <= 20 && (
                                <div className="absolute inset-0 bg-red-950/80 rounded-xl flex items-center justify-center z-30 border border-red-500/30 pointer-events-none">
                                  <span className="text-[8px] font-black uppercase text-red-500 font-mono tracking-widest rotate-[-12deg]">GASSED</span>
                                </div>
                              )}

                              {/* Tutorial Select Card Badge */}
                              {isHighlighted && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[7px] font-black px-2 py-0.5 rounded-full shadow-lg z-30 tracking-widest uppercase animate-bounce pointer-events-none">
                                  SELECT
                                </div>
                              )}
                            </div>

                            {/* Name & Stamina Gauge */}
                            <div className="w-full flex flex-col items-center leading-none gap-1">
                              <span className="text-[7.5px] font-bold text-neutral-400 truncate max-w-[72px]">
                                <span className="text-amber-400 font-extrabold mr-0.5">{stats.pos}</span> {nameLabel}
                              </span>
                              <div className="h-1.5 w-full max-w-[72px] bg-neutral-950 rounded-full overflow-hidden relative border border-white/5">
                                <div 
                                  className={`h-full ${c.currentSta <= 20 ? 'bg-red-500' : c.currentSta <= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                  style={{ width: `${(c.currentSta/stats.sta)*100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bench view roster strip */}
                <div className="glass-panel p-3 sm:p-4 rounded-2xl border border-white/5 bg-black/60">
                  <button 
                    onClick={() => setIsBenchCollapsed(!isBenchCollapsed)}
                    className="w-full text-[9px] uppercase font-bold text-neutral-400 tracking-wider mb-2 flex justify-between items-center cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      📋 Bench Substitutes {subsActive ? '(Click Starter and Bench card to swap)' : '(Call Timeout to make substitutions)'}
                      <iconify-icon icon={isBenchCollapsed ? "solar:alt-arrow-down-bold" : "solar:alt-arrow-up-bold"} width="10"></iconify-icon>
                      {subsActive && <span className="text-[8px] bg-red-950/20 text-red-500 font-bold px-1.5 py-0.5 rounded border border-red-500/10 tracking-wider ml-1.5 animate-pulse">SUBS ACTIVE</span>}
                    </span>
                    <span className="text-neutral-500 text-[8px] hidden min-[400px]:inline">Bench heals +20 on Timeouts</span>
                  </button>
                  {!isBenchCollapsed && (
                    <div className="flex gap-3 sm:gap-4 justify-center transition-all animate-modal-entry flex-wrap">
                    {bench.map(id => {
                      const c = playerCards.find(x => x.id === id);
                      if (!c) return null;
                      
                      const stats = getCardGameStats(c);
                      const isSubActive = subsActive;
                      const nameLabel = c.player.split('(')[0].trim().split(' ').pop();
                      
                      return (
                        <div 
                          key={c.id + '_bench'}
                          className="w-[15%] lg:w-[96px] xl:w-[112px] flex flex-col items-center gap-1.5 flex-shrink-0"
                        >
                          <div 
                            onClick={() => {
                              if (isSubActive) {
                                if (selectedSubId === c.id) {
                                  setSelectedSubId(null);
                                } else if (selectedSubId) {
                                  handleDragDropSwap(selectedSubId, c.id);
                                  setSelectedSubId(null);
                                } else {
                                  setSelectedSubId(c.id);
                                }
                              }
                            }}
                            className={`relative w-full rounded-xl transition-all ${
                              isSubActive 
                                ? (selectedSubId === c.id 
                                    ? 'ring-4 ring-amber-400 animate-pulse scale-105 z-20 shadow-[0_0_20px_rgba(245,158,11,0.7)] cursor-pointer' 
                                    : 'ring-2 ring-blue-500/40 hover:ring-blue-500 cursor-pointer') 
                                : 'opacity-60'
                            }`}
                          >
                            <HoloCard 
                              card={c} 
                              size="game" 
                              interactive={isSubActive}
                              hideAttributes={false}
                            />
                          </div>

                          {/* Name & Stamina Gauge */}
                          <div className="w-full flex flex-col items-center leading-none gap-1">
                            <span className="text-[7.5px] font-bold text-neutral-400 truncate max-w-[72px]">
                              <span className="text-amber-400 font-extrabold mr-0.5">{stats.pos}</span> {nameLabel}
                            </span>
                            <div className="h-1.5 w-full max-w-[72px] bg-neutral-950 rounded-full overflow-hidden relative border border-white/5">
                              <div className="h-full bg-emerald-600" style={{ width: `${(c.currentSta/stats.sta)*100}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  )}
                </div>
                </div>
              </div>
              
              {/* Right Panel: Game Commentary Feed + Action Controller Console */}
              <div className="flex flex-col gap-4 lg:gap-6 lg:min-h-0 lg:h-full">
                
                {/* 1. Live Play Commentary event log */}
                <div className="game-commentary order-2 lg:order-1 glass-panel p-4 rounded-2xl border border-white/5 bg-black/60 flex flex-col h-40 min-[400px]:h-48 lg:h-auto lg:flex-1 lg:min-h-0">
                  <div className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider mb-2 border-b border-white/5 pb-2 flex justify-between items-center">
                    <span>🎙️ Play-by-Play Commentary</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  </div>
                  <div 
                    ref={setLogScrollRef}
                    className="flex-1 overflow-y-auto font-mono text-[8px] leading-relaxed text-neutral-400 space-y-1.5 pr-2"
                  >
                    {gameLog.map((log, idx) => {
                      let color = 'text-neutral-400';
                      if (log.startsWith('🏀') || log.includes('SCORE')) color = 'text-orange-400 font-bold';
                      else if (log.startsWith('🪙')) color = 'text-yellow-400 font-bold';
                      else if (log.startsWith('🛡️') || log.includes('MISS')) color = 'text-blue-400 font-semibold';
                      else if (log.startsWith('🚨')) color = 'text-red-500 font-black';
                      else if (log.startsWith('-----------------')) color = 'text-neutral-700';
                      else if (log.startsWith('👑')) color = 'text-amber-300 font-black';
                      
                      return (
                        <div key={idx} className={color}>
                          {log}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Gameplay Controller panel */}
                <div className="game-console order-1 lg:order-2 glass-panel p-4 sm:p-5 rounded-2xl border border-white/5 bg-black/60 relative overflow-hidden flex flex-col justify-start gap-4 lg:flex-shrink-0">
                  <div className="absolute top-0 left-0 w-full h-[1.5px] bg-neutral-800" />
                  
                  {/* Chat Notification Box Simulation */}
                  {mockChatLog.length > 0 && (
                    <div className="absolute top-3 inset-x-3 z-30 space-y-1 animate-modal-entry pointer-events-none">
                      {mockChatLog.map(chat => (
                        <div key={chat.id} className="bg-[#1C2028]/90 border border-white/10 px-3 py-1.5 rounded-xl text-[7px] text-left flex gap-1.5 items-start shadow-xl max-w-[90%]">
                          <iconify-icon icon="solar:dialog-linear" width="10" className="text-amber-400 mt-0.5"></iconify-icon>
                          <div>
                            <span className="font-bold text-white uppercase">{chat.sender}:</span>
                            <span className="text-slate-300 ml-1 font-mono">&quot;{chat.msg}&quot;</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="w-full text-center">
                    <div className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest mb-1.5">Action Console</div>
                    
                    {/* --- TACTICAL WINDOW --- */}
                    {gamePhase === 'tactical' && (
                      <div className="space-y-4">
                        <p className="text-[9px] text-neutral-500">
                          {playerPossession 
                            ? "OFFENSE: Prepare your strategy. You can call a timeout or proceed to select a shooter." 
                            : "DEFENSE: Opponent is starting their play. Prepare your matchups."}
                        </p>
                        
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={handleProceedToAttack}
                            className={`w-full conic-btn py-3.5 ${isTutorialMatch && tutorialStep === 1 && !tutorialPopupOpen ? 'tutorial-highlight-orange scale-[1.02] z-50 relative' : ''}`}
                          >
                            <div className={`conic-spin-bg ${isTutorialMatch && tutorialStep === 1 && !tutorialPopupOpen ? 'opacity-100 animate-[spin_1.8s_linear_infinite]' : ''}`}></div>
                            <div className="conic-btn-mask"></div>
                            <span className="relative z-10 text-[10px] font-black text-white uppercase flex items-center justify-center gap-1.5">
                              {isTutorialMatch && tutorialStep === 1 && !tutorialPopupOpen && (
                                <span className="text-amber-400 animate-pulse mr-1 font-sans">👉</span>
                              )}
                              {playerPossession ? 'Go to Attack Phase' : 'Defend Play'} 
                              <iconify-icon icon="solar:arrow-right-linear" width="12"></iconify-icon>
                            </span>
                            {isTutorialMatch && tutorialStep === 1 && !tutorialPopupOpen && (
                              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 z-30">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border border-black flex items-center justify-center text-[6.5px] font-black text-black">!</span>
                              </span>
                            )}
                          </button>

                          {/* Timeout button */}
                          <button
                            onClick={() => callTimeout(true)}
                            disabled={playerTimeouts <= 0 || (!playerPossession && lastScorer !== 'opponent' && !(isTutorialMatch && tutorialStep === 7))}
                            className={`w-full py-3 rounded-xl border border-white/10 hover:border-white/20 text-[9px] font-bold text-neutral-300 hover:text-white uppercase disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-1.5 relative ${isTutorialMatch && tutorialStep === 7 && !tutorialPopupOpen ? 'tutorial-highlight-orange scale-[1.02] z-50' : ''}`}
                          >
                            <iconify-icon icon="solar:stopwatch-linear" width="12"></iconify-icon>
                            {isTutorialMatch && tutorialStep === 7 && !tutorialPopupOpen && (
                              <span className="text-amber-400 animate-pulse mr-1 font-sans">👉</span>
                            )}
                            Call Timeout (Rest Bench)
                            {isTutorialMatch && tutorialStep === 7 && !tutorialPopupOpen && (
                              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 z-30">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border border-black flex items-center justify-center text-[6.5px] font-black text-black">!</span>
                              </span>
                            )}
                          </button>

                          {isTutorialMatch && tutorialStep === 7 && !tutorialPopupOpen && (
                            <button
                              onClick={() => setTutorialStep(null)}
                              className="w-full py-2 rounded-xl border border-dashed border-white/10 hover:border-white/20 text-[8px] font-bold text-neutral-500 hover:text-white uppercase transition-all flex items-center justify-center gap-1 mt-1 z-50 relative"
                            >
                              Skip / End Tutorial
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* --- ATTACK SHOT SELECTION --- */}
                    {gamePhase === 'attack' && (
                      <div className="space-y-3">
                        <p className="text-[9px] text-neutral-500">
                          Select a shooter from your Starting Five on the court, then choose your shot attempt type.
                        </p>

                        {selectedAttackerId ? (
                          (() => {
                            const attCard = playerCards.find(x => x.id === selectedAttackerId);
                            const stats = getCardGameStats(attCard);
                            
                            const limit3pt = stats.perks.some(p => p.name === 'Sniper Zone') ? 7 : 6;
                            const limitAnd1 = 6;
                            
                            const threesAttempted = attCard.threesAttempted || 0;
                            const and1sAttempted = attCard.and1sAttempted || 0;
                            
                            const isGassed = attCard.currentSta <= 20 && !stats.perks.some(p => p.name === 'Heavy Duty');

                            return (
                              <div className="space-y-3 border border-white/5 bg-black/40 p-3.5 rounded-2xl">
                                <div className="text-[10px] font-bold text-white uppercase flex justify-between">
                                  <span>Selected: {attCard.player} ({stats.pos})</span>
                                  {isGassed && <span className="text-red-500 text-[8px] animate-pulse">GASSED</span>}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => handleSelectShooter(selectedAttackerId, 'mid_range')}
                                    className={`py-2 rounded-xl border border-orange-500/40 bg-orange-950/20 hover:bg-orange-950/40 text-orange-400 text-[10px] font-bold uppercase transition-all flex flex-col items-center justify-center gap-0.5 relative`}
                                  >
                                    <span className="text-white text-[9.5px]">Mid-Range</span>
                                    <span className="text-[8px] text-orange-400/80 font-mono">MID: {stats.mid}</span>
                                  </button>
                                  <button
                                    onClick={() => handleSelectShooter(selectedAttackerId, 'attack_rim')}
                                    className={`py-2 rounded-xl border border-blue-500/40 bg-blue-950/20 hover:bg-blue-950/40 text-blue-400 text-[10px] font-bold uppercase transition-all flex flex-col items-center justify-center gap-0.5 relative`}
                                  >
                                    <span className="text-white text-[9.5px]">Attack Basket</span>
                                    <span className="text-[8px] text-blue-400/80 font-mono">RIM: {stats.rim}</span>
                                  </button>
                                  <button
                                    onClick={() => handleSelectShooter(selectedAttackerId, 'three_pointer')}
                                    disabled={isGassed || threesAttempted >= limit3pt}
                                    className={`py-2 rounded-xl border border-amber-500/40 bg-amber-950/20 hover:bg-amber-950/40 text-amber-400 text-[10px] font-bold uppercase disabled:opacity-30 disabled:pointer-events-none transition-all flex flex-col items-center justify-center gap-0.5 relative`}
                                  >
                                    <span className="text-white text-[9.5px]">3-Pointer</span>
                                    <span className="text-[8px] text-amber-400/80 font-mono">3PT: {stats.tpt} ({threesAttempted}/{limit3pt})</span>
                                  </button>
                                  <button
                                    onClick={() => handleSelectShooter(selectedAttackerId, 'three_point_play')}
                                    disabled={isGassed || and1sAttempted >= limitAnd1}
                                    className={`py-2 rounded-xl border border-purple-500/40 bg-purple-950/20 hover:bg-purple-950/40 text-purple-400 text-[10px] font-bold uppercase disabled:opacity-30 disabled:pointer-events-none transition-all flex flex-col items-center justify-center gap-0.5 relative`}
                                  >
                                    <span className="text-white text-[9.5px]">3-Point Play</span>
                                    <span className="text-[8px] text-purple-400/80 font-mono">ATH: {stats.ath} ({and1sAttempted}/{limitAnd1})</span>
                                  </button>
                                </div>
                                {isGassed && (
                                  <span className="text-[7px] text-red-500 block text-center font-semibold mt-1">
                                    Gassed players cannot attempt 3-pointers or 3-point plays.
                                  </span>
                                )}
                              </div>
                            );
                          })()
                        ) : (
                          <div className="py-6 border border-dashed border-white/5 rounded-2xl flex items-center justify-center">
                            <span className="text-[8px] uppercase tracking-widest text-neutral-600">Select shooter from court</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* --- DEFENDER CONTEST --- */}
                    {gamePhase === 'contest' && (
                      <div className="space-y-3">
                        <p className="text-[9px] text-neutral-500">
                          {playerPossession 
                            ? "OPPONENT is selecting a defender to guard your shot..."
                            : "CONTEST PLAY: Select a starting defender from your floor to contest the shot. Matchup rules apply!"}
                        </p>
                        


                        {!playerPossession && (
                          <div className="py-6 border border-dashed border-blue-500/30 rounded-2xl flex items-center justify-center bg-blue-950/5">
                            <span className="text-[8px] uppercase tracking-widest text-blue-400 animate-pulse">Select defender from court (PG-PG/SG, C-PF/C, etc.)</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* --- PLAY RESOLUTION --- */}
                    {gamePhase === 'resolve' && (
                      <div className="space-y-4">
                        {(() => {
                          const att = playerPossession 
                            ? playerCards.find(x => x.id === selectedAttackerId) 
                            : opponentCards.slice(0, 5).find(x => x.id === selectedAttackerId);
                            
                          const def = playerPossession
                            ? opponentCards.slice(0, 5).find(x => x.id === selectedDefenderId)
                            : playerCards.find(x => x.id === selectedDefenderId);

                          const attStats = getCardGameStats(att);
                          const defStats = getCardGameStats(def);

                          // Check if Grail Card (HoF Aura) is available for bypass roll
                          const attHasGrail = attStats.perks.some(p => p.name === 'Hall of Fame Aura');
                          const defHasGrail = defStats.perks.some(p => p.name === 'Hall of Fame Aura');

                          const canPlayerUseGrail = playerPossession ? (attHasGrail && !selectedGrailUsed) : (defHasGrail && !selectedGrailUsed);
                          const canOpponentUseGrail = !playerPossession ? (attHasGrail && !oppGrailUsed) : (defHasGrail && !oppGrailUsed);

                          // CPU smart usage of Hall of Fame Aura
                          // CPU uses HoF Aura if it's a tight score or 4th quarter and they haven't used it
                          const shouldCpuUseGrail = canOpponentUseGrail && (possessionCount >= 20 || Math.abs(playerScore - opponentScore) <= 2) && (((possessionCount * 7 + 3) % 10) < 5);

                          return (
                            <div className="space-y-3">
                              <div className="border border-white/5 bg-black/45 p-3 rounded-2xl text-[8.5px] leading-tight space-y-1">
                                <div className="text-neutral-400">Matchup Roll Resolution:</div>
                                {(() => {
                                  let attLabel = 'OFF';
                                  let attVal = attStats.off;
                                  let defLabel = 'DEF';
                                  let defVal = defStats.def;
                                  let activeShotType = shotType;
                                  const hasDefensiveAnchor = defStats.perks.some(p => p.name === 'Defensive Anchor');
                                  if (hasDefensiveAnchor && (activeShotType === 'three_pointer' || activeShotType === 'three_point_play')) {
                                    if (activeShotType === 'three_pointer') {
                                      activeShotType = 'mid_range';
                                    } else {
                                      activeShotType = 'attack_rim';
                                    }
                                  }

                                  if (activeShotType === 'mid_range') {
                                    attLabel = 'MID';
                                    attVal = attStats.mid;
                                    defLabel = 'DEF/MID';
                                    defVal = Math.round(defStats.def * 0.7 + defStats.mid * 0.3);
                                  } else if (activeShotType === 'attack_rim') {
                                    attLabel = 'RIM';
                                    attVal = attStats.rim;
                                    defLabel = 'DEF/ATH';
                                    defVal = Math.round(defStats.def * 0.7 + defStats.ath * 0.3);
                                  } else if (activeShotType === 'three_pointer') {
                                    attLabel = '3PT';
                                    attVal = attStats.tpt;
                                    defLabel = 'DEF/3PT';
                                    defVal = Math.round(defStats.def * 0.7 + defStats.tpt * 0.3);
                                  } else if (activeShotType === 'three_point_play') {
                                    attLabel = 'ATH';
                                    attVal = attStats.ath;
                                    defLabel = 'DEF/ATH';
                                    defVal = Math.round(defStats.def * 0.7 + defStats.ath * 0.3);
                                  }

                                  const { finalAtt, finalDef } = getMatchupRatings(att, def, activeShotType, possessionCount, playerPossession);

                                  return (
                                    <React.Fragment>
                                      <div className="flex justify-between font-mono text-white">
                                        <span>🏀 OFFENSE: {att.player.split(' ').pop()} ({attStats.pos})</span>
                                        <span className="font-bold">{attVal} {attLabel} (Final: {finalAtt})</span>
                                      </div>
                                      <div className="flex justify-between font-mono text-neutral-400">
                                        <span>🛡️ DEFENSE: {def.player.split(' ').pop()} ({defStats.pos})</span>
                                        <span className="font-bold">{defVal} {defLabel} (Final: {finalDef})</span>
                                      </div>
                                    </React.Fragment>
                                  );
                                })()}
                              </div>

                              <div className="flex flex-col gap-2">
                                {/* Coin Flip trigger button */}
                                <button
                                  onClick={() => {
                                    if (shouldCpuUseGrail) {
                                      resolveShotPlay('opponent');
                                    } else {
                                      resolveShotPlay(false);
                                    }
                                  }}
                                  disabled={coinFlipping}
                                  className="w-full conic-btn py-3.5"
                                >
                                  <div className="conic-spin-bg"></div>
                                  <div className="conic-btn-mask"></div>
                                  <span className="relative z-10 text-[10px] font-black text-white uppercase flex items-center justify-center gap-1.5">
                                    Flip Coin to Resolve
                                  </span>
                                </button>

                                {/* Hall of Fame Aura active trigger */}
                                {canPlayerUseGrail && (
                                  <button
                                    onClick={() => resolveShotPlay('player')}
                                    className="w-full py-2.5 rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300 text-[9px] font-bold uppercase transition-all flex items-center justify-center gap-1"
                                  >
                                    👑 Use Hall of Fame Aura (Auto-Win Roll)
                                  </button>
                                )}

                                <div 
                                  className="text-[7.5px] text-amber-500 italic block transition-opacity duration-200"
                                  style={{ height: '12px', opacity: shouldCpuUseGrail ? 1 : 0, visibility: shouldCpuUseGrail ? 'visible' : 'hidden' }}
                                >
                                  Opponent coach is preparing to invoke Hall of Fame Aura...
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* --- NEXT POSSESSION --- */}
                    {gamePhase === 'next' && (
                      <div className="space-y-4">
                        <p className="text-[9px] text-neutral-500">
                          Play resolved! Prepare for the next possession of the game.
                        </p>
                        
                        <button
                          onClick={handleNextPossession}
                          className="w-full conic-btn py-3.5"
                        >
                          <div className="conic-spin-bg"></div>
                          <div className="conic-btn-mask"></div>
                          <span className="relative z-10 text-[10px] font-black text-white uppercase flex items-center justify-center gap-1.5">
                            Advance Play 
                            <iconify-icon icon="solar:arrow-right-linear" width="12"></iconify-icon>
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* FACE-OFF SPOTLIGHT (Contest / Resolve / Next phases) */}
              {(gamePhase === 'contest' || gamePhase === 'resolve' || gamePhase === 'next') && selectedAttackerId && (
                <div className={`absolute inset-0 ${isLight ? 'bg-white/90 border border-slate-200/60 shadow-2xl' : 'bg-black/80'} z-30 flex flex-col items-center justify-center p-2 sm:p-4 animate-faceoff-fade-in backdrop-blur-md overflow-hidden`} style={{ borderRadius: '24px' }}>
                  {(() => {
                    const att = playerPossession 
                      ? playerCards.find(x => x.id === selectedAttackerId) 
                      : opponentCards.slice(0, 5).find(x => x.id === selectedAttackerId);
                    if (!att) return null;
                    const stats = getCardGameStats(att);
                    const isOneOfOne = att.id.includes('::One-of-One') || (att.parallel && (att.parallel.includes('One-of-One') || att.parallel.includes('1/1')));
                    
                    const isNext = gamePhase === 'next';
                    const isWinner = isNext && (playerPossession ? lastScorer === 'player' : lastScorer === 'opponent');
                    const isLoser = isNext && !isWinner;

                    const def = selectedDefenderId 
                      ? (playerPossession
                        ? opponentCards.slice(0, 5).find(x => x.id === selectedDefenderId)
                        : playerCards.find(x => x.id === selectedDefenderId))
                      : null;

                    let defStats = null;
                    let isDefOneOfOne = false;
                    let isDefWinner = false;
                    let isDefLoser = false;
                    
                    if (def) {
                      defStats = getCardGameStats(def);
                      isDefOneOfOne = def.id.includes('::One-of-One') || (def.parallel && (def.parallel.includes('One-of-One') || def.parallel.includes('1/1')));
                      isDefWinner = isNext && (playerPossession ? lastScorer !== 'player' : lastScorer !== 'opponent');
                      isDefLoser = isNext && !isDefWinner;
                    }

                    const attHasGrail = stats.perks.some(p => p.name === 'Hall of Fame Aura');
                    const defHasGrail = defStats ? defStats.perks.some(p => p.name === 'Hall of Fame Aura') : false;
                    const canPlayerUseGrail = playerPossession ? (attHasGrail && !selectedGrailUsed) : (defHasGrail && !selectedGrailUsed);
                    const canOpponentUseGrail = !playerPossession ? (attHasGrail && !oppGrailUsed) : (defHasGrail && !oppGrailUsed);
                    const shouldCpuUseGrail = canOpponentUseGrail && (possessionCount >= 20 || Math.abs(playerScore - opponentScore) <= 2) && (((possessionCount * 7 + 3) % 10) < 5);

                    const matchupMap = {
                      'PG': ['PG', 'SG'],
                      'SG': ['PG', 'SG', 'SF'],
                      'SF': ['SG', 'SF', 'PF'],
                      'PF': ['SF', 'PF', 'C'],
                      'C': ['PF', 'C']
                    };

                    return (
                      <React.Fragment>
                        {/* Glowing scanlines behind the spotlight */}
                        <div className="absolute inset-0 dot-grid-bg opacity-[0.07] pointer-events-none" />
                        <div className={`absolute top-[20%] left-[-20%] w-[140%] h-[2px] bg-gradient-to-r from-transparent ${isLight ? 'via-orange-500/25' : 'via-orange-500/30'} to-transparent rotate-[35deg] animate-pulse`} />
                        <div className={`absolute bottom-[20%] right-[-20%] w-[140%] h-[2px] bg-gradient-to-r from-transparent ${isLight ? 'via-blue-500/25' : 'via-blue-500/30'} to-transparent rotate-[35deg] animate-pulse`} />

                        {/* Face-off Title Header */}
                        <div className={`text-[10px] sm:text-xs uppercase font-black tracking-widest ${isLight ? 'text-slate-600' : 'text-neutral-400'} mb-3 sm:mb-4 flex items-center gap-2 z-10`}>
                          <iconify-icon icon="solar:fire-bold" width="12" className="text-orange-500 animate-pulse"></iconify-icon>
                          <span>Matchup Battle: Star Face-Off</span>
                          <iconify-icon icon="solar:shield-bold" width="12" className="text-blue-500 animate-pulse"></iconify-icon>
                        </div>

                        {/* Play Indicator Banner */}
                        {(() => {
                          const isShooter = stats.primaryBadge.type === 'three_pointer';
                          const limit = isShooter ? (6 + (stats.perks.some(p => p.name === 'Sniper Zone') ? 1 : 0)) : 6;
                          
                          if (shotType === 'three_pointer' || shotType === 'three_point_play') {
                            if (shotType === 'three_pointer') {
                              const attempted = att.threesAttempted || 0;
                              return (
                                <div className="mb-4 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono text-[9px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-scale-up z-10">
                                  <iconify-icon icon="solar:target-bold" className="animate-spin text-amber-400" style={{ animationDuration: '3s' }}></iconify-icon>
                                  <span>🏀 3-POINT SHOT ATTEMPT</span>
                                  <span className="text-amber-500/60 font-extrabold">•</span>
                                  <span className="text-amber-300 font-bold">Attempt {attempted + 1} of {limit}</span>
                                </div>
                              );
                            } else {
                              const attempted = att.and1sAttempted || 0;
                              return (
                                <div className="mb-4 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 font-mono text-[9px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.25)] animate-scale-up z-10">
                                  <iconify-icon icon="solar:bolt-bold" className="animate-pulse text-purple-400"></iconify-icon>
                                  <span>⚡ 3-POINT PLAY DRIVE (AND-1)</span>
                                  <span className="text-purple-500/60 font-extrabold">•</span>
                                  <span className="text-purple-300 font-bold">Drive {attempted + 1} of {limit}</span>
                                </div>
                              );
                            }
                          } else {
                            if (shotType === 'mid_range') {
                              return (
                                <div className="mb-4 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 font-mono text-[9px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(249,115,22,0.25)] animate-scale-up z-10">
                                  <iconify-icon icon="solar:basketball-bold" className="text-orange-400"></iconify-icon>
                                  <span>🏀 MID-RANGE PULL-UP ATTEMPT</span>
                                </div>
                              );
                            } else {
                              return (
                                <div className="mb-4 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 font-mono text-[9px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.25)] animate-scale-up z-10">
                                  <iconify-icon icon="solar:basketball-bold" className="text-blue-400"></iconify-icon>
                                  <span>🏀 ATTACK TO THE BASKET</span>
                                </div>
                              );
                            }
                          }
                        })()}

                        {/* Split Spotlight Cards Row */}
                        <div className="flex items-center justify-center gap-4 sm:gap-8 w-full max-w-[550px] my-1 sm:my-2 z-10">
                          {/* Attacker Card */}
                          <div className={`w-[36%] sm:w-[38%] max-w-[165px] sm:max-w-[210px] aspect-[3/4] relative transition-all duration-300 shadow-2xl animate-slam-left rounded-2xl ${
                            isWinner ? 'scale-105 shadow-[0_0_20px_rgba(16,185,129,0.5)] ring-4 ring-emerald-500'
                            : isLoser ? 'opacity-40 grayscale scale-95'
                            : 'shadow-[0_0_25px_rgba(249,115,22,0.6)] ring-4 ring-orange-500'
                          }`}>
                            <HoloCard 
                              card={att} 
                              size="game" 
                              interactive={true}
                              hideAttributes={false}
                            />
                            {isWinner && (
                              <div className="absolute -top-2 -right-2 bg-emerald-500 text-white font-extrabold text-[8px] sm:text-[10px] uppercase px-2 py-0.5 rounded-md shadow-lg border border-white/20 animate-bounce z-20">
                                WON
                              </div>
                            )}
                          </div>

                          {/* VS Divider & Coin Portal */}
                          <div className="flex flex-col items-center justify-center gap-2 z-10">
                            <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center overflow-visible">
                              {coinFlipping ? (
                                <QuarterCoin flipping={true} result={coinResult} size="md" flipId={coinFlipId} />
                              ) : coinResult && gamePhase === 'next' ? (
                                <QuarterCoin flipping={false} result={coinResult} size="md" flipId={coinFlipId} />
                              ) : (
                                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full ${isLight ? 'bg-slate-100 border border-slate-200 text-slate-500' : 'bg-neutral-900 border border-white/10 text-neutral-400'} flex items-center justify-center text-[10px] sm:text-xs font-extrabold font-mono shadow-inner z-10`}>
                                  VS
                                </div>
                              )}
                              <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-md animate-pulse pointer-events-none" />
                            </div>
                          </div>

                          {/* Defender Card */}
                          {!def ? (
                            <div className={`w-[36%] sm:w-[38%] max-w-[165px] sm:max-w-[210px] aspect-[3/4] ${isLight ? 'bg-slate-100 border-slate-200/60' : 'bg-neutral-950/85 border-white/15'} border border-dashed rounded-xl sm:rounded-2xl flex flex-col justify-center items-center text-center relative transition-all duration-300 opacity-80 animate-pulse`}>
                              <iconify-icon icon="solar:shield-bold" width="20" className={`${isLight ? 'text-slate-400' : 'text-neutral-700'} mb-1 sm:mb-2`}></iconify-icon>
                              <span className={`text-[6.5px] sm:text-[8.5px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-400' : 'text-neutral-600'}`}>Selecting<br/>Defender...</span>
                            </div>
                          ) : (
                            <div className={`w-[36%] sm:w-[38%] max-w-[165px] sm:max-w-[210px] aspect-[3/4] relative transition-all duration-300 shadow-2xl animate-slam-right rounded-2xl ${
                              isDefWinner ? 'scale-105 shadow-[0_0_20px_rgba(16,185,129,0.5)] ring-4 ring-emerald-500'
                              : isDefLoser ? 'opacity-40 grayscale scale-95'
                              : 'shadow-[0_0_25px_rgba(59,130,246,0.6)] ring-4 ring-blue-500'
                            }`}>
                              <HoloCard 
                                card={def} 
                                size="game" 
                                interactive={true}
                                hideAttributes={false}
                              />
                              {isDefWinner && (
                                <div className="absolute -top-2 -right-2 bg-emerald-500 text-white font-extrabold text-[8px] sm:text-[10px] uppercase px-2 py-0.5 rounded-md shadow-lg border border-white/20 animate-bounce z-20">
                                  WON
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Stat Differential Slider Bars */}
                        {def && (
                          (() => {
                            let activeShotType = shotType;
                            const hasDefensiveAnchor = defStats.perks.some(p => p.name === 'Defensive Anchor');
                            if (hasDefensiveAnchor && (activeShotType === 'three_pointer' || activeShotType === 'three_point_play')) {
                              if (activeShotType === 'three_pointer') {
                                activeShotType = 'mid_range';
                              } else {
                                activeShotType = 'attack_rim';
                              }
                            }
                            const { finalAtt, finalDef } = getMatchupRatings(att, def, activeShotType, possessionCount, playerPossession);

                            const totalStats = finalAtt + finalDef;
                            const attPercent = totalStats > 0 ? (finalAtt / totalStats) * 100 : 50;
                            
                            const totalOvr = stats.ovr + defStats.ovr;
                            const ovrPercent = totalOvr > 0 ? (stats.ovr / totalOvr) * 100 : 50;

                            let typeLabel = 'OFF';
                            let defTypeLabel = 'DEF';
                            if (activeShotType === 'mid_range') {
                              typeLabel = 'MID';
                              defTypeLabel = 'DEF/MID';
                            } else if (activeShotType === 'attack_rim') {
                              typeLabel = 'RIM';
                              defTypeLabel = 'DEF/ATH';
                            } else if (activeShotType === 'three_pointer') {
                              typeLabel = '3PT';
                              defTypeLabel = 'DEF/3PT';
                            } else if (activeShotType === 'three_point_play') {
                              typeLabel = 'ATH';
                              defTypeLabel = 'DEF/ATH';
                            }

                            return (
                              <div className={`w-full max-w-[500px] mt-4 border ${isLight ? 'border-slate-200 bg-white shadow-xl' : 'border-white/5 bg-black/75'} p-3 sm:p-4 rounded-2xl flex flex-col gap-3 relative z-10`}>
                                {(att.id.includes('::One-of-One') || def.id.includes('::One-of-One')) && (
                                  <div className={`text-[7px] sm:text-[9.5px] font-black uppercase text-center ${isLight ? 'bg-amber-500/10 text-amber-700 border-amber-200' : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'} border py-0.5 rounded tracking-widest animate-pulse mb-1 leading-none`}>
                                    👑 One-of-One +5 Att Boost Active 👑
                                  </div>
                                )}

                                {/* Stat Bar 1: Final Matchup Rating */}
                                <div className="flex flex-col gap-1.5">
                                  <div className={`flex justify-between text-[8px] sm:text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-neutral-400'} font-bold uppercase leading-none`}>
                                    <span className="text-orange-400">Matchup {typeLabel}: {finalAtt}</span>
                                    <span className="text-blue-400">Matchup {defTypeLabel}: {finalDef}</span>
                                  </div>
                                  <div className={`h-2.5 w-full ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-neutral-900 border-white/5'} rounded-full overflow-hidden flex border`}>
                                    <div className="h-full bg-gradient-to-r from-orange-600 to-orange-500" style={{ width: `${attPercent}%` }} />
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 flex-1" />
                                  </div>
                                </div>

                                {/* Stat Bar 2: Base Card OVR comparison */}
                                <div className="flex flex-col gap-1.5">
                                  <div className={`flex justify-between text-[8px] sm:text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-neutral-400'} font-bold uppercase leading-none`}>
                                    <span className="text-orange-400">Card OVR: {stats.ovr}</span>
                                    <span className="text-blue-400">Card OVR: {defStats.ovr}</span>
                                  </div>
                                  <div className={`h-2.5 w-full ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-neutral-900 border-white/5'} rounded-full overflow-hidden flex border`}>
                                    <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500" style={{ width: `${ovrPercent}%` }} />
                                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 flex-1" />
                                  </div>
                                </div>
                              </div>
                            );
                          })()
                        )}

                        {/* Inline controls */}
                        {gamePhase === 'contest' && !def && !playerPossession && (
                          <div className={`w-full max-w-[500px] mt-4 border ${isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-black/85'} p-3 sm:p-4 rounded-2xl flex flex-col gap-2.5 shadow-2xl relative z-10 animate-scale-up`}>
                            <div className={`text-[10px] sm:text-xs font-black uppercase tracking-wider ${isLight ? 'text-blue-600' : 'text-blue-400'} text-center animate-pulse`}>
                              Select a Defender to Contest:
                            </div>
                            <div className="flex justify-around items-center gap-2 mt-1">
                              {starters.map((sid, idx) => {
                                const c = playerCards.find(x => x.id === sid);
                                if (!c) return null;
                                const cStats = getCardGameStats(c);

                                return (
                                  <div
                                    key={sid + '_inline_def'}
                                    onClick={() => handleSelectDefender(c.id)}
                                    className={`w-[18%] flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 ${
                                      isLight ? 'hover:scale-105 border border-blue-300 hover:border-blue-500 rounded-lg p-0.5 bg-blue-50 shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'hover:scale-105 border border-blue-500/50 hover:border-blue-400 rounded-lg p-0.5 bg-blue-950/10 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                                    }`}
                                  >
                                    <div className="w-full aspect-[3/4] rounded overflow-hidden relative">
                                      <img src={c.frontImg} className="w-full h-full object-cover" />
                                      {c.currentSta <= 20 && (
                                        <div className="absolute inset-0 bg-red-950/70 flex items-center justify-center">
                                          <span className="text-[5px] font-black text-red-500 font-mono tracking-tighter">GASSED</span>
                                        </div>
                                      )}
                                    </div>
                                    <span className={`text-[7px] sm:text-[8px] font-extrabold ${isLight ? 'text-slate-700' : 'text-neutral-300'} leading-none truncate max-w-full`}>
                                      {c.player.split(' ').pop()}
                                    </span>
                                    <span className={`text-[6px] sm:text-[7px] font-mono leading-none ${isLight ? 'text-blue-600 font-bold' : 'text-blue-400 font-bold'}`}>
                                      {cStats.pos} (P:{cStats.perDef}|R:{cStats.rimDef})
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className={`text-[6.5px] sm:text-[8.5px] ${isLight ? 'text-slate-500' : 'text-neutral-400'} text-center italic leading-none`}>
                              No position locks! Choose the best defender based on their PRD (Perimeter Defense) or RMP (Rim Protection) rating.
                            </div>
                          </div>
                        )}

                        {gamePhase === 'contest' && isTutorialMatch && tutorialStep === 4 && !tutorialPopupOpen && (
                          <div className="w-full max-w-[500px] mt-4 z-10 animate-scale-up">
                            <button
                              onClick={handleTutorialBtnAction}
                              className="w-full py-3.5 conic-btn primary tutorial-highlight-orange scale-[1.02] z-50 relative mt-2"
                            >
                              <div className="conic-spin-bg opacity-100 animate-[spin_1.8s_linear_infinite]"></div>
                              <div className="conic-btn-mask"></div>
                              <span className="relative z-10 text-[10px] sm:text-xs font-black text-white uppercase flex items-center justify-center gap-1.5 font-mono">
                                <span className="text-amber-400 animate-pulse mr-1 font-sans">👉</span>
                                See Contest Matchup
                              </span>
                            </button>
                          </div>
                        )}

                        {gamePhase === 'resolve' && (
                          <div className="w-full max-w-[500px] mt-4 flex flex-col gap-2 z-10 animate-scale-up">
                            <button
                              onClick={() => {
                                  if (shouldCpuUseGrail) {
                                    resolveShotPlay('opponent');
                                  } else {
                                    resolveShotPlay(false);
                                  }
                              }}
                              disabled={coinFlipping}
                              className={`w-full conic-btn py-4 shadow-[0_0_20px_rgba(255,145,70,0.2)] ${
                                isTutorialMatch && tutorialStep === 5 && !tutorialPopupOpen ? 'tutorial-highlight-orange scale-[1.02] z-50 relative' : ''
                              }`}
                            >
                              <div className={`conic-spin-bg ${isTutorialMatch && tutorialStep === 5 && !tutorialPopupOpen ? 'opacity-100 animate-[spin_1.8s_linear_infinite]' : ''}`}></div>
                              <div className="conic-btn-mask"></div>
                              <span className="relative z-10 text-[10px] sm:text-xs font-black text-white uppercase flex items-center justify-center gap-2">
                                {isTutorialMatch && tutorialStep === 5 && !tutorialPopupOpen && (
                                  <span className="text-amber-400 animate-pulse mr-1 font-sans">👉</span>
                                )}
                                🪙 {coinFlipping ? 'Flipping Coin...' : 'Flip Coin to Resolve Matchup'}
                              </span>
                              {isTutorialMatch && tutorialStep === 5 && !tutorialPopupOpen && (
                                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 z-30">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border border-black flex items-center justify-center text-[6.5px] font-black text-black">!</span>
                                </span>
                              )}
                            </button>

                            {canPlayerUseGrail && (
                              <button
                                onClick={() => resolveShotPlay('player')}
                                disabled={coinFlipping}
                                className={`w-full py-3 rounded-xl border ${isLight ? 'border-amber-400 bg-amber-500/10 text-amber-800 hover:bg-amber-500/20 shadow-sm' : 'border-amber-400/40 bg-amber-400/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]'} text-[10px] sm:text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95`}
                              >
                                👑 Use Hall of Fame Aura (Auto-Win Matchup)
                              </button>
                            )}

                            <div 
                              className={`text-[8px] sm:text-[10px] ${isLight ? 'text-amber-700' : 'text-amber-400'} font-bold italic text-center animate-pulse transition-opacity duration-200 flex items-center justify-center`}
                              style={{ height: '16px', opacity: shouldCpuUseGrail ? 1 : 0, visibility: shouldCpuUseGrail ? 'visible' : 'hidden' }}
                            >
                              ⚠️ Opponent coach is invoking Hall of Fame Aura for this play!
                            </div>
                          </div>
                        )}

                        {gamePhase === 'next' && (
                          <div className="w-full max-w-[500px] mt-4 z-10 animate-scale-up">
                            <button
                              onClick={handleNextPossession}
                              className={`w-full conic-btn py-4 shadow-[0_0_20px_rgba(70,212,198,0.2)] animate-bounce ${
                                isTutorialMatch && tutorialStep === 6 && !tutorialPopupOpen ? 'tutorial-highlight-orange scale-[1.02] z-50 relative' : ''
                              }`}
                            >
                              <div className={`conic-spin-bg ${isTutorialMatch && tutorialStep === 6 && !tutorialPopupOpen ? 'opacity-100 animate-[spin_1.8s_linear_infinite]' : ''}`}></div>
                              <div className="conic-btn-mask"></div>
                              <span className="relative z-10 text-[10px] sm:text-xs font-black text-white uppercase flex items-center justify-center gap-2">
                                {isTutorialMatch && tutorialStep === 6 && !tutorialPopupOpen && (
                                  <span className="text-amber-400 animate-pulse mr-1 font-sans">👉</span>
                                )}
                                Advance Play
                                <iconify-icon icon="solar:arrow-right-linear" width="16"></iconify-icon>
                              </span>
                              {isTutorialMatch && tutorialStep === 6 && !tutorialPopupOpen && (
                                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 z-30">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border border-black flex items-center justify-center text-[6.5px] font-black text-black">!</span>
                                </span>
                              )}
                            </button>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })()}
                </div>
              )}
            </div>
            <div className="h-24 md:hidden" />
          </div>
        )}

          {/* 6. SUDDEN DEATH OVERTIME WINDOW */}
          {isOvertime && (
            <div className="glass-panel p-8 rounded-3xl border border-white/5 text-center max-w-md mx-auto w-full space-y-6 animate-modal-entry z-50">
              <h3 className="text-lg font-black uppercase text-amber-500 animate-pulse">SUDDEN DEATH OVERTIME</h3>
              <p className="text-xs text-neutral-400">
                Regulations tied! Both coaches must select one single player to resolve a 1-on-1 winner-take-all roll.
              </p>

              {/* Player single roster selection */}
              <div className="space-y-3">
                <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Choose Your Champion</div>
                <div className="grid grid-cols-2 gap-2">
                  {starters.map(id => {
                    const c = playerCards.find(x => x.id === id);
                    const stats = getCardGameStats(c);
                    return (
                      <button
                        key={id + '_ot'}
                        onClick={() => {
                          // CPU selects their champion (usually center or best overall)
                          const oppBest = opponentCards.slice(0, 5).sort((a, b) => getCardGameStats(b).ovr - getCardGameStats(a).ovr)[0];
                          resolveSuddenDeathMatchup(c.id, oppBest.id);
                        }}
                        className="py-2.5 rounded-xl border border-white/5 bg-white/5 text-[9px] text-white uppercase font-bold hover:border-amber-400 transition-all flex flex-col items-center gap-1"
                      >
                        <span>{c.player.split(' ').pop()} ({stats.pos})</span>
                        <span className="text-amber-400 text-[10px] font-mono">{stats.ovr} OVR</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 7. END GAME RESULT PANEL */}
          {gameState === 'ended' && (
            <div className="glass-panel p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/5 text-center max-w-md mx-auto w-full space-y-4 sm:space-y-6 animate-modal-entry">
              <div className="flex flex-col items-center">
                <iconify-icon icon="solar:crown-minimalistic-bold" width="54" className="text-amber-400 animate-bounce"></iconify-icon>
                <h3 className="text-xl font-bold tracking-widest uppercase text-white mt-4">Match Terminated!</h3>
                
                {playerScore > opponentScore ? (
                  <span className="text-green-500 text-lg font-black uppercase mt-1">🏆 Victory! You Won 🏆</span>
                ) : (
                  <span className="text-red-500 text-lg font-black uppercase mt-1">😭 Defeat! You Lost 😭</span>
                )}
              </div>

              <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex justify-around font-mono text-sm">
                <div>
                  <div className="text-[9px] uppercase font-bold text-neutral-500">Your Score</div>
                  <div className="text-2xl font-black text-white mt-1">{playerScore}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-neutral-500">Opponent</div>
                  <div className="text-2xl font-black text-white mt-1">{opponentScore}</div>
                </div>
              </div>

              <div className="bg-[#1C2028] p-4 rounded-2xl text-left border border-white/10 text-xs">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Arena Rewards:</span>
                  <span className="text-green-400">
                    +{opponentType === 'online' 
                      ? (playerScore > opponentScore ? 300 : 120) 
                      : (cpuDifficulty === 'rookie' ? (playerScore > opponentScore ? 80 : 30) : cpuDifficulty === 'veteran' ? (playerScore > opponentScore ? 120 : 50) : (playerScore > opponentScore ? 180 : 70))
                    } XP
                  </span>
                </div>
                <p className="text-[9px] text-neutral-400 mt-1 leading-relaxed">
                  Excellent coaching. Your match records and Arena statistics have been updated in your profile database.
                </p>
              </div>

              <button 
                onClick={handleReturnToLobby}
                className="w-full conic-btn py-3.5"
              >
                <div className="conic-spin-bg"></div>
                <div className="conic-btn-mask"></div>
                <span className="relative z-10 text-[10px] font-black text-white px-6 py-3 uppercase flex items-center justify-center gap-1">
                  Return to Lobby & Claim XP
                </span>
              </button>
            </div>
          )}

          {/* Tutorial Overlay Modal/Popup */}
          {tutorialStep !== null && tutorialPopupOpen && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div 
                className="glass-panel p-5 md:p-6 rounded-2xl border border-amber-500/40 shadow-[0_0_35px_rgba(245,158,11,0.25)] w-full max-w-sm sm:max-w-md text-left flex flex-col justify-between max-h-[85vh] overflow-y-auto animate-scale-up"
                style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
              >
                <div className="flex items-center justify-between gap-2 mb-3 border-b border-white/10 pb-2.5 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <iconify-icon icon="solar:info-circle-bold-duotone" width="16" className="text-amber-400"></iconify-icon>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">Coach Tutorial ({tutorialStep}/7)</span>
                  </div>
                  <button 
                    onClick={() => setTutorialStep(null)}
                    className="text-[9px] font-bold text-neutral-500 hover:text-white uppercase transition-all"
                  >
                    Skip
                  </button>
                </div>
                
                <div className="space-y-2 mb-4 flex-1">
                  <h4 className="text-xs font-extrabold text-white uppercase">{getTutorialTitle()}</h4>
                  <p className="text-[10.5px] text-neutral-300 leading-relaxed font-sans font-medium">{getTutorialText()}</p>
                </div>

                <div className="flex justify-end items-center border-t border-white/5 pt-3 flex-shrink-0">
                  <button
                    onClick={() => setTutorialPopupOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black text-[10px] font-black uppercase transition-all shadow-lg border border-amber-400/20 font-bold animate-pulse"
                  >
                    Got it, show me!
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    // HoopTactics Gameplay Guide View Component
    const GameplayGuideContainer = () => {
      const [subTab, setSubTab] = useState('quickstart'); // 'quickstart', 'attributes', 'perks', 'tactics'
      
      // OVR Calculator states
      const [offVal, setOffVal] = useState(85);
      const [defVal, setDefVal] = useState(85);
      const [staVal, setStaVal] = useState(100);
      const [hasSuperstar, setHasSuperstar] = useState(false);
      const [isAutograph, setIsAutograph] = useState(false);
      const [isOneOfOne, setIsOneOfOne] = useState(false);

      // Perform overall calculation
      const calculatedOvr = useMemo(() => {
        const baseAvg = (offVal + defVal + staVal) / 3;
        let finalOvr = baseAvg;
        
        if (hasSuperstar) {
          finalOvr += 8;
        }
        if (isOneOfOne) {
          finalOvr += 4;
        } else if (isAutograph) {
          finalOvr += 2;
        }
        
        return Math.min(99, Math.round(finalOvr));
      }, [offVal, defVal, staVal, hasSuperstar, isAutograph, isOneOfOne]);

      // Calculate details
      const formulaDetails = useMemo(() => {
        const baseAvg = Math.round((offVal + defVal + staVal) / 3);
        let breakdown = [];
        breakdown.push(`Base Stats Average: (${offVal} OFF + ${defVal} DEF + ${staVal} STA) / 3 = ${baseAvg}`);
        if (hasSuperstar) breakdown.push(`+8 OVR for Superstar Perk Boost`);
        if (isOneOfOne) breakdown.push(`+4 OVR for 1-of-1 Parallel Boost`);
        else if (isAutograph) breakdown.push(`+2 OVR for Autograph Boost`);
        
        const total = baseAvg + (hasSuperstar ? 8 : 0) + (isOneOfOne ? 4 : (isAutograph ? 2 : 0));
        breakdown.push(`Uncapped Total: ${total}`);
        if (total > 99) breakdown.push(`Final OVR capped at max 99.`);
        
        return breakdown;
      }, [offVal, defVal, staVal, hasSuperstar, isAutograph, isOneOfOne]);

      return (
        <div className="space-y-6 text-left animate-modal-entry">
          {/* Sub-tab Navigation */}
          <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1.5 no-scrollbar">
            {[
              { id: 'quickstart', label: 'Quick Start', icon: 'solar:compass-linear' },
              { id: 'attributes', label: 'Attributes & OVR', icon: 'solar:chart-square-linear' },
              { id: 'perks', label: 'Perk Matrix', icon: 'solar:medal-star-bold' },
              { id: 'tactics', label: 'Tactical Strategy', icon: 'solar:bomb-linear' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  subTab === tab.id
                    ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                    : 'text-neutral-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <iconify-icon icon={tab.icon} width="14"></iconify-icon>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sub-tab Content Panels */}
          {subTab === 'quickstart' && (
            <div className="space-y-6">
              <div className="glass-panel border border-white/5 p-6 rounded-3xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <iconify-icon icon="solar:info-circle-bold" className="text-orange-400"></iconify-icon>
                  The HoopTactics Game Loop
                </h3>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  HoopTactics is a turn-based tabletop basketball card game where you coach a deck of 10 players. A match lasts 32 possessions (divided into 4 quarters of 8 possessions each). Your objective is to outscore your opponent by choosing the right attackers, defending strategically, and managing player stamina.
                </p>
              </div>

              {/* Step Timeline */}
              <div className="relative pl-6 border-l border-white/10 space-y-8 py-2">
                {[
                  {
                    step: '1',
                    title: 'The Tip-Off Matchup',
                    desc: 'The game begins with a Center matchup. Starting Centers compare their Offense (OFF) ratings, adjusted by their team\'s overall chemistry. The higher rating wins the jump ball and starts the match on offense.',
                    icon: 'solar:basketball-bold',
                    color: 'from-orange-500 to-red-500'
                  },
                  {
                    step: '2',
                    title: 'Declare an Attack (Offense)',
                    desc: 'Select an active shooter and choose your shot type: Mid-Range Pull-Up (uses MID), Attack to the Basket (uses RIM), 3-Pointer (uses 3PT, limit 6), or a 3-Point Play drive (uses ATH, limit 6). Pick a shot that leverages your shooter\'s highest attribute!',
                    icon: 'solar:target-bold',
                    color: 'from-blue-500 to-indigo-500'
                  },
                  {
                    step: '3',
                    title: 'Contest the Play (Defense)',
                    desc: 'Assign any active starter to guard the shooter (no position restrictions!). Defenders contest shots using a hybrid formula: 70% of Perimeter Defense (for Mid-Range or 3PT shots) or Rim Protection (for Paint attacks or 3-Point plays) + 30% of the attacker\'s shot attribute, plus a +2 bonus if the matchup is an exact position match (e.g. PG vs. PG)!',
                    icon: 'solar:shield-bold',
                    color: 'from-green-500 to-emerald-500'
                  },
                  {
                    step: '4',
                    title: 'Coin Flip Momentum Boost',
                    desc: 'Every matchup features a coin flip representing game-time physics and momentum. HEADS grants +4 OFF (+6 with Topps Now: On Fire) to the attacker. TAILS grants +4 DEF to the defender.',
                    icon: 'ph:coin-bold',
                    color: 'from-yellow-500 to-amber-500'
                  },
                  {
                    step: '5',
                    title: 'Resolve the Shot',
                    desc: 'Add up the final ratings. If the adjusted OFF is higher than the adjusted DEF (or tied, if the shooter has the Offensive Superstar perk), the shot is GOOD and points are scored. Otherwise, the defense blocks or recovers the ball.',
                    icon: 'solar:gamepad-bold',
                    color: 'from-purple-500 to-pink-500'
                  },
                  {
                    step: '6',
                    title: 'Stamina Drain & Timeouts',
                    desc: 'Both the shooter and defender lose 10 Stamina during a possession. If a player drops to 20 Stamina or below, they become GASSED and suffer a major -15 rating penalty. Call a Timeout to recover bench player stamina (+20) and swap players.',
                    icon: 'solar:battery-charge-bold',
                    color: 'from-teal-500 to-cyan-500'
                  },
                  {
                    step: '7',
                    title: 'Sudden Death Overtime',
                    desc: 'If the score is tied after all 32 possessions, the game enters Sudden Death Overtime. The first team to score a bucket immediately wins the match and claims the championship!',
                    icon: 'solar:alarm-bold',
                    color: 'from-red-500 to-rose-500'
                  }
                ].map((item) => (
                  <div key={item.step} className="relative group">
                    {/* Circle Badge icon */}
                    <div className={`phase-icon-circle absolute -left-[43px] top-0.5 w-8 h-8 rounded-full bg-gradient-to-tr ${item.color} flex items-center justify-center border border-white/20 text-xs font-bold text-white z-10 shadow-lg`}>
                      <iconify-icon icon={item.icon} width="12"></iconify-icon>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Phase {item.step}</span>
                        <div className="h-px bg-white/5 flex-1"></div>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1 group-hover:text-orange-400 transition-colors">{item.title}</h4>
                      <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {subTab === 'attributes' && (
            <div className="space-y-6">
              {/* Descriptions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="amp-card p-5 text-left border border-white/5 bg-black/40">
                  <div className="flex items-center gap-2 mb-2 text-orange-400">
                    <iconify-icon icon="solar:fire-bold" width="16"></iconify-icon>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Offense (OFF)</h4>
                  </div>
                  <p className="text-[10.5px] text-neutral-400 leading-relaxed">
                    Represents standard scoring potential, handles, and passing. Used as the default rating in overtime sudden-death matchups.
                  </p>
                </div>
                
                <div className="amp-card p-5 text-left border border-white/5 bg-black/40">
                  <div className="flex items-center gap-2 mb-2 text-blue-400">
                    <iconify-icon icon="solar:shield-bold" width="16"></iconify-icon>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Perimeter Def (PRD)</h4>
                  </div>
                  <p className="text-[10.5px] text-neutral-400 leading-relaxed">
                    Represents steal, perimeter containment, and contest potential. Used to contest Mid-Range and 3PT shots (70% of the base contest rating).
                  </p>
                </div>

                <div className="amp-card p-5 text-left border border-white/5 bg-black/40">
                  <div className="flex items-center gap-2 mb-2 text-indigo-400">
                    <iconify-icon icon="solar:shield-bold" width="16"></iconify-icon>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Rim Protection (RMP)</h4>
                  </div>
                  <p className="text-[10.5px] text-neutral-400 leading-relaxed">
                    Represents block, interior defense, and paint containment potential. Used to contest Rim Attacks and 3PT Plays (70% of the base contest rating).
                  </p>
                </div>

                <div className="amp-card p-5 text-left border border-white/5 bg-black/40">
                  <div className="flex items-center gap-2 mb-2 text-emerald-400">
                    <iconify-icon icon="solar:battery-charge-bold" width="16"></iconify-icon>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Stamina (STA)</h4>
                  </div>
                  <p className="text-[10.5px] text-neutral-400 leading-relaxed">
                    Represents player endurance. Starts at 100 (110 for Jersey Patches). Matchup selections drain -10 STA. Dropping to 20 or below triggers a heavy -15 Gassed ratings penalty.
                  </p>
                </div>

                <div className="amp-card p-5 text-left border border-white/5 bg-black/40">
                  <div className="flex items-center gap-2 mb-2 text-amber-400">
                    <iconify-icon icon="solar:medal-star-bold" width="16"></iconify-icon>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Playstyle Badges</h4>
                  </div>
                  <p className="text-[10.5px] text-neutral-400 leading-relaxed">
                    Designates card archetypes. Shooters get the <strong>Three-Point Shooting</strong> badge (up to 6 shots/game). Athletic players get the <strong>Athleticism</strong> badge, enabling up to 6 drives/game for <strong>3-Point Plays</strong> (And-1). Non-archetypes cannot attempt these shots.
                  </p>
                </div>
              </div>

              {/* Detailed Attributes Descriptions */}
              <div className="border-t border-white/5 pt-5 mt-5">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3 font-mono">Specialized Attributes</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="amp-card p-4 text-left border border-white/5 bg-black/45">
                    <div className="flex items-center gap-1.5 mb-1.5 text-amber-400">
                      <iconify-icon icon="solar:target-bold" width="14"></iconify-icon>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider">3-Point (3PT)</h4>
                    </div>
                    <p className="text-[9.5px] text-neutral-400 leading-relaxed">
                      Determines capability for 3-point shots. Highly-rated shooters can easily sink deep range attempts.
                    </p>
                  </div>
                  
                  <div className="amp-card p-4 text-left border border-white/5 bg-black/45">
                    <div className="flex items-center gap-1.5 mb-1.5 text-neutral-200">
                      <iconify-icon icon="solar:basketball-bold" width="14"></iconify-icon>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider">Mid-Range (MID)</h4>
                    </div>
                    <p className="text-[9.5px] text-neutral-400 leading-relaxed">
                      Powers mid-range pull-up jumpers, a reliable scoring method between the key and arc.
                    </p>
                  </div>

                  <div className="amp-card p-4 text-left border border-white/5 bg-black/45">
                    <div className="flex items-center gap-1.5 mb-1.5 text-rose-400">
                      <iconify-icon icon="solar:star-bold" width="14"></iconify-icon>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider">Rim Finish (RIM)</h4>
                    </div>
                    <p className="text-[9.5px] text-neutral-400 leading-relaxed">
                      Determines layup and dunk completion rate under heavy defensive pressure at the hoop.
                    </p>
                  </div>

                  <div className="amp-card p-4 text-left border border-white/5 bg-black/45">
                    <div className="flex items-center gap-1.5 mb-1.5 text-purple-400">
                      <iconify-icon icon="solar:running-bold" width="14"></iconify-icon>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider">Athleticism (ATH)</h4>
                    </div>
                    <p className="text-[9.5px] text-neutral-400 leading-relaxed">
                      Powers 3-point play (And-1) drives and enhances a defender's recovery speed against drives.
                    </p>
                  </div>

                  <div className="amp-card p-4 text-left border border-white/5 bg-black/45">
                    <div className="flex items-center gap-1.5 mb-1.5 text-yellow-400">
                      <iconify-icon icon="solar:bolt-bold" width="14"></iconify-icon>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider">Clutch (CLU)</h4>
                    </div>
                    <p className="text-[9.5px] text-neutral-400 leading-relaxed">
                      Grants a significant rating boost inside the 4th Quarter (possessions 25-32) equal to <code className="text-[8.5px] font-mono text-yellow-400/80">Math.round((clutch - 50) / 4)</code>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Matchup Restrictions Row */}
              <div className="glass-panel border border-white/5 p-5 rounded-3xl bg-black/20 text-left">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <iconify-icon icon="solar:user-bold" className="text-amber-400"></iconify-icon>
                  Matchup Strategy & Matching Bonuses
                </h4>
                <p className="text-[10.5px] text-neutral-400 mb-4 leading-relaxed">
                  You are free to assign any defender to any shooter! However, choosing logical matchups is key: guards excel on the perimeter with high Perimeter Defense (PRD), and big men lock down the paint with high Rim Protection (RMP). Additionally, defending a shooter of the exact same position (e.g. PG guarding PG) awards a **+2 DEF** contest matchup bonus.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { pos: 'PG', defends: 'PG, SG', label: 'Point Guard', specialty: 'Perimeter' },
                    { pos: 'SG', defends: 'PG, SG, SF', label: 'Shooting Guard', specialty: 'Perimeter' },
                    { pos: 'SF', defends: 'SG, SF, PF', label: 'Small Forward', specialty: 'Balanced' },
                    { pos: 'PF', defends: 'SF, PF, C', label: 'Power Forward', specialty: 'Rim Protection' },
                    { pos: 'C', defends: 'PF, C', label: 'Center', specialty: 'Rim Protection' }
                  ].map((x) => (
                    <div key={x.pos} className="matchup-card bg-neutral-950/60 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center">
                      <span className="text-[10px] uppercase font-bold text-white bg-white/10 px-2 py-0.5 rounded mb-1.5">{x.pos}</span>
                      <span className="text-[9px] text-neutral-500 font-semibold">{x.label}</span>
                      <div className="w-full border-t border-white/5 my-2"></div>
                      <span className="text-[8px] text-neutral-500 font-mono scale-90">Best Matchups:</span>
                      <span className="text-[9px] text-orange-400 font-bold font-mono mt-0.5">{x.defends}</span>
                      <span className="text-[8px] text-neutral-500 font-mono scale-90 mt-1">Specialty:</span>
                      <span className="text-[9px] text-blue-400 font-bold font-mono mt-0.5">{x.specialty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive OVR Calculator Widget */}
              <div className="glass-panel border border-white/5 p-6 rounded-3xl bg-gradient-to-br from-neutral-950 via-white/5 to-neutral-950 text-left grid grid-cols-1 lg:grid-cols-3 gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white/20 to-teal-500" />
                
                {/* Sliders Block */}
                <div className="lg:col-span-2 space-y-5">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <iconify-icon icon="solar:calculator-bold" className="text-orange-400"></iconify-icon>
                      Interactive Overall (OVR) Calculator
                    </h3>
                    <p className="text-[10px] text-neutral-400 uppercase mt-0.5">Adjust settings to see how card traits build player rankings</p>
                  </div>

                  <div className="space-y-4">
                    {/* OFF Rating Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-orange-400 flex items-center gap-1">
                          <iconify-icon icon="solar:fire-bold" width="10"></iconify-icon> Offense (OFF)
                        </span>
                        <span className="font-mono text-white font-black">{offVal}</span>
                      </div>
                      <input 
                        type="range" min="50" max="99" value={offVal} onChange={(e) => setOffVal(parseInt(e.target.value))}
                        className="w-full h-1 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none"
                      />
                    </div>

                    {/* DEF Rating Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-blue-400 flex items-center gap-1">
                          <iconify-icon icon="solar:shield-bold" width="10"></iconify-icon> Defense (DEF)
                        </span>
                        <span className="font-mono text-white font-black">{defVal}</span>
                      </div>
                      <input 
                        type="range" min="50" max="99" value={defVal} onChange={(e) => setDefVal(parseInt(e.target.value))}
                        className="w-full h-1 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* STA Rating Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-emerald-400 flex items-center gap-1">
                          <iconify-icon icon="solar:battery-charge-bold" width="10"></iconify-icon> Max Stamina (STA)
                        </span>
                        <span className="font-mono text-white font-black">{staVal}</span>
                      </div>
                      <input 
                        type="range" min="70" max="110" step="5" value={staVal} onChange={(e) => setStaVal(parseInt(e.target.value))}
                        className="w-full h-1 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Checklist Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <label className="flex items-center gap-2 bg-neutral-900/60 p-2.5 rounded-xl border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                      <input 
                        type="checkbox" checked={hasSuperstar} onChange={(e) => setHasSuperstar(e.target.checked)}
                        className="rounded border-neutral-700 bg-neutral-800 text-orange-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                      />
                      <div className="text-left leading-tight">
                        <div className="text-[9px] font-bold text-white">Superstar Perk</div>
                        <div className="text-[8px] text-neutral-500 mt-0.5">+8 OVR Bonus</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 bg-neutral-900/60 p-2.5 rounded-xl border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                      <input 
                        type="checkbox" checked={isAutograph} onChange={(e) => {
                          setIsAutograph(e.target.checked);
                          if (e.target.checked) setIsOneOfOne(false);
                        }}
                        className="rounded border-neutral-700 bg-neutral-800 text-orange-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                      />
                      <div className="text-left leading-tight">
                        <div className="text-[9px] font-bold text-white">Autographed</div>
                        <div className="text-[8px] text-neutral-500 mt-0.5">+2 OVR Bonus</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 bg-neutral-900/60 p-2.5 rounded-xl border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                      <input 
                        type="checkbox" checked={isOneOfOne} onChange={(e) => {
                          setIsOneOfOne(e.target.checked);
                          if (e.target.checked) setIsAutograph(false);
                        }}
                        className="rounded border-neutral-700 bg-neutral-800 text-orange-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                      />
                      <div className="text-left leading-tight">
                        <div className="text-[9px] font-bold text-white">1-of-1 Parallel</div>
                        <div className="text-[8px] text-neutral-500 mt-0.5">+4 OVR Bonus</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Math & Spinning Avatar Card Display */}
                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between items-center text-center">
                  <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono">Calculated Rating</div>
                  
                  {/* Big Spinning Badge */}
                  <div className="ovr-avatar mt-4 mb-4" style={{ width: '72px', height: '72px' }}>
                    <div className="ovr-avatar-spin" style={{ animationDuration: '2s' }}></div>
                    <div className="ovr-avatar-mask"></div>
                    <div className="ovr-avatar-content z-10 flex flex-col items-center justify-center leading-none">
                      <span className="text-[26px] font-black text-white tracking-tighter">{calculatedOvr}</span>
                      <span className="text-[8px] text-orange-400 font-bold uppercase mt-0.5 tracking-widest font-mono">OVR</span>
                    </div>
                  </div>

                  {/* Details Math Panel */}
                  <div className="w-full space-y-1 border-t border-white/5 pt-3 text-left">
                    <span className="text-[7.5px] uppercase font-mono text-neutral-500 block mb-1">Mathematical Details:</span>
                    {formulaDetails.map((detail, idx) => (
                      <div key={idx} className="text-[8.5px] text-neutral-400 font-mono flex items-start gap-1 leading-normal">
                        <span className="text-neutral-600">•</span>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {subTab === 'perks' && (
            <div className="space-y-6">
              <div className="glass-panel border border-white/5 p-6 rounded-3xl bg-black/20 text-left">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <iconify-icon icon="solar:medal-star-bold" className="text-orange-400"></iconify-icon>
                  The Gameplay Perk Registry
                </h3>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Perks are special abilities printed on select rare cards that grant coaches critical combat boosts, bypass rules, or trigger 4th-quarter shifts. Familiarize yourself with these skills to draft an unbeatable deck!
                </p>
              </div>

              {/* Perks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: 'Stepback Maestro',
                    icon: 'solar:arrow-left-down-bold',
                    desc: 'Stepback master! Gains +6 OFF when attempting a 3-pointer. Bypasses normal defensive momentum.',
                    example: 'Stephen Curry, Luka Doncic, Kyrie Irving, Carmelo Anthony, Jalen Brunson',
                    color: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20'
                  },
                  {
                    name: 'Microwave',
                    icon: 'solar:fire-bold',
                    desc: 'Heats up fast! Gains +6 OFF on offensive attempts if their team scored on the previous possession.',
                    example: 'Stephen Curry, Luka Doncic, Kyrie Irving, Nikola Jokic, Derrick Rose',
                    color: 'text-pink-400 bg-pink-500/10 border-pink-500/20'
                  },
                  {
                    name: 'Offensive Superstar',
                    icon: 'solar:star-bold',
                    desc: 'Wins coin-flip ties on offense. Normally, a tie score goes to the defense. Cards with this perk break ties in favor of the offensive shooter.',
                    example: 'LeBron James, Stephen Curry, Jalen Brunson, Kyrie Irving, Kobe Bryant',
                    color: 'text-orange-400 bg-orange-500/10 border-orange-500/20'
                  },
                  {
                    name: 'Defensive Anchor',
                    icon: 'solar:shield-keyhole-bold',
                    desc: 'Opponents cannot attempt 3-pointers. If an offensive player declares a 3-point attempt against this defender, the play is immediately blocked and downgraded to a 2-point attempt.',
                    example: 'Bill Russell, Victor Wembanyama, Tim Duncan, David Robinson, Scottie Pippen',
                    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                  },
                  {
                    name: 'Clutch Gene',
                    icon: 'solar:bolt-bold',
                    desc: 'Activates during the 4th Quarter (possessions 25 to 32). Grants +10 to both Offense (OFF) and Defense (DEF) ratings, transforming the card into a late-game engine.',
                    example: 'Automatically embedded on any Autograph (Auto) card versions',
                    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                  },
                  {
                    name: 'Hall of Fame Aura',
                    icon: 'solar:crown-bold',
                    desc: 'Taps into legend status to claim an automatic bucket once per game! The shooter or defender bypasses the coin flip check and automatically wins the possession check.',
                    example: 'Michael Jordan (1986 Fleer), pre-1990 legend cards, or any 1-of-1 Masterpiece cards',
                    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                  },
                  {
                    name: 'Topps Now: Clutch Master',
                    icon: 'solar:fire-bold',
                    desc: 'Grants +5 to Offense (OFF) during the 4th Quarter (possessions 25 to 32). Perfect for late-game game-winning attempts.',
                    example: 'Topps Now cards with "clutch" or "christmas" in their card metadata',
                    color: 'text-red-400 bg-red-500/10 border-red-500/20'
                  },
                  {
                    name: 'Topps Now: ECF MVP',
                    icon: 'solar:medal-star-bold',
                    desc: 'Grants +10 to Defense (DEF) during the 4th Quarter (possessions 25 to 32). Lock down opponent clutch attempts with ease.',
                    example: 'Topps Now cards representing Eastern Conference Finals MVP honors',
                    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                  },
                  {
                    name: 'Topps Now: Debut Fire',
                    icon: 'solar:running-bold',
                    desc: 'Keeps rookie legs fresh! Recover +10 Stamina at the end of each quarter (possessions 8, 16, and 24) to offset stamina fatigue.',
                    example: 'Topps Now Rookie Debut or All-Rookie card series',
                    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  },
                  {
                    name: 'Topps Now: On Fire',
                    icon: 'solar:flame-bold',
                    desc: 'Enhances coin-flip boosts. A HEADS coin flip on offense grants the shooter a +6 OFF boost instead of the default +4.',
                    example: 'Printed on all standard, non-rookie/non-clutch Topps Now cards',
                    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  }
                ].map((perk) => (
                  <div key={perk.name} className={`amp-card perk-card p-5 border flex flex-col justify-between gap-3 text-left ${perk.color}`}>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <iconify-icon icon={perk.icon} width="16" className="animate-pulse"></iconify-icon>
                        <h4 className="text-xs font-black uppercase tracking-wider">{perk.name}</h4>
                      </div>
                      <p className="text-[10px] text-neutral-300 leading-relaxed">{perk.desc}</p>
                    </div>
                    <div className="border-t border-white/5 pt-2 flex items-baseline gap-1 text-[8.5px]">
                      <span className="text-neutral-500 font-mono uppercase">Key Cards:</span>
                      <span className="text-white font-bold">{perk.example}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {subTab === 'tactics' && (
            <div className="space-y-6">
              {/* Lineup Chemistry & Penalties */}
              <div className="glass-panel border border-white/5 p-6 rounded-3xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <iconify-icon icon="solar:atom-bold" width="18" className="text-orange-400"></iconify-icon>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Lineup Chemistry Rules</h3>
                </div>
                <p className="text-[10.5px] text-neutral-400 leading-relaxed mb-4">
                  To achieve optimal squad chemistry, a coach should field a starter at every standard position. An ideal lineup consists of exactly **1 PG, 1 SG, 1 SF, 1 PF, and 1 C**. 
                </p>
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3">
                  <iconify-icon icon="solar:shield-warning-bold" width="20" className="text-red-500 flex-shrink-0 mt-0.5"></iconify-icon>
                  <div className="leading-tight text-left">
                    <span className="text-[10px] font-bold text-white uppercase block">Missing Position Penalty: -5 OVR per position</span>
                    <span className="text-[9.5px] text-neutral-400 mt-1 block">
                      For every missing standard position in your starting lineup, your team receives a **-5 stat penalty** applied to all combat rating checks during the match. For example, if you run two Centers and no Point Guard, your entire roster suffers -5 ratings throughout the game. Optimize your deck structure accordingly!
                    </span>
                  </div>
                </div>
              </div>

              {/* Stamina & Timeout Rules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="amp-card p-5 border border-white/5 bg-black/40 text-left">
                  <div className="flex items-center gap-2 mb-2 text-emerald-400">
                    <iconify-icon icon="solar:battery-charge-bold" width="16"></iconify-icon>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Stamina & Fatigue Drainage</h4>
                  </div>
                  <p className="text-[10.5px] text-neutral-400 leading-relaxed mb-3">
                    Basketball is exhausting! Every active matchup selection drains **-10 Stamina** from both the selected attacker and defender.
                  </p>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-2">
                    <iconify-icon icon="solar:sad-circle-bold" width="16" className="text-amber-500 flex-shrink-0 mt-0.5"></iconify-icon>
                    <span className="text-[9.5px] text-neutral-300 leading-normal font-semibold">
                      Gassed Penalty: If a player's Stamina drops to 20 or below, they get Gassed. This imposes a heavy -15 rating penalty to both OFF and DEF, rendering them extremely vulnerable.
                    </span>
                  </div>
                </div>

                <div className="amp-card p-5 border border-white/5 bg-black/40 text-left">
                  <div className="flex items-center gap-2 mb-2 text-blue-400">
                    <iconify-icon icon="solar:bell-bold" width="16"></iconify-icon>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Timeout Stamina Recovery</h4>
                  </div>
                  <p className="text-[10.5px] text-neutral-400 leading-relaxed mb-3">
                    Coaches start with **4 Timeouts** per match. A Timeout can be called during offensive phases, or immediately after an opponent scores.
                  </p>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex gap-2">
                    <iconify-icon icon="solar:heart-bold" width="16" className="text-emerald-500 flex-shrink-0 mt-0.5"></iconify-icon>
                    <span className="text-[9.5px] text-neutral-300 leading-normal font-semibold">
                      Bench Healing: When a Timeout is called, all resting bench players recover +20 Stamina. Use timeouts to swap gassed starters onto the bench so they can heal and recover!
                    </span>
                  </div>
                </div>
              </div>

              {/* Matchup Resolution Mechanics */}
              <div className="glass-panel border border-white/5 p-6 rounded-3xl bg-black/20 text-left">
                <div className="flex items-center gap-2 mb-3 text-amber-400">
                  <iconify-icon icon="solar:chart-square-linear" width="18"></iconify-icon>
                  <h3 className="text-xs font-bold uppercase tracking-wider">The Combat Resolution Math</h3>
                </div>
                <p className="text-[10.5px] text-neutral-400 leading-relaxed mb-3">
                  Each shot contest compares the final attacker score and defender score:
                </p>
                <div className="combat-math-box bg-neutral-950/60 p-4 rounded-2xl border border-white/5 font-mono text-[9px] text-neutral-300 space-y-2">
                  <div>
                    <span className="text-orange-400 font-bold">Attacker Matchup Value</span> = Base Shot Attribute (MID, RIM, 3PT, or ATH) + Chemistry (Penalty) + Stamina Penalty (Gassed -15) + Q4 Clutch Boost (Math.round((clutch - 50) / 4)) + Perks (Clutch Gene/Master) + Coin Flip (Heads: +4 / +6)
                  </div>
                  <div>
                    <span className="text-blue-400 font-bold">Defender Contest Value</span> = Contest Rating (70% Base DEF + 30% Attacker's Shot Attribute) + Chemistry (Penalty) + Stamina Penalty (Gassed -15) + Q4 Clutch Boost (Math.round((clutch - 50) / 4)) + Position Matchup Bonus (+2) + Perks (Clutch Gene/ECF MVP/Eraser/Reflector) + Coin Flip (Tails: +4) + CPU Difficulty Modifier
                  </div>
                  <div className="border-t border-white/5 my-2 pt-2">
                    Result logic:
                    <br />• If Attacker Matchup Value &gt; Defender Contest Value: <span className="text-emerald-400">Shot is GOOD (2 or 3 pts scored)</span>
                    <br />• If Attacker Matchup Value === Defender Contest Value and has "Offensive Superstar": <span className="text-emerald-400">Shot is GOOD (superstar tie-breaker)</span>
                    <br />• If Attacker Matchup Value &lt;= Defender Contest Value: <span className="text-red-400">Shot is MISSED/DEFENDED (0 pts)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

// Achievements and profile data moved to js/data.js

    // Main App Shell Component
    const App = () => {
      const { theme, setTheme } = React.useContext(ThemeContext);
      // Initialize states from localStorage with sensible defaults
      const [screen, setScreen] = useState(() => {
        return localStorage.getItem('ht_screen') || 'onboarding';
      });
      const [expandedSets, setExpandedSets] = useState({});
      const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('ht_activeTab') || 'home';
      });
      const [focusMode, setFocusMode] = useState(false);
      const [searchQuery, setSearchQuery] = useState('');
      const [selectedCardId, setSelectedCardId] = useState(null);
      const [modalMode, setModalMode] = useState('attributes'); // 'attributes' or 'analytics'
      const [performanceMode, setPerformanceMode] = useState(() => {
        return localStorage.getItem('ht_performanceMode') || 'animations';
      });
      const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('ht_favorites');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed) {
              if (!parsed.sports || !Array.isArray(parsed.sports)) {
                parsed.sports = ['Basketball'];
              }
              return parsed;
            }
          } catch (e) {
            // fallback
          }
        }
        return { sports: ['Basketball'], team: '', level: '' };
      });
      const [userCollection, setUserCollection] = useState(() => {
        const saved = localStorage.getItem('ht_userCollection');
        if (saved) {
          try {
            let list = JSON.parse(saved);
            let migrated = false;
            let migratedList = list.map(item => {
              if (item.startsWith('mikal-bridges-chrome-2025')) {
                migrated = true;
                item = item.replace('mikal-bridges-chrome-2025', 'mikal-bridges-flagship-2025');
              }
              if (item.includes('::')) {
                const [baseId, pName] = item.split('::');
                if (pName !== 'Base') {
                  migrated = true;
                  return `${baseId}::Base`;
                }
              } else {
                migrated = true;
                return `${item}::Base`;
              }
              return item;
            });
            const uniqueList = Array.from(new Set(migratedList));
            if (uniqueList.length !== list.length) {
              migrated = true;
            }
            if (migrated) {
              localStorage.setItem('ht_userCollection', JSON.stringify(uniqueList));
            }
            return uniqueList;
          } catch (e) {
            return [];
          }
        }
        return [];
      });

      const [activeSportFilter, setActiveSportFilter] = useState(() => {
        const saved = localStorage.getItem('ht_favorites');
        if (saved) {
          try {
            const favs = JSON.parse(saved);
            if (favs && Array.isArray(favs.sports)) {
              return favs.sports.length > 1 ? 'All' : (favs.sports.length === 1 ? favs.sports[0] : 'All');
            }
          } catch (e) {
            // fallback
          }
        }
        return 'All';
      });
      const [level, setLevel] = useState(() => {
        const saved = localStorage.getItem('ht_level');
        return saved ? parseInt(saved, 10) : 1;
      });
      const [toastMsg, setToastMsg] = useState(null);
      const [subscribedDrops, setSubscribedDrops] = useState(() => {
        const saved = localStorage.getItem('ht_subscribedDrops');
        return saved ? JSON.parse(saved) : [];
      });
      const [xp, setXp] = useState(() => {
        const saved = localStorage.getItem('ht_xp');
        return saved ? parseInt(saved, 10) : 0;
      });
      const [prestige, setPrestige] = useState(() => {
        const saved = localStorage.getItem('ht_prestige');
        return saved ? parseInt(saved, 10) : 0;
      });
      const [avatarIcon, setAvatarIcon] = useState(() => {
        return localStorage.getItem('ht_profile_avatar_icon') || 'letter';
      });
      const [avatarGradient, setAvatarGradient] = useState(() => {
        return localStorage.getItem('ht_profile_avatar_gradient') || 'from-orange-500 to-yellow-500';
      });
      const [matchStats, setMatchStats] = useState(() => {
        const saved = localStorage.getItem('ht_match_stats');
        return saved ? JSON.parse(saved) : { cpuWins: 0, cpuLosses: 0, onlineWins: 0, onlineLosses: 0, totalXpEarned: 0 };
      });
      const [unlockedAchievements, setUnlockedAchievements] = useState(() => {
        const saved = localStorage.getItem('ht_unlocked_achievements');
        return saved ? JSON.parse(saved) : [];
      });
      const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
      const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
      const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);
      const [wasOvertime, setWasOvertime] = useState(false);
      const [profileTab, setProfileTab] = useState('edit');
      const [tempUsername, setTempUsername] = useState('');
      const [tempTeam, setTempTeam] = useState('');
      const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
      const [removeConfirmInput, setRemoveConfirmInput] = useState('');
      const [isGameActive, setIsGameActive] = useState(false);

      // New advanced sort & filter states
      const [sortBy, setSortBy] = useState('value-desc');
      const [activeEraFilter, setActiveEraFilter] = useState('All');
      const [activeTeamFilter, setActiveTeamFilter] = useState('All');
      const [selectedTeam, setSelectedTeam] = useState(null);
      const [selectedParallel, setSelectedParallel] = useState('Base');
      const [selectedTimeline, setSelectedTimeline] = useState('1D');

      // Market-specific sort & filter states
      const [marketSearchQuery, setMarketSearchQuery] = useState('');
      const [marketSortBy, setMarketSortBy] = useState('value-desc');
      const [marketActiveEraFilter, setMarketActiveEraFilter] = useState('All');
      const [marketActiveTeamFilter, setMarketActiveTeamFilter] = useState('All');

  // Dynamic filtered variables based on user's selected sports in settings
  const activeCards = React.useMemo(() => {
    const sports = favorites?.sports || ['Basketball'];
    if (sports.length === 0) return SPORTS_CARDS;
    return SPORTS_CARDS.filter(c => sports.includes(c.sport));
  }, [favorites]);

  const activeSets = React.useMemo(() => {
    const sports = favorites?.sports || ['Basketball'];
    if (sports.length === 0) return SPORTS_SETS;
    return SPORTS_SETS.filter(s => sports.includes(s.sport));
  }, [favorites]);

  const activeUserCollection = React.useMemo(() => {
    return userCollection.filter(item => {
      const baseId = item.includes('::') ? item.split('::')[0] : item;
      return activeCards.some(c => c.baseCardId === baseId);
    });
  }, [userCollection, activeCards]);

  const allTeams = React.useMemo(() => {
    return Array.from(new Set(activeCards.map(c => c.team)))
      .filter(t => !t.includes('/') && !t.includes('Rookie') && !t.includes('Free Agent'))
      .sort();
  }, [activeCards]);

  const activeDrops = React.useMemo(() => {
    return [
      {
        id: 'jalen-brunson-2025-topps-now-finals-patch-auto-v2',
        sport: 'Basketball',
        brand: 'Topps Now Basketball',
        title: 'Jalen Brunson Finals Patch Auto',
        desc: "1/1 on-card autograph patch card commemorating Jalen Brunson's clutch Finals Game 1 performance.",
        price: '$29.99',
        printRun: '1/1',
        timeKey: 'drop1',
        toast: 'Pre-ordered! Jalen Brunson Finals Patch Auto has been added to your collection binder!'
      },
      {
        id: 'karl-anthony-towns-2025-topps-chrome-auto',
        sport: 'Basketball',
        brand: 'Topps Chrome Basketball',
        title: 'Karl-Anthony Towns "The Big Bodega"',
        desc: 'Highest rated Karl-Anthony Towns autograph parallel card, nicknamed "The Big Bodega".',
        price: '$29.99',
        printRun: 'LTD /99',
        timeKey: 'drop2',
        toast: 'Pre-ordered! Karl-Anthony Towns "The Big Bodega" Edition has been added to your collection binder!'
      },
      {
        id: 'victor-wembanyama-2025-topps-chrome-limited-auto',
        sport: 'Basketball',
        brand: 'Topps Chrome Basketball',
        title: 'Victor Wembanyama Chrome Autograph',
        desc: 'Special gold refractor autograph parallel card celebrating Wembanyama\'s stellar sophomore season.',
        price: '$29.99',
        printRun: 'LTD /25',
        timeKey: 'drop3',
        toast: 'Pre-ordered! Victor Wembanyama Chrome Autograph has been added to your collection binder!'
      }
    ];
  }, []);

      // Synchronize state changes to localStorage
      useEffect(() => {
        const cleared = localStorage.getItem('ht_cleared_mock_collection_v3');
        if (!cleared) {
          setUserCollection([]);
          localStorage.setItem('ht_userCollection', JSON.stringify([]));
          localStorage.setItem('ht_cleared_mock_collection_v3', 'true');
        }
      }, []);

      useEffect(() => {
        localStorage.setItem('ht_screen', screen);
      }, [screen]);

      useEffect(() => {
        localStorage.setItem('ht_activeTab', activeTab);
      }, [activeTab]);

      useEffect(() => {
        localStorage.setItem('ht_favorites', JSON.stringify(favorites));
      }, [favorites]);

      useEffect(() => {
        localStorage.setItem('ht_userCollection', JSON.stringify(userCollection));
      }, [userCollection]);

      useEffect(() => {
        localStorage.setItem('ht_subscribedDrops', JSON.stringify(subscribedDrops));
      }, [subscribedDrops]);

      useEffect(() => {
        localStorage.setItem('ht_level', level.toString());
      }, [level]);

      useEffect(() => {
        localStorage.setItem('ht_xp', xp.toString());
      }, [xp]);

      useEffect(() => {
        localStorage.setItem('ht_prestige', prestige.toString());
      }, [prestige]);

      useEffect(() => {
        localStorage.setItem('ht_profile_avatar_icon', avatarIcon);
      }, [avatarIcon]);

      useEffect(() => {
        localStorage.setItem('ht_profile_avatar_gradient', avatarGradient);
      }, [avatarGradient]);

      useEffect(() => {
        localStorage.setItem('ht_match_stats', JSON.stringify(matchStats));
      }, [matchStats]);

      useEffect(() => {
        localStorage.setItem('ht_unlocked_achievements', JSON.stringify(unlockedAchievements));
      }, [unlockedAchievements]);

      useEffect(() => {
        localStorage.setItem('ht_performanceMode', performanceMode);
        if (performanceMode === 'performance') {
          document.documentElement.classList.add('performance-mode');
        } else {
          document.documentElement.classList.remove('performance-mode');
        }
      }, [performanceMode]);

      // Reset card removal confirmation states when details modal closes or changes
      useEffect(() => {
        if (selectedCardId === null) {
          setShowRemoveConfirm(false);
          setRemoveConfirmInput('');
          document.body.style.overflow = '';
        } else {
          document.body.style.overflow = 'hidden';
        }
        return () => {
          document.body.style.overflow = '';
        };
      }, [selectedCardId]);

      // Synchronize temp inputs when modal opens
      useEffect(() => {
        if (isProfileModalOpen && favorites) {
          setTempUsername(favorites.username || '');
          setTempTeam(favorites.team || '');
        }
      }, [isProfileModalOpen, favorites]);

      // Version migration logic (reset mock levels/xp to 1/0 for a clean gameplay start)
      useEffect(() => {
        const resetKey = localStorage.getItem('ht_gameplay_xp_v2');
        if (!resetKey) {
          localStorage.setItem('ht_level', '1');
          localStorage.setItem('ht_xp', '0');
          localStorage.setItem('ht_prestige', '0');
          localStorage.setItem('ht_match_stats', JSON.stringify({ cpuWins: 0, cpuLosses: 0, onlineWins: 0, onlineLosses: 0, totalXpEarned: 0 }));
          localStorage.setItem('ht_unlocked_achievements', JSON.stringify([]));
          localStorage.setItem('ht_profile_avatar_icon', 'letter');
          localStorage.setItem('ht_profile_avatar_gradient', 'from-orange-500 to-yellow-500');
          
          setLevel(1);
          setXp(0);
          setPrestige(0);
          setMatchStats({ cpuWins: 0, cpuLosses: 0, onlineWins: 0, onlineLosses: 0, totalXpEarned: 0 });
          setUnlockedAchievements([]);
          setAvatarIcon('letter');
          setAvatarGradient('from-orange-500 to-yellow-500');

          localStorage.setItem('ht_gameplay_xp_v2', 'true');
        }
      }, []);

      // Real-time ticking countdown timers for Live Drops
      const [timeRemaining, setTimeRemaining] = useState({
        drop1: 8 * 3600 + 14 * 60 + 20, // Jalen Brunson Finals Patch Auto (8h 14m 20s)
        drop2: 14 * 3600 + 42 * 60 + 5, // Karl-Anthony Towns "The Big Bodega" Auto (14h 42m 05s)
        drop3: 3 * 3600 + 11 * 60 + 40  // Victor Wembanyama Topps Chrome Auto (3h 11m 40s)
      });

      useEffect(() => {
        const interval = setInterval(() => {
          setTimeRemaining(prev => ({
            drop1: Math.max(0, prev.drop1 - 1),
            drop2: Math.max(0, prev.drop2 - 1),
            drop3: Math.max(0, prev.drop3 - 1)
          }));
        }, 1000);
        return () => clearInterval(interval);
      }, []);

      const formatTime = (secs) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      };

      const toggleSubscribe = (setName) => {
        if (subscribedDrops.includes(setName)) {
          setSubscribedDrops(subscribedDrops.filter(s => s !== setName));
          triggerToast(`Alert cancelled for ${setName}.`);
        } else {
          setSubscribedDrops([...subscribedDrops, setName]);
          triggerToast(`Subscribed! You will receive launch alerts for ${setName}.`);
        }
      };

      // Onboarding complete
      const handleOnboardingComplete = (data) => {
        setFavorites(data);
        setActiveSportFilter(data.sports[0] || 'All');
        setScreen('dashboard');
        triggerToast('Vault Access Granted! Welcome to HoopTactics.');
      };

      const triggerToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 4000);
      };

      const checkAndAwardAchievements = (stats, collection, lvl, prest) => {
        const unlocked = JSON.parse(localStorage.getItem('ht_unlocked_achievements') || '[]');
        const newUnlocked = [...unlocked];
        
        const achievementsToCheck = [
          { id: 'first_win', check: () => (stats.cpuWins || 0) + (stats.onlineWins || 0) >= 1 },
          { id: 'cpu_wins_5', check: () => (stats.cpuWins || 0) >= 5 },
          { id: 'online_wins_5', check: () => (stats.onlineWins || 0) >= 5 },
          { id: 'prestige_1', check: () => prest >= 1 },
          { id: 'prestige_5', check: () => prest >= 5 },
          { id: 'total_xp_10k', check: () => (stats.totalXpEarned || 0) >= 10000 },
          { id: 'win_by_15', check: () => !!stats.hasWinBy15 },
          { id: 'win_overtime', check: () => !!stats.hasOvertimeWin },
          { id: 'binder_count_20', check: () => collection.length >= 20 },
          {
            id: 'binder_auto_5',
            check: () => {
              let count = 0;
              collection.forEach(item => {
                const [cardId, parallelName] = item.split('::');
                const cardObj = SPORTS_CARDS.find(x => x.id === cardId);
                const isAuto = (parallelName && parallelName.toLowerCase().includes('auto')) || 
                               (cardId && cardId.toLowerCase().includes('-auto-')) ||
                               (cardObj && cardObj.parallel && cardObj.parallel.toLowerCase().includes('auto'));
                if (isAuto) count++;
              });
              return count >= 5;
            }
          }
        ];

        let unlockedAny = false;
        achievementsToCheck.forEach(ach => {
          if (!newUnlocked.includes(ach.id) && ach.check()) {
            newUnlocked.push(ach.id);
            unlockedAny = true;
            const achDetails = ACHIEVEMENTS.find(a => a.id === ach.id);
            if (achDetails) {
              triggerToast(`🏆 Achievement Unlocked: ${achDetails.title}!`);
            }
          }
        });

        if (unlockedAny) {
          setUnlockedAchievements(newUnlocked);
          localStorage.setItem('ht_unlocked_achievements', JSON.stringify(newUnlocked));
        }
      };

      const handleOpenDetail = (id, mode = 'attributes') => {
        setSelectedCardId(id);
        setModalMode(mode);
      };

      // Add to collection triggers achievement checks (scratched XP gain)
      const toggleCollection = (id) => {
        const itemStr = id.includes('::') ? id : `${id}::Base`;
        const { parallelName } = parseCollectedCard(itemStr);
        let updatedColl;
        if (userCollection.includes(itemStr)) {
          updatedColl = userCollection.filter(x => x !== itemStr);
          setUserCollection(updatedColl);
          triggerToast(`${parallelName} card removed from your Vault.`);
        } else {
          updatedColl = [...userCollection, itemStr];
          setUserCollection(updatedColl);
          triggerToast(`Added ${parallelName} to Vault!`);
        }
        
        setTimeout(() => {
          checkAndAwardAchievements(matchStats, updatedColl, level, prestige);
        }, 100);
      };

      const totalValue = activeUserCollection.reduce((sum, item) => {
        const card = activeCards.find(c => c.id === item) || SPORTS_CARDS.find(c => c.id === item);
        if (card) {
          return sum + card.value;
        }
        return sum;
      }, 0);

      const activeCard = activeCards.find(c => c.id === selectedCardId) || SPORTS_CARDS.find(c => c.id === selectedCardId);
      const detailedActiveCard = activeCard;

      // Generate chart data points dynamically based on the selected card and timeline
      const chartDataPoints = useMemo(() => {
        if (!detailedActiveCard) return [];
        return getCardPriceHistory(detailedActiveCard, selectedTimeline);
      }, [detailedActiveCard, selectedTimeline]);

      // Calculate percentage change over the selected timeline
      const timelinePctChange = useMemo(() => {
        if (chartDataPoints.length < 2) return 0;
        const startPrice = chartDataPoints[0].price;
        const endPrice = chartDataPoints[chartDataPoints.length - 1].price;
        if (startPrice === 0) return 0;
        const pct = ((endPrice - startPrice) / startPrice) * 100;
        return parseFloat(pct.toFixed(1));
      }, [chartDataPoints]);

      const getOwnedParallels = (cardId) => {
        const baseId = cardId.includes('::') ? cardId.split('::')[0] : cardId;
        return userCollection
          .filter(item => parseCollectedCard(item).cardId === baseId)
          .map(item => parseCollectedCard(item).parallelName);
      };

      // Helper to determine rarity priority: 1 (Golden Auto/Patch) to 5 (Base)
      const getCardRarityPriority = window.getCardRarityPriority || ((card) => 5);

      // Sort a flat list of cards dynamically based on sortBy state
      const sortCardsList = (cardsList, sortVal = sortBy) => {
        return [...cardsList].sort((a, b) => {
          const ovrA = window.getCardGameStats ? window.getCardGameStats(a).ovr : 0;
          const ovrB = window.getCardGameStats ? window.getCardGameStats(b).ovr : 0;
          if (ovrB !== ovrA) {
            return ovrB - ovrA;
          }

          const pA = getCardRarityPriority(a);
          const pB = getCardRarityPriority(b);
          if (pA !== pB) {
            return pA - pB;
          }

          if (sortVal === 'value-desc') return b.value - a.value;
          if (sortVal === 'value-asc') return a.value - b.value;
          if (sortVal === 'year-desc') return b.year - a.year;
          if (sortVal === 'year-asc') return a.year - b.year;
          if (sortVal === 'pct-desc') return b.pctChange - a.pctChange;
          if (sortVal === 'volume-desc') {
            const getVolVal = (volText) => {
              const num = parseInt(volText.match(/\d+/) || 0, 10);
              const factor = volText.includes('wk') ? 4 : volText.includes('mo') ? 1 : 0.1;
              return num * factor;
            };
            return getVolVal(b.volume) - getVolVal(a.volume);
          }
          return 0;
        });
      };

      // Organize cards by Set for organized chronological display (injecting filters and sorting)
      const getChronologicalSetsWithCards = (q = searchQuery, era = activeEraFilter, team = activeTeamFilter, sport = activeSportFilter, sortVal = sortBy) => {
        const filtered = activeCards.filter(card => {
          const set = activeSets.find(s => s.id === card.setId);
          const setName = set ? set.name.toLowerCase() : '';
          // Search query check
          if (q) {
            const query = q.toLowerCase();
            const matchesSearch = 
              card.player.toLowerCase().includes(query) ||
              card.brand.toLowerCase().includes(query) ||
              card.team.toLowerCase().includes(query) ||
              card.sport.toLowerCase().includes(query) ||
              card.parallel.toLowerCase().includes(query) ||
              setName.includes(query) ||
              card.setId.toLowerCase().includes(query);
            if (!matchesSearch) return false;
          }

          // Sport filter
          if (sport !== 'All' && card.sport !== sport) return false;

          // Era filter (based on its set)
          if (era !== 'All' && (!set || set.era !== era)) return false;

          // Team filter
          if (team !== 'All') {
            if (card.team !== team) {
              const cardTeams = card.team.split(' / ');
              const match = cardTeams.some(ct => {
                const cleanCt = ct.replace('L.A. ', '').replace('L.A. Lakers', 'Lakers').toLowerCase().trim();
                const cleanTn = team.replace('Los Angeles ', '').replace('L.A. ', '').toLowerCase().trim();
                return cleanCt === cleanTn || cleanTn.includes(cleanCt) || cleanCt.includes(cleanTn);
              });
              if (!match) return false;
            }
          }

          return true;
        });

        // Group cards into their sets
        const setsList = [];

        activeSets.forEach(set => {
          const setCards = filtered.filter(c => c.setId === set.id);
          if (setCards.length > 0) {
            const matchesSport = (favorites?.sports || ['Basketball']).includes(set.sport);
            const matchesTeam = setCards.some(c => favorites.team && c.team.toLowerCase().includes(favorites.team.toLowerCase()));
            
            // Sort set cards internally
            const sortedSetCards = sortCardsList(setCards, sortVal);

            setsList.push({
              ...set,
              cards: sortedSetCards,
              isSuggested: matchesSport || matchesTeam,
              priorityScore: (matchesTeam ? 2 : 0) + (matchesSport ? 1 : 0)
            });
          }
        });

        // Sort sets: newest sets first (year descending).
        // The 1948 Bowman set (year 1948) will naturally be last.
        setsList.sort((a, b) => b.year - a.year);

        return setsList;
      };

      // Get cards recommended for the top slot (Tailored for You)
      const getTailoredCards = () => {
        let cards = [];
        if (favorites.team) {
          const teamCards = SPORTS_CARDS.filter(card => {
            if (card.team.toLowerCase().includes(favorites.team.toLowerCase())) return true;
            const cardTeams = card.team.split(' / ');
            return cardTeams.some(ct => {
              const cleanCt = ct.replace('L.A. ', '').replace('L.A. Lakers', 'Lakers').toLowerCase().trim();
              const cleanTn = favorites.team.replace('Los Angeles ', '').replace('L.A. ', '').toLowerCase().trim();
              return cleanCt === cleanTn || cleanTn.includes(cleanCt) || cleanCt.includes(cleanTn);
            });
          });
          
          // Group by player name to find the highest OVR card for each player
          const bestCardsByPlayer = {};
          teamCards.forEach(card => {
            const playerName = card.player.trim();
            const cardStats = getCardGameStats(card);
            const currentBest = bestCardsByPlayer[playerName];
            if (!currentBest || cardStats.ovr > currentBest.ovr || (cardStats.ovr === currentBest.ovr && card.value > currentBest.card.value)) {
              bestCardsByPlayer[playerName] = { card, ovr: cardStats.ovr };
            }
          });

          cards = Object.values(bestCardsByPlayer).map(item => item.card);
          // Sort players/cards by OVR descending, then value descending
          return cards.sort((a, b) => {
            const ovrA = getCardGameStats(a).ovr;
            const ovrB = getCardGameStats(b).ovr;
            if (ovrB !== ovrA) return ovrB - ovrA;
            return b.value - a.value;
          });
        }
        // Fallback to favorite sports if no team matches
        const sports = favorites?.sports || ['Basketball'];
        if (cards.length === 0 && sports && sports.length > 0) {
          cards = activeCards.filter(card => 
            sports.includes(card.sport)
          );
        }
        return [...cards].sort((a, b) => {
          const ovrA = getCardGameStats(a).ovr;
          const ovrB = getCardGameStats(b).ovr;
          if (ovrB !== ovrA) return ovrB - ovrA;
          return b.value - a.value;
        });
      };

      const chronologicalSets = getChronologicalSetsWithCards();
      const tailoredCards = getTailoredCards();

      const isSetExpanded = (setId, idx) => {
        if (expandedSets[setId] !== undefined) {
          return expandedSets[setId];
        }
        return idx < 2; // Default: expand the first 2 sets
      };

      const toggleSetExpanded = (setId, idx) => {
        setExpandedSets(prev => ({
          ...prev,
          [setId]: !isSetExpanded(setId, idx)
        }));
      };

      if (screen === 'onboarding') {
        return <Onboarding onComplete={handleOnboardingComplete} />;
      }

      return (
        <div className="w-full h-full overflow-hidden flex flex-col md:flex-row p-2 sm:p-4 md:p-6 gap-3 sm:gap-6 relative z-10">
          
          {/* Toast Notification */}
          {toastMsg && (
            <div className="fixed top-6 right-6 z-55 glass-panel border border-white/10 px-5 py-3 rounded-xl flex items-center gap-3 animate-bounce shadow-2xl">
              <iconify-icon icon="solar:star-bold" width="16" className="text-white animate-spin-slow"></iconify-icon>
              <span className="text-xs font-semibold tracking-wide text-white">{toastMsg}</span>
            </div>
          )}

          {/* Mobile Navigation Header */}
          <header className="md:hidden flex items-center justify-between px-4 py-3 bg-black/60 border border-white/5 backdrop-blur-2xl rounded-2xl flex-shrink-0 z-40">
            <div className="flex items-center gap-2">
              <Logo className="w-6 h-8 text-white" />
              <div>
                <h1 className="font-bold tracking-widest text-xs text-white uppercase leading-none">HoopTactics</h1>
                <span className="text-[7px] text-neutral-500 uppercase tracking-wider block mt-0.5">Tactical Binder</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Profile Shortcut */}
              {favorites && favorites.username && (
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-8 h-8 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-950 flex items-center justify-center font-bold text-white text-[10px] select-none border border-white/10 animate-fade-in"
                >
                  {avatarIcon === 'letter' ? (
                    favorites.username.charAt(0).toUpperCase()
                  ) : (
                    <iconify-icon icon={avatarIcon} width="14"></iconify-icon>
                  )}
                </button>
              )}
              {/* Hamburger Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
              >
                <iconify-icon icon={isMobileMenuOpen ? "solar:close-circle-linear" : "solar:hamburger-menu-linear"} width="20"></iconify-icon>
              </button>
            </div>
          </header>

          {/* Mobile Hamburger Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden bg-black flex flex-col justify-between p-6 animate-modal-entry text-left">
              <div className="space-y-6">
                {/* Dropdown Header */}
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2.5">
                    <Logo className="w-8 h-10 text-white" />
                    <div>
                      <h1 className="font-bold tracking-widest text-sm text-white uppercase leading-none">HoopTactics</h1>
                      <span className="text-[8px] text-neutral-500 uppercase tracking-wider mt-1 block">Tactical Basketball Binder</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
                  >
                    <iconify-icon icon="solar:close-circle-linear" width="22"></iconify-icon>
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="grid grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto hide-scrollbar">
                  {[
                    { id: 'home', icon: 'solar:home-2-linear', label: 'Vault', desc: 'My Collection' },
                    { id: 'discover', icon: 'solar:magnifer-linear', label: 'Index', desc: 'Card Search' },
                    { id: 'play', icon: 'solar:gamepad-linear', label: 'Play Now', desc: 'Arena Match' },
                    { id: 'guide', icon: 'solar:notebook-linear', label: 'Guide', desc: 'Rulebook & Perks' },
                    { id: 'teams', icon: 'solar:shield-linear', label: 'Teams', desc: 'Registries' },
                    { id: 'scan', icon: 'solar:camera-linear', label: 'Scanner', desc: 'Digital Scan' },
                    { id: 'drops', icon: 'solar:calendar-date-linear', label: 'Drops', desc: 'New Packs' },
                    { id: 'market', icon: 'solar:chart-square-linear', label: 'Market', desc: 'Analytics' },
                    { id: 'settings', icon: 'solar:settings-linear', label: 'Settings', desc: 'Options' }
                  ].map(item => (
                    <button 
                      key={item.id} 
                      onClick={() => { 
                        setActiveTab(item.id); 
                        setSelectedCardId(null); 
                        setIsMobileMenuOpen(false); 
                      }}
                      className={`flex flex-col p-3.5 rounded-2xl transition-all border text-left gap-1.5 ${
                        activeTab === item.id 
                          ? 'bg-white/10 border-white/20 text-white shadow-inner' 
                          : 'bg-white/5 border-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <iconify-icon icon={item.icon} width="20" className={activeTab === item.id ? 'text-orange-400' : 'text-neutral-400'}></iconify-icon>
                      <div>
                        <div className="font-bold text-xs text-white leading-tight">{item.label}</div>
                        <div className="text-[9px] text-neutral-500 font-medium leading-none">{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Bottom Profile / Coach stats inside the Mobile Dropdown */}
              <div className="border-t border-white/5 pt-4 space-y-3 mt-4">
                {favorites && favorites.username && (
                  <div 
                    onClick={() => {
                      setIsProfileModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${avatarGradient} ${avatarGradient === 'from-neutral-800 to-neutral-950' ? 'avatar-obsidian' : ''} flex items-center justify-center font-bold text-white text-xs select-none shadow-md border border-white/10`}>
                      {avatarIcon === 'letter' ? (
                        favorites.username.charAt(0).toUpperCase()
                      ) : (
                        <iconify-icon icon={avatarIcon} width="16"></iconify-icon>
                      )}
                    </div>
                    <div className="leading-none flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{favorites.username}</div>
                      <div className="text-[8px] text-neutral-500 uppercase mt-1 tracking-wider truncate">
                        {prestige > 0 ? `Prestige ${getPrestigeRoman(prestige)}` : 'Basketball Curator'}
                      </div>
                    </div>
                    <iconify-icon icon="solar:alt-arrow-right-linear" width="16" className="text-neutral-500"></iconify-icon>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[9px] text-neutral-500 uppercase block">Arena Level</span>
                    <span className="font-bold text-white">Lvl {level} — {getCoachTitle(level, prestige).split(' ').pop()}</span>
                  </div>
                  <span className="text-[9px] text-neutral-500 font-mono">{xp} / 500 XP</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden border border-white/5 relative">
                  <div className="h-full bg-white transition-all duration-300" style={{ width: `${(xp / 500) * 100}%` }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Navigation Sidebar */}
          <aside className="hidden md:flex w-64 flex-col bg-black/60 border border-white/5 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl justify-between flex-shrink-0">
            <div className="space-y-8">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <Logo className="w-12 h-16 text-white" />
                <div>
                  <h1 className="font-bold tracking-widest text-sm text-white uppercase">HoopTactics</h1>
                  <span className="text-[8px] text-neutral-500 uppercase tracking-wider">Tactical Basketball Binder</span>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="flex flex-col gap-2">
                {[
                  { id: 'home', icon: 'solar:home-2-linear', label: 'My Collection' },
                  { id: 'discover', icon: 'solar:magnifer-linear', label: 'Card Index' },
                  { id: 'play', icon: 'solar:gamepad-linear', label: 'Play Now' },
                  { id: 'guide', icon: 'solar:notebook-linear', label: 'Gameplay Guide' },
                  { id: 'teams', icon: 'solar:shield-linear', label: 'Teams Directory' },
                  { id: 'scan', icon: 'solar:camera-linear', label: 'Camera Scanner' },
                  { id: 'drops', icon: 'solar:calendar-date-linear', label: 'Drops & Releases' },
                  { id: 'market', icon: 'solar:chart-square-linear', label: 'Market Analytics' },
                  { id: 'settings', icon: 'solar:settings-linear', label: 'Settings' }
                ].map(item => (
                  <button 
                    key={item.id} onClick={() => { setActiveTab(item.id); setSelectedCardId(null); }}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-xs font-semibold ${activeTab === item.id ? 'bg-white/10 border border-white/10 text-white shadow-sm' : 'text-neutral-500 hover:bg-white/5 hover:text-white'}`}
                  >
                    <iconify-icon icon={item.icon} width="16"></iconify-icon>
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Profile / XP Bar */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              {favorites && favorites.username && (
                <div 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-2.5 pb-2 border-b border-white/5 cursor-pointer hover:bg-white/5 p-1 rounded-xl transition-all duration-200"
                >
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${avatarGradient} ${avatarGradient === 'from-neutral-800 to-neutral-950' ? 'avatar-obsidian' : ''} flex items-center justify-center font-bold text-white text-xs select-none shadow-md border border-white/10`}>
                    {avatarIcon === 'letter' ? (
                      favorites.username.charAt(0).toUpperCase()
                    ) : (
                      <iconify-icon icon={avatarIcon} width="16"></iconify-icon>
                    )}
                  </div>
                  <div className="text-left leading-none flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">{favorites.username}</div>
                    <div className="text-[8px] text-neutral-500 uppercase mt-0.5 tracking-wider truncate">
                      {prestige > 0 ? `Prestige ${getPrestigeRoman(prestige)}` : 'Basketball Curator'}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase">Arena Level</div>
                  <div className="text-xs font-bold text-white truncate max-w-[170px]">Lvl {level} — {getCoachTitle(level, prestige).split(' ').pop()}</div>
                </div>
                <iconify-icon icon="solar:crown-minimalistic-bold" className="text-white" width="16"></iconify-icon>
              </div>
              <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-white transition-all duration-300" style={{ width: `${(xp / 500) * 100}%` }}></div>
              </div>
              <div className="text-[9px] text-neutral-500 font-mono text-right">
                {level >= 20 && xp >= 500 ? "Ready to Prestige!" : `${xp} / 500 XP`}
              </div>
            </div>
          </aside>

          {/* Main Panel */}
          <main className="flex-1 bg-black/60 border border-white/5 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col min-h-0 max-h-full">
            <div className={`p-2 sm:p-6 md:p-8 flex-1 flex flex-col min-h-0 ${isGameActive ? 'lg:overflow-hidden' : 'pb-24 sm:pb-16 overflow-y-auto hide-scrollbar'}`}>
              
              {/* Top Action Row */}
              {!isGameActive && (
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-wider">
                    {activeTab === 'home' && 'My Collection'}
                    {activeTab === 'discover' && 'Card Index'}
                    {activeTab === 'play' && 'HoopTactics Arena'}
                    {activeTab === 'guide' && 'Gameplay Guide'}
                    {activeTab === 'teams' && 'Teams Directory'}
                    {activeTab === 'scan' && 'Scan Digital Replica'}
                    {activeTab === 'drops' && 'Drops & Releases'}
                    {activeTab === 'market' && 'Market Analytics'}
                  </h2>
                  <p className="text-[10px] text-neutral-500 uppercase">
                    {activeTab === 'home' && 'Your personal scanned card binder & stats'}
                    {activeTab === 'discover' && 'Search & browse complete historic card sets'}
                    {activeTab === 'play' && 'Turn-based tabletop card game experience'}
                    {activeTab === 'guide' && 'Rulebook, Perks, Attributes, and OVR Calculations'}
                    {activeTab === 'teams' && 'Browse cards by team registries & set sources'}
                    {activeTab === 'scan' && 'Align your card inside the frame to scan'}
                    {activeTab === 'drops' && 'Subscribed pack releases and digital sale pre-orders'}
                    {activeTab === 'market' && 'Volume & price fluctuations over time'}
                  </p>
                </div>

                {/* Focus Mode & Search triggers */}
                <div className="flex items-center gap-3">
                  {/* Profile Trigger button */}
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="conic-btn dramatic-hover rounded-full"
                  >
                    <div className="conic-spin-bg"></div>
                    <div className="conic-btn-mask rounded-full bg-[#111111]/90"></div>
                    <div className="relative z-10 flex items-center gap-2 pl-1.5 pr-3 py-1 transition-all text-left cursor-pointer">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${avatarGradient} ${avatarGradient === 'from-neutral-800 to-neutral-950' ? 'avatar-obsidian' : ''} flex items-center justify-center font-bold text-white text-[10.5px] select-none border border-white/10`}>
                        {avatarIcon === 'letter' ? (
                          favorites?.username?.charAt(0).toUpperCase() || 'P'
                        ) : (
                          <iconify-icon icon={avatarIcon} width="12"></iconify-icon>
                        )}
                      </div>
                      <div className="leading-none hidden sm:block">
                        <div className="text-[9px] font-bold text-white uppercase">{favorites?.username || 'Profile'}</div>
                        <div className="text-[7.5px] text-neutral-400 font-semibold mt-0.5">
                          Lvl {level} {prestige > 0 && `(P.${getPrestigeRoman(prestige)})`}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Settings Trigger shortcut */}
                  <button
                    onClick={() => { setActiveTab('settings'); setSelectedCardId(null); setIsGameActive(false); }}
                    className={`conic-btn dramatic-hover ${activeTab === 'settings' ? 'orange' : ''}`}
                  >
                    <div className="conic-spin-bg"></div>
                    <div className="conic-btn-mask"></div>
                    <span className="relative z-10 flex items-center gap-1.5 px-3 py-1.5 text-[9px] uppercase font-bold text-white">
                      <iconify-icon icon="solar:settings-linear" width="10"></iconify-icon>
                      Settings
                    </span>
                  </button>
                </div>
              </div>
              )}

              {/* TAB 1: HOME/DASHBOARD (MY COLLECTION CHANNEL) */}
              {activeTab === 'home' && (
                <div className="space-y-8 animate-modal-entry">
                  {/* Dashboard Stats row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="amp-card p-4 sm:p-5 text-left stagger-1">
                      <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Portfolio Value</div>
                      <div className="text-xl font-bold mt-1 text-white">${totalValue.toLocaleString()}</div>
                      <div className="text-[9px] text-green-500 mt-0.5 flex items-center gap-1">
                        <iconify-icon icon="solar:arrow-right-up-bold" width="10"></iconify-icon> +8.4% (24h)
                      </div>
                    </div>
                    <div className="amp-card p-4 sm:p-5 text-left stagger-2">
                      <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Total Scanned</div>
                      <div className="text-xl font-bold mt-1 text-white">{activeUserCollection.length}</div>
                      <div className="text-[9px] text-neutral-400 mt-0.5">Slabs in Vault</div>
                    </div>
                    <div className="amp-card p-4 sm:p-5 text-left stagger-3">
                      <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Favorite Team</div>
                      <div className="text-xl font-bold mt-1 truncate text-white">{favorites.team || 'None Set'}</div>
                      <div className="text-[9px] text-neutral-400 mt-0.5">Custom index prioritized</div>
                    </div>
                    <div className="amp-card p-4 sm:p-5 text-left stagger-4">
                      <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Scanned Progress</div>
                      <div className="text-xl font-bold mt-1 text-white">
                        {activeCards.length > 0 ? Math.round((activeUserCollection.length / activeCards.length) * 100) : 0}%
                      </div>
                      <div className="text-[9px] text-neutral-400 mt-0.5">Set completions active</div>
                    </div>
                  </div>

                  {/* My Binder Grid */}
                  <div>
                    <h3 className="text-xs uppercase font-extrabold text-neutral-400 mb-4 tracking-widest border-b border-white/5 pb-2">My Vault Binder</h3>
                    {activeUserCollection.length === 0 ? (
                      <div className="amp-card p-12 text-center text-neutral-500 text-xs rounded-2xl border border-dashed border-white/10">
                        <iconify-icon icon="solar:folder-add-linear" width="36" className="mb-2 block mx-auto opacity-40"></iconify-icon>
                        Your personal card vault is currently empty. Go to the Card Index or Camera Scanner to add some!
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-6">
                        {[...activeUserCollection].sort((a, b) => {
                          const cardA = activeCards.find(c => c.id === a) || SPORTS_CARDS.find(c => c.id === a);
                          const cardB = activeCards.find(c => c.id === b) || SPORTS_CARDS.find(c => c.id === b);
                          const ovrA = cardA ? getCardGameStats(cardA).ovr : 0;
                          const ovrB = cardB ? getCardGameStats(cardB).ovr : 0;
                          if (ovrB !== ovrA) return ovrB - ovrA;
                          const valA = cardA ? cardA.value : 0;
                          const valB = cardB ? cardB.value : 0;
                          if (valB !== valA) return valB - valA;
                          return (cardA?.player || '').localeCompare(cardB?.player || '');
                        }).map((item, idx) => {
                          const card = activeCards.find(c => c.id === item) || SPORTS_CARDS.find(c => c.id === item);
                          if (!card) return null;
                          return (
                            <CatalogCard 
                              key={`${card.id}-${idx}`}
                              card={card}
                              isOwned={true}
                              onOpenDetail={(id) => setSelectedCardId(id)}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: DISCOVER / CARD INDEX (CATALOG CHANNEL) */}
              {activeTab === 'discover' && (
                <div className="space-y-8 animate-modal-entry">
                  {/* Search and Filters Bar */}
                  <div className="flex flex-col gap-4">
                    <div className="relative">
                      <input 
                        type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search card by player name, set, team, brand..."
                        className="w-full bg-neutral-900 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-0 focus:border-white/20 transition-all text-white placeholder-neutral-500"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 flex items-center justify-center pointer-events-none">
                        <iconify-icon icon="solar:magnifer-linear" width="18"></iconify-icon>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 sm:gap-3 bg-neutral-950/40 p-2 sm:p-3 rounded-2xl border border-white/5 text-xs">
                      {/* Sort Dropdown */}
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-[8px] sm:text-[9px] uppercase text-neutral-500 font-bold truncate">Sort By</label>
                        <select 
                          value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-1.5 sm:p-2 focus:outline-none text-white font-semibold cursor-pointer text-[10px] sm:text-xs"
                        >
                          <option value="value-desc">Market Value: High to Low</option>
                          <option value="value-asc">Market Value: Low to High</option>
                          <option value="year-desc">Year: Newest First</option>
                          <option value="year-asc">Year: Oldest First</option>
                          <option value="pct-desc">7D Change: Highest Spikes</option>
                          <option value="volume-desc">Sales Volume: Highest First</option>
                        </select>
                      </div>

                      {/* Era Filter */}
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-[8px] sm:text-[9px] uppercase text-neutral-500 font-bold truncate">Era</label>
                        <select 
                          value={activeEraFilter} onChange={(e) => setActiveEraFilter(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-1.5 sm:p-2 focus:outline-none text-white font-semibold cursor-pointer text-[10px] sm:text-xs"
                        >
                          <option value="All">All Eras</option>
                          <option value="Pre-War & Tobacco Era">Pre-War & Tobacco Era</option>
                          <option value="Early Vintage Era">Early Vintage Era</option>
                          <option value="Modern Competition & Junk Wax Era">Modern Competition & Junk Wax Era</option>
                          <option value="Premium, Insert, & Chrome Revolution">Premium, Insert, & Chrome Revolution</option>
                          <option value="Fanatics & Real-Time Era">Fanatics & Real-Time Era</option>
                        </select>
                      </div>

                      {/* Team Filter */}
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-[8px] sm:text-[9px] uppercase text-neutral-500 font-bold truncate">Team</label>
                        <select 
                          value={activeTeamFilter} onChange={(e) => setActiveTeamFilter(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-1.5 sm:p-2 focus:outline-none text-white font-semibold cursor-pointer text-[10px] sm:text-xs"
                        >
                          <option value="All">All Teams</option>
                          {allTeams.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      {/* Reset Filters Button */}
                      <div className="flex items-end">
                        <button 
                          onClick={() => {
                            setSearchQuery('');
                            setSortBy('value-desc');
                            setActiveEraFilter('All');
                            setActiveTeamFilter('All');
                            setActiveSportFilter('All');
                          }}
                          className="w-full bg-neutral-900 hover:bg-neutral-800 border border-white/10 rounded-lg py-1.5 sm:py-2 font-bold text-white transition-colors text-[10px] sm:text-xs flex items-center justify-center gap-1.5"
                          title="Reset Filters"
                        >
                          <iconify-icon icon="solar:restart-bold" width="14" className="text-white"></iconify-icon>
                          <span className="hidden sm:inline">Reset Filters</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 1. Tailored Interest Highlights Section */}
                  {tailoredCards.length > 0 && !searchQuery && activeTeamFilter === 'All' && activeEraFilter === 'All' && (
                    <div className="glass-panel border border-white/5 p-6 rounded-3xl mb-8 text-left relative overflow-hidden bg-gradient-to-br from-neutral-950 via-white/5 to-neutral-950">
                      <div className="absolute top-0 left-0 w-full h-1 bg-white" />
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded text-white font-mono uppercase tracking-widest">
                            {favorites.team ? 'Priority Registry' : 'Trending Hits'}
                          </span>
                          <h3 className="text-lg font-bold text-white mt-1">
                            {favorites.team ? `Sought-After ${favorites.team} Cards` : 'Recommended for You'}
                          </h3>
                          <p className="text-[10px] text-neutral-400 uppercase mt-0.5 font-semibold">
                            {favorites.team 
                              ? `Highest ranked OVR players for the ${favorites.team} franchise` 
                              : `Top trending cards in your selected sports`}
                          </p>
                        </div>
                        <iconify-icon icon="solar:star-fall-bold" width="24" className="text-white opacity-80 animate-pulse"></iconify-icon>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {(favorites.team ? tailoredCards.slice(0, 6) : sortCardsList(tailoredCards).slice(0, 6)).map(card => (
                          <CatalogCard
                            key={`tailored-${card.id}`}
                            card={card}
                            isOwned={isAnyParallelOwned(userCollection, card.id)}
                            onToggle={toggleCollection}
                            onOpenDetail={(id) => {
                              setSelectedCardId(id);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Flat Search/Filter Results or Structured Catalog Sets */}
                  {(searchQuery || activeTeamFilter !== 'All' || activeEraFilter !== 'All') ? (
                    <div>
                      <h3 className="text-xs uppercase font-extrabold text-neutral-400 mb-4 tracking-widest border-b border-white/5 pb-2 text-left">
                        Filtered Catalog Cards ({
                          sortCardsList(
                            activeCards.filter(card => {
                              const set = activeSets.find(s => s.id === card.setId);
                              const setName = set ? set.name.toLowerCase() : '';
                              if (searchQuery) {
                                const query = searchQuery.toLowerCase();
                                const matchesSearch = 
                                  card.player.toLowerCase().includes(query) ||
                                  card.brand.toLowerCase().includes(query) ||
                                  card.team.toLowerCase().includes(query) ||
                                  card.sport.toLowerCase().includes(query) ||
                                  setName.includes(query) ||
                                  card.setId.toLowerCase().includes(query);
                                if (!matchesSearch) return false;
                              }
                              if (activeSportFilter !== 'All' && card.sport !== activeSportFilter) return false;
                              if (activeEraFilter !== 'All' && (!set || set.era !== activeEraFilter)) return false;
                              if (activeTeamFilter !== 'All') {
                                if (card.team !== activeTeamFilter) {
                                  const cardTeams = card.team.split(' / ');
                                  const match = cardTeams.some(ct => {
                                    const cleanCt = ct.replace('L.A. ', '').replace('L.A. Lakers', 'Lakers').toLowerCase().trim();
                                    const cleanTn = activeTeamFilter.replace('Los Angeles ', '').replace('L.A. ', '').toLowerCase().trim();
                                    return cleanCt === cleanTn || cleanTn.includes(cleanCt) || cleanCt.includes(cleanTn);
                                  });
                                  if (!match) return false;
                                }
                              }
                              return true;
                            })
                          ).length
                        })
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-6">
                        {sortCardsList(
                          activeCards.filter(card => {
                            const set = activeSets.find(s => s.id === card.setId);
                            const setName = set ? set.name.toLowerCase() : '';
                            if (searchQuery) {
                              const query = searchQuery.toLowerCase();
                              const matchesSearch = 
                                card.player.toLowerCase().includes(query) ||
                                card.brand.toLowerCase().includes(query) ||
                                card.team.toLowerCase().includes(query) ||
                                card.sport.toLowerCase().includes(query) ||
                                setName.includes(query) ||
                                card.setId.toLowerCase().includes(query);
                              if (!matchesSearch) return false;
                            }
                            if (activeSportFilter !== 'All' && card.sport !== activeSportFilter) return false;
                            if (activeEraFilter !== 'All' && (!set || set.era !== activeEraFilter)) return false;
                            if (activeTeamFilter !== 'All') {
                              if (card.team !== activeTeamFilter) {
                                const cardTeams = card.team.split(' / ');
                                const match = cardTeams.some(ct => {
                                  const cleanCt = ct.replace('L.A. ', '').replace('L.A. Lakers', 'Lakers').toLowerCase().trim();
                                  const cleanTn = activeTeamFilter.replace('Los Angeles ', '').replace('L.A. ', '').toLowerCase().trim();
                                  return cleanCt === cleanTn || cleanTn.includes(cleanCt) || cleanCt.includes(cleanTn);
                                });
                                if (!match) return false;
                              }
                            }
                            return true;
                          })
                        ).map(card => (
                          <CatalogCard 
                            key={card.id} 
                            card={card}
                            isOwned={isAnyParallelOwned(userCollection, card.id)}
                            onToggle={toggleCollection}
                            onOpenDetail={(id) => {
                              setSelectedCardId(id);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      {(() => {
                        const filteredSets = focusMode 
                          ? chronologicalSets.filter(s => s.isSuggested) 
                          : chronologicalSets;

                        if (filteredSets.length === 0) {
                          return (
                            <div className="amp-card p-12 text-center text-neutral-500 text-xs rounded-2xl border border-dashed border-white/10">
                              No sets match the active filters or suggestions.
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-6">
                            {/* Chronological Label */}
                            <h3 className="text-sm font-black uppercase tracking-widest text-white border-b border-white/10 pb-2 flex items-center justify-between">
                              <span>Chronological Set Index</span>
                              <span className="text-[9px] font-mono text-neutral-500 font-normal">Latest Season to Past</span>
                            </h3>

                            {/* Sets list */}
                            <div className="space-y-8">
                              {filteredSets.map((set, idx) => {
                                const ownedCount = set.cards.filter(c => isAnyParallelOwned(userCollection, c.id)).length;
                                const completionPercent = Math.round((ownedCount / set.cards.length) * 100);

                                return (
                                  <div key={set.id} className="bg-black/30 border border-white/5 rounded-3xl p-5 md:p-6 space-y-4 text-left">
                                    {/* Set Header with Progress */}
                                    <div 
                                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all duration-200"
                                      onClick={() => toggleSetExpanded(set.id, idx)}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="flex flex-col text-left">
                                          <h4 className="text-md font-bold text-white flex items-center gap-2 flex-wrap">
                                            {set.name}
                                            {set.isSuggested && (
                                              <span className="text-[8px] bg-white text-black font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                Suggested Set
                                              </span>
                                            )}
                                          </h4>
                                          <span className="text-[10px] text-neutral-500 uppercase font-semibold">{set.sport} Set • {set.year} • {set.era}</span>
                                        </div>
                                      </div>

                                      {/* Completion Progress Bar */}
                                      <div className="flex items-center gap-3">
                                        <div className="text-right">
                                          <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono">Vault Progress</div>
                                          <div className="text-xs font-bold text-white">{ownedCount} / {set.cards.length} Scanned ({completionPercent}%)</div>
                                        </div>
                                        <div className="w-24 h-1.5 bg-neutral-900 border border-white/5 rounded-full overflow-hidden">
                                          <div className="h-full bg-white" style={{ width: `${completionPercent}%` }} />
                                        </div>
                                        <iconify-icon 
                                          icon={isSetExpanded(set.id, idx) ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"} 
                                          width="16" 
                                          className="text-white opacity-60 ml-2"
                                        ></iconify-icon>
                                      </div>
                                    </div>
                                    {/* Set Cards Listing */}
                                    {isSetExpanded(set.id, idx) && (
                                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-6 pt-2 animate-modal-entry">
                                        {set.cards.map(card => (
                                          <CatalogCard 
                                            key={card.id} 
                                            card={card}
                                            isOwned={isAnyParallelOwned(userCollection, card.id)}
                                            onToggle={toggleCollection}
                                            onOpenDetail={(id) => {
                                              setSelectedCardId(id);
                                            }}
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: HOOPTACTICS ARENA GAMEPLAY EXPERIENCE */}
              {activeTab === 'play' && (
                <div className={`animate-modal-entry text-left ${isGameActive ? 'lg:flex-1 lg:flex lg:flex-col lg:min-h-0 lg:h-full' : 'space-y-6'}`}>
                  {(() => {
                    const basketballCardsInCollection = activeUserCollection.filter(item => {
                      const c = SPORTS_CARDS.find(x => x.id === item);
                      return c && c.sport === 'Basketball';
                    });

                    // HoopTactics Arena inner state manager
                    return (
                      <HoopTacticsArenaContainer 
                        onOpenDetail={handleOpenDetail}
                        collection={basketballCardsInCollection} 
                        userCollection={userCollection}
                        activeCards={activeCards}
                        toggleCollection={toggleCollection}
                        triggerToast={triggerToast}
                        getCardGameStats={getCardGameStats}
                        level={level}
                        setLevel={setLevel}
                        xp={xp}
                        setXp={setXp}
                        favorites={favorites}
                        setActiveTab={setActiveTab}
                        prestige={prestige}
                        wasOvertime={wasOvertime}
                        setWasOvertime={setWasOvertime}
                        matchStats={matchStats}
                        setMatchStats={setMatchStats}
                        avatarIcon={avatarIcon}
                        avatarGradient={avatarGradient}
                        setIsGameActive={setIsGameActive}
                      />
                    );
                  })()}
                </div>
              )}

              {/* TAB: HOOPTACTICS GAMEPLAY GUIDE */}
              {activeTab === 'guide' && (
                <div className="animate-modal-entry">
                  <GameplayGuideContainer />
                </div>
              )}

              {/* TAB 3: CAMERA SCANNER (SIMULATION) */}
              {activeTab === 'scan' && (
                <div className="flex flex-col items-center justify-center py-6 animate-modal-entry">
                  <div className="w-full max-w-sm aspect-[3/4] bg-neutral-950 border border-white/10 rounded-2xl relative overflow-hidden flex flex-col items-center justify-between p-6">
                    {/* Corner overlay brackets */}
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/20 rounded-tl" />
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/20 rounded-tr" />
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/20 rounded-bl" />
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/20 rounded-br" />

                    <div className="text-center mt-6">
                      <iconify-icon icon="solar:camera-linear" width="32" className="text-neutral-500 animate-pulse"></iconify-icon>
                      <h3 className="text-sm font-semibold mt-2">Align Graded Slab or Raw Card</h3>
                      <p className="text-[10px] text-neutral-500 mt-1">Keep card flat in bright lighting</p>
                    </div>

                    <div className="w-48 h-64 border border-dashed border-white/20 rounded-xl bg-white/5 flex items-center justify-center relative">
                      {/* Scanning laser beam animation */}
                      <div className="absolute top-0 inset-x-0 h-0.5 bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-bounce" style={{ animationDuration: '3s' }} />
                      <span className="text-[9px] font-mono text-neutral-500">Align Frame</span>
                    </div>

                    <button 
                      onClick={() => {
                        // Scan simulation: pick a card at random from unowned catalog cards
                        const unowned = activeCards.filter(c => !isAnyParallelOwned(userCollection, c.id));
                        if (unowned.length > 0) {
                          const randCard = unowned[Math.floor(Math.random() * unowned.length)];
                          toggleCollection(randCard.id);
                        } else {
                          triggerToast('All available catalog cards are already in your Vault!');
                        }
                      }}
                      className="conic-btn primary dramatic-hover w-full py-3"
                    >
                      <div className="conic-spin-bg"></div>
                      <div className="conic-btn-mask"></div>
                      <span className="relative z-10 text-white text-xs font-semibold px-6">
                        Capture & Identify Card
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: DROPS & RELEASES CALENDAR */}
              {activeTab === 'drops' && (
                <div className="space-y-8 animate-modal-entry text-left">
                  {/* Active drops header banner */}
                  <div className="bg-gradient-to-r from-red-600/10 via-amber-500/10 to-transparent p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-amber-500" />
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="text-[9px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-widest animate-pulse">Live Limited Drops</span>
                        <h3 className="text-xl font-bold text-white mt-2">Active Trading Card Releases</h3>
                        <p className="text-[10px] text-neutral-400 uppercase mt-0.5">Time-sensitive prints and flash drops. Purchase runs are open for 24-48 hours only.</p>
                      </div>
                      <iconify-icon icon="solar:fire-bold" width="32" className="text-red-500 opacity-80 animate-bounce"></iconify-icon>
                    </div>
                  </div>

                  {/* Active Drops grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeDrops.map((drop) => {
          const isOwned = isAnyParallelOwned(userCollection, drop.id);
          const dropCard = activeCards.find(c => c.id === drop.id || c.baseCardId === drop.id) || SPORTS_CARDS.find(c => c.id === drop.id || c.baseCardId === drop.id) || activeCards[0] || SPORTS_CARDS[0];
          const timeLeft = timeRemaining[drop.timeKey] || 0;
          
          return (
            <div key={drop.id} className="amp-card p-5 flex flex-col justify-between gap-4 bg-black/60 relative overflow-hidden">
              <div className="absolute top-3 right-3 text-red-500 animate-pulse text-[9px] font-mono font-bold flex items-center gap-1">
                <iconify-icon icon="solar:bell-bold" width="10"></iconify-icon> LIVE SALE
              </div>

              <div className="space-y-2 text-left">
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono font-bold">{drop.brand}</span>
                <h4 className="text-sm font-bold text-white leading-tight">{drop.title}</h4>
                <p className="text-[9px] text-neutral-400">{drop.desc}</p>
              </div>

              {/* Display large card preview */}
              <div className="w-full h-80 bg-neutral-900/30 border border-white/5 rounded-2xl overflow-hidden relative flex items-center justify-center p-3">
                <div className="scale-[0.85] min-[400px]:scale-[0.9] sm:scale-100 origin-center flex-shrink-0 relative">
                  <HoloCard card={dropCard} size="md" interactive={true} />
                </div>
              </div>

              <div className="space-y-3 pt-2 text-left">
                <div className="flex justify-between items-center bg-white/5 p-2 rounded border border-white/5 font-mono text-[10px]">
                  <span className="text-neutral-500">TIME LEFT:</span>
                  <span className="text-white font-bold">{formatTime(timeLeft)}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-mono text-neutral-400">
                  <span>PRICE: {drop.price}</span>
                  <span>PRINT RUN: {drop.printRun}</span>
                </div>

                <button
                  onClick={() => {
                    window.open('https://www.topps.com', '_blank');
                  }}
                  className="conic-btn primary dramatic-hover w-full py-2.5"
                >
                  <div className="conic-spin-bg"></div>
                  <div className="conic-btn-mask"></div>
                  <span className="relative z-10 text-[10px] font-bold uppercase text-white flex items-center justify-center gap-1.5">
                    <iconify-icon icon="solar:cart-bold" width="12"></iconify-icon>
                    Buy Pre-Order
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming calendar section */}
                  <div className="space-y-6 pt-4">
                    <h3 className="text-xs uppercase font-extrabold text-neutral-400 tracking-widest border-b border-white/5 pb-2">Topps Basketball Release Calendar (2025/2026 Sets)</h3>
                    
                    <div className="space-y-4">
                      {[
                        { set: '2025-26 Topps Motif Basketball', sport: 'Basketball', date: 'June 09, 2026', days: 1, msrp: 1399.99, hype: 5, released: false },
                        { set: '2025-26 Topps Chrome Cactus Jack Basketball', sport: 'Basketball', date: 'June 19, 2026', days: 11, msrp: 249.99, hype: 5, released: false },
                        { set: '2025-26 Topps NBL Basketball', sport: 'Basketball', date: 'June 25, 2026', days: 17, msrp: 119.99, hype: 3.5, released: false },
                        { set: '2025-26 Topps Finest Basketball', sport: 'Basketball', date: 'July 08, 2026', days: 30, msrp: 299.99, hype: 4.5, released: false },
                        { set: '2025-26 Topps Hoops Basketball', sport: 'Basketball', date: 'April 15, 2026', days: 0, msrp: 149.99, hype: 4, released: true },
                        { set: '2025-26 Topps Chrome Basketball', sport: 'Basketball', date: 'December 18, 2025', days: 0, msrp: 269.99, hype: 5, released: true },
                        { set: '2025-26 Topps Flagship Basketball', sport: 'Basketball', date: 'October 23, 2025', days: 0, msrp: 119.99, hype: 4.5, released: true }
                      ].map((item, idx) => {
                        const isSubscribed = subscribedDrops.includes(item.set);
                        return (
                          <div key={idx} className="amp-card p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/40 hover:border-white/10 transition-all">
                            <div className="flex items-center gap-4 text-left">
                              <div className="w-12 h-12 bg-neutral-900 border border-white/5 rounded-xl flex flex-col items-center justify-center">
                                <span className="text-[10px] text-neutral-500 font-mono font-bold uppercase">{item.sport.substring(0,4)}</span>
                                <iconify-icon icon="solar:calendar-linear" width="14" className="text-neutral-400 mt-0.5"></iconify-icon>
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-white">{item.set}</h4>
                                <p className="text-[10px] text-neutral-400 uppercase mt-0.5">
                                  LAUNCH: {item.date} • {item.released ? <span className="text-emerald-400 font-semibold">RELEASED (RECENT)</span> : `${item.days} ${item.days === 1 ? 'day' : 'days'} remaining`}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-row md:flex-col lg:flex-row items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                              <div className="text-left md:text-right leading-tight">
                                <div className="text-[8px] text-neutral-500 uppercase tracking-widest font-mono">Est MSRP Box</div>
                                <div className="text-xs font-bold text-white mt-0.5">${item.msrp}</div>
                              </div>

                              <div className="text-left md:text-right leading-tight">
                                <div className="text-[8px] text-neutral-500 uppercase tracking-widest font-mono">Hype Rating</div>
                                <div className="text-xs font-bold text-amber-400 mt-0.5 flex items-center gap-0.5">
                                  {Array.from({ length: Math.floor(item.hype) }).map((_, i) => (
                                    <iconify-icon key={i} icon="solar:star-bold" width="10"></iconify-icon>
                                  ))}
                                  {item.hype % 1 !== 0 && (
                                    <iconify-icon icon="solar:star-half-bold" width="10"></iconify-icon>
                                  )}
                                </div>
                              </div>

                              <button 
                                onClick={() => {
                                  if (item.released) {
                                    window.open('https://www.topps.com', '_blank');
                                  } else {
                                    toggleSubscribe(item.set);
                                  }
                                }}
                                className={`conic-btn dramatic-hover py-2 px-4 w-full md:w-auto ${item.released ? '' : (isSubscribed ? 'orange' : 'primary')}`}
                              >
                                <div className="conic-spin-bg"></div>
                                <div className="conic-btn-mask"></div>
                                <span className="relative z-10 text-[9px] font-bold uppercase text-white flex items-center justify-center gap-1">
                                  <iconify-icon icon={item.released ? "solar:square-share-line-linear" : (isSubscribed ? "solar:bell-bold" : "solar:bell-linear")} width="10"></iconify-icon> 
                                  {item.released ? 'View on Topps' : (isSubscribed ? 'Alert On 🔔' : 'Subscribe Alert')}
                                </span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: MARKET ANALYTICS */}
              {activeTab === 'market' && (
                <div className="space-y-6 animate-modal-entry">
                  {/* Market Summary cards */}
                  <div className="grid grid-cols-1 min-[450px]:grid-cols-3 gap-4">
                    <div className="amp-card p-4 sm:p-5 text-left">
                      <div className="text-[10px] text-neutral-500 uppercase">Market Index</div>
                      <div className="text-lg font-bold mt-1 text-white">CV-500 Index</div>
                      <div className="text-[9px] text-green-500 mt-0.5">+4.2% This Month</div>
                    </div>
                    <div className="amp-card p-4 sm:p-5 text-left">
                      <div className="text-[10px] text-neutral-500 uppercase">Top Gainer</div>
                      <div className="text-lg font-bold mt-1 text-white">Victor Wemby</div>
                      <div className="text-[9px] text-green-500 mt-0.5">+14.2% Spike</div>
                    </div>
                    <div className="amp-card p-4 sm:p-5 text-left">
                      <div className="text-[10px] text-neutral-500 uppercase">Index Volume</div>
                      <div className="text-lg font-bold mt-1 text-white">14.8M</div>
                      <div className="text-[9px] text-neutral-400 mt-0.5">Slab comps validated</div>
                    </div>
                  </div>

                  {/* Search and Filters Bar (Specific to Market) */}
                  <div className="flex flex-col gap-4">
                    <div className="relative">
                      <input 
                        type="text" value={marketSearchQuery} onChange={(e) => setMarketSearchQuery(e.target.value)}
                        placeholder="Search card by player name, set, team, brand..."
                        className="w-full bg-neutral-900 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-0 focus:border-white/20 transition-all text-white placeholder-neutral-500"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 flex items-center justify-center pointer-events-none">
                        <iconify-icon icon="solar:magnifer-linear" width="18"></iconify-icon>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 sm:gap-3 bg-neutral-950/40 p-2 sm:p-3 rounded-2xl border border-white/5 text-xs">
                      {/* Sort Dropdown */}
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-[8px] sm:text-[9px] uppercase text-neutral-500 font-bold truncate">Sort By</label>
                        <select 
                          value={marketSortBy} onChange={(e) => setMarketSortBy(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-1.5 sm:p-2 focus:outline-none text-white font-semibold cursor-pointer text-[10px] sm:text-xs"
                        >
                          <option value="value-desc">Market Value: High to Low</option>
                          <option value="value-asc">Market Value: Low to High</option>
                          <option value="year-desc">Year: Newest First</option>
                          <option value="year-asc">Year: Oldest First</option>
                          <option value="pct-desc">7D Change: Highest Spikes</option>
                          <option value="volume-desc">Sales Volume: Highest First</option>
                        </select>
                      </div>

                      {/* Era Filter */}
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-[8px] sm:text-[9px] uppercase text-neutral-500 font-bold truncate">Era</label>
                        <select 
                          value={marketActiveEraFilter} onChange={(e) => setMarketActiveEraFilter(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-1.5 sm:p-2 focus:outline-none text-white font-semibold cursor-pointer text-[10px] sm:text-xs"
                        >
                          <option value="All">All Eras</option>
                          <option value="Pre-War & Tobacco Era">Pre-War & Tobacco Era</option>
                          <option value="Early Vintage Era">Early Vintage Era</option>
                          <option value="Modern Competition & Junk Wax Era">Modern Competition & Junk Wax Era</option>
                          <option value="Premium, Insert, & Chrome Revolution">Premium, Insert, & Chrome Revolution</option>
                          <option value="Fanatics & Real-Time Era">Fanatics & Real-Time Era</option>
                        </select>
                      </div>

                      {/* Team Filter */}
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-[8px] sm:text-[9px] uppercase text-neutral-500 font-bold truncate">Team</label>
                        <select 
                          value={marketActiveTeamFilter} onChange={(e) => setMarketActiveTeamFilter(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-1.5 sm:p-2 focus:outline-none text-white font-semibold cursor-pointer text-[10px] sm:text-xs"
                        >
                          <option value="All">All Teams</option>
                          {allTeams.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      {/* Reset Filters Button */}
                      <div className="flex items-end">
                        <button 
                          onClick={() => {
                            setMarketSearchQuery('');
                            setMarketSortBy('value-desc');
                            setMarketActiveEraFilter('All');
                            setMarketActiveTeamFilter('All');
                          }}
                          className="w-full bg-neutral-900 hover:bg-neutral-800 border border-white/10 rounded-lg py-1.5 sm:py-2 font-bold text-white transition-colors text-[10px] sm:text-xs flex items-center justify-center gap-1.5"
                          title="Reset Filters"
                        >
                          <iconify-icon icon="solar:restart-bold" width="14" className="text-white"></iconify-icon>
                          <span className="hidden sm:inline">Reset Filters</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 2. Flat Search/Filter Results or Structured Catalog Sets */}
                  {(marketSearchQuery || marketActiveTeamFilter !== 'All' || marketActiveEraFilter !== 'All') ? (
                    <div>
                      <h3 className="text-xs uppercase font-extrabold text-neutral-400 mb-4 tracking-widest border-b border-white/5 pb-2 text-left">
                        Filtered Catalog Cards ({
                          sortCardsList(
                            activeCards.filter(card => {
                              const set = activeSets.find(s => s.id === card.setId);
                              const setName = set ? set.name.toLowerCase() : '';
                              if (marketSearchQuery) {
                                const query = marketSearchQuery.toLowerCase();
                                const matchesSearch = 
                                  card.player.toLowerCase().includes(query) ||
                                  card.brand.toLowerCase().includes(query) ||
                                  card.team.toLowerCase().includes(query) ||
                                  card.sport.toLowerCase().includes(query) ||
                                  setName.includes(query) ||
                                  card.setId.toLowerCase().includes(query);
                                if (!matchesSearch) return false;
                              }
                              if (activeSportFilter !== 'All' && card.sport !== activeSportFilter) return false;
                              if (marketActiveEraFilter !== 'All' && (!set || set.era !== marketActiveEraFilter)) return false;
                              if (marketActiveTeamFilter !== 'All') {
                                if (card.team !== marketActiveTeamFilter) {
                                  const cardTeams = card.team.split(' / ');
                                  const match = cardTeams.some(ct => {
                                    const cleanCt = ct.replace('L.A. ', '').replace('L.A. Lakers', 'Lakers').toLowerCase().trim();
                                    const cleanTn = marketActiveTeamFilter.replace('Los Angeles ', '').replace('L.A. ', '').toLowerCase().trim();
                                    return cleanCt === cleanTn || cleanTn.includes(cleanCt) || cleanCt.includes(cleanTn);
                                  });
                                  if (!match) return false;
                                }
                              }
                              return true;
                            }),
                            marketSortBy
                          ).length
                        })
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-6">
                        {sortCardsList(
                          activeCards.filter(card => {
                            const set = activeSets.find(s => s.id === card.setId);
                            const setName = set ? set.name.toLowerCase() : '';
                            if (marketSearchQuery) {
                              const query = marketSearchQuery.toLowerCase();
                              const matchesSearch = 
                                card.player.toLowerCase().includes(query) ||
                                card.brand.toLowerCase().includes(query) ||
                                card.team.toLowerCase().includes(query) ||
                                card.sport.toLowerCase().includes(query) ||
                                setName.includes(query) ||
                                card.setId.toLowerCase().includes(query);
                              if (!matchesSearch) return false;
                            }
                            if (activeSportFilter !== 'All' && card.sport !== activeSportFilter) return false;
                            if (marketActiveEraFilter !== 'All' && (!set || set.era !== marketActiveEraFilter)) return false;
                            if (marketActiveTeamFilter !== 'All') {
                              if (card.team !== marketActiveTeamFilter) {
                                const cardTeams = card.team.split(' / ');
                                const match = cardTeams.some(ct => {
                                  const cleanCt = ct.replace('L.A. ', '').replace('L.A. Lakers', 'Lakers').toLowerCase().trim();
                                  const cleanTn = marketActiveTeamFilter.replace('Los Angeles ', '').replace('L.A. ', '').toLowerCase().trim();
                                  return cleanCt === cleanTn || cleanTn.includes(cleanCt) || cleanCt.includes(cleanTn);
                                });
                                if (!match) return false;
                              }
                            }
                            return true;
                          }),
                          marketSortBy
                        ).map(card => (
                          <CatalogCard 
                            key={card.id} 
                            card={card}
                            isOwned={isAnyParallelOwned(userCollection, card.id)}
                            onToggle={toggleCollection}
                            hideAttributes={true}
                            showAnalyticsButton={true}
                            onOpenDetail={(id) => {
                              setSelectedCardId(id);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      {(() => {
                        const marketChronologicalSets = getChronologicalSetsWithCards(
                          marketSearchQuery, 
                          marketActiveEraFilter, 
                          marketActiveTeamFilter, 
                          activeSportFilter,
                          marketSortBy
                        );

                        if (marketChronologicalSets.length === 0) {
                          return (
                            <div className="amp-card p-12 text-center text-neutral-500 text-xs rounded-2xl border border-dashed border-white/10">
                              No sets match the active filters or suggestions.
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-6">
                            {/* Chronological Label */}
                            <h3 className="text-sm font-black uppercase tracking-widest text-white border-b border-white/10 pb-2 flex items-center justify-between">
                              <span>Market Set Index</span>
                              <span className="text-[9px] font-mono text-neutral-500 font-normal">Latest Season to Past</span>
                            </h3>

                            {/* Sets list */}
                            <div className="space-y-8">
                              {marketChronologicalSets.map(set => {
                                const ownedCount = set.cards.filter(c => isAnyParallelOwned(userCollection, c.id)).length;
                                const completionPercent = Math.round((ownedCount / set.cards.length) * 100);

                                return (
                                  <div key={set.id} className="bg-black/30 border border-white/5 rounded-3xl p-5 md:p-6 space-y-4 text-left">
                                    {/* Set Header with Progress */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                                      <div className="flex items-center gap-2">
                                        <div className="flex flex-col text-left">
                                          <h4 className="text-md font-bold text-white flex items-center gap-2 flex-wrap">
                                            {set.name}
                                          </h4>
                                          <span className="text-[10px] text-neutral-500 uppercase font-semibold">{set.sport} Set • {set.year} • {set.era}</span>
                                        </div>
                                      </div>

                                      {/* Completion Progress Bar */}
                                      <div className="flex items-center gap-3">
                                        <div className="text-right">
                                          <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono">Vault Progress</div>
                                          <div className="text-xs font-bold text-white">{ownedCount} / {set.cards.length} Scanned ({completionPercent}%)</div>
                                        </div>
                                        <div className="w-24 h-1.5 bg-neutral-900 border border-white/5 rounded-full overflow-hidden">
                                          <div className="h-full bg-white" style={{ width: `${completionPercent}%` }} />
                                        </div>
                                      </div>
                                    </div>
                                    {/* Set Cards Listing */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-6 pt-2">
                                      {set.cards.map(card => (
                                        <CatalogCard 
                                          key={card.id} 
                                          card={card}
                                          isOwned={isAnyParallelOwned(userCollection, card.id)}
                                          onToggle={toggleCollection}
                                          hideAttributes={true}
                                          showAnalyticsButton={true}
                                          onOpenDetail={(id) => {
                                            setSelectedCardId(id);
                                          }}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: TEAMS DIRECTORY & INDEX */}
              {activeTab === 'teams' && (
                <div className="space-y-8 animate-modal-entry text-left">
                  {!selectedTeam ? (
                    <div className="space-y-6">
                      {/* Teams Directory Search Header */}
                      <div className={`p-6 rounded-3xl border relative overflow-hidden transition-all duration-300 ${
                        theme === 'light'
                          ? 'bg-gradient-to-r from-neutral-100 via-neutral-50/50 to-neutral-100 border-neutral-200/80'
                          : 'bg-gradient-to-r from-neutral-900 via-white/5 to-neutral-900 border-white/5'
                      }`}>
                        <div className={`absolute top-0 left-0 w-full h-1 ${
                          theme === 'light' ? 'bg-neutral-800' : 'bg-white'
                        }`} />
                        <h3 className="text-xl font-bold text-white">Teams Directory</h3>
                        <p className="text-[10px] text-neutral-400 uppercase mt-0.5">Explore card registries, collection stats, and sets grouped by individual teams.</p>
                      </div>

                      {/* Team Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
                                {allTeams.map(teamName => {
                                  const c = TEAM_COLORS[teamName] || { primary: '#222222', secondary: '#111111', accent: '#FFFFFF', text: '#FFFFFF' };
                                  const teamCards = activeCards.filter(card => {
                                    if (card.team === teamName) return true;
                                    const cardTeams = card.team.split(' / ');
                                    return cardTeams.some(ct => {
                                      const cleanCt = ct.replace('L.A. ', '').replace('L.A. Lakers', 'Lakers').toLowerCase().trim();
                                      const cleanTn = teamName.replace('Los Angeles ', '').replace('L.A. ', '').toLowerCase().trim();
                                      return cleanCt === cleanTn || cleanTn.includes(cleanCt) || cleanCt.includes(cleanTn);
                                    });
                                  });
                                  const ownedCardsCount = teamCards.filter(card => isAnyParallelOwned(userCollection, card.id)).length;
                          const completionPercent = teamCards.length > 0 ? Math.round((ownedCardsCount / teamCards.length) * 100) : 0;
                          
                          return (
                            <button
                              key={teamName}
                              onClick={() => setSelectedTeam(teamName)}
                              className="amp-card p-3 min-[400px]:p-4 sm:p-5 flex flex-col items-center justify-between text-center group cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-300 w-full"
                            >
                              {/* Custom Colored Shield */}
                              <div className="w-16 h-16 rounded-full mb-3 flex items-center justify-center relative shadow-lg overflow-hidden border border-white/10 group-hover:scale-105 transition-transform duration-300">
                                <div 
                                  className="absolute inset-0 bg-gradient-to-br" 
                                  style={{ backgroundImage: `linear-gradient(135deg, ${c.primary} 0%, ${c.secondary} 100%)` }}
                                />
                                <div className="absolute inset-0.5 rounded-full bg-black/40 flex items-center justify-center">
                                  <iconify-icon icon="solar:shield-unique-bold" style={{ color: c.accent || '#FFF' }} width="24"></iconify-icon>
                                </div>
                              </div>

                              <div className="flex-1 flex flex-col justify-center">
                                <h4 className="text-xs font-black uppercase text-white tracking-wider group-hover:text-white transition-colors">{teamName}</h4>
                                <p className="text-[9px] text-neutral-500 font-semibold mt-1 uppercase">
                                  {teamCards.length} {teamCards.length === 1 ? 'Card' : 'Cards'} Registry
                                </p>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full mt-4 space-y-1">
                                <div className="flex justify-between text-[8px] font-mono text-neutral-500">
                                  <span>Vault Progress</span>
                                  <span>{ownedCardsCount}/{teamCards.length} ({completionPercent}%)</span>
                                </div>
                                <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                                  <div className="h-full transition-all duration-500" style={{ width: `${completionPercent}%`, backgroundColor: c.accent || '#FFF' }} />
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-modal-entry">
                      {/* Back Button */}
                      <button
                        onClick={() => setSelectedTeam(null)}
                        className="conic-btn py-2 px-4 flex items-center gap-2 group border border-white/10 rounded-full"
                      >
                        <div className="conic-spin-bg"></div>
                        <div className="conic-btn-mask"></div>
                        <span className="relative z-10 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <iconify-icon icon="solar:arrow-left-linear" width="12" className="group-hover:-translate-x-0.5 transition-transform"></iconify-icon>
                          Back to Directory
                        </span>
                      </button>

                      {/* Dynamic Team Index Header */}
                      {(() => {
                        const teamName = selectedTeam;
                        const c = TEAM_COLORS[teamName] || { primary: '#222222', secondary: '#111111', accent: '#FFFFFF', text: '#FFFFFF' };
                        const teamCards = activeCards
                          .filter(card => {
                            if (card.team === teamName) return true;
                            const cardTeams = card.team.split(' / ');
                            return cardTeams.some(ct => {
                              const cleanCt = ct.replace('L.A. ', '').replace('L.A. Lakers', 'Lakers').toLowerCase().trim();
                              const cleanTn = teamName.replace('Los Angeles ', '').replace('L.A. ', '').toLowerCase().trim();
                              return cleanCt === cleanTn || cleanTn.includes(cleanCt) || cleanCt.includes(cleanTn);
                            });
                          })
                          .sort((a, b) => {
                            const ovrA = getCardGameStats(a).ovr;
                            const ovrB = getCardGameStats(b).ovr;
                            if (ovrB !== ovrA) return ovrB - ovrA;
                            return b.value - a.value;
                          });
                        
                        // Gather cards and calculate portfolio values
                        const ownedCards = teamCards.filter(card => isAnyParallelOwned(userCollection, card.id));
                        
                        // Calculate total market value of owned parallels for this team
                        const ownedRegistryVal = userCollection.reduce((sum, item) => {
                          const card = teamCards.find(c => c.id === item);
                          if (card) {
                            return sum + card.value;
                          }
                          return sum;
                        }, 0);

                        const completionPercent = teamCards.length > 0 ? Math.round((ownedCards.length / teamCards.length) * 100) : 0;
                        const mostValuable = [...teamCards].sort((a, b) => b.value - a.value)[0];

                        return (
                          <div className="space-y-6">
                            {/* Team Banner */}
                            <div 
                              className="p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
                              style={{ 
                                background: `linear-gradient(135deg, ${c.primary} 0%, ${c.secondary} 100%)`,
                                boxShadow: `0 10px 30px -10px ${c.primary}40`
                              }}
                            >
                              {/* Background Glowing Orb */}
                              <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4)_0%,transparent_70%)]" />
                              
                              <div className="relative z-10 flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl">
                                  <iconify-icon icon="solar:shield-unique-bold" style={{ color: c.accent || '#FFF' }} width="36"></iconify-icon>
                                </div>
                                <div className="text-left">
                                  <h3 className="text-2xl md:text-3xl font-black uppercase text-white tracking-wide drop-shadow-md">{teamName}</h3>
                                  <p className="text-[10px] text-white/70 uppercase font-semibold tracking-wider">Official Card Registry & Vault Index</p>
                                </div>
                              </div>

                              {/* Registry Stats Panel */}
                              <div className="relative z-10 grid grid-cols-3 gap-4 bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl md:w-80 text-center">
                                <div>
                                  <div className="text-[8px] text-white/50 uppercase font-bold">Scanned</div>
                                  <div className="text-sm font-black text-white">{ownedCards.length} / {teamCards.length}</div>
                                </div>
                                <div>
                                  <div className="text-[8px] text-white/50 uppercase font-bold">Registry Value</div>
                                  <div className="text-sm font-black text-white">${ownedRegistryVal.toLocaleString()}</div>
                                </div>
                                <div>
                                  <div className="text-[8px] text-white/50 uppercase font-bold">Completed</div>
                                  <div className="text-sm font-black text-white">{completionPercent}%</div>
                                </div>
                              </div>
                            </div>

                            {/* Team Insights row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-neutral-900/50 border border-white/5 p-4 rounded-2xl text-left flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-neutral-400">
                                  <iconify-icon icon="solar:star-linear" width="20"></iconify-icon>
                                </div>
                                <div>
                                  <div className="text-[8px] text-neutral-500 uppercase font-bold">Registry MVP</div>
                                  <div className="text-xs font-black text-white truncate max-w-[180px]">{mostValuable ? mostValuable.player : 'N/A'}</div>
                                  <div className="text-[9px] text-neutral-400 font-mono">${mostValuable ? mostValuable.value.toLocaleString() : '0'} Base</div>
                                </div>
                              </div>

                              <div className="bg-neutral-900/50 border border-white/5 p-4 rounded-2xl text-left flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-neutral-400">
                                  <iconify-icon icon="solar:medal-linear" width="20"></iconify-icon>
                                </div>
                                <div>
                                  <div className="text-[8px] text-neutral-500 uppercase font-bold">Rookie Cards</div>
                                  <div className="text-xs font-black text-white">
                                    {teamCards.filter(card => card.type === 'Rookie Card' || card.type.includes('Rookie')).length} Available
                                  </div>
                                </div>
                              </div>

                              <div className="bg-neutral-900/50 border border-white/5 p-4 rounded-2xl text-left flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-neutral-400">
                                  <iconify-icon icon="solar:shield-check-linear" width="20"></iconify-icon>
                                </div>
                                <div>
                                  <div className="text-[8px] text-neutral-500 uppercase font-bold">Team Set Sources</div>
                                  <div className="text-xs font-black text-white">
                                    {Array.from(new Set(teamCards.map(c => c.brand))).length} Brands / Sets
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Team Card Catalog Grid */}
                            <div className="space-y-4">
                              <h4 className="text-xs uppercase font-extrabold text-neutral-400 tracking-widest border-b border-white/5 pb-2">
                                Available Team Cards
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-6">
                                {teamCards.map(card => (
                                  <div key={card.id} className="relative group">
                                    <CatalogCard 
                                      card={card}
                                      isOwned={isAnyParallelOwned(userCollection, card.id)}
                                      onToggle={toggleCollection}
                                      onOpenDetail={(id) => {
                                        setSelectedCardId(id);
                                      }}
                                    />
                                    {/* Set tag display */}
                                    <div className="mt-2 text-center">
                                      <span className="text-[8px] font-mono uppercase bg-white/5 border border-white/5 rounded px-2 py-0.5 text-neutral-500 font-semibold truncate block max-w-full text-center">
                                        Source: {card.brand} ({card.year})
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

            {/* TAB 7: SETTINGS VIEW */}
            {activeTab === 'settings' && (
              <div className="space-y-8 animate-modal-entry text-left max-w-2xl mx-auto">
                {/* Welcome & Info Card */}
                <div className={`p-6 rounded-3xl border relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 ${
                  theme === 'light'
                    ? 'bg-gradient-to-r from-neutral-100 via-neutral-50/50 to-neutral-100 border-neutral-200/80 shadow-sm'
                    : 'bg-gradient-to-r from-neutral-900 via-white/5 to-neutral-900 border-white/5 shadow-xl'
                }`}>
                  <div className="text-left space-y-1">
                    <h3 className="text-lg font-bold text-white">Welcome to HoopTactics!</h3>
                    <p className="text-[10px] text-neutral-400 uppercase font-semibold">
                      Your premium digital sports card binder & tactical arena.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsBriefingModalOpen(true)}
                    className="conic-btn primary dramatic-hover py-2.5 px-4"
                  >
                    <div className="conic-spin-bg"></div>
                    <div className="conic-btn-mask"></div>
                    <span className="relative z-10 flex items-center gap-1.5 text-[10px] font-bold uppercase text-white">
                      <iconify-icon icon="solar:info-square-linear" width="14"></iconify-icon>
                      Platform Briefing
                    </span>
                  </button>
                </div>

                <div className="bg-neutral-900/50 border border-white/5 p-6 rounded-3xl space-y-6">
                  <h3 className="text-xl font-bold text-white border-b border-white/5 pb-3">Reconfigure Profile Settings</h3>
                  
                  {/* Theme Configuration */}
                  <div className="space-y-3">
                    <label className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">Display Theme</label>
                    <p className="text-[10px] text-neutral-500 uppercase font-semibold">Select your preferred viewing theme for the vault</p>
                    <div className="grid grid-cols-2 gap-3">
                      {['dark', 'light'].map(t => {
                        const isSelected = theme === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTheme(t)}
                            className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border transition-all duration-300 ${
                              isSelected 
                                ? 'bg-white text-black border-white shadow-lg' 
                                : 'bg-neutral-950/40 border-white/5 text-neutral-400 hover:border-white/20'
                            }`}
                          >
                            <iconify-icon 
                              icon={t === 'dark' ? 'solar:moon-linear' : 'solar:sun-linear'} 
                              width="16"
                            ></iconify-icon>
                            <span className="text-[10px] font-bold uppercase">{t} Mode</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Performance vs Animation Mode Selector (Desktop Only) */}
                  <div className="hidden md:block space-y-3">
                    <label className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">Performance Priority</label>
                    <p className="text-[10px] text-neutral-500 uppercase font-semibold">Prioritize smooth rendering or rich 3D card animations (recommended for weaker laptops)</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'animations', label: 'Prioritize Animations', desc: 'Full 3D effects & reflection sweeps', icon: 'solar:magic-stick-linear' },
                        { id: 'performance', label: 'Prioritize Performance', desc: 'Static rendering (similar to mobile)', icon: 'solar:bolt-linear' }
                      ].map(mode => {
                        const isSelected = performanceMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setPerformanceMode(mode.id)}
                            className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 ${
                              isSelected 
                                ? 'bg-white text-black border-white shadow-lg' 
                                : 'bg-neutral-950/40 border-white/5 text-neutral-400 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <iconify-icon icon={mode.icon} width="16"></iconify-icon>
                              <span className="text-[10px] font-bold uppercase">{mode.label}</span>
                            </div>
                            <span className={`text-[8.5px] font-semibold leading-normal ${isSelected ? 'text-black/60' : 'text-neutral-500'}`}>{mode.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Favorite Team Selector */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">Favorite Franchise</label>
                    <p className="text-[10px] text-neutral-500 uppercase font-semibold">Prioritizes team-specific card lists and details in the index</p>
                    <select
                      value={favorites.team}
                      onChange={(e) => setFavorites({ ...favorites, team: e.target.value })}
                      className="w-full bg-neutral-950/60 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-white/30 text-white font-semibold cursor-pointer text-xs"
                    >
                      <option value="">No Favorite Team (Show All)</option>
                      {Array.from(new Set(SPORTS_CARDS.map(c => c.team))).sort().map(team => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                    </select>
                  </div>

                  {/* Collector Level / Experience Selector */}
                  <div className="space-y-3">
                    <label className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">Collector Status</label>
                    <p className="text-[10px] text-neutral-500 uppercase font-semibold">Select your card collecting experience level</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {[
                        { id: 'casual', title: 'Casual Collector', desc: 'Starting out or collecting for fun' },
                        { id: 'casual_hobbyist', title: 'Casual Hobbyist', desc: 'Starting out or collecting for fun' },
                        { id: 'hobbyist', title: 'Dedicated Hobbyist', desc: 'Familiar with sets, pricing & grading' },
                        { id: 'whale', title: 'Whale Master', desc: 'High-end investing, 1/1s & master sets' }
                      ].filter(x => x.id !== 'casual_hobbyist').map(lvl => {
                        const isSelected = favorites.level === lvl.id;
                        return (
                          <button
                            key={lvl.id}
                            type="button"
                            onClick={() => setFavorites({ ...favorites, level: lvl.id })}
                            className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 ${
                              isSelected 
                                ? 'bg-white text-black border-white shadow-lg' 
                                : 'bg-neutral-950/40 border-white/5 text-neutral-400 hover:border-white/20'
                            }`}
                          >
                            <div>
                              <div className="font-extrabold uppercase text-[10px]">{lvl.title}</div>
                              <div className={`text-[9px] mt-1 ${isSelected ? 'text-black/60' : 'text-neutral-500'}`}>{lvl.desc}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => {
                        const sports = favorites?.sports || ['Basketball'];
                        if (sports.length === 0) {
                          triggerToast("Please select at least one sport to save!");
                          return;
                        }
                        const updatedFavorites = { ...favorites, sports };
                        setFavorites(updatedFavorites);
                        localStorage.setItem('ht_favorites', JSON.stringify(updatedFavorites));
                        // Sync activeSportFilter
                        if (activeSportFilter !== 'All' && !sports.includes(activeSportFilter)) {
                          setActiveSportFilter(sports[0] || 'All');
                        }
                        triggerToast("Settings saved successfully!");
                        setActiveTab('home');
                      }}
                      className="conic-btn primary dramatic-hover w-full sm:w-48 sm:flex-initial py-3.5 text-xs font-bold uppercase text-white"
                    >
                      <div className="conic-spin-bg"></div>
                      <div className="conic-btn-mask"></div>
                      <span className="relative z-10 flex items-center justify-center gap-1.5 font-bold uppercase text-white">
                        <iconify-icon icon="solar:diskette-bold" width="14"></iconify-icon>
                        Save Settings
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to log out of HoopTactics? Your collection and settings will be saved on this device.")) {
                          setScreen('onboarding');
                          setActiveTab('home');
                          triggerToast("Logged out successfully.");
                        }
                      }}
                      className="conic-btn primary dramatic-hover w-full sm:w-48 sm:flex-initial py-3.5"
                    >
                      <div className="conic-spin-bg"></div>
                      <div className="conic-btn-mask bg-neutral-900"></div>
                      <span className="relative z-10 flex items-center justify-center gap-1.5 text-xs font-bold uppercase text-amber-500 hover:text-amber-400">
                        <iconify-icon icon="solar:logout-bold" width="14"></iconify-icon>
                        Log Out
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to reset HoopTactics? This will delete all scanned cards, favorites, and progress!")) {
                          localStorage.clear();
                          setScreen('onboarding');
                          setActiveTab('home');
                          setFavorites({ sports: [], team: '', level: '' });
                          setUserCollection([]);
                          setActiveSportFilter('All');
                          setLevel(1);
                          setXp(0);
                          setPrestige(0);
                          setAvatarIcon('letter');
                          setAvatarGradient('from-orange-500 to-yellow-500');
                          setMatchStats({ cpuWins: 0, cpuLosses: 0, onlineWins: 0, onlineLosses: 0, totalXpEarned: 0 });
                          setUnlockedAchievements([]);
                          setSelectedCardId(null);
                          setSelectedParallel('Base');
                          setSelectedTeam(null);
                          triggerToast("App successfully reset to default.");
                        }
                      }}
                      className="conic-btn orange dramatic-hover w-full sm:w-48 sm:flex-initial py-3.5"
                    >
                      <div className="conic-spin-bg"></div>
                      <div className="conic-btn-mask bg-red-950/10 dark:bg-red-950/20"></div>
                      <span className="relative z-10 flex items-center justify-center gap-1.5 text-xs font-bold uppercase text-red-500 hover:text-red-400">
                        <iconify-icon icon="solar:trash-bin-trash-bold" width="14"></iconify-icon>
                        Reset Application
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            </div>

            {/* TIMEOUT FULL-SCREEN OVERLAY SEQUENCE */}
            {timeoutActive && (
              <div className="absolute inset-0 border-4 sm:border-[12px] md:border-[16px] border-amber-950 rounded-3xl bg-[#0d241c] z-50 flex flex-col items-center justify-center p-3 sm:p-6 animate-timeout-bg animate-fade-in backdrop-blur-md overflow-hidden shadow-[0_25px_50px_rgba(0,0,0,0.85)]">
                {/* Chalk drawings on the background board */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 z-0" viewBox="0 0 500 500" preserveAspectRatio="none">
                  {/* Court lines */}
                  <rect x="15" y="15" width="470" height="470" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" strokeDasharray="6,6" />
                  <circle cx="250" cy="250" r="50" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
                  <line x1="15" y1="250" x2="485" y2="250" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
                  
                  {/* Tactical drawings */}
                  <path className="animate-chalk-line" d="M 250 350 Q 210 270 240 210" fill="none" stroke="rgba(234,179,8,0.18)" strokeWidth="3" strokeLinecap="round" markerEnd="url(#arrow)" />
                  <circle cx="250" cy="350" r="6" fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.3)" strokeWidth="1.5" />
                  <text x="246" y="352" fill="rgba(239,68,68,0.4)" fontSize="7" fontWeight="bold" fontFamily="monospace">O</text>
                  
                  <circle cx="210" cy="265" r="6" fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5" />
                  <text x="206" y="267" fill="rgba(59,130,246,0.4)" fontSize="7" fontWeight="bold" fontFamily="monospace">X</text>
                  
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(234,179,8,0.3)" />
                    </marker>
                  </defs>
                </svg>

                {/* Stamina Bubble Emitters */}
                <div className="absolute inset-0 pointer-events-none z-0">
                  <div className="absolute bottom-8 left-[25%] w-2.5 h-2.5 rounded-full bg-emerald-500/20 animate-bubble-1" />
                  <div className="absolute bottom-12 left-[50%] w-2 h-2 rounded-full bg-emerald-500/20 animate-bubble-2" />
                  <div className="absolute bottom-6 left-[75%] w-3 h-3 rounded-full bg-emerald-500/20 animate-bubble-3" />
                </div>

                <div className="absolute top-4 right-4 text-[7px] font-mono text-neutral-500 tracking-wider z-10">
                  HOOPTACTICS ARENA TIMEOUT INTERMISSION
                </div>

                <div className="w-full h-full relative z-10 flex flex-col items-center justify-between p-2 sm:p-4 max-w-4xl text-center">
                  
                  {/* Header Section: compact and fixed */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2 mt-1 sm:mt-2">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-pulse">
                        <iconify-icon icon="solar:stopwatch-bold" width="18" className="text-white"></iconify-icon>
                      </div>
                      <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                        TIMEOUT ACTIVATED
                      </h2>
                    </div>
                    
                    <p className="text-[8.5px] sm:text-[9.5px] font-mono font-bold uppercase tracking-wider" style={{ color: timeoutCaller === 'player' ? '#F97316' : '#3B82F6' }}>
                      {timeoutCaller === 'player' 
                        ? `Coach ${favorites?.username || 'Player'} calls for tactical realignment!` 
                        : `Coach ${opponentName} initiates a strategic timeout!`}
                    </p>
                  </div>
                  
                  {/* Middle Section: Chalkboard Strategy Card (scrolls internally if height is extremely constrained) */}
                  <div className="flex-1 w-full min-h-0 overflow-y-auto my-2 pr-1 hide-scrollbar flex flex-col items-center">
                    <div className="border border-white/5 bg-[#0a1a14]/90 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl relative overflow-hidden w-full flex flex-col gap-2.5 sm:gap-3 my-auto">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.01] to-transparent pointer-events-none" />
                      
                      <div className="text-[8px] uppercase tracking-widest text-emerald-400 font-bold border-b border-white/10 pb-1 flex justify-between items-center text-left">
                        <span>📋 Chalkboard Strategy & Bench Realignment</span>
                        {timeoutCaller === 'player' && (
                          <span className="text-[7px] text-neutral-400 font-mono font-normal">
                            💡 Drag & drop or tap a starter + reserve to swap!
                          </span>
                        )}
                      </div>
                      
                      {timeoutCaller === 'player' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 w-full">
                          {/* STARTERS ON COURT */}
                          <div className="border border-white/5 bg-black/40 p-2 sm:p-2.5 rounded-xl flex flex-col gap-1.5">
                            <div className="text-[8.5px] uppercase tracking-wider text-orange-400 font-bold border-b border-white/5 pb-0.5 text-left">
                              🏀 Active On-Court Lineup (Starters)
                            </div>
                            <div className="flex gap-2 safe-scroll-center py-0.5 overflow-x-auto no-scrollbar justify-start lg:justify-center">
                              {starters.map((id, sIdx) => {
                                const c = playerCards.find(x => x.id === id);
                                if (!c) return null;
                                const stats = getCardGameStats(c);
                                const isSelected = selectedSubId === c.id;
                                const isDragOver = dragOverCardId === c.id;
                                const isDragging = draggedCardId === c.id;
                                const nameLabel = c.player.split('(')[0].trim().split(' ').pop();
                                
                                return (
                                  <div
                                    key={c.id + '_timeout_starter'}
                                    draggable="true"
                                    onDragStart={(e) => {
                                      e.dataTransfer.effectAllowed = "move";
                                      e.dataTransfer.setData("text/plain", c.id);
                                      const cid = c.id;
                                      setTimeout(() => {
                                        setDraggedCardId(cid);
                                      }, 0);
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      if (draggedCardId && draggedCardId !== c.id) {
                                        setDragOverCardId(c.id);
                                      }
                                    }}
                                    onDragLeave={() => setDragOverCardId(null)}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      const sourceId = draggedCardId || e.dataTransfer.getData("text/plain");
                                      if (sourceId && sourceId !== c.id) {
                                        handleDragDropSwap(sourceId, c.id);
                                      }
                                      setDraggedCardId(null);
                                      setDragOverCardId(null);
                                    }}
                                    onDragEnd={() => {
                                      setDraggedCardId(null);
                                      setDragOverCardId(null);
                                    }}
                                    onClick={() => {
                                      if (selectedSubId === c.id) {
                                        setSelectedSubId(null);
                                      } else if (selectedSubId) {
                                        handleDragDropSwap(selectedSubId, c.id);
                                        setSelectedSubId(null);
                                      } else {
                                        setSelectedSubId(c.id);
                                      }
                                    }}
                                    className={`w-[17%] min-w-[58px] sm:min-w-[68px] md:w-[76px] lg:w-[84px] xl:w-[90px] flex flex-col items-center gap-0.5 cursor-grab active:cursor-grabbing transition-all duration-300 ease-out flex-shrink-0 ${
                                      isSelected 
                                        ? 'ring-2 ring-amber-400 scale-105 z-20 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                                        : isDragOver 
                                          ? 'ring-2 ring-emerald-400 scale-[1.06] z-20 shadow-[0_0_15px_rgba(16,185,129,0.6)] -rotate-1' 
                                          : 'hover:scale-[1.03]'
                                    }`}
                                  >
                                    {isDragging ? (
                                      <div className="relative w-full aspect-[3/4] rounded-lg border border-dashed border-orange-500/40 bg-orange-950/20 flex flex-col items-center justify-center gap-0.5 shadow-[inset_0_0_10px_rgba(245,158,11,0.15)] animate-pulse">
                                        <iconify-icon icon="solar:transfer-vertical-bold-duotone" width="14" className="text-orange-400/70 animate-bounce"></iconify-icon>
                                        <span className="text-[4.5px] font-mono font-black text-orange-400/60 uppercase tracking-widest text-center px-0.5 leading-none">SWAP</span>
                                      </div>
                                    ) : (
                                      <React.Fragment>
                                        <div className="relative w-full rounded-lg overflow-hidden shadow-md border border-white/5">
                                          <HoloCard card={c} size="game" interactive={false} hideAttributes={false} />
                                          {c.currentSta <= 20 && (
                                            <div className="absolute inset-0 bg-red-950/70 flex items-center justify-center pointer-events-none">
                                              <span className="text-[4.5px] font-black text-red-500 font-mono tracking-tighter">GASSED</span>
                                            </div>
                                          )}
                                          {isDragOver && (
                                            <div className="absolute inset-0 bg-emerald-950/75 backdrop-blur-[1px] flex flex-col items-center justify-center gap-0.5 z-30 animate-fade-in">
                                              <iconify-icon icon="solar:round-transfer-horizontal-bold-duotone" width="14" className="text-emerald-400 animate-spin-slow"></iconify-icon>
                                              <span className="text-[4.5px] font-mono font-black text-emerald-400 uppercase tracking-wider text-center px-0.5 leading-none">SWAP</span>
                                            </div>
                                          )}
                                        </div>
                                        <span className="text-[6.5px] font-bold text-neutral-300 truncate w-full text-center leading-none mt-0.5">
                                          <span className="text-amber-400 font-extrabold mr-0.5">{stats.pos}</span> {nameLabel}
                                        </span>
                                        <div className="h-0.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-white/5 relative mt-0.5">
                                          <div 
                                            className={`h-full ${c.currentSta <= 20 ? 'bg-red-500' : c.currentSta <= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                            style={{ width: `${(c.currentSta/stats.sta)*100}%` }}
                                          />
                                        </div>
                                        <span className="text-[5px] font-mono text-neutral-400 leading-none mt-0.5">STA: {c.currentSta}/{stats.sta}</span>
                                      </React.Fragment>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* BENCH RESERVES */}
                          <div className="border border-white/5 bg-black/40 p-2 sm:p-2.5 rounded-xl flex flex-col gap-1.5">
                            <div className="text-[8.5px] uppercase tracking-wider text-emerald-400 font-bold border-b border-white/5 pb-0.5 text-left flex justify-between">
                              <span>📋 Bench Reserves (Resting)</span>
                              <span className="text-[6px] text-emerald-400 font-normal">▲ +20 STA!</span>
                            </div>
                            <div className="flex gap-2 safe-scroll-center py-0.5 overflow-x-auto no-scrollbar justify-start lg:justify-center">
                              {bench.map((id, bIdx) => {
                                const c = playerCards.find(x => x.id === id);
                                if (!c) return null;
                                const stats = getCardGameStats(c);
                                const isSelected = selectedSubId === c.id;
                                const isDragOver = dragOverCardId === c.id;
                                const isDragging = draggedCardId === c.id;
                                const nameLabel = c.player.split('(')[0].trim().split(' ').pop();
                                
                                return (
                                  <div
                                    key={c.id + '_timeout_bench'}
                                    draggable="true"
                                    onDragStart={(e) => {
                                      e.dataTransfer.effectAllowed = "move";
                                      e.dataTransfer.setData("text/plain", c.id);
                                      const cid = c.id;
                                      setTimeout(() => {
                                        setDraggedCardId(cid);
                                      }, 0);
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      if (draggedCardId && draggedCardId !== c.id) {
                                        setDragOverCardId(c.id);
                                      }
                                    }}
                                    onDragLeave={() => setDragOverCardId(null)}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      const sourceId = draggedCardId || e.dataTransfer.getData("text/plain");
                                      if (sourceId && sourceId !== c.id) {
                                        handleDragDropSwap(sourceId, c.id);
                                      }
                                      setDraggedCardId(null);
                                      setDragOverCardId(null);
                                    }}
                                    onDragEnd={() => {
                                      setDraggedCardId(null);
                                      setDragOverCardId(null);
                                    }}
                                    onClick={() => {
                                      if (selectedSubId === c.id) {
                                        setSelectedSubId(null);
                                      } else if (selectedSubId) {
                                        handleDragDropSwap(selectedSubId, c.id);
                                        setSelectedSubId(null);
                                      } else {
                                        setSelectedSubId(c.id);
                                      }
                                    }}
                                    className={`w-[17%] min-w-[58px] sm:min-w-[68px] md:w-[76px] lg:w-[84px] xl:w-[90px] flex flex-col items-center gap-0.5 cursor-grab active:cursor-grabbing transition-all duration-300 ease-out flex-shrink-0 ${
                                      isSelected 
                                        ? 'ring-2 ring-amber-400 scale-105 z-20 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                                        : isDragOver 
                                          ? 'ring-2 ring-emerald-400 scale-[1.06] z-20 shadow-[0_0_15px_rgba(16,185,129,0.6)] -rotate-1' 
                                          : 'hover:scale-[1.03]'
                                    }`}
                                  >
                                    {isDragging ? (
                                      <div className="relative w-full aspect-[3/4] rounded-lg border border-dashed border-emerald-500/40 bg-emerald-950/20 flex flex-col items-center justify-center gap-0.5 shadow-[inset_0_0_10px_rgba(16,185,129,0.15)] animate-pulse">
                                        <iconify-icon icon="solar:transfer-vertical-bold-duotone" width="14" className="text-emerald-400/70 animate-bounce"></iconify-icon>
                                        <span className="text-[4.5px] font-mono font-black text-emerald-400/60 uppercase tracking-widest text-center px-0.5 leading-none">SWAP</span>
                                      </div>
                                    ) : (
                                      <React.Fragment>
                                        <div className="relative w-full rounded-lg overflow-hidden shadow-md border border-white/5">
                                          <HoloCard card={c} size="game" interactive={false} hideAttributes={false} />
                                          {/* Stamina recovered badge */}
                                          <span className="absolute top-0.5 right-0.5 text-[4.5px] font-extrabold text-emerald-400 bg-black/85 px-0.5 py-0.2 rounded border border-emerald-500/30 flex items-center gap-0.5 leading-none z-10">
                                            ▲+20
                                          </span>
                                          {c.currentSta <= 20 && (
                                            <div className="absolute inset-0 bg-red-950/70 flex items-center justify-center pointer-events-none">
                                              <span className="text-[4.5px] font-black text-red-500 font-mono tracking-tighter">GASSED</span>
                                            </div>
                                          )}
                                          {isDragOver && (
                                            <div className="absolute inset-0 bg-amber-950/75 backdrop-blur-[1px] flex flex-col items-center justify-center gap-0.5 z-30 animate-fade-in">
                                              <iconify-icon icon="solar:round-transfer-horizontal-bold-duotone" width="14" className="text-amber-400 animate-spin-slow"></iconify-icon>
                                              <span className="text-[4.5px] font-mono font-black text-amber-400 uppercase tracking-wider text-center px-0.5 leading-none">SWAP</span>
                                            </div>
                                          )}
                                        </div>
                                        <span className="text-[6.5px] font-bold text-neutral-300 truncate w-full text-center leading-none mt-0.5">
                                          <span className="text-amber-400 font-extrabold mr-0.5">{stats.pos}</span> {nameLabel}
                                        </span>
                                        <div className="h-0.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-white/5 relative mt-0.5">
                                          <div 
                                            className="h-full bg-emerald-500 animate-fill-stamina" 
                                            style={{ width: `${(c.currentSta/stats.sta)*100}%` }}
                                          />
                                        </div>
                                        <span className="text-[5px] font-mono text-neutral-400 leading-none mt-0.5">STA: {c.currentSta}/{stats.sta}</span>
                                      </React.Fragment>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border border-white/5 bg-[#0a1a14]/90 p-2.5 rounded-xl space-y-2 shadow-2xl relative overflow-hidden w-full">
                          <div className="text-[8px] uppercase tracking-widest text-emerald-400 font-bold border-b border-white/10 pb-1">
                            📋 Opponent Bench & Recovery Status
                          </div>
                          
                          <div className="flex gap-2 safe-scroll-center overflow-x-auto no-scrollbar w-full pb-0.5 relative justify-start lg:justify-center">
                            {opponentCards.slice(5, 10).map((c, sIdx) => {
                              const stats = getCardGameStats(c);
                              return (
                                <div key={c.id + '_timeout_opp_' + sIdx} className="w-[14%] min-w-[48px] flex flex-col items-center gap-0.5 animate-scale-up flex-shrink-0" style={{ animationDelay: `${sIdx * 0.1}s` }}>
                                  <div className="relative w-8 h-10 rounded-lg overflow-hidden border border-white/10 bg-neutral-900 shadow-lg flex items-center justify-center">
                                    <img src={c.frontImg} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-emerald-950/20" />
                                  </div>
                                  
                                  <span className="text-[6px] font-mono text-neutral-300 truncate w-full">{c.player.split(' ').pop()}</span>
                                  
                                  <span className="text-[5px] font-extrabold text-emerald-400 bg-emerald-500/10 px-0.5 py-0.2 rounded border border-emerald-500/15 flex items-center gap-0.2 leading-none">
                                    ▲+20
                                  </span>

                                  <div className="h-0.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-white/5 relative">
                                    <div 
                                      className="h-full bg-emerald-500 animate-fill-stamina" 
                                      style={{ width: `${(c.currentSta/stats.sta)*100}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Simplified Stamina Guide Bar */}
                      <div className="bg-emerald-950/30 border border-emerald-500/10 p-2 rounded-xl text-left flex items-center gap-2 text-[8px] font-mono text-emerald-300">
                        <iconify-icon icon="solar:info-circle-bold-duotone" className="text-emerald-400 text-xs flex-shrink-0"></iconify-icon>
                        <span className="leading-tight"><strong>Stamina Quick Rules:</strong> Possession drains <span className="text-white">-10 STA</span>. Gassed penalty is <span className="text-red-400">-15 ratings at ≤20 STA</span>. Timeouts restore <span className="text-white">+20 STA</span> to bench.</span>
                      </div>
                      
                      {/* Coaching Chalkboard Tips */}
                      <div className="text-[8px] sm:text-[8.5px] text-yellow-300 font-mono font-bold leading-snug bg-black/40 border border-yellow-500/10 p-2 rounded-xl uppercase w-full text-center">
                        {(() => {
                          const lowSPlayer = timeoutCaller === 'player'
                            ? bench.map(id => playerCards.find(x => x.id === id)).filter(Boolean).find(c => c.currentSta <= 40)
                            : null;
                          const highestOffPlayer = timeoutCaller === 'player'
                            ? starters.map(id => playerCards.find(x => x.id === id)).filter(Boolean).sort((a,b) => getCardGameStats(b).off - getCardGameStats(a).off)[0]
                            : null;

                          return timeoutCaller === 'player'
                            ? (lowSPlayer 
                              ? `🚨 COACH STRATEGY: Roster warning! ${lowSPlayer.player} is low on stamina (${lowSPlayer.currentSta}). Swap them out on the court to avoid penalty.`
                              : highestOffPlayer 
                                ? `💡 COACH STRATEGY: Matchup focus! Run offense through ${highestOffPlayer.player.split(' ').pop()} (OFF: ${getCardGameStats(highestOffPlayer).off}) to exploit weaknesses.`
                                : "💡 COACH STRATEGY: Maintain high-energy defense and look for open 3-point shooters."
                              )
                            : `Opponent Coach ${opponentName} is realigning their defense. Keep your defenses high!`;
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Resume Match Button: Pinned to the bottom of the viewport */}
                  <div className="flex-shrink-0 w-full flex justify-center pt-2">
                    <button 
                      onClick={() => {
                        setTimeoutActive(false);
                        setTimeoutCaller(null);
                        setSelectedSubId(null);
                      }}
                      className="conic-btn px-6 py-2.5 transition-all shadow-[0_0_15px_rgba(70,212,198,0.25)] scale-100 hover:scale-[1.05] active:scale-95"
                    >
                      <div className="conic-spin-bg opacity-100 animate-[spin_3s_linear_infinite]"></div>
                      <div className="conic-btn-mask"></div>
                      <span className="relative z-10 text-[9px] font-black text-white uppercase flex items-center justify-center gap-1.5">
                        💡 Close Chalkboard & Resume
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </main>

          {/* PLAYER PROFILE OVERLAY MODAL */}
          {isProfileModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-black/85 transition-opacity duration-300">
              <div 
                className="glass-panel w-full max-w-2xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border border-white/10 rounded-3xl p-5 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto hide-scrollbar shadow-2xl relative animate-modal-entry text-left"
              >
                {/* Close Button */}
                <button 
                  onClick={() => setIsProfileModalOpen(false)}
                  className="absolute top-5 right-5 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                >
                  <iconify-icon icon="solar:close-circle-bold" width="24"></iconify-icon>
                </button>

                {/* Modal Title */}
                <div>
                  <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <iconify-icon icon="solar:user-bold" className="text-orange-500"></iconify-icon>
                    Player Profile Registry
                  </h3>
                  <p className="text-[9px] md:text-[10px] text-neutral-500 uppercase mt-0.5">Customize your curator persona and view Arena stats</p>
                </div>

                {/* Profile Card Summary Row */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-6">
                  {/* Left: Avatar Icon */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-tr ${avatarGradient} ${avatarGradient === 'from-neutral-800 to-neutral-950' ? 'avatar-obsidian' : ''} flex items-center justify-center font-black text-white text-3xl select-none shadow-lg border-2 border-white/10`}>
                      {avatarIcon === 'letter' ? (
                        tempUsername?.charAt(0).toUpperCase() || 'P'
                      ) : (
                        <iconify-icon icon={avatarIcon} width="40"></iconify-icon>
                      )}
                    </div>
                    {prestige > 0 && (
                      <div className="absolute -bottom-1.5 -right-1.5 bg-amber-500 text-black border border-black font-mono font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase shadow">
                        P.{getPrestigeRoman(prestige)}
                      </div>
                    )}
                  </div>

                  {/* Right: Username & Level Progress */}
                  <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 justify-center sm:justify-start">
                      <span className="text-lg md:text-xl font-bold text-white truncate max-w-[200px] inline-block">{tempUsername || 'Curator'}</span>
                      <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded w-fit mx-auto sm:mx-0">
                        Lvl {level} — {getCoachTitle(level, prestige)}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Favorite Franchise: <span className="text-white font-bold">{tempTeam || 'None Set'}</span>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[9px] text-neutral-500 font-semibold uppercase">
                        <span>XP Progress</span>
                        <span>{level >= 20 ? 'Max Level' : `${xp} / 500 XP`}</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-white transition-all duration-500" style={{ width: `${(xp / 500) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prestige Reset Panel */}
                {level >= 20 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 animate-pulse">
                    <div className="text-left">
                      <div className="text-xs font-black text-amber-400 uppercase flex items-center gap-1.5">
                        <iconify-icon icon="solar:star-bold" className="animate-spin-slow"></iconify-icon>
                        Prestige Promotion Ready!
                      </div>
                      <p className="text-[9.5px] text-neutral-400 mt-1 leading-normal max-w-md">
                        You have reached the maximum level of 20! You can now Prestige. This resets your level back to 1 and XP to 0, but increments your Prestige rank. You'll unlock a higher coach title prefix, a custom prestige Roman numeral badge, and work towards prestige achievements!
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        if (confirm(`Are you ready to Prestige to Rank ${prestige + 1}? Your level will reset to 1, but your stats and binder will remain!`)) {
                          const nextPrestige = prestige + 1;
                          setPrestige(nextPrestige);
                          setLevel(1);
                          setXp(0);
                          triggerToast(`🎉 Congratulations! Promoted to Prestige Rank ${getPrestigeRoman(nextPrestige)}!`);
                          
                          // Run achievement checks with updated prestige
                          setTimeout(() => {
                            checkAndAwardAchievements(matchStats, userCollection, 1, nextPrestige);
                          }, 100);
                        }
                      }}
                      className="conic-btn flex-shrink-0"
                    >
                      <div className="conic-spin-bg"></div>
                      <div className="conic-btn-mask bg-black"></div>
                      <span className="relative z-10 text-[10px] font-black text-white px-4 py-2 uppercase cursor-pointer">Prestige Now</span>
                    </button>
                  </div>
                )}

                {/* Tabs */}
                <div className="flex border-b border-white/5 text-xs font-bold uppercase tracking-wider gap-4">
                  {['edit', 'stats', 'achievements'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setProfileTab(tab)}
                      className={`pb-2 transition-all border-b-2 cursor-pointer ${profileTab === tab ? 'border-white text-white' : 'border-transparent text-neutral-500 hover:text-white'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab 1: Edit Profile */}
                {profileTab === 'edit' && (
                  <div className="space-y-4">
                    {/* Basic details inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">Username / Name</label>
                        <input 
                          type="text" 
                          value={tempUsername} 
                          onChange={(e) => setTempUsername(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-white transition-all font-semibold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">Favorite Team</label>
                        <select 
                          value={tempTeam} 
                          onChange={(e) => setTempTeam(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-white transition-all font-semibold focus:outline-none cursor-pointer"
                        >
                          <option value="">None</option>
                          {Array.from(new Set(SPORTS_CARDS.map(c => c.team))).sort().map(team => (
                            <option key={team} value={team}>{team}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Avatar Icon Selector */}
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase font-bold text-neutral-400 block">Select Avatar Icon</label>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {AVATAR_ICONS.map(item => (
                          <button
                            key={item.id}
                            onClick={() => setAvatarIcon(item.id)}
                            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                              avatarIcon === item.id 
                                ? 'border-white bg-white/5 text-white shadow' 
                                : 'border-white/5 bg-black/40 text-neutral-400 hover:border-white/20 hover:text-white'
                            }`}
                          >
                            {item.id === 'letter' ? (
                              <span className="font-bold text-xs leading-none uppercase">{tempUsername?.charAt(0) || 'P'}</span>
                            ) : (
                              <iconify-icon icon={item.icon} width="16"></iconify-icon>
                            )}
                            <span className="text-[7.5px] uppercase font-bold truncate max-w-full leading-none">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Avatar Gradient Selector */}
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase font-bold text-neutral-400 block">Select Background Gradient</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {AVATAR_GRADIENTS.map(item => (
                          <button
                            key={item.id}
                            onClick={() => setAvatarGradient(item.id)}
                            className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                              avatarGradient === item.id 
                                ? 'border-white bg-white/5 text-white shadow' 
                                : 'border-white/5 bg-black/40 text-neutral-400 hover:border-white/20 hover:text-white'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${item.id} border border-white/10 flex-shrink-0`}></div>
                            <span className="text-[8px] uppercase font-bold tracking-wider">{item.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          if (!tempUsername.trim()) {
                            triggerToast("Username cannot be empty!");
                            return;
                          }
                          const updatedFavorites = { ...favorites, username: tempUsername, team: tempTeam };
                          setFavorites(updatedFavorites);
                          localStorage.setItem('ht_favorites', JSON.stringify(updatedFavorites));
                          triggerToast("Profile configuration saved!");
                          setIsProfileModalOpen(false);
                        }}
                        className="w-full conic-btn py-3"
                      >
                        <div className="conic-spin-bg"></div>
                        <div className="conic-btn-mask bg-black"></div>
                        <span className="relative z-10 flex items-center justify-center gap-1.5 text-[10px] font-bold text-white uppercase cursor-pointer">
                          <iconify-icon icon="solar:diskette-bold" width="14"></iconify-icon>
                          Save Profile Settings
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 2: Statistics */}
                {profileTab === 'stats' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* CPU Stats Card */}
                      <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center gap-2 text-cyan-400">
                          <iconify-icon icon="solar:cpu-bold" width="16"></iconify-icon>
                          <span className="text-[10px] uppercase font-extrabold tracking-wider">VS Computer AI</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-left font-mono">
                          <div>
                            <span className="text-[8px] text-neutral-500 uppercase font-bold block">Matches</span>
                            <span className="text-base font-bold text-white">{matchStats.cpuMatches || 0}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-neutral-500 uppercase font-bold block">Wins</span>
                            <span className="text-base font-bold text-white">{matchStats.cpuWins || 0}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-neutral-500 uppercase font-bold block">Losses</span>
                            <span className="text-base font-bold text-white">{matchStats.cpuLosses || 0}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-neutral-500 uppercase font-bold block">Win Rate</span>
                            <span className="text-base font-bold text-white">
                              {matchStats.cpuMatches ? Math.round(((matchStats.cpuWins || 0) / matchStats.cpuMatches) * 100) : 0}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Online Stats Card */}
                      <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center gap-2 text-indigo-400">
                          <iconify-icon icon="solar:dialog-bold" width="16"></iconify-icon>
                          <span className="text-[10px] uppercase font-extrabold tracking-wider">Online Matchmaking</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-left font-mono">
                          <div>
                            <span className="text-[8px] text-neutral-500 uppercase font-bold block">Matches</span>
                            <span className="text-base font-bold text-white">{matchStats.onlineMatches || 0}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-neutral-500 uppercase font-bold block">Wins</span>
                            <span className="text-base font-bold text-white">{matchStats.onlineWins || 0}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-neutral-500 uppercase font-bold block">Losses</span>
                            <span className="text-base font-bold text-white">{matchStats.onlineLosses || 0}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-neutral-500 uppercase font-bold block">Win Rate</span>
                            <span className="text-base font-bold text-white">
                              {matchStats.onlineMatches ? Math.round(((matchStats.onlineWins || 0) / matchStats.onlineMatches) * 100) : 0}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Summary Card */}
                      <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center gap-2 text-amber-500">
                          <iconify-icon icon="solar:cup-first-bold" width="16"></iconify-icon>
                          <span className="text-[10px] uppercase font-extrabold tracking-wider">Overall Summary</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-left font-mono">
                          <div>
                            <span className="text-[8px] text-neutral-500 uppercase font-bold block">Total XP</span>
                            <span className="text-base font-bold text-white">{(matchStats.totalXpEarned || 0).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-neutral-500 uppercase font-bold block">Binder Slabs</span>
                            <span className="text-base font-bold text-white">{userCollection.length}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-neutral-500 uppercase font-bold block">Achievements</span>
                            <span className="text-base font-bold text-white">{unlockedAchievements.length} / {ACHIEVEMENTS.length}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-neutral-500 uppercase font-bold block">Prestige Rank</span>
                            <span className="text-base font-bold text-white">{getPrestigeRoman(prestige) || 'None'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Achievements */}
                {profileTab === 'achievements' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-2 no-scrollbar">
                      {ACHIEVEMENTS.map(ach => {
                        const isUnlocked = unlockedAchievements.includes(ach.id);
                        return (
                          <div 
                            key={ach.id} 
                            className={`p-4 border rounded-2xl flex items-center gap-3.5 transition-all text-left ${
                              isUnlocked 
                                ? `${ach.color} shadow-lg shadow-white/[0.01]` 
                                : 'border-white/5 bg-neutral-950/20 text-neutral-500'
                            }`}
                          >
                            <div className={`p-2 rounded-xl border flex items-center justify-center ${isUnlocked ? 'border-white/10 bg-white/5 text-white' : 'border-white/5 bg-transparent text-neutral-700'}`}>
                              <iconify-icon icon={isUnlocked ? ach.icon : 'solar:lock-keyhole-minimalistic-bold'} width="18"></iconify-icon>
                            </div>
                            <div className="flex-1 space-y-0.5 leading-tight">
                              <h4 className={`text-xs font-black uppercase tracking-wider ${isUnlocked ? 'text-white' : 'text-neutral-500'}`}>{ach.title}</h4>
                              <p className="text-[9.5px] text-neutral-400 font-semibold">{ach.desc}</p>
                            </div>
                            {isUnlocked && (
                              <iconify-icon icon="solar:check-circle-bold" className="text-green-500 flex-shrink-0" width="16"></iconify-icon>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PLATFORM BRIEFING MODAL */}
          {isBriefingModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-black/85 transition-opacity duration-300">
              <div 
                className="glass-panel w-full max-w-2xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border border-white/10 rounded-3xl p-5 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto hide-scrollbar shadow-2xl relative animate-modal-entry text-left"
              >
                {/* Close Button */}
                <button 
                  onClick={() => setIsBriefingModalOpen(false)}
                  className="absolute top-5 right-5 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                >
                  <iconify-icon icon="solar:close-circle-bold" width="24"></iconify-icon>
                </button>

                {/* Modal Title */}
                <div className="border-b border-white/5 pb-3">
                  <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <iconify-icon icon="solar:info-square-bold" className="text-orange-500"></iconify-icon>
                    Hoop Tactics Platform Briefing
                  </h3>
                  <p className="text-[9px] md:text-[10px] text-neutral-500 uppercase mt-0.5">Learn how collecting meets strategic basketball card gameplay</p>
                </div>

                {/* Purpose and Gamification */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">🎯 Gamified Card Collecting</h4>
                  <p className="text-[11px] leading-relaxed text-neutral-300">
                    <strong>Hoop Tactics</strong> is a digital sports card binder that gamifies your collection. Instead of just admiring your cards, you can field them in high-stakes tactical matchups! 
                  </p>
                  <p className="text-[11px] leading-relaxed text-neutral-300">
                    By expanding your vault, scanning new physical or digital slabs, and securing rare parallel finishes, you earn experience points (XP) that boost your overall <strong>Curator Level</strong>. Maximize your status, earn prestige achievements, and show off your legendary basketball binder.
                  </p>
                </div>

                {/* The Game Section */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">🏀 The Matchup Arena</h4>
                  <p className="text-[11px] leading-relaxed text-neutral-300">
                    Each card features physical specs, team registries, and custom game attributes: <strong>Offense (OFF)</strong>, <strong>Perimeter Defense (PRD)</strong>, <strong>Rim Protection (RMP)</strong>, and <strong>Stamina (STA)</strong>. 
                  </p>
                  <p className="text-[11px] leading-relaxed text-neutral-300">
                    In the <strong>Play Now (Arena)</strong>, you select a 5-card deck to match up against opposing players. Manage your squad's stamina depletion, execute strategic timeouts to swap tired players, and leverage special roster perks (like scoring boosts, defense anchors, or playmaking engines) to dominate the court.
                  </p>
                  <p className="text-[11px] leading-relaxed text-neutral-300">
                    Want a deeper breakdown? Navigate to the <strong className="text-orange-400 cursor-pointer hover:underline" onClick={() => { setActiveTab('guide'); setIsBriefingModalOpen(false); }}>Gameplay Guide</strong> tab for full formulas, coin flip mechanics, and specialized perk explanations.
                  </p>
                </div>

                {/* Channels Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">navigation channels & directories</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { icon: 'solar:home-2-linear', label: 'My Collection / Vault', desc: 'Manage your owned digital card collection, track vault values, and view curator stats.' },
                      { icon: 'solar:magnifer-linear', label: 'Card Index', desc: 'Browse the complete player card catalog, search sets, and check market values.' },
                      { icon: 'solar:gamepad-linear', label: 'Play Now / Arena', desc: 'Launch into tactical 5v5 basketball matches against AI or other players.' },
                      { icon: 'solar:notebook-linear', label: 'Gameplay Guide', desc: 'View complete rules, OVR math formula tools, and active card perks list.' },
                      { icon: 'solar:shield-linear', label: 'Teams Directory', desc: 'Examine card checklists and track scanned card completion by franchise.' },
                      { icon: 'solar:camera-linear', label: 'Camera Scanner', desc: 'Simulate scanning digital or physical card slabs into your digital binder.' },
                      { icon: 'solar:calendar-date-linear', label: 'Drops & Releases', desc: 'Follow new pack releases, daily reward calendars, and drop schedules.' },
                      { icon: 'solar:chart-square-linear', label: 'Market Analytics', desc: 'Monitor price trend graphs, historical valuation data, and player trends.' },
                      { icon: 'solar:settings-linear', label: 'Settings', desc: 'Switch light/dark themes, specify your favorite franchise, or reset progress.' }
                    ].map((ch, idx) => (
                      <div key={idx} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-neutral-400 mt-0.5 flex-shrink-0">
                          <iconify-icon icon={ch.icon} width="16"></iconify-icon>
                        </div>
                        <div className="space-y-0.5 text-left">
                          <div className="text-[10px] font-black text-white uppercase tracking-wider">{ch.label}</div>
                          <div className="text-[9.5px] leading-normal text-neutral-400 font-semibold">{ch.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Close Button at bottom */}
                <div className="pt-2">
                  <button
                    onClick={() => setIsBriefingModalOpen(false)}
                    className="w-full conic-btn py-3"
                  >
                    <div className="conic-spin-bg"></div>
                    <div className="conic-btn-mask bg-black"></div>
                    <span className="relative z-10 flex items-center justify-center gap-1.5 text-[10px] font-bold text-white uppercase cursor-pointer">
                      <iconify-icon icon="solar:check-circle-bold" width="14"></iconify-icon>
                      Got it, thanks!
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedCardId && activeCard && (
            <div 
              className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm sm:backdrop-blur-xl bg-black/90 sm:bg-black/85 transition-opacity duration-300 ease-out hide-scrollbar"
            >
              <div 
                className="min-h-full w-full flex items-center justify-center p-4 md:p-6 pt-16 md:pt-16"
                onClick={() => { setSelectedCardId(null); setSelectedTimeline('1D'); }}
              >
                <div 
                  className="relative w-full max-w-5xl bg-[#0c0c0c] border border-white/10 rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col md:flex-row gap-4 md:gap-8 shadow-[0_0_50px_rgba(255,255,255,0.05)] transform transition-all duration-300 scale-95 opacity-0 animate-modal-entry"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close Button */}
                  <button 
                    onClick={() => { setSelectedCardId(null); setSelectedTimeline('1D'); }}
                    className="absolute top-4 right-4 md:top-6 md:right-6 z-50 conic-btn circle orange dramatic-hover"
                    style={{ position: 'absolute' }}
                  >
                    <div className="conic-spin-bg"></div>
                    <div className="conic-btn-mask bg-black/60 backdrop-blur-md"></div>
                    <span className="relative z-10 text-neutral-400 hover:text-white transition-all duration-200 flex items-center justify-center">
                      <iconify-icon icon="solar:close-circle-bold" width="20"></iconify-icon>
                    </span>
                  </button>

                  {/* Left Column: Enlarged 3D Card */}
                  <div className="w-full md:w-auto flex flex-col items-center gap-4 flex-shrink-0 md:self-start">
                    <div className="flex justify-between w-full max-w-[280px]">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">
                        {detailedActiveCard.brand}
                      </span>
                    </div>

                    <HoloCard card={detailedActiveCard} size="xl" interactive={true} hideAttributes={false} />
                    
                    <p className="text-[9px] text-neutral-500 uppercase tracking-widest text-center mt-2">
                      Tilt card to reflect.
                    </p>
                  </div>

                  {/* Right Column: UI Card with Price charts, grades, specs */}
                  <div className="game-detail-right flex-1 w-full flex flex-col gap-6 text-left md:overflow-y-auto md:max-h-[75vh] hide-scrollbar pr-1">
                    
                    {/* Header Details */}
                    <div className="glass-panel border border-white/5 p-4 sm:p-6 rounded-2xl">
                      <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded text-white font-mono uppercase tracking-wider">
                        {detailedActiveCard.sport}
                      </span>
                      <h1 className="text-2xl md:text-3xl font-extrabold mt-2 text-white">{detailedActiveCard.player}</h1>
                      <p className="text-xs text-neutral-400 mt-1">{detailedActiveCard.year} {detailedActiveCard.brand} {detailedActiveCard.number} • <span className="text-white font-semibold">{detailedActiveCard.parallel}</span></p>
                      
                      {/* Modal Mode Tabs */}
                      <div className="flex bg-neutral-900/60 p-1 rounded-xl border border-white/5 mt-4">
                        {['analytics', 'attributes'].map(mode => (
                          <button
                            key={mode}
                            onClick={() => setModalMode(mode)}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                              modalMode === mode ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    {modalMode === 'analytics' && (
                      <>
                        <div className="glass-panel border border-white/5 p-4 sm:p-6 rounded-2xl">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono">Market Value</div>
                              <div className="text-lg md:text-xl font-bold mt-1 text-white">${detailedActiveCard.value.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono">{selectedTimeline} Change</div>
                              <div className={`text-lg md:text-xl font-bold mt-1 flex items-center gap-0.5 ${timelinePctChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                <iconify-icon icon={timelinePctChange >= 0 ? "solar:arrow-right-up-bold" : "solar:arrow-right-down-bold"} width="14"></iconify-icon>
                                {timelinePctChange >= 0 ? '+' : ''}{timelinePctChange}%
                              </div>
                            </div>
                            <div>
                              <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono">Volume</div>
                              <div className="text-lg md:text-xl font-bold mt-1 text-neutral-300 truncate">{detailedActiveCard.volume}</div>
                            </div>
                          </div>
                        </div>

                        <div className="glass-panel border border-white/5 p-4 sm:p-6 rounded-2xl">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                            <h3 className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">Historical Price Trend (PSA 10 Comps)</h3>
                            <div className="flex bg-neutral-900/60 p-0.5 rounded-lg border border-white/5">
                              {['1D', '1M', '6M', '1Y', '5Y'].map(t => (
                                <button
                                  key={t}
                                  onClick={() => setSelectedTimeline(t)}
                                  className={`px-2 py-1 rounded text-[8px] font-bold uppercase transition-all ${
                                    selectedTimeline === t ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                                  }`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="w-full bg-black/40 p-4 rounded-xl border border-white/5">
                            <PriceChart card={detailedActiveCard} timeline={selectedTimeline} data={chartDataPoints} />
                          </div>
                        </div>

                        <div className="glass-panel border border-white/5 p-4 sm:p-6 rounded-2xl">
                          <h3 className="text-xs uppercase font-extrabold text-neutral-400 mb-4 tracking-wider">PSA / BGS / Raw Grading Index</h3>
                          <div className="grid grid-cols-3 gap-3">
                            {Object.entries(detailedActiveCard.grades).map(([grade, val]) => (
                              <div key={grade} className="bg-black/30 border border-white/5 p-3 rounded-xl flex flex-col justify-between">
                                <span className="font-mono text-[9px] text-neutral-500 uppercase">{grade}</span>
                                <span className="font-bold text-white text-xs sm:text-sm mt-1">{typeof val === 'number' ? `$${val.toLocaleString()}` : val}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="glass-panel border border-white/5 p-4 sm:p-6 rounded-2xl">
                          <h3 className="text-xs uppercase font-extrabold text-neutral-400 mb-4 tracking-wider">Physical Registry Specifications</h3>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-[10px] text-neutral-300">
                            <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-neutral-500">CARD NUM:</span><span className="text-white">{detailedActiveCard.specs.cardNum}</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-neutral-500">POSITION:</span><span className="text-white">{detailedActiveCard.specs.position}</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-neutral-500">HEIGHT:</span><span className="text-white">{detailedActiveCard.specs.height}</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-neutral-500">WEIGHT:</span><span className="text-white">{detailedActiveCard.specs.weight}</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-neutral-500">DRAFT YR:</span><span className="text-white">{detailedActiveCard.specs.draftYear}</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-neutral-500">VERIFIED:</span><span className="text-green-500">YES</span></div>
                          </div>
                        </div>
                      </>
                    )}

                    {modalMode === 'attributes' && (
                      <>
                        <div className="glass-panel border border-white/5 p-4 sm:p-6 rounded-2xl space-y-4">
                          <h3 className="text-xs uppercase font-extrabold text-neutral-400 border-b border-white/5 pb-2 tracking-wider flex items-center justify-between">
                            <span>HoopTactics Game Ratings</span>
                            <span className="text-[9px] font-mono text-neutral-500 font-normal">Slab Attributes & Playstyle</span>
                          </h3>
                          <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5 gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                              <span className="text-xs font-mono font-bold bg-neutral-800 text-neutral-300 border border-neutral-700 px-3 py-1 rounded-md inline-block whitespace-nowrap">
                                Position: {getCardGameStats(detailedActiveCard).pos}
                              </span>
                              {getCardGameStats(detailedActiveCard).primaryBadge && (
                                <div className="flex items-center gap-1.5 text-xs font-extrabold text-white whitespace-nowrap">
                                  <iconify-icon 
                                    icon={getCardGameStats(detailedActiveCard).primaryBadge.icon} 
                                    width="16" 
                                    className={getCardGameStats(detailedActiveCard).primaryBadge.type === 'three_pointer' ? 'text-amber-500' : 'text-purple-500'}
                                  ></iconify-icon>
                                  <span>{getCardGameStats(detailedActiveCard).primaryBadge.name}</span>
                                </div>
                              )}
                            </div>
                            <div className="ovr-avatar lg shadow-xl">
                              <div className="ovr-avatar-spin"></div>
                              <div className="ovr-avatar-mask"></div>
                              <div className="ovr-avatar-content">
                                <span className="ovr-val text-[16px]">{getCardGameStats(detailedActiveCard).ovr}</span>
                                <span className="ovr-lbl text-[6px] -mt-0.5">OVR</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-4 font-mono text-xs text-neutral-300">
                            <div>
                              <div className="flex justify-between font-bold mb-1">
                                <span>OFFENSE (OFF)</span>
                                <span className="text-orange-400 font-black">{getCardGameStats(detailedActiveCard).off}</span>
                              </div>
                              <div className="h-2 w-full bg-neutral-900 border border-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full" style={{ width: `${getCardGameStats(detailedActiveCard).off}%` }}></div>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between font-bold mb-1">
                                <span>PERIMETER DEFENSE (PRD)</span>
                                <span className="text-blue-400 font-black">{getCardGameStats(detailedActiveCard).perDef}</span>
                              </div>
                              <div className="h-2 w-full bg-neutral-900 border border-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${getCardGameStats(detailedActiveCard).perDef}%` }}></div>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between font-bold mb-1">
                                <span>RIM PROTECTION (RMP)</span>
                                <span className="text-indigo-400 font-black">{getCardGameStats(detailedActiveCard).rimDef}</span>
                              </div>
                              <div className="h-2 w-full bg-neutral-900 border border-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full" style={{ width: `${getCardGameStats(detailedActiveCard).rimDef}%` }}></div>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between font-bold mb-1">
                                <span>STAMINA (STA)</span>
                                <span className="text-emerald-400 font-black">{getCardGameStats(detailedActiveCard).sta}</span>
                              </div>
                              <div className="h-2 w-full bg-neutral-900 border border-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" style={{ width: `${Math.min(100, (getCardGameStats(detailedActiveCard).sta / 110) * 100)}%` }}></div>
                              </div>
                            </div>
                          </div>

                          {/* Expanded attributes section */}
                          <div className="border-t border-white/5 pt-4 mt-4">
                            <h4 className="text-[10px] uppercase font-bold text-neutral-500 mb-3 tracking-wider font-mono">Detailed Attributes</h4>
                            <div className="grid grid-cols-1 gap-3.5 font-mono text-xs text-neutral-300">
                              <div>
                                <div className="flex justify-between font-bold mb-1">
                                  <span>3-POINT (3PT)</span>
                                  <span className="text-amber-400 font-black">{getCardGameStats(detailedActiveCard).tpt}</span>
                                </div>
                                <div className="h-1.5 w-full bg-neutral-900 border border-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" style={{ width: `${getCardGameStats(detailedActiveCard).tpt}%` }}></div>
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between font-bold mb-1">
                                  <span>MID-RANGE (MID)</span>
                                  <span className="text-neutral-200 font-black">{getCardGameStats(detailedActiveCard).mid}</span>
                                </div>
                                <div className="h-1.5 w-full bg-neutral-900 border border-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-neutral-500 to-neutral-300 rounded-full" style={{ width: `${getCardGameStats(detailedActiveCard).mid}%` }}></div>
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between font-bold mb-1">
                                  <span>RIM FINISH (RIM)</span>
                                  <span className="text-rose-400 font-black">{getCardGameStats(detailedActiveCard).rim}</span>
                                </div>
                                <div className="h-1.5 w-full bg-neutral-900 border border-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full" style={{ width: `${getCardGameStats(detailedActiveCard).rim}%` }}></div>
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between font-bold mb-1">
                                  <span>ATHLETICISM (ATH)</span>
                                  <span className="text-purple-400 font-black">{getCardGameStats(detailedActiveCard).ath}</span>
                                </div>
                                <div className="h-1.5 w-full bg-neutral-900 border border-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full" style={{ width: `${getCardGameStats(detailedActiveCard).ath}%` }}></div>
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between font-bold mb-1">
                                  <span>CLUTCH (CLU)</span>
                                  <span className="text-yellow-400 font-black">{getCardGameStats(detailedActiveCard).clu}</span>
                                </div>
                                <div className="h-1.5 w-full bg-neutral-900 border border-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full" style={{ width: `${getCardGameStats(detailedActiveCard).clu}%` }}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="glass-panel border border-white/5 p-4 sm:p-6 rounded-2xl">
                          <h3 className="text-xs uppercase font-extrabold text-neutral-400 mb-4 tracking-wider">⚡ Active Gameplay Perks</h3>
                          {getCardGameStats(detailedActiveCard).perks.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {getCardGameStats(detailedActiveCard).perks.map((p, idx) => (
                                <div key={idx} className="bg-black/30 border border-white/5 p-3 rounded-xl flex flex-col">
                                  <span className="font-extrabold text-[10px] text-amber-400 uppercase">⚡ {p.name}</span>
                                  <span className="text-[9.5px] leading-normal text-neutral-400 mt-1 font-semibold">{p.desc}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-xs italic text-neutral-500 bg-black/20 rounded-xl border border-dashed border-white/5">
                              No special perks active (Standard Roster player)
                            </div>
                          )}
                        </div>

                        <div className="glass-panel border border-white/5 p-4 sm:p-6 rounded-2xl">
                          <h3 className="text-xs uppercase font-extrabold text-neutral-400 mb-4 tracking-wider">📊 Career Statistics Table</h3>
                          {(() => {
                            const statsRows = getPlayerStats(detailedActiveCard);
                            const headers = statsRows[0]?.labels || ['YR', 'TEAM', 'GP', 'PTS', 'REB', 'AST'];
                            return (
                              <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/40 p-4">
                                <table className="w-full text-[9.5px] font-mono text-neutral-300 text-center border-collapse">
                                  <thead>
                                    <tr className="border-b border-white/10 uppercase text-neutral-400 font-extrabold">
                                      {headers.map(h => <th key={h} className="pb-2 font-bold">{h}</th>)}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {statsRows.map((r, idx) => (
                                      <tr key={idx} className="hover:bg-white/5 transition-all">
                                        <td className="py-2 font-bold text-white">{r.yr}</td>
                                        <td className="py-2 font-semibold text-neutral-200">{r.team || 'NBA'}</td>
                                        <td className="py-2">{r.gp}</td>
                                        <td className="py-2 font-bold text-white">{r.col1}</td>
                                        <td className="py-2">{r.col2}</td>
                                        <td className="py-2">{r.col3}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          })()}
                        </div>

                        {(() => {
                          const { bio } = getBasketballStatsAndBio(detailedActiveCard);
                          if (!bio) return null;
                          return (
                            <div className="glass-panel border border-white/5 p-4 sm:p-6 rounded-2xl text-[10px] leading-relaxed text-neutral-300">
                              <span className="font-extrabold block uppercase tracking-wider text-neutral-400 mb-2">Highlights & Biography</span>
                              <p className="font-semibold">{bio}</p>
                            </div>
                          );
                        })()}

                        <div className="glass-panel border border-white/5 p-4 sm:p-6 rounded-2xl">
                          <h3 className="text-xs uppercase font-extrabold text-neutral-400 mb-4 tracking-wider">Physical Specifications</h3>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-[10px] text-neutral-300">
                            <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-neutral-500">CARD NUM:</span><span className="text-white">{detailedActiveCard.specs.cardNum}</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-neutral-500">POSITION:</span><span className="text-white">{detailedActiveCard.specs.position}</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-neutral-500">HEIGHT:</span><span className="text-white">{detailedActiveCard.specs.height}</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-neutral-500">WEIGHT:</span><span className="text-white">{detailedActiveCard.specs.weight}</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-neutral-500">DRAFT YR:</span><span className="text-white">{detailedActiveCard.specs.draftYear}</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-neutral-500">VERIFIED:</span><span className="text-green-500">YES</span></div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <ThemeProvider>
        <App />
      </ThemeProvider>
    );
