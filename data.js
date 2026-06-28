/* =====================================================================
 *  data.js — 赤壁之戰 208 · Battle of Red Cliffs (redcliff208)
 *  Narrated history-map documentary · Three Kingdoms / 三國
 *  Cinematic posture. Bilingual 繁中 + English.
 *  Narrative follows 《三國演義》ch. 43–50 with historicity chips.
 *  Engine fork: keithligh/cinematic-3d-battle-engine (MIT)
 * ===================================================================== */
window.BATTLE_DATA = (function () {

  const factions = {
    cao: {
      main: 0x5a6472, glow: 0x8898aa, dim: 0x2a3038, css: "#5a6472",
      name_zh: "曹軍", name_en: "Cao Cao's Army",
      role: "attacker", maxStrength: 800, defaultFlag: "cao",
    },
    sun: {
      main: 0xb23a2e, glow: 0xe06050, dim: 0x7a1e14, css: "#b23a2e",
      name_zh: "孫吳", name_en: "Sun Wu",
      role: "defender", maxStrength: 500, defaultFlag: "sun",
    },
    liu: {
      main: 0x1f8f8f, glow: 0x40c0b8, dim: 0x0d5050, css: "#1f8f8f",
      name_zh: "劉備", name_en: "Liu Bei",
      role: "defender", maxStrength: 200, defaultFlag: "liu",
    },
  };

  // Geo box: ~160 km × 100 km covering 赤壁, 烏林, 華容道 corridor
  // Yangtze at 赤壁 ≈ 29.72 N 113.92 E · 烏林 ≈ 29.80 N 113.68 E
  // Inner safe zone (>8% from each edge): lng 113.05–114.35, lat 29.39–30.11
  const meta = {
    geo: { minLng: 112.6, maxLng: 114.8, minLat: 29.2, maxLat: 30.3, Z: 9 },
    dayMin: 1, dayMax: 9.5, year: 208, month: 11, lastDay: 9,
    vexag: 3.5,           // hilly Yangtze riverbank — do NOT pin to 2.0
    showStrength: false,
    title: "赤壁之戰",
    subtitle: "Battle of Red Cliffs 208 AD — Three Kingdoms Narrated History Map",
    dir: "ltr",
    theme: {
      grade: { vignette: 0.35, grain: 0.18, brightness: 0.98 },
      sky:   { day: "#9fb6c8", night: "#0a0a1e" },
      sea:   "#2b3a45",      // Yangtze tint
    },
  };

  const ui = {
    boot: {
      dem: "載入地形中…", imagery: "載入衛星圖像中…",
      terrain: "建構地形中…", music: "載入音樂中…", starting: "啟動中…",
    },
    frontLine: { zh: "前線", en: "Front line" },
    strengthUnit: "", endLabel: "終",
    sceneLabel: "208 AD · {day}",
    notesCaveatsHeader: "說明", notesSourcesHeader: "資料來源",
    langToggle: { both: "中·EN", zh: "中", en: "EN" },
    notesBtn: "ⓘ 說明", notesHeader: "說明與資料來源",
    resume: "▶ 繼續",
    hint: { autoplay: "自動播放中", drag: "拖曳自由視角（暫停導覽）" },
    legend: {
      symbolsHeader: "圖例", flagsHeader: "部隊",
      advance: "進軍", hq: "指揮所", infantry: "步兵",
      air: "空中", navy: "水軍", artillery: "砲兵",
      contact: "接觸中", strength: "兵力",
      movement: "移動", combat: "戰鬥 / 炮擊", lost: "損失 / 殲滅",
    },
    disclaimer: "地圖影像 © EOX Sentinel-2 cloudless 2016 (CC BY 4.0, s2maps.eu) · 高程 SRTM courtesy USGS · 揚子江河道自 208 AD 迄今已偏移，現代衛星影像僅供地形參考",
  };

  const intro = {
    title_zh: "赤壁之戰 · 208 AD", title_en: "Battle of Red Cliffs · 208 AD",
    sub_zh: "三國鼎立的關鍵一戰", sub_en: "The battle that shaped the Three Kingdoms",
    cam: { lng: 113.60, lat: 29.75, dist: 1800, az: 5, el: 50 },
  };

  const outro = {
    title_zh: "赤壁定三分", title_en: "Red Cliffs Divides the Realm",
    narration_zh: "一場火攻，奠定三國鼎立格局。曹操退守北方，孫權穩據江東，劉備取得荊南。此後四十五年，天下三分。",
    narration_en: "A single fire attack fixed the three-way split. Cao holds the north, Sun holds the east, Liu takes southern Jing. The realm stays divided for forty-five years.",
    cam: { lng: 113.30, lat: 29.80, dist: 2800, az: 350, el: 55, orbit: 0.6, tween: 3.5 },
  };

  const flagLegend = [
    { flag: "cao", zh: "曹軍 · 曹操", en: "Cao Cao's Army", faction: "cao" },
    { flag: "sun", zh: "孫吳 · 孫權 / 周瑜", en: "Sun Wu — Sun Quan / Zhou Yu", faction: "sun" },
    { flag: "liu", zh: "劉備軍 · 關羽 / 張飛", en: "Liu Bei's Force", faction: "liu" },
  ];

  const geography = {
    regions: [
      { name_zh: "長江", name_en: "Yangtze River", type: "region", lng: 113.80, lat: 29.76 },
      { name_zh: "赤壁", name_en: "Red Cliffs", type: "fort", lng: 113.92, lat: 29.69 },
      { name_zh: "烏林", name_en: "Wulin (Cao Camp)", type: "fort", lng: 113.66, lat: 29.82 },
      { name_zh: "華容道", name_en: "Huarong Road", type: "town", lng: 113.22, lat: 29.74 },
      { name_zh: "江陵 / 荊州", name_en: "Jiangling / Jingzhou", type: "town", lng: 113.06, lat: 30.18 },
    ],
    lines: [],
  };

  // ── UNITS ──────────────────────────────────────────────────────────────
  // Safe inner zone: lng 113.05–114.35, lat 29.39–30.11
  // 烏林 north bank ≈ 29.80 N, 113.68 E  (Cao fleet anchorage)
  // 赤壁 south bank ≈ 29.70 N, 113.90 E  (Zhou Yu HQ)

  const units = [

    // ── 曹軍 ──────────────────────────────────────────────────────────────

    // 連環船 row: 3 navy units spaced west→east along north bank
    { id: "cao-fleet-w", faction: "cao", kind: "navy", flag: "cao",
      name_zh: "曹軍水師 (西)", name_en: "Cao Fleet — West",
      type: "連環船 chained warships — west anchor",
      track: [
        { d: 1.5, lng: 113.54, lat: 29.81, s: 600, st: "hold" },
        { d: 5.5, lng: 113.54, lat: 29.81, s: 600, st: "hold" },
        { d: 7.0, lng: 113.54, lat: 29.82, s: 300, st: "dead" },
      ]},

    { id: "cao-fleet-c", faction: "cao", kind: "navy", flag: "cao",
      name_zh: "曹軍水師 (中)", name_en: "Cao Fleet — Centre",
      type: "連環船 chained warships — centre",
      track: [
        { d: 1.5, lng: 113.66, lat: 29.82, s: 700, st: "hold" },
        { d: 5.5, lng: 113.66, lat: 29.82, s: 700, st: "hold" },
        { d: 7.2, lng: 113.66, lat: 29.83, s: 300, st: "dead" },
      ]},

    { id: "cao-fleet-e", faction: "cao", kind: "navy", flag: "cao",
      name_zh: "曹軍水師 (東)", name_en: "Cao Fleet — East",
      type: "連環船 chained warships — east anchor",
      track: [
        { d: 1.5, lng: 113.78, lat: 29.82, s: 600, st: "hold" },
        { d: 5.5, lng: 113.78, lat: 29.82, s: 600, st: "hold" },
        { d: 7.4, lng: 113.78, lat: 29.83, s: 200, st: "dead" },
      ]},

    // 蔡瑁 / 張允 — die in Act 2 (反間計)
    { id: "cao-caimao", faction: "cao", kind: "command", flag: "cao",
      name_zh: "蔡瑁・張允", name_en: "Cai Mao / Zhang Yun",
      type: "曹水軍督 — 曹操水軍主將，死於反間計",
      track: [
        { d: 1.5, lng: 113.71, lat: 29.82, s: 300, st: "hold" },
        { d: 2.1, lng: 113.71, lat: 29.82, s: 0,   st: "dead" },
      ]},

    // 曹操中軍旗艦 — flees NW in Act 8
    { id: "cao-hq", faction: "cao", kind: "command", flag: "cao",
      name_zh: "曹操中軍", name_en: "Cao Cao HQ",
      type: "曹操旗艦 — 赤壁後撤退華容道",
      track: [
        { d: 1.5, lng: 113.64, lat: 29.83, s: 700, st: "hold"    },
        { d: 7.5, lng: 113.64, lat: 29.83, s: 500, st: "retreat" },
        { d: 8.0, lng: 113.30, lat: 29.79, s: 400, st: "retreat" },
        { d: 8.5, lng: 113.10, lat: 30.08, s: 350, st: "retreat" },
      ]},

    // 曹軍陸營 — shore infantry, partly lost Act 7–8
    { id: "cao-infantry", faction: "cao", kind: "infantry", flag: "cao",
      name_zh: "曹軍陸營", name_en: "Cao Shore Camp",
      type: "曹軍陸上大營 — 烏林",
      track: [
        { d: 1.5, lng: 113.60, lat: 29.84, s: 800, st: "hold"    },
        { d: 7.5, lng: 113.60, lat: 29.84, s: 400, st: "retreat" },
        { d: 8.5, lng: 113.10, lat: 30.05, s: 200, st: "retreat" },
      ]},

    // ── 孫吳 ──────────────────────────────────────────────────────────────

    // 周瑜大營 (旗艦) — 赤壁 south bank
    { id: "sun-hq", faction: "sun", kind: "command", flag: "sun",
      name_zh: "周瑜大營", name_en: "Zhou Yu HQ",
      type: "孫吳水軍都督 — 赤壁南岸指揮所",
      track: [
        { d: 1.5, lng: 113.90, lat: 29.69, s: 500, st: "hold" },
        { d: 9.0, lng: 113.90, lat: 29.69, s: 500, st: "hold" },
      ]},

    // 周瑜水師 — 赤壁 south bank
    { id: "sun-navy", faction: "sun", kind: "navy", flag: "sun",
      name_zh: "周瑜水師", name_en: "Zhou Yu's Fleet",
      type: "孫吳主力艦隊 — 赤壁南岸",
      track: [
        { d: 1.5, lng: 113.84, lat: 29.72, s: 450, st: "hold"  },
        { d: 7.0, lng: 113.84, lat: 29.72, s: 450, st: "march" },
        { d: 7.8, lng: 113.74, lat: 29.76, s: 450, st: "hold"  },
        { d: 9.0, lng: 113.74, lat: 29.76, s: 450, st: "hold"  },
      ]},

    // 黃蓋火船 — south→north assault in Act 7 (the decisive strike)
    { id: "sun-huanggai", faction: "sun", kind: "navy", flag: "sun",
      name_zh: "黃蓋火船", name_en: "Huang Gai Fire Ships",
      type: "詐降火船 — 東南風助火，突擊烏林連環船",
      track: [
        { d: 6.5, lng: 113.88, lat: 29.71, s: 350, st: "hold"   },
        { d: 7.0, lng: 113.75, lat: 29.77, s: 350, st: "march"  },
        { d: 7.2, lng: 113.66, lat: 29.82, s: 300, st: "attack" },
        { d: 7.5, lng: 113.62, lat: 29.84, s: 0,   st: "dead"   },
      ]},

    // Act 1: Sun strategic position (east anchor, 柴桑 direction)
    { id: "sun-caisang", faction: "sun", kind: "command", flag: "sun",
      name_zh: "柴桑 · 孫權大本營", name_en: "Chaisang — Sun Quan Base",
      type: "孫吳後方大本營 — 孫劉結盟前出發地",
      track: [
        { d: 1.0, lng: 114.26, lat: 29.80, s: 400, st: "hold" },
        { d: 2.5, lng: 114.26, lat: 29.80, s: 400, st: "hold" },
        { d: 3.0, lng: 114.26, lat: 29.80, s: 0,   st: "hold" },
      ]},

    // Act 3: 草船借箭 — arrow rain (optional air FX mid-river)
    { id: "sun-arrows", faction: "sun", kind: "air", flag: "sun",
      name_zh: "借箭艦隊 (霧中)", name_en: "Straw-Boat Arrow Decoys",
      type: "草船借箭 — 演義：霧夜漂船，引曹軍射箭十萬",
      track: [
        { d: 2.9, lng: 113.78, lat: 29.77, s: 200, st: "hold"   },
        { d: 3.0, lng: 113.72, lat: 29.79, s: 200, st: "march"  },
        { d: 3.2, lng: 113.68, lat: 29.80, s: 200, st: "hold"   },
        { d: 3.4, lng: 113.85, lat: 29.73, s: 200, st: "retreat"},
        { d: 3.6, lng: 113.85, lat: 29.73, s: 0,   st: "hold"   },
      ]},

    // ── 劉備 ──────────────────────────────────────────────────────────────

    // 劉備聯盟部隊 — initially near 赤壁 south, pursues via 華容道 in Act 8
    { id: "liu-guan", faction: "liu", kind: "infantry", flag: "liu",
      name_zh: "關羽・劉備陸軍", name_en: "Guan Yu / Liu Bei Infantry",
      type: "劉備所部 — 關羽鎮守華容道；義釋曹操（演義）",
      track: [
        { d: 1.5, lng: 113.90, lat: 29.66, s: 200, st: "hold"   },
        { d: 7.5, lng: 113.90, lat: 29.66, s: 200, st: "hold"   },
        { d: 8.0, lng: 113.28, lat: 29.75, s: 200, st: "march"  },
        { d: 8.5, lng: 113.15, lat: 29.72, s: 200, st: "hold"   },
        { d: 9.0, lng: 113.15, lat: 29.72, s: 200, st: "hold"   },
      ]},

    // Act 1: Cao strategic anchor (江陵 / west)
    { id: "cao-jiangling", faction: "cao", kind: "command", flag: "cao",
      name_zh: "曹操大軍 · 江陵", name_en: "Cao's Main Force — Jiangling",
      type: "曹操平定荊州後屯兵江陵，順江東下",
      track: [
        { d: 1.0, lng: 113.08, lat: 30.09, s: 700, st: "hold"   },
        { d: 1.5, lng: 113.25, lat: 29.96, s: 700, st: "march"  },
        { d: 2.0, lng: 113.56, lat: 29.85, s: 700, st: "hold"   },
        { d: 2.5, lng: 113.56, lat: 29.85, s: 0,   st: "hold"   },
      ]},

    // Act 9: three-faction settlement markers (post-battle zones)
    { id: "sun-jiangdong", faction: "sun", kind: "command", flag: "sun",
      name_zh: "孫吳 · 江東", name_en: "Sun Wu — Jiangdong",
      type: "赤壁後孫吳穩定江東版圖",
      track: [
        { d: 9.0, lng: 114.18, lat: 29.98, s: 500, st: "hold" },
      ]},

    { id: "liu-jingnan", faction: "liu", kind: "command", flag: "liu",
      name_zh: "劉備 · 荊南", name_en: "Liu Bei — Jingnan",
      type: "赤壁後劉備取荊南四郡",
      track: [
        { d: 9.0, lng: 113.50, lat: 29.42, s: 300, st: "hold" },
      ]},

  ];

  // ── ARROWS ─────────────────────────────────────────────────────────────

  const arrows = [
    // Act 1: Cao advance east along river
    { f: "cao", from: [113.08, 30.09], to: [113.60, 29.83], d: 1.0, kind: "advance", label: "曹操東進 — Cao's army moves east" },
    // Act 7: Huang Gai fire-ship assault south→north
    { f: "sun", from: [113.88, 29.71], to: [113.66, 29.82], d: 7.0, kind: "attack",  label: "黃蓋火船突擊 — fire ships attack Wulin" },
    // Act 8: Cao's retreat NW via 華容道
    { f: "cao", from: [113.64, 29.83], to: [113.08, 30.09], d: 8.0, kind: "retreat", label: "曹操敗走華容道 — Cao flees Huarong Road" },
    // Act 8: Liu infantry intercept
    { f: "liu", from: [113.90, 29.66], to: [113.22, 29.73], d: 8.0, kind: "attack",  label: "關羽截擊 — Guan Yu's ambush position" },
    // Act 9: Sun expansion
    { f: "sun", from: [113.90, 29.69], to: [114.18, 29.98], d: 9.0, kind: "advance", label: "孫吳定江東 — Sun secures Jiangdong" },
    // Act 9: Liu expansion south
    { f: "liu", from: [113.90, 29.66], to: [113.50, 29.45], d: 9.0, kind: "advance", label: "劉備取荊南 — Liu Bei takes Jingnan" },
  ];

  const fronts = [];

  // ── WEATHER ────────────────────────────────────────────────────────────

  const weather = [
    { d: 1.0, night: 0.00, fog: 0.08, rain: 0.0, smoke: 0.00, zh: "江上晴朗",           en: "Clear over the Yangtze — armies converge"   },
    { d: 2.0, night: 0.00, fog: 0.10, rain: 0.0, smoke: 0.00, zh: "冬霧漸起",           en: "Winter mist thickens — the river closes"    },
    { d: 3.0, night: 0.60, fog: 0.40, rain: 0.0, smoke: 0.00, zh: "霧夜 — 草船借箭",   en: "Foggy night — straw-boat arrow raid"        },
    { d: 4.0, night: 0.00, fog: 0.12, rain: 0.0, smoke: 0.00, zh: "苦肉計定",           en: "Huang Gai's staged beating — the plan set"  },
    { d: 6.0, night: 0.85, fog: 0.05, rain: 0.0, smoke: 0.00, zh: "夜 · 東南風起",     en: "Night — southeast wind rises"               },
    { d: 7.0, night: 0.95, fog: 0.05, rain: 0.0, smoke: 0.55, zh: "火攻 · 連環船大火", en: "Fire attack — the chained fleet burns"       },
    { d: 7.5, night: 0.95, fog: 0.00, rain: 0.0, smoke: 0.80, zh: "烈火烏林",           en: "Wulin ablaze — peak inferno"                },
    { d: 8.5, night: 0.40, fog: 0.15, rain: 0.0, smoke: 0.30, zh: "曹操敗退",           en: "Cao's retreat — smoke lingers"              },
    { d: 9.0, night: 0.00, fog: 0.10, rain: 0.0, smoke: 0.08, zh: "三分定局 · 天明",   en: "Three kingdoms settled — dawn breaks"        },
  ];

  // ── HOTSPOTS ───────────────────────────────────────────────────────────

  const hotspots = [
    // Act 2: 蔡瑁/張允 execution at 烏林
    { a: 2.0, b: 2.2, kind: "explosion",  lng: 113.71, lat: 29.82, i: 0.4 },
    // Act 7: 黃蓋 fire ship impact — cascade of fleet burning west to east
    { a: 7.0, b: 7.6, kind: "firefight",  lng: 113.72, lat: 29.81, i: 0.9 },
    { a: 7.1, b: 7.7, kind: "explosion",  lng: 113.54, lat: 29.81, i: 0.85 },
    { a: 7.2, b: 7.8, kind: "explosion",  lng: 113.66, lat: 29.82, i: 0.90 },
    { a: 7.3, b: 7.9, kind: "explosion",  lng: 113.78, lat: 29.82, i: 0.80 },
    { a: 7.5, b: 8.0, kind: "firefight",  lng: 113.62, lat: 29.84, i: 0.70 },
    // Act 8: 華容道 skirmish
    { a: 8.0, b: 8.3, kind: "firefight",  lng: 113.22, lat: 29.75, i: 0.35 },
  ];

  // ── STORYBOARD (9 acts) ────────────────────────────────────────────────

  const storyboard = [

    // ACT 1 — 孫劉結盟・舌戰群儒 【演義】
    { day: 1.0, hold: 11,
      cam: { lng: 113.60, lat: 29.85, dist: 2200, az: 280, el: 48, orbit: 0.6 },
      title_zh: "孫劉結盟", title_en: "The Sun–Liu Alliance",
      dateLabel: "208 AD · Act 1",
      narration_zh: '<span class="cc variant">演義</span> 曹操破荊州，順江東下。諸葛亮過江舌戰群儒，說服孫權聯劉抗曹。',
      narration_en: '<span class="cc variant">演義</span> Cao Cao sweeps through Jing and moves east along the Yangtze. Zhuge Liang crosses the river to forge the Sun–Liu pact against Cao.',
      side: "cao", focus: ["cao-jiangling", "sun-caisang", "liu-guan"], commanders: [] },

    // ACT 2 — 群英會・蔣幹中計 【演義】
    { day: 2.0, hold: 10,
      cam: { lng: 113.68, lat: 29.82, dist: 800, az: 180, el: 36, orbit: 0.7 },
      title_zh: "群英會・蔣幹中計", title_en: "The Banquet — The Double Cross",
      dateLabel: "208 AD · Act 2",
      narration_zh: '<span class="cc variant">演義</span> 周瑜設群英會，反間計誑蔣幹。曹操中計，自斷水軍之手——蔡瑁、張允伏誅。',
      narration_en: '<span class="cc variant">演義</span> Zhou Yu plants a forged letter at his own banquet. Cao Cao falls for the ruse and executes his two best navy commanders — Cai Mao and Zhang Yun.',
      side: "sun", focus: ["cao-caimao", "sun-hq", "cao-fleet-c"], commanders: [] },

    // ACT 3 — 草船借箭 【演義】
    { day: 3.0, hold: 10,
      cam: { lng: 113.76, lat: 29.79, dist: 700, az: 355, el: 32, orbit: 0.8 },
      title_zh: "草船借箭", title_en: "The Straw-Boat Arrow Raid",
      dateLabel: "208 AD · Act 3",
      narration_zh: '<span class="cc variant">演義</span> 諸葛亮趁霧夜驅草船，逼近烏林。曹軍齊射，草束插箭十萬。一夜之間，孫劉聯軍補足矢矢。',
      narration_en: '<span class="cc variant">演義</span> In thick fog Zhuge Liang drifts straw boats toward Cao\'s lines. Cao\'s archers fill them with 100,000 arrows — delivered free to the allied fleet by dawn.',
      side: "sun", focus: ["sun-arrows", "cao-fleet-c", "cao-fleet-e"], commanders: [] },

    // ACT 4 — 苦肉計・黃蓋詐降 【演義 · 詐降正史】
    { day: 4.0, hold: 10,
      cam: { lng: 113.88, lat: 29.70, dist: 750, az: 0, el: 34, orbit: 0.6 },
      title_zh: "苦肉計・黃蓋詐降", title_en: "The Bitter-Flesh Ruse — Feigned Surrender",
      dateLabel: "208 AD · Act 4",
      narration_zh: '<span class="cc variant">演義</span> 黃蓋受苦肉計，遞詐降書——詐降本身見於《三國志》正史，苦肉計之說則是演義渲染。',
      narration_en: '<span class="cc variant">演義</span> · <span class="cc canon">正史</span> Huang Gai submits a surrender letter to Cao Cao. The feigned defection itself is attested in the <em>Sanguozhi</em>; the elaborate self-flogging performance is the novel\'s embellishment.',
      side: "sun", focus: ["sun-huanggai", "sun-hq", "cao-hq"], commanders: [] },

    // ACT 5 — 龐統獻連環計 【演義】
    { day: 5.0, hold: 9,
      cam: { lng: 113.66, lat: 29.82, dist: 650, az: 200, el: 30, orbit: 0.5 },
      title_zh: "龐統獻連環計", title_en: "Pang Tong's Chained-Ships Stratagem",
      dateLabel: "208 AD · Act 5",
      narration_zh: '<span class="cc variant">演義</span> 龐統設計說服曹操以鐵鏈相連諸船——船連是史，「連環計」則出自演義之筆。曹軍北方將士苦於暈船，連船確能穩陣，卻也埋下火攻的禍根。',
      narration_en: '<span class="cc variant">演義</span> Pang Tong persuades Cao to chain his ships together — the chaining itself is historical (northern troops suffered seasickness), but the idea of a planted strategist is the novel\'s invention. The chain solves one problem and creates a fatal one.',
      side: "cao", focus: ["cao-fleet-w", "cao-fleet-c", "cao-fleet-e"], commanders: [] },

    // ACT 6 — 七星壇借東風 【傳說】
    { day: 6.0, hold: 10,
      cam: { lng: 113.90, lat: 29.68, dist: 900, az: 20, el: 38, orbit: 0.7 },
      title_zh: "七星壇借東風", title_en: "The Wind Altar",
      dateLabel: "208 AD · Act 6",
      narration_zh: '<span class="cc staging">傳說</span> 諸葛亮登七星壇作法，東南風起。實為冬至前後長江中游之季節性東南季風——諸葛亮懂得觀象，演義將之神化。',
      narration_en: '<span class="cc staging">傳說</span> Zhuge Liang performs a ritual at his altar and the southeast wind rises. In fact it is a seasonal winter southeasterly common on the middle Yangtze — he read the weather; the novel made it a miracle.',
      side: "sun", focus: ["sun-hq", "sun-huanggai"], commanders: [] },

    // ACT 7 — 火燒連環船 (火攻烏林) 【正史核心】
    { day: 7.0, hold: 14,
      cam: { lng: 113.70, lat: 29.78, dist: 600, az: 350, el: 28, orbit: 0.8 },
      title_zh: "火燒連環船", title_en: "Fire on the Chained Fleet",
      dateLabel: "208 AD · Act 7",
      narration_zh: '<span class="cc canon">正史</span> 東南風大起，黃蓋率火船順風突進。連環船互縛，無法散開——火烈風猛，曹軍大敗，烏林盡成火海。',
      narration_en: '<span class="cc canon">正史</span> The southeast wind rises. Huang Gai\'s fire ships ride it straight into the chained Cao fleet. Unable to scatter, ship after ship ignites. Wulin burns. This is the historical core of the battle.',
      side: "sun", focus: ["sun-huanggai", "cao-fleet-w", "cao-fleet-c", "cao-fleet-e", "cao-hq"], commanders: [] },

    // ACT 8 — 曹操敗走華容道・關羽義釋 【正史敗退 + 演義義釋】
    { day: 8.0, hold: 10,
      cam: { lng: 113.35, lat: 29.80, dist: 900, az: 310, el: 38, orbit: 0.6 },
      title_zh: "敗走華容道", title_en: "Retreat on the Huarong Road",
      dateLabel: "208 AD · Act 8",
      narration_zh: '<span class="cc canon">正史</span> 曹操經華容道敗退江陵——疫病肆虐、自燒餘船，均見正史。<span class="cc variant">演義</span> 關羽途中義釋曹操——此乃演義之義，史無記載。',
      narration_en: '<span class="cc canon">正史</span> Cao retreats northwest through the Huarong marshes — plague, self-burnt ships, and a shattered army: all historical. <span class="cc variant">演義</span> Guan Yu intercepts him but lets him go out of old loyalty — that act of mercy is the novel\'s, not the record\'s.',
      side: "cao", focus: ["cao-hq", "cao-infantry", "liu-guan"], commanders: [] },

    // ACT 9 — 赤壁定三分 【正史】
    { day: 9.0, hold: 12,
      cam: { lng: 113.55, lat: 29.75, dist: 2600, az: 5, el: 54, orbit: 0.5 },
      title_zh: "赤壁定三分", title_en: "Red Cliffs Divides the Realm",
      dateLabel: "208 AD · Act 9",
      narration_zh: '<span class="cc canon">正史</span> 一場火攻，奠定三國鼎立格局。曹操退守北方，孫權穩據江東，劉備取得荊南。此後四十五年，天下三分。',
      narration_en: '<span class="cc canon">正史</span> One fire fixed the three-way split: Cao north of the river, Sun Quan in Jiangdong, Liu Bei taking southern Jing. The realm stays divided for forty-five years — until Jin\'s reunification in 280 AD.',
      side: "sun", focus: ["sun-jiangdong", "liu-jingnan", "cao-hq"], commanders: [] },

  ];

  // ── NOTES ──────────────────────────────────────────────────────────────

  const notes = {
    summary: "赤壁之戰 208 AD — 本地圖依循《三國演義》戲劇線，每則敘事標示史實可信度晶片：正史（《三國志》）、演義（小說渲染）、爭議（史家存疑）、傳說（戲曲神化）。Battle of Red Cliffs 208 AD — this map follows the Romance of the Three Kingdoms dramatic line, with each caption carrying a historicity chip: 正史 canon, 演義 variant, 爭議 disputed, 傳說 legend.",
    caveats: [
      "揚子江河道：208 AD 實際河道與現代2016 Sentinel-2衛星影像有明顯差異，約1,800年間河道多次偏移。地圖僅作地形參考。(爭議)",
      "兵力數字：曹操號稱「八十萬」，史學界估計實際南下人數約20–23萬，其中水師數量存疑。(爭議)",
      "赤壁確切位置：學界對「赤壁」具體地點仍有爭議，本圖採蒲圻/赤壁市說（湖北省）。(爭議)",
      "草船借箭：此事《三國志》未載，原型見諸葛瑾於吳書；本圖標示為演義。(演義)",
      "七星壇借東風：純屬演義渲染，實為長江中游冬季東南季風；本圖標示為傳說。(傳說)",
      "關羽義釋曹操：《三國志》記曹操走小道逃脫，未見關羽截擊記載；此段為演義。(演義)",
      "Yangtze channel shift: the 2016 Sentinel-2 imagery shows the modern channel, which differs substantially from 208 AD. (爭議/approx)",
      "Troop numbers: Cao Cao claimed 800,000; historians estimate ~200,000–230,000 actually moved south. (爭議)",
      "Exact Red Cliffs site: disputed; this map uses the Puqi / Chibi City identification (Hubei). (爭議)",
    ],
    sources: "Primary: 《三國志》裴松之注 (陳壽, 280–290 AD) — 火攻 (Act 7)、詐降 (Act 4)、曹操敗退 (Act 8) 正史依據。《三國演義》(羅貫中, c.1330–1400) — 群英會 (Act 2)、草船借箭 (Act 3)、苦肉計 (Act 4)、七星壇 (Act 6)、關羽義釋 (Act 8) 演義來源。Secondary: Rafe de Crespigny, 'Fire over Luoyang: A History of the Later Han Dynasty' (2016); Achilles Fang, 'The Chronicle of the Three Kingdoms' (1952); 盧弼 《三國志集解》. Music: 請於 music/ 目錄放置授權音樂檔案，並取消 index.html 中 <audio> 標籤的注釋。Terrain: EOX Sentinel-2 cloudless 2016 (CC BY 4.0, s2maps.eu) · SRTM courtesy USGS (public domain). Engine: cinematic-3d-battle-engine by Keith Li (MIT licence, github.com/keithligh/cinematic-3d-battle-engine).",
  };

  return { meta, factions, ui, intro, outro, flagLegend, geography, units, arrows, fronts, weather, hotspots, storyboard, notes };
})();
