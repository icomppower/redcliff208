/* =====================================================================
 *  flags.js — 赤壁之戰 208 · Battle of Red Cliffs
 *  Three painters: cao (slate 「曹」) · sun (red 「孫」) · liu (teal 「劉」)
 *  Bold surname glyph on faction field via ctx.fillText. Tested at 48×48.
 *  No real-world prohibited symbols — plain CJK glyph only.
 * ===================================================================== */
import { FAC } from "./config.js";
const W = 230, H = 150;

const flags = {

  cao: (c) => {
    // cold slate field
    c.fillStyle = "#38414a";
    c.fillRect(0, 0, W, H);
    // subtle horizontal band
    c.fillStyle = "rgba(255,255,255,0.07)";
    c.fillRect(0, H * 0.40, W, H * 0.20);
    // 「曹」 glyph
    c.fillStyle = "#c8cdd4";
    c.font = `bold ${Math.round(H * 0.62)}px "Microsoft JhengHei","PingFang TC","Noto Sans TC",serif`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("曹", W / 2, H / 2);
  },

  sun: (c) => {
    // warm red field
    c.fillStyle = "#b23a2e";
    c.fillRect(0, 0, W, H);
    // subtle diagonal shimmer
    c.fillStyle = "rgba(255,200,150,0.09)";
    c.fillRect(0, H * 0.38, W, H * 0.24);
    // 「孫」 glyph
    c.fillStyle = "#f5e0c8";
    c.font = `bold ${Math.round(H * 0.62)}px "Microsoft JhengHei","PingFang TC","Noto Sans TC",serif`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("孫", W / 2, H / 2);
  },

  liu: (c) => {
    // teal field
    c.fillStyle = "#1f6f6f";
    c.fillRect(0, 0, W, H);
    // subtle horizontal band
    c.fillStyle = "rgba(180,240,230,0.09)";
    c.fillRect(0, H * 0.40, W, H * 0.20);
    // 「劉」 glyph
    c.fillStyle = "#c8eeea";
    c.font = `bold ${Math.round(H * 0.62)}px "Microsoft JhengHei","PingFang TC","Noto Sans TC",serif`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("劉", W / 2, H / 2);
  },

};

const cache = {};
export function flagTexture(unit) {
  if (cache[unit.id]) return cache[unit.id];
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const c = cv.getContext("2d");
  const draw = flags[unit.flag] || flags[FAC[unit.faction]?.defaultFlag] || Object.values(flags)[0];
  draw(c);
  // left-edge shadow + border
  const sh = c.createLinearGradient(0, 0, W * 0.18, 0);
  sh.addColorStop(0, "rgba(0,0,0,0.28)");
  sh.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = sh; c.fillRect(0, 0, W * 0.18, H);
  c.strokeStyle = "rgba(0,0,0,0.48)"; c.lineWidth = 3;
  c.strokeRect(1.5, 1.5, W - 3, H - 3);
  const tex = new THREE.CanvasTexture(cv);
  tex.anisotropy = 4; tex.needsUpdate = true;
  cache[unit.id] = tex;
  return tex;
}
