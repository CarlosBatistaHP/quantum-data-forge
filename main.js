import { AuthManager, ApiManager } from './api.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- DATA & CONFIG ---
    const BUILDINGS_DATA=[{id:"script",name:"Auto-Clicker Script",baseCost:15,description:"Clica automaticamente."}, {id:"cpu",name:"CPU Cluster",baseCost:100,baseDps:1.5,description:"+1.5 DPS base."}, {id:"server",name:"Server Farm",baseCost:1100,baseDps:9,description:"+9 DPS base."}, {id:"quantum",name:"Quantum Processor",baseCost:12e3,baseDps:50,description:"+50 DPS base."}, {id:"ai",name:"AI Superintelligence",baseCost:13e4,baseDps:260,description:"+260 DPS base."}, {id:"dyson",name:"Dyson Swarm",baseCost:14e5,baseDps:1400,description:"+1400 DPS base."}];
    const UPGRADES_DATA={'click_1':{name:"Mouse Óptico",description:"Cliques 2x mais eficientes.",cost:100,requirement:()=>!0,type:"click",multiplier:2},'click_2':{name:"Luva Háptica",description:"Cliques 2x mais eficientes.",cost:500,requirement:e=>e.upgrades.includes("click_1"),type:"click",multiplier:2},'synergy_click_dps':{name:"Interface Neural Direta",description:"Cada clique também gera 1% do seu DPS.",cost:1e4,requirement:e=>e.buildings.cpu.count>=10,type:"click_dps_synergy",multiplier:.01},'script_1':{name:"Código Otimizado",description:"Scripts clicam 25% mais rápido.",cost:100,requirement:e=>e.buildings.script.count>=1,type:"auto_clicker_speed",speedMultiplier:1.25},'script_2':{name:"Scripts Polimórficos",description:"Scripts clicam 40% mais rápido.",cost:500,requirement:e=>e.buildings.script.count>=5,type:"auto_clicker_speed",speedMultiplier:1.4},'cpu_1':{name:"Sistema de Cooling",description:"CPUs 2x mais eficientes.",cost:1e3,requirement:e=>e.buildings.cpu.count>=1,type:"building",target:"cpu",multiplier:2},'cpu_tier1':{name:"Arquitetura de CPU Avançada",description:"CPUs permanentemente 2x mais eficientes.",cost:5e4,requirement:e=>e.buildings.cpu.count>=25,type:"building",target:"cpu",multiplier:2},'server_tier1':{name:"Backbone de Fibra Ótica",description:"Server Farms permanentemente 2x mais eficientes.",cost:6e5,requirement:e=>e.buildings.server.count>=25,type:"building",target:"server",multiplier:2},'synergy_server_cpu':{name:"Otimização de Virtualização",description:"Cada Server Farm aumenta a produção de CPUs em 1%.",cost:75e3,requirement:e=>e.buildings.server.count>=10&&e.buildings.cpu.count>=25,type:"synergy",source:"server",target:"cpu",multiplier_per_source:.01},'synergy_ai_all':{name:"IA de Otimização de Rede",description:"A AI Superintelligence aumenta a produção de TODOS os outros edifícios em 10%.",cost:1e7,requirement:e=>e.buildings.ai.count>=1,type:"synergy_global",source:"ai",multiplier:1.1},'global_1':{name:"Compressão Global",description:"Dobra (2x) toda a sua geração de Data (Cliques e DPS).",cost:5e4,requirement:e=>e.buildings.quantum.count>=1,type:"global_multiplier",multiplier:2},'unlock_abilities':{name:"Desbloquear Processador de Efeitos",description:"Habilita as habilidades ativas Overclock e Data Dump.",cost:25e3,requirement:e=>e.buildings.quantum.count>=1,type:"unlock",target:"abilities"}};
    const PRESTIGE_UPGRADES_DATA={'prestige_start_scripts':{name:"Protocolo de Inicialização",description:"Comece cada nova recompilação com 10 Scripts.",cost:1,requirement:()=>true, prestigeReq:1},'prestige_kernel_power':{name:"Kernel Supercarregado",description:"Cada Kernel Core agora dá +1.5% de bônus em vez de +1%.",cost:10,requirement:()=>true, prestigeReq:1},'singularity_compress':{name:"Compressão de Singularidade",description:"Aumenta todo o DPS em +50%.",cost:25,requirement:()=>true, prestigeReq:3},'supernova_shards':{name:"Fragmentos de Supernova",description:"Aumenta o DPC base em +100%.",cost:100,requirement:()=>true, prestigeReq:10},'dwarf_forge':{name:"Forja Anã",description:"Aumenta a eficiência de todos os edifícios em 25%.",cost:250,requirement:()=>true, prestigeReq:15}};
    const ACHIEVEMENTS_DATA={'ach_data_m':{name:"Megabyte",description:"Junte 1,000,000 Data.",condition:e=>e.stats.totalDataThisPrestige>=1e6,bonus:.002},'ach_ship_launched':{name:"Odyssey Lançada",description:"Construa e lance a nave (250 de cada infraestrutura).",condition:e=>e.shipLaunched,bonus:.1},'ach_prestige_1':{name:"Recompilado",description:"Recompile pela 1ª vez.",condition:e=>e.stats.prestigeCount>=1,bonus:.05},'ach_prestige_cosmic':{name:"Era Cósmica",description:"Alcance a Era Cósmica (1 Recompilação).",condition:e=>e.stats.prestigeCount>=1,bonus:.05},'ach_prestige_singularity':{name:"Era da Singularidade",description:"Alcance a Era da Singularidade (3 Recompilações).",condition:e=>e.stats.prestigeCount>=3,bonus:.05},'ach_prestige_blackhole':{name:"Horizonte de Eventos",description:"Alcance a Era do Buraco Negro (7 Recompilações).",condition:e=>e.stats.prestigeCount>=7,bonus:.1},'ach_prestige_supernova':{name:"Era da Supernova",description:"Alcance a Era da Supernova (10 Recompilações).",condition:e=>e.stats.prestigeCount>=10,bonus:.1},'ach_prestige_whitedwarf':{name:"Era da Anã Branca",description:"Alcance a Era da Anã Branca (15 Recompilações).",condition:e=>e.stats.prestigeCount>=15,bonus:.15},'ach_dev_mode':{name:"A Chave Mestra",description:"Você encontrou o acesso de superusuário.",condition:e=>e.devMode,bonus:0}};

    // --- GAME STATE ---
    let gameState = {};
    const defaultGameState = (isPrestige = false) => {
        const oldState = gameState;
        const newState = {
            data: 0,
            devMode: false,
            shipLaunched: false,
            buildings: BUILDINGS_DATA.reduce((acc, b) => ({...acc, [b.id]: { count: 0 }}), {}),
            upgrades: [],
            prestigeUpgrades: [],
            achievements: [],
            hallOfFame: [],
            stats: { totalData: 0, totalDataThisPrestige: 0, clicks: 0, autoClicks: 0, prestigeCount: 0, playTime: 0, lastPrestigePlayTime: 0, },
            autoClicker: { interval: 2000, timer: 0 },
            globalMultiplier: 1,
            activeAbilities: { overclock: { active_until: 0, cooldown_until: 0 }, datadump: { active_until: 0, cooldown_until: 0 } }
        };

        if (isPrestige) {
            newState.devMode = oldState.devMode;
            newState.prestige = oldState.prestige;
            newState.prestigeUpgrades = oldState.prestigeUpgrades;
            newState.achievements = oldState.achievements;
            newState.hallOfFame = oldState.hallOfFame;
            newState.shipLaunched = oldState.shipLaunched;
            newState.stats.prestigeCount = oldState.stats.prestigeCount;
            newState.stats.playTime = oldState.stats.playTime;
            newState.stats.lastPrestigePlayTime = oldState.stats.playTime;
            newState.stats.totalData = oldState.stats.totalData;
            if (newState.prestigeUpgrades.includes("prestige_start_scripts")) {
                newState.buildings.script.count = 10;
            }
        } else {
            newState.prestige = { cores: 0 };
        }
        return newState;
    };

    // --- DOM ELEMENTS CACHE---
    const DOM = {};
    const DYNAMIC_DOM = {
        buildings: {},
        upgrades: {},
        prestigeUpgrades: {}
    };

    // --- CORE GAME LOGIC ---
    function mainClick(event){const dpc=calculateDPC();addData(dpc);gameState.stats.clicks++;createShockwave();createClickEffect(event,dpc);};
    function autoClick(){const dpc=calculateDPC();addData(dpc);createAutoClickEffect(dpc);gameState.stats.autoClicks++;};
    function addData(e){gameState.data+=e; gameState.stats.totalData+=e; gameState.stats.totalDataThisPrestige+=e};
    function calculateCost(e,t){return Math.ceil(e*Math.pow(1.15,t))};
    function buyBuilding(e,t){const s=BUILDINGS_DATA.find(e=>e.id===t),a=gameState.buildings[t];if(a.count>=1000)return;let o=1;e.shiftKey&&(o=10);let n=0;for(let i=0;i<o;i++)n+=calculateCost(s.baseCost,a.count+i);if(gameState.data>=n){gameState.data-=n;a.count=Math.min(1000, a.count + o);}};
    function buyUpgrade(e){const t=UPGRADES_DATA[e];if(!t||gameState.data<t.cost||gameState.upgrades.includes(e))return;gameState.data-=t.cost,gameState.upgrades.push(e),"auto_clicker_speed"===t.type?gameState.autoClicker.interval/=t.speedMultiplier:"global_multiplier"===t.type&&(gameState.globalMultiplier*=t.multiplier);if(t.type !== 'unlock')showToast(`Upgrade Comprado: ${t.name}!`)};
    function buyPrestigeUpgrade(e){const t=PRESTIGE_UPGRADES_DATA[e];if(t&&gameState.prestige.cores>=t.cost&&!gameState.prestigeUpgrades.includes(e)){gameState.prestige.cores-=t.cost,gameState.prestigeUpgrades.push(e),showToast("Upgrade de Kernel Comprado!")}};
    function calculateDPC(){let e=1;if(gameState.prestigeUpgrades.includes("supernova_shards"))e*=2;const t=calculateDPS();Object.values(UPGRADES_DATA).forEach((s,i)=>{if(gameState.upgrades.includes(Object.keys(UPGRADES_DATA)[i])){if("click"===s.type)e*=s.multiplier;if("click_dps_synergy"===s.type)e+=t*s.multiplier}});e*=gameState.globalMultiplier*(1+getPrestigeBonus());if(Date.now()<gameState.activeAbilities.overclock.active_until)e*=7.77;return e};
    function calculateDPS(){let e=0;BUILDINGS_DATA.forEach(t=>{if("script"===t.id)return;const s=gameState.buildings[t.id];if(!s||0===s.count)return;let a=(t.baseDps||0)*s.count;Object.values(UPGRADES_DATA).forEach((up,i)=>{if(gameState.upgrades.includes(Object.keys(UPGRADES_DATA)[i])){if("building"===up.type&&up.target===t.id)a*=up.multiplier;if("synergy"===up.type&&up.target===t.id)a*=1+gameState.buildings[up.source].count*up.multiplier_per_source}});e+=a});let mult=gameState.globalMultiplier*(1+getPrestigeBonus())*(1+calculateAchievementBonus());if(gameState.shipLaunched)mult*=1.25;if(gameState.prestigeUpgrades.includes("singularity_compress"))mult*=1.5;if(gameState.prestigeUpgrades.includes("dwarf_forge"))mult*=1.25;const aiUpgrade = UPGRADES_DATA['synergy_ai_all'];if(gameState.upgrades.includes('synergy_ai_all') && gameState.buildings[aiUpgrade.source]?.count > 0) e *= aiUpgrade.multiplier;return e*mult};
    function getPrestigeBonus(){return gameState.prestige.cores*(gameState.prestigeUpgrades.includes("prestige_kernel_power")?.015:.01)};
    function getPrestigeBaseCost() { return 1e6 * Math.pow(1.5, gameState.stats.prestigeCount); }
    function calculateNextPrestigeCost(cores) { return getPrestigeBaseCost() * Math.pow(cores + 1, 2); }
    function calculatePendingPrestigeCores(){const baseCost=getPrestigeBaseCost();if(gameState.stats.totalDataThisPrestige<baseCost)return 0;return Math.max(0,Math.floor(Math.pow(gameState.stats.totalDataThisPrestige/baseCost,.5)))};
    function prestigeReset(){const e=calculatePendingPrestigeCores();if(!(e<=0)){const playerName=AuthManager.getLoggedInUser();if(!gameState.devMode&&playerName){const t={date:(new Date).toLocaleString(),score:gameState.stats.totalDataThisPrestige,kernels:e,playTime:gameState.stats.playTime-(gameState.stats.lastPrestigePlayTime||0)};gameState.hallOfFame.push(t);ApiManager.submitScore(playerName,gameState.stats.totalData)}const t={...gameState};gameState=defaultGameState(!0);gameState.prestige.cores=t.prestige.cores+e;gameState.stats.prestigeCount=t.stats.prestigeCount+1;showToast(`Sistema Recompilado! Você ganhou ${formatNumber(e,0)} Kernel Cores!`);updateUI()}};
    function handleAbilities(e){DOM.abilities.style.display=gameState.upgrades.includes("unlock_abilities")?"block":"none";const t=Date.now(),s=(gameState.activeAbilities.overclock.cooldown_until-t)/1e3;DOM['ability-overclock'].textContent=s>0?`Overclock (${s.toFixed(0)}s)`:"Overclock",DOM['ability-overclock'].classList.toggle("on-cooldown",s>0);const a=(gameState.activeAbilities.datadump.cooldown_until-t)/1e3;DOM['ability-datadump'].textContent=a>0?`Data Dump (${a.toFixed(0)}s)`:"Data Dump",DOM['ability-datadump'].classList.toggle("on-cooldown",a>0)};
    function activateAbility(e){const t=Date.now();if("overclock"===e&&t>gameState.activeAbilities.overclock.cooldown_until){gameState.activeAbilities.overclock.active_until=t+1e4,gameState.activeAbilities.overclock.cooldown_until=t+6e4,showToast("Overclock ativado! Ganhos de clique x7.77!")}if("datadump"===e&&t>gameState.activeAbilities.datadump.cooldown_until){addData(1800*(calculateDPS()||1)),gameState.activeAbilities.datadump.cooldown_until=t+3e5,showToast(`Data Dump! +${formatNumber(1800*(calculateDPS()||1))} Data!`)}};
    function handleAutoClicker(e){if(gameState.buildings.script.count>0&&(gameState.autoClicker.timer+=e,gameState.autoClicker.timer>=gameState.autoClicker.interval)){const clicks=Math.floor(gameState.autoClicker.timer/gameState.autoClicker.interval);for(let t=0;t<clicks;t++)autoClick();gameState.autoClicker.timer%=gameState.autoClicker.interval}};
    
    // --- UI & VISUALS ---
    function checkAchievements(){for(const e in ACHIEVEMENTS_DATA)if(!gameState.achievements.includes(e)&&ACHIEVEMENTS_DATA[e].condition(gameState)){gameState.achievements.push(e),showToast(`Conquista: ${ACHIEVEMENTS_DATA[e].name}`)}};
    function checkShipLaunch() { if(gameState.shipLaunched) return; const canLaunch = BUILDINGS_DATA.every(b => b.id === 'script' || gameState.buildings[b.id].count >= 250); if(canLaunch){ gameState.shipLaunched = true; DOM['ship-launch-overlay'].classList.add('active'); DOM['odyssey-svg'].classList.add('is-launched'); checkAchievements(); } }
    function calculateAchievementBonus(){return gameState.achievements.reduce((e,t)=>e+(ACHIEVEMENTS_DATA[t]?.bonus||0),0)};
    function showToast(e, duration = 4900){const t=document.createElement("div");t.className="toast",t.textContent=e,DOM.toast.appendChild(t),setTimeout(()=>t.remove(),duration)};
    function createShockwave(){const e=document.createElement("div");e.className="shockwave";e.style.borderColor = getComputedStyle(document.body).getPropertyValue('--glow-color'); DOM['data-orb'].appendChild(e),setTimeout(()=>e.remove(),500)};
    function createClickEffect(event, value){const t=document.createElement("div");t.className="click-effect",t.textContent=`+${formatNumber(value)}`;t.style.left=`${event.clientX}px`;t.style.top=`${event.clientY-20}px`;t.style.color = getComputedStyle(document.body).getPropertyValue('--accent-color'); document.body.appendChild(t),setTimeout(()=>t.remove(),1e3)};
    function createAutoClickEffect(value){const orbRect=DOM['data-orb'].getBoundingClientRect(),t=document.createElement("div");t.className="click-effect",t.textContent=`+${formatNumber(value)}`;t.style.left=`${orbRect.left+orbRect.width/2}px`;t.style.top=`${orbRect.top+orbRect.height/2}px`;t.style.color = getComputedStyle(document.body).getPropertyValue('--accent-color'); document.body.appendChild(t),setTimeout(()=>t.remove(),1e3)};
    function formatNumber(e,t=2){if(e<1e3)return e.toFixed(0);const s=["K","M","B","T","Qa","Qi","Sx","Sp"],a=Math.floor(Math.log10(e)/3)-1;return a>=s.length?e.toExponential(2):(e/Math.pow(1e3,a+1)).toFixed(t).replace(/\.00$/,"").replace(/\.([1-9])0$/,".$1")+s[a]};
    function formatTime(ms){const s=Math.floor(ms/1e3),m=Math.floor(s/60),h=Math.floor(m/60);return`${Math.floor(h/24)}d ${h%24}h ${m%60}m ${s%60}s`};
    function updateGameTheme(){const e=document.body.classList,t=gameState.stats.prestigeCount;const themes=['theme-cosmic','theme-singularity','theme-black-hole','theme-supernova','theme-whitedwarf'];e.remove(...themes);if(t>=15)e.add("theme-whitedwarf");else if(t>=10)e.add("theme-supernova");else if(t>=7)e.add("theme-black-hole");else if(t>=3)e.add("theme-singularity");else if(t>=1)e.add("theme-cosmic")};
    function updateShipVisuals(){const e=gameState.buildings;const t=(t,n)=>{if(!t)return;let s=0;n>=1000?s=5:n>=250?s=4:n>=50?s=3:n>=10?s=2:n>=1&&(s=1),t.classList.remove("level-1","level-2","level-3","level-4","level-5"),s>0&&t.classList.add(`level-${s}`)};const n=[{id:"ship-hull",building:e.script},{id:"ship-engine",building:e.cpu},{id:"ship-bridge",building:e.server},{id:"ship-wings",building:e.quantum},{id:"ship-sensors",building:e.ai},{id:"ship-plating",building:e.dyson}];let s=!0;n.forEach(e=>{const n=document.getElementById(e.id);if(n){n.classList.toggle("active",e.building.count>0),t(n,e.building.count)}if(e.id!=='ship-hull'&&e.building.count<250)s=!1});DOM['engine-glow-group'].classList.toggle("active",e.cpu.count>=1);DOM['odyssey-svg'].classList.toggle("is-wandering",s&&!gameState.shipLaunched)};
    
    let lastUIUpdate=0;
    function updateUI(force = false){
        const t=performance.now();
        if(!force && t-lastUIUpdate<200 && document.activeElement.tagName!=="INPUT")return; lastUIUpdate=t;
        
        DOM['data-count'].textContent=formatNumber(gameState.data);
        DOM['dps-count'].textContent=formatNumber(calculateDPS());
        DOM['dpc-count'].textContent=formatNumber(calculateDPC());
        DOM['auto-clicks-per-sec'].textContent = (gameState.buildings.script.count > 0 ? (1000 / gameState.autoClicker.interval).toFixed(2) : "0.00");
        DOM['kernel-cores-count'].textContent=formatNumber(gameState.prestige.cores,0);
        DOM['prestige-bonus'].textContent=(100*getPrestigeBonus()).toFixed(1);
        
        const pendingCores=calculatePendingPrestigeCores();
        const canPrestige = pendingCores > 0;
        DOM['prestige-button'].style.display=canPrestige?"block":"none";
        if(canPrestige)DOM['prestige-button'].textContent=`Recompilar (+${formatNumber(pendingCores,0)} Núcleos)`;
        
        const basePrestigeCost = getPrestigeBaseCost();
        DOM['prestige-progress-container'].style.display=gameState.stats.totalDataThisPrestige>=basePrestigeCost/5||gameState.stats.prestigeCount>0?"block":"none";
        const nextCost = calculateNextPrestigeCost(pendingCores);
        const progress = canPrestige ? 100 : Math.min(100, (gameState.stats.totalDataThisPrestige / basePrestigeCost) * 100);
        DOM['prestige-progress-bar'].style.width = `${progress}%`;
        DOM['prestige-progress-text'].textContent = `${formatNumber(gameState.stats.totalDataThisPrestige)} / ${formatNumber(basePrestigeCost)}`;

        DOM['dev-panel'].style.display=gameState.devMode?"block":"none";
        
        BUILDINGS_DATA.forEach(b => {
            const el = DYNAMIC_DOM.buildings[b.id];
            const state = gameState.buildings[b.id];
            const cost = calculateCost(b.baseCost, state.count);
            const isMax = state.count >= 1000;
            el.cost.textContent = isMax ? 'MAX' : formatNumber(cost);
            el.count.textContent = state.count;
            el.el.classList.toggle("disabled", gameState.data < cost || isMax);
        });

        Object.keys(UPGRADES_DATA).forEach(id=>{
            const up=UPGRADES_DATA[id];
            const el = DYNAMIC_DOM.upgrades[id];
            const shouldShow = !gameState.upgrades.includes(id) && up.requirement(gameState);
            el.el.style.display = shouldShow ? 'flex' : 'none';
            if(shouldShow) el.el.classList.toggle("disabled",gameState.data<up.cost);
        });
        
        const showPrestigeHeader = gameState.stats.prestigeCount > 0 && Object.keys(PRESTIGE_UPGRADES_DATA).some(id => !gameState.prestigeUpgrades.includes(id) && gameState.stats.prestigeCount >= PRESTIGE_UPGRADES_DATA[id].prestigeReq);
        DOM.prestigeUpgradesHeader.style.display = showPrestigeHeader ? 'block' : 'none';
        
        Object.keys(PRESTIGE_UPGRADES_DATA).forEach(id=>{
            const up=PRESTIGE_UPGRADES_DATA[id];
            const el = DYNAMIC_DOM.prestigeUpgrades[id];
            const shouldShow = !gameState.prestigeUpgrades.includes(id) && gameState.stats.prestigeCount >= up.prestigeReq;
            el.el.style.display = shouldShow ? 'flex' : 'none';
            if(shouldShow) el.el.classList.toggle("disabled",gameState.prestige.cores<up.cost);
        });
        
        updateShipVisuals();
    }

    async function updateModal(activeTab) {
        const contentEl = document.getElementById(activeTab);
        if (!contentEl) return;
        contentEl.innerHTML = '<p style="text-align:center;">Carregando...</p>'; 

        if (activeTab === 'ranking-content') {
            const playerData = { name: AuthManager.getLoggedInUser(), score: gameState.stats.totalData };
            const leaderboard = await ApiManager.getLeaderboard(playerData);
            let table = `<table class="ranking-table"><tr><th>#</th><th>Hacker</th><th>Score Total</th></tr>`;
            leaderboard.forEach((entry, index) => {
                const isPlayer = entry.name === playerData.name;
                table += `<tr class="${isPlayer ? 'player-row' : ''}"><td>${index + 1}</td><td>${entry.name}</td><td>${formatNumber(entry.score)}</td></tr>`;
            });
            table += '</table>';
            contentEl.innerHTML = table;
        }
        if (activeTab === 'hall-of-fame-content') {
            let list = '<ul>';
            if (gameState.devMode) list += "<li>Hall da Fama desativado em Modo Dev.</li>";
            else if (!gameState.hallOfFame || gameState.hallOfFame.length === 0) list += '<li>Nenhum registro. Recompile o sistema para começar seu legado!</li>';
            else [...gameState.hallOfFame].reverse().forEach(run => { list += `<li><strong>${run.date}:</strong> ${formatNumber(run.score)} Data, rendeu ${formatNumber(run.kernels, 0)} Núcleos em ${formatTime(run.playTime)}</li>`; });
            list += '</ul>'; contentEl.innerHTML = list;
        }
        if (activeTab === 'achievements-content') {
            const grid = document.createElement('div'); grid.id = 'achievements-grid';
            for (const id in ACHIEVEMENTS_DATA) {
                const a = ACHIEVEMENTS_DATA[id], isUnlocked = gameState.achievements.includes(id), el = document.createElement('div');
                el.className = `achievement-entry ${isUnlocked ? 'unlocked' : 'locked'}`;
                el.innerHTML = `<h3>${isUnlocked ? a.name : '???'}</h3><p>${a.description}</p>`;
                grid.appendChild(el);
            }
             contentEl.innerHTML = ''; contentEl.appendChild(grid);
        }
        if (activeTab === 'stats-content') {
            const playerName = AuthManager.getLoggedInUser();
            let list = `<ul><li><strong>Hacker:</strong> ${playerName}</li><li><strong>Tempo de Jogo Total:</strong> ${formatTime(gameState.stats.playTime)}</li><li><strong>Total de Data (Esta Recompilação):</strong> ${formatNumber(gameState.stats.totalDataThisPrestige)}</li><li><strong>Cliques Manuais:</strong> ${formatNumber(gameState.stats.clicks, 0)}</li><li><strong>Cliques Automáticos:</strong> ${formatNumber(gameState.stats.autoClicks, 0)}</li><li><strong>Recompilações:</strong> ${formatNumber(gameState.stats.prestigeCount, 0)}</li></ul>`;
            list += `<button id="logout-button" class="action-button">Sair (Logout)</button>`;
            contentEl.innerHTML = list;
            document.getElementById('logout-button').onclick = () => {
                AuthManager.logout();
                location.reload();
            };
        }
    }

    // --- BACKGROUND ANIMATION ---
    function setupStarfield(){starfieldCanvas.width=window.innerWidth,starfieldCanvas.height=window.innerHeight,nebulaCanvas.width=window.innerWidth,nebulaCanvas.height=window.innerHeight,stars=[];for(let e=0;e<400;e++)stars.push({x:Math.random()*starfieldCanvas.width-starfieldCanvas.width/2,y:Math.random()*starfieldCanvas.height-starfieldCanvas.height/2,z:Math.random()*starfieldCanvas.width})};
    function drawBackgrounds(){starfieldCtx.clearRect(0,0,starfieldCanvas.width,starfieldCanvas.height),starfieldCtx.save(),starfieldCtx.translate(starfieldCanvas.width/2,starfieldCanvas.height/2);const e=gameState.stats.prestigeCount>0?1.5:gameState.buildings.quantum.count>0?1.2:1;stars.forEach(t=>{t.z-=.2*e,t.z<=0&&(t.z=starfieldCanvas.width);const s=128/t.z,a=t.x*s,o=t.y*s;if(a>-starfieldCanvas.width/2&&a<starfieldCanvas.width/2&&o>-starfieldCanvas.height/2&&o<starfieldCanvas.height/2){const e=(1-t.z/starfieldCanvas.width)*3;starfieldCtx.fillStyle=`rgba(255, 255, 255, ${1-t.z/starfieldCanvas.width})`,starfieldCtx.fillRect(a,o,e,e)}}),starfieldCtx.restore(),nebulaCtx.clearRect(0,0,nebulaCanvas.width,nebulaCanvas.height),gameState.stats.prestigeCount>0&&(()=>{const e=nebulaCtx.createRadialGradient(nebulaCanvas.width/2,nebulaCanvas.height/2,0,nebulaCanvas.width/2,nebulaCanvas.height/2,nebulaCanvas.width/2);e.addColorStop(0,"hsla(0, 0%, 0%, 0)");const t=getComputedStyle(document.body).getPropertyValue("--glow-color").trim();e.addColorStop(1,`${t}33`),nebulaCtx.fillStyle=e,nebulaCtx.fillRect(0,0,nebulaCanvas.width,nebulaCanvas.height)})()};
    
    // --- MAIN LOOP & SAVE/LOAD ---
    let lastTick=0;
    function gameLoop(e){if(!lastTick)lastTick=e;const t=e-lastTick;lastTick=e,gameState.stats.playTime+=t;addData(calculateDPS()*t/1e3);handleAutoClicker(t);handleAbilities(t);checkAchievements();updateUI();updateGameTheme();drawBackgrounds();requestAnimationFrame(gameLoop)};
    function getSaveKey() { const player = AuthManager.getLoggedInUser(); return player ? `quantumOdysseySave_v5.2_${player}` : null; }
    function saveGame(){ const key = getSaveKey(); if(key) try { localStorage.setItem(key, JSON.stringify(gameState)); } catch(e) { console.error("Falha ao salvar o jogo:", e); } };
    function loadGame(){ const key = getSaveKey(); if(!key) { gameState = defaultGameState(); return; } let savedData; try { savedData = JSON.parse(localStorage.getItem(key)); } catch { savedData = null; } gameState = defaultGameState(); if(savedData && typeof savedData === 'object' && savedData.stats){ Object.keys(gameState).forEach(k => { if (savedData[k] !== undefined) { if (typeof gameState[k] === 'object' && gameState[k] !== null && !Array.isArray(gameState[k])) { Object.assign(gameState[k], savedData[k]); } else { gameState[k] = savedData[k]; } } }); } }
    
    // --- INITIALIZATION ---
    function createDynamicElements() {
        BUILDINGS_DATA.forEach(b => {
            const el = document.createElement("div");
            el.className = "item";
            el.onclick = (e) => buyBuilding(e, b.id);
            el.innerHTML = `<div class="item-info"><h3>${b.name}</h3><p>${b.description}</p><p>Custo: <span class="cost"></span></p></div><span class="item-count"></span>`;
            DOM.buildings.appendChild(el);
            DYNAMIC_DOM.buildings[b.id] = { el: el, cost: el.querySelector('.cost'), count: el.querySelector('.item-count') };
        });

        Object.keys(UPGRADES_DATA).forEach(id => {
            const up = UPGRADES_DATA[id];
            const el = document.createElement("div");
            el.className = "item";
            el.style.display = 'none';
            el.onclick = () => buyUpgrade(id);
            el.innerHTML = `<div class="item-info"><h3>${up.name}</h3><p>Custo: ${formatNumber(up.cost)}</p><small>${up.description}</small></div>`;
            DOM.upgrades.appendChild(el);
            DYNAMIC_DOM.upgrades[id] = { el: el };
        });

        const header = document.createElement('h3');
        header.className = 'sub-header';
        header.textContent = 'Upgrades de Kernel';
        header.style.display = 'none';
        DOM.prestigeUpgradesContainer.appendChild(header);
        DOM.prestigeUpgradesHeader = header;
        
        const prestigeList = document.createElement('div');
        prestigeList.className = 'item-list';
        DOM.prestigeUpgradesContainer.appendChild(prestigeList);

        Object.keys(PRESTIGE_UPGRADES_DATA).forEach(id => {
            const up = PRESTIGE_UPGRADES_DATA[id];
            const el = document.createElement("div");
            el.className = "item prestige-upgrade";
            el.style.display = 'none';
            el.onclick = () => buyPrestigeUpgrade(id);
            el.innerHTML = `<div class="item-info"><h3>${up.name}</h3><p>Custo: ${formatNumber(up.cost, 0)} Núcleos</p><small>${up.description}</small></div>`;
            prestigeList.appendChild(el);
            DYNAMIC_DOM.prestigeUpgrades[id] = { el: el };
        });
    }

    function init(){
        const SELECTORS = ['data-count','kernel-cores-count','prestige-bonus','auto-clicks-per-sec','dps-count','dpc-count','data-orb','buildings-container','upgrades-container','prestige-upgrades-container','abilities-container','ability-overclock','ability-datadump','menu-buttons-container','main-menu-button','prestige-button','toast-container','main-modal','close-modal-button','main-container','player-name-input','save-name-button','name-modal','prestige-progress-container','prestige-progress-bar','prestige-progress-text','dev-panel','dev-add-data','dev-add-kernels','dev-reset-cooldowns','tabs', 'ship-launch-overlay', 'close-launch-overlay-button', 'odyssey-svg'];
        SELECTORS.forEach(id => DOM[id] = document.getElementById(id));

        const loggedInUser = AuthManager.getLoggedInUser();
        if (!loggedInUser) {
            DOM['name-modal'].classList.add('active');
        } else {
            DOM['name-modal'].classList.remove('active');
            startGame(loggedInUser);
        }
        
        DOM["save-name-button"].addEventListener("click",()=>{
            const name = DOM["player-name-input"].value.trim();
            if (name) {
                const user = AuthManager.login(name);
                DOM["name-modal"].classList.remove("active");
                startGame(user.playerName);
            }
        });
    }

    function startGame(playerName) {
        loadGame();
        createDynamicElements();
        if (playerName === "Saricon diz olá") {
            gameState.devMode = true;
            showToast("Modo de Desenvolvedor Ativado!");
        }
        addEventListeners();
        setInterval(saveGame, 5e3);
        setupStarfield();
        window.addEventListener("resize", setupStarfield);
        lastTick = performance.now();
        requestAnimationFrame(gameLoop);
        updateUI(true);
    }

    function addEventListeners() {
        DOM["data-orb"].addEventListener("click", mainClick);
        DOM["prestige-button"].addEventListener("click", prestigeReset);
        DOM["ability-overclock"].addEventListener("click", ()=>activateAbility("overclock"));
        DOM["ability-datadump"].addEventListener("click", ()=>activateAbility("datadump"));
        DOM["main-menu-button"].addEventListener("click", () => {
            if(DOM["main-modal"]) {
                DOM["main-modal"].classList.add("active");
                document.querySelector('.tab-button[data-tab="ranking-content"]').click();
            }
        });
        DOM["close-modal-button"].addEventListener("click", ()=>DOM["main-modal"].classList.remove("active"));
        DOM["close-launch-overlay-button"].addEventListener("click", () => {
            DOM["ship-launch-overlay"].classList.remove("active");
        });
        DOM["tabs"].addEventListener("click", e => {
            if (e.target.matches('.tab-button')) {
                const tabId = e.target.dataset.tab;
                document.querySelectorAll('.tab-button').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === tabId));
                updateModal(tabId);
            }
        });
        DOM["dev-add-data"].addEventListener("click",()=>{gameState.data+=1e8;});
        DOM["dev-add-kernels"].addEventListener("click",()=>{gameState.prestige.cores+=100;});
        DOM["dev-reset-cooldowns"].addEventListener("click",()=>{gameState.activeAbilities.overclock.cooldown_until=0;gameState.activeAbilities.datadump.cooldown_until=0;});
    }

    init();
});