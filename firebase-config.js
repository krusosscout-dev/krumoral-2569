/**
 * Active Learning: Phygital Snakes and Ladders
 * Firebase Configuration & Database Manager
 * เพจตามติดชีวิต KruSos Edition
 */

const DEFAULT_FIREBASE_CONFIG_KEY = 'PHYGITAL_FIREBASE_CONFIG';
const DEFAULT_SAVED_ROOM_KEY = 'PHYGITAL_CURRENT_ROOM_PIN';

// Default Demo Configuration
const SAMPLE_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDemoKeyExampleOnlyForPreview123",
  authDomain: "phygital-snakes-ladders.firebaseapp.com",
  databaseURL: "https://phygital-snakes-ladders-default-rtdb.firebaseio.com",
  projectId: "phygital-snakes-ladders",
  storageBucket: "phygital-snakes-ladders.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// คลังสีและค่าเริ่มต้นสำหรับกลุ่มผู้เล่น (รองรับ 2 - 12 กลุ่ม)
const TEAM_COLOR_PALETTES = [
  { color: "#EF4444", defaultAvatar: "🦁", defaultName: "กลุ่มที่ 1 (สิงโตเพลิง)" },
  { color: "#3B82F6", defaultAvatar: "🐯", defaultName: "กลุ่มที่ 2 (พยัคฆ์คราม)" },
  { color: "#10B981", defaultAvatar: "🐉", defaultName: "กลุ่มที่ 3 (มังกรเขียว)" },
  { color: "#F59E0B", defaultAvatar: "🦅", defaultName: "กลุ่มที่ 4 (อินทรีทอง)" },
  { color: "#8B5CF6", defaultAvatar: "🦚", defaultName: "กลุ่มที่ 5 (ฟีนิกซ์ม่วง)" },
  { color: "#EC4899", defaultAvatar: "🐬", defaultName: "กลุ่มที่ 6 (วาฬชมพู)" },
  { color: "#06B6D4", defaultAvatar: "🦊", defaultName: "กลุ่มที่ 7 (จิ้งจอกสายฟ้า)" },
  { color: "#84CC16", defaultAvatar: "🐼", defaultName: "กลุ่มที่ 8 (แพนด้าพิทักษ์)" },
  { color: "#F97316", defaultAvatar: "🦄", defaultName: "กลุ่มที่ 9 (ยูนิคอร์นสุริยา)" },
  { color: "#64748B", defaultAvatar: "🤖", defaultName: "กลุ่มที่ 10 (หุ่นยนต์พิทักษ์)" },
  { color: "#D946EF", defaultAvatar: "🧙‍♂️", defaultName: "กลุ่มที่ 11 (จอมเวทแห่งแสง)" },
  { color: "#14B8A6", defaultAvatar: "🚀", defaultName: "กลุ่มที่ 12 (นักบินอวกาศ)" }
];

function generateDefaultTeams(count = 6) {
  const teams = {};
  const actualCount = Math.min(12, Math.max(2, parseInt(count) || 6));
  for (let i = 0; i < actualCount; i++) {
    const palette = TEAM_COLOR_PALETTES[i] || TEAM_COLOR_PALETTES[i % TEAM_COLOR_PALETTES.length];
    const teamId = `team_${i + 1}`;
    teams[teamId] = {
      id: teamId,
      name: palette.defaultName,
      color: palette.color,
      avatar: palette.defaultAvatar,
      current_tile: 0,
      score: 0,
      current_station_id: null,
      station_start_time: null,
      completed_stations: {},
      is_finished: false,
      finish_time: null,
      dice_history: []
    };
  }
  return teams;
}

const DEFAULT_TEAMS = generateDefaultTeams(6);

// ฐานกิจกรรมตัวอย่างสำหรับการจัดการเรียนรู้เชิงรุก (Active Learning 10 ฐาน)
const SAMPLE_ACTIVE_LEARNING_STATIONS = [
  {
    id: "station_1",
    name: "ฐานที่ 1: คิดเลขเร็วพิชิตมังกร",
    description: "ช่วยกันตอบคำถามคณิตศาสตร์คิดเลขเร็ว 5 ข้อ ให้ถูกต้องภายในเวลาที่กำหนด",
    timer_minutes: 3,
    max_score: 100,
    is_vacant: true,
    current_team_id: null,
    occupied_at: null,
    icon: "🧮"
  },
  {
    id: "station_2",
    name: "ฐานที่ 2: ตอบคำถามวิทย์ปริศนา",
    description: "สืบค้นและตอบคำถามการทดลองทางวิทยาศาสตร์ 3 ข้อ พร้อมอธิบายเหตุผล",
    timer_minutes: 4,
    max_score: 100,
    is_vacant: true,
    current_team_id: null,
    occupied_at: null,
    icon: "🔬"
  },
  {
    id: "station_3",
    name: "ฐานที่ 3: สะกดคำภาษาไทยพาสนุก",
    description: "เรียงการ์ดคำศัพท์และเขียนสะกดคำภาษาไทยให้ถูกต้องครบ 10 คำ",
    timer_minutes: 3,
    max_score: 100,
    is_vacant: true,
    current_team_id: null,
    occupied_at: null,
    icon: "📖"
  },
  {
    id: "station_4",
    name: "ฐานที่ 4: ใบ้คำภาษาอังกฤษ (Charades)",
    description: "ส่งตัวแทน 1 คนแสดงท่าทางใบ้คำศัพท์ภาษาอังกฤษ ให้เพื่อนในกลุ่มทายถูก 5 คำ",
    timer_minutes: 3,
    max_score: 100,
    is_vacant: true,
    current_team_id: null,
    occupied_at: null,
    icon: "🗣️"
  },
  {
    id: "station_5",
    name: "ฐานที่ 5: แผนที่ภูมิศาสตร์และประวัติศาสตร์",
    description: "ปักหมุดตำแหน่งสถานที่สำคัญทางประวัติศาสตร์และภูมิศาสตร์ลงบนแผนที่",
    timer_minutes: 4,
    max_score: 100,
    is_vacant: true,
    current_team_id: null,
    occupied_at: null,
    icon: "🗺️"
  },
  {
    id: "station_6",
    name: "ฐานที่ 6: ต่อเลโก้จำลองโครงสร้างวิศวกรรม",
    description: "ออกแบบและต่อตัวต่อโครงสร้างสะพานหรือหอคอยให้แข็งแรงและมั่นคง",
    timer_minutes: 5,
    max_score: 100,
    is_vacant: true,
    current_team_id: null,
    occupied_at: null,
    icon: "🧱"
  },
  {
    id: "station_7",
    name: "ฐานที่ 7: ภารกิจเขียนโค้ด Unplugged Coding",
    description: "วางการ์ดคำสั่งลูกศรนำทางพาหุ่นยนต์เดินทางผ่านเขาวงกตให้ถึงเป้าหมาย",
    timer_minutes: 4,
    max_score: 100,
    is_vacant: true,
    current_team_id: null,
    occupied_at: null,
    icon: "🤖"
  },
  {
    id: "station_8",
    name: "ฐานที่ 8: คัดแยกขยะรักษ์โลก (Green Earth)",
    description: "คัดแยกประเภทขยะลงถังขยะ 4 สีให้ถูกต้องและตอบคำถามเรื่องสิ่งแวดล้อม",
    timer_minutes: 3,
    max_score: 100,
    is_vacant: true,
    current_team_id: null,
    occupied_at: null,
    icon: "🌱"
  },
  {
    id: "station_9",
    name: "ฐานที่ 9: ดนตรีและจังหวะหรรษา",
    description: "เคาะจังหวะหรือร้องเพลงตามบทเรียนที่สุ่มได้ให้พร้อมเพรียงกัน",
    timer_minutes: 3,
    max_score: 100,
    is_vacant: true,
    current_team_id: null,
    occupied_at: null,
    icon: "🎵"
  },
  {
    id: "station_10",
    name: "ฐานที่ 10: สรุปความรู้ Mind Map รวมพลัง",
    description: "สรุปสิ่งที่ได้เรียนรู้ของบทเรียนลงในกระดาษชาร์ตขนาดใหญ่ร่วมกัน",
    timer_minutes: 5,
    max_score: 100,
    is_vacant: true,
    current_team_id: null,
    occupied_at: null,
    icon: "💡"
  }
];

// รูปภาพกระดานบันไดงูสำเร็จรูป (ระบบสร้างช่องเดิน ตัวเลข และบันได/งูให้อัตโนมัติ)
const SAMPLE_BOARD_PRESETS = [
  {
    name: "🏰 ปราสาทแฟนตาซีเวทมนตร์ (40 ช่อง)",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80",
    tiles: 40,
    grid_cols: 8,
    grid_direction: "serpentine_bottom_lr",
    tile_display_mode: "show_all",
    padding_x: 7,
    padding_y: 9,
    snakes_ladders: {
      "5": { to: 18, type: "ladder", message: "🧗‍♂️ ขึ้นบันไดเวทมนตร์! ลัดไปช่อง 18" },
      "14": { to: 32, type: "ladder", message: "🧗‍♂️ เจอประตูมิติ! วาร์ปไปช่อง 32" },
      "23": { to: 37, type: "ladder", message: "🧗‍♂️ ลิฟต์ปราสาทพาเหาะ! ลอยไปช่อง 37" },
      "17": { to: 4, type: "snake", message: "🐍 ตกบ่วงงูยักษ์! รูดลงไปช่อง 4" },
      "28": { to: 11, type: "snake", message: "🐍 กับดักห้องใต้ดิน! ถอยไปช่อง 11" },
      "38": { to: 19, type: "snake", message: "🐍 มังกรพ่นลมหมุน! ปลิวกลับไปช่อง 19" }
    }
  },
  {
    name: "🌌 กาแล็กซีอวกาศพิศวง (50 ช่อง)",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1400&q=80",
    tiles: 50,
    grid_cols: 10,
    grid_direction: "serpentine_bottom_lr",
    tile_display_mode: "show_all",
    padding_x: 7,
    padding_y: 9,
    snakes_ladders: {
      "7": { to: 22, type: "ladder", message: "🚀 อุโมงค์รูหนอน! วาร์ปไปช่อง 22" },
      "19": { to: 38, type: "ladder", message: "🚀 ไอพ่นความเร็วแสง! ทะยานไปช่อง 38" },
      "30": { to: 46, type: "ladder", message: "🚀 ยานแม่นำทาง! ลอยลำไปช่อง 46" },
      "24": { to: 9, type: "snake", message: "🛸 หลุมดำดูดกลืน! โดนดูดกลับไปช่อง 9" },
      "36": { to: 15, type: "snake", message: "🛸 ฝนดาวตกสกัด! ถอยไปตั้งหลักช่อง 15" },
      "48": { to: 26, type: "snake", message: "🛸 พายุสุริยะพัดกระหน่ำ! ถอยไปช่อง 26" }
    }
  },
  {
    name: "🌴 ผจญภัยป่าดึกดำบรรพ์ (36 ช่อง)",
    url: "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1400&q=80",
    tiles: 36,
    grid_cols: 6,
    grid_direction: "serpentine_bottom_lr",
    tile_display_mode: "show_all",
    padding_x: 7,
    padding_y: 9,
    snakes_ladders: {
      "4": { to: 16, type: "ladder", message: "🧗‍♂️ ปีนเถาวัลย์ยักษ์! ไต่ขึ้นไปช่อง 16" },
      "15": { to: 28, type: "ladder", message: "🧗‍♂️ เจอทางลับโบราณ! ลัดไปช่อง 28" },
      "21": { to: 34, type: "ladder", message: "🧗‍♂️ นกยักษ์โฉบพาบิน! เหินไปช่อง 34" },
      "18": { to: 6, type: "snake", message: "🐍 งูเหลือมยักษ์รัด! ถอยหลังกลับช่อง 6" },
      "26": { to: 10, type: "snake", message: "🐍 ตกบึงโคลนดูด! สไลด์ลงช่อง 10" },
      "33": { to: 19, type: "snake", message: "🐍 ไดโนเสาร์ไล่กวด! วิ่งหนีถอยไปช่อง 19" }
    }
  },
  {
    name: "🌊 ใต้ท้องทะเลลึกแอตแลนติส (40 ช่อง)",
    url: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=1400&q=80",
    tiles: 40,
    grid_cols: 8,
    grid_direction: "serpentine_bottom_lr",
    tile_display_mode: "show_all",
    padding_x: 7,
    padding_y: 9,
    snakes_ladders: {
      "6": { to: 19, type: "ladder", message: "🌊 กระแสน้ำอุ่นผลักดัน! ลอยลำไปช่อง 19" },
      "15": { to: 31, type: "ladder", message: "🧜‍♀️ นางเงือกช่วยว่ายน้ำ! พาลัดไปช่อง 31" },
      "22": { to: 38, type: "ladder", message: "🐬 โลมาพาเหาะข้ามคลื่น! วาร์ปไปช่อง 38" },
      "18": { to: 5, type: "snake", message: "🐙 หมึกยักษ์พ่นหมึกดำ! หลงทางถอยไปช่อง 5" },
      "27": { to: 12, type: "snake", message: "🌀 วังน้ำวนดูดดิ่ง! หมุนถอยลงไปช่อง 12" },
      "37": { to: 20, type: "snake", message: "🦈 ฉลามขาวไล่ล่า! หนีถอยกลับไปช่อง 20" }
    }
  },
  {
    name: "🏙️ เมืองไซเบอร์อนาคต (40 ช่อง)",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1400&q=80",
    tiles: 40,
    grid_cols: 8,
    grid_direction: "serpentine_bottom_lr",
    tile_display_mode: "show_all",
    padding_x: 7,
    padding_y: 9,
    snakes_ladders: {
      "3": { to: 17, type: "ladder", message: "⚡ เครือข่ายไฮเปอร์ลูป! พุ่งทะยานไปช่อง 17" },
      "13": { to: 30, type: "ladder", message: "⚡ สัญญาณควอนตัมบูสต์! วาร์ปไปช่อง 30" },
      "24": { to: 38, type: "ladder", message: "⚡ แท็กซี่โดรนบินด่วน! รุดหน้าไปช่อง 38" },
      "16": { to: 4, type: "snake", message: "⚠️ ไวรัสระบบโจมตี! โดนรีเซ็ตถอยไปช่อง 4" },
      "29": { to: 11, type: "snake", message: "⚠️ ไฟฟ้าลัดวงจรขัดข้อง! ถอยไปช่อง 11" },
      "36": { to: 18, type: "snake", message: "⚠️ สัญญาณตัดขาดกะทันหัน! ถอยกลับช่อง 18" }
    }
  },
  {
    name: "🏴‍☠️ เกาะมหาสมบัติโจรสลัด (40 ช่อง)",
    url: "pirate_board_100.jpg",
    tiles: 40,
    grid_cols: 8,
    grid_direction: "serpentine_bottom_lr",
    tile_display_mode: "show_all",
    padding_x: 7,
    padding_y: 9,
    snakes_ladders: {
      "4": { to: 18, type: "ladder", message: "🧭 เข็มทิศโจรสลัดนำทาง! ลัดไปช่อง 18" },
      "14": { to: 32, type: "ladder", message: "🗺️ แผนที่ลับนำทาง! วาร์ปไปช่อง 32" },
      "23": { to: 37, type: "ladder", message: "⛵ ลมมรสุมส่งท้าย! แล่นฉิวไปช่อง 37" },
      "17": { to: 6, type: "snake", message: "🍺 ลูกเรือเมาเหล้ารัม! ถอยหลังกลับช่อง 6" },
      "28": { to: 12, type: "snake", message: "🪨 เรือชนหินโสโครก! ถอยไปช่อง 12" },
      "38": { to: 20, type: "snake", message: "🐙 คราเคนฟาดหาง! โดนซัดถอยไปช่อง 20" }
    }
  }
];

// ฟังก์ชันคำนวณสุ่มตำแหน่งบันไดและงูอัตโนมัติอย่างชาญฉลาดและสมดุล (รองรับ 20, 30, 40, 50, 60, 80, 100 ช่อง)
function generateDynamicSnakesAndLadders(totalTiles = 40) {
  const total = parseInt(totalTiles) || 40;
  const result = {};
  const usedTiles = new Set([1, total]); // ห้ามสุ่มโดนจุดเริ่มและเส้นชัย

  // กำหนดจำนวนคู่บันไดและงูตามขนาดกระดาน
  let pairCount = 3;
  if (total <= 25) pairCount = 2;
  else if (total <= 50) pairCount = 3;
  else if (total <= 75) pairCount = 4;
  else pairCount = 5; // สำหรับ 100 ช่อง มี 5 บันได + 5 งู

  const ladderMessages = [
    "🧗‍♂️ ไต่บันไดลัด! พุ่งขึ้นไปช่อง {to}",
    "⚡ สัญญาณบูสต์พลัง! วาร์ปข้ามไปช่อง {to}",
    "🚀 จรวดเร่งความเร็ว! พุ่งทะยานไปช่อง {to}",
    "🌟 เก็บดาวนำโชค! เหินฟ้าไปช่อง {to}",
    "🦅 อินทรีย์ช่วยพาบิน! ลอยลำไปช่อง {to}"
  ];

  const snakeMessages = [
    "🐍 ตกหลุมพรางงูยักษ์! ถอยหลังกลับไปช่อง {to}",
    "⚠️ กับดักสกัดทาง! ถอยไปตั้งหลักช่อง {to}",
    "🌀 วังน้ำวนดูดดิ่ง! สไลด์ลงไปช่อง {to}",
    "💥 กับระเบิดสะเทือน! ถอยกลับไปช่อง {to}",
    "🌪️ ลมพายุพัดกระหน่ำ! ถอยหลังไปช่อง {to}"
  ];

  // 1. สุ่มบันได (Ladders) - เริ่มต้นโซนล่าง/กลาง ปีนขึ้นโซนสูง
  for (let i = 0; i < pairCount; i++) {
    let attempts = 0;
    while (attempts < 60) {
      attempts++;
      const minStart = Math.max(3, Math.floor((total / (pairCount + 1)) * i) + 2);
      const maxStart = Math.min(total - 5, Math.floor((total / (pairCount + 1)) * (i + 1)));
      const start = Math.floor(Math.random() * (maxStart - minStart + 1)) + minStart;

      const climbDistance = Math.floor(total * (0.18 + Math.random() * 0.25)) + 3;
      const end = Math.min(total - 1, start + climbDistance);

      if (!usedTiles.has(start) && !usedTiles.has(end) && end > start + 2) {
        usedTiles.add(start);
        usedTiles.add(end);
        const msg = ladderMessages[i % ladderMessages.length].replace('{to}', end);
        result[String(start)] = {
          to: end,
          type: "ladder",
          message: msg
        };
        break;
      }
    }
  }

  // 2. สุ่มงู (Snakes / Traps) - เริ่มต้นโซนกลาง/บน สไลด์ลงโซนล่าง
  for (let i = 0; i < pairCount; i++) {
    let attempts = 0;
    while (attempts < 60) {
      attempts++;
      const minStart = Math.max(8, Math.floor(total * 0.35) + Math.floor((total * 0.55 / pairCount) * i));
      const maxStart = Math.min(total - 2, Math.floor(total * 0.35) + Math.floor((total * 0.55 / pairCount) * (i + 1)));
      const start = Math.floor(Math.random() * (maxStart - minStart + 1)) + minStart;

      const dropDistance = Math.floor(total * (0.18 + Math.random() * 0.25)) + 3;
      const end = Math.max(2, start - dropDistance);

      if (!usedTiles.has(start) && !usedTiles.has(end) && start > end + 2) {
        usedTiles.add(start);
        usedTiles.add(end);
        const msg = snakeMessages[i % snakeMessages.length].replace('{to}', end);
        result[String(start)] = {
          to: end,
          type: "snake",
          message: msg
        };
        break;
      }
    }
  }

  return result;
}

class PhygitalFirebaseManager {
  constructor() {
    this.app = null;
    this.db = null;
    this.connected = false;
    this.listeners = [];
  }

  // Helper สำหรับเรียกสุ่มจุดงูและบันไดอัตโนมัติ
  generateDynamicSnakesAndLadders(totalTiles) {
    return generateDynamicSnakesAndLadders(totalTiles);
  }

  // Promise Timeout Wrapper ป้องกัน Network Hang
  async withTimeout(promise, ms = 1200) {
    if (!promise) return null;
    let timer;
    const timeoutPromise = new Promise(resolve => {
      timer = setTimeout(() => resolve(null), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
  }

  // ดึง Config จาก LocalStorage
  getStoredConfig() {
    try {
      const raw = localStorage.getItem(DEFAULT_FIREBASE_CONFIG_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Cannot parse saved Firebase Config:", e);
    }
    return null;
  }

  // บันทึก Config ลง LocalStorage
  saveConfig(config) {
    if (typeof config === 'string') {
      try {
        config = JSON.parse(config);
      } catch (e) {
        throw new Error("รูปแบบ JSON ไม่ถูกต้อง");
      }
    }
    if (!config.databaseURL) {
      throw new Error("ต้องระบุ databaseURL เช่น https://your-project-default-rtdb.firebaseio.com");
    }
    localStorage.setItem(DEFAULT_FIREBASE_CONFIG_KEY, JSON.stringify(config, null, 2));
    return config;
  }

  // ดึงข้อมูลห้องจาก Local Simulation Store
  getLocalRoom(roomPin) {
    try {
      const raw = localStorage.getItem(`PHYGITAL_LOCAL_ROOM_${roomPin}`);
      if (raw) return JSON.parse(raw);
    } catch(e) {}

    // สร้างห้องจำลองอัตโนมัติหากเป็น PIN 999999 หรือ 123456
    if (roomPin === '999999' || roomPin === '123456') {
      const demoData = this.generateDemoRoomData(roomPin);
      this.saveLocalRoom(roomPin, demoData);
      return demoData;
    }
    return null;
  }

  // บันทึกห้องลง Local Simulation Store
  saveLocalRoom(roomPin, data) {
    try {
      localStorage.setItem(`PHYGITAL_LOCAL_ROOM_${roomPin}`, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('phygital_room_update', { detail: { pin: roomPin, data } }));
    } catch(e) {}
  }

  // สร้างโครงสร้างข้อมูลห้องจำลอง
  generateDemoRoomData(roomPin) {
    const stationsObj = {};
    SAMPLE_ACTIVE_LEARNING_STATIONS.forEach((st, idx) => {
      const stId = st.id || `station_${idx + 1}`;
      stationsObj[stId] = {
        id: stId,
        name: st.name,
        description: st.description,
        timer_minutes: st.timer_minutes || 3,
        max_score: st.max_score || 100,
        is_vacant: true,
        current_team_id: null,
        occupied_at: null,
        icon: st.icon || "🎯"
      };
    });

    const defaultPreset = SAMPLE_BOARD_PRESETS[0];

    return {
      config: {
        room_pin: roomPin,
        title: `ห้องเรียน Active Learning (${roomPin})`,
        board_image_url: defaultPreset.url,
        total_tiles: defaultPreset.tiles || 40,
        game_duration_minutes: 40,
        game_started_at: Date.now(),
        grid_cols: defaultPreset.grid_cols || 8,
        grid_direction: defaultPreset.grid_direction || "serpentine_bottom_lr",
        tile_display_mode: defaultPreset.tile_display_mode || "show_all",
        padding_x: defaultPreset.padding_x || 7,
        padding_y: defaultPreset.padding_y || 9,
        snakes_ladders: defaultPreset.snakes_ladders || {},
        total_teams: 6,
        total_stations: 10,
        finish_bonus: 500,
        game_status: "playing",
        winner_team_id: null,
        created_at: Date.now(),
        updated_at: Date.now()
      },
      stations: stationsObj,
      teams: generateDefaultTeams(6),
      logs: {}
    };
  }

  // เริ่มต้นเชื่อมต่อ Firebase (มี Fallback อัตโนมัติ)
  initFirebase(customConfig = null) {
    const config = customConfig || this.getStoredConfig() || SAMPLE_FIREBASE_CONFIG;

    try {
      if (typeof firebase !== 'undefined' && firebase.apps) {
        if (firebase.apps.length > 0) {
          this.app = firebase.apps[0];
        } else if (config) {
          this.app = firebase.initializeApp(config);
        }
        if (this.app && typeof firebase.database === 'function') {
          this.db = firebase.database();
          this.connected = true;
        }
      }
      return { success: true, db: this.db, config };
    } catch (error) {
      this.connected = false;
      return { success: false, error: error.message };
    }
  }

  // ทดสอบสถานะการเชื่อมต่อ (.info/connected)
  watchConnectionState(callback) {
    if (!this.db) return;
    try {
      const connectedRef = this.db.ref(".info/connected");
      connectedRef.on("value", (snap) => {
        this.connected = snap.val() === true;
        if (callback) callback(this.connected);
      });
    } catch(e) {}
  }

  // ดึง Reference ของ Room
  getRoomRef(roomPin) {
    if (this.db) {
      return this.db.ref(`rooms/${roomPin}`);
    }
    return null;
  }

  // ดึง Reference ของ Logs
  getLogsRef(roomPin) {
    if (this.db) {
      return this.getRoomRef(roomPin).child('logs');
    }
    return null;
  }

  // สร้างห้องใหม่ (กำหนดจำนวนกลุ่ม 2-12 และจำนวนฐาน 2-12 ได้อย่างยืดหยุ่น)
  async createRoom(roomPin, roomData) {
    const stationsObj = {};
    let stationsList = roomData.stations || SAMPLE_ACTIVE_LEARNING_STATIONS;
    if (roomData.total_stations && parseInt(roomData.total_stations) > 0) {
      const targetCount = parseInt(roomData.total_stations);
      stationsList = SAMPLE_ACTIVE_LEARNING_STATIONS.slice(0, targetCount);
    }

    stationsList.forEach((st, idx) => {
      const stId = st.id || `station_${idx + 1}`;
      stationsObj[stId] = {
        id: stId,
        name: st.name || `ฐานที่ ${idx + 1}`,
        description: st.description || "",
        timer_minutes: parseInt(st.timer_minutes) || 3,
        max_score: parseInt(st.max_score) || 100,
        is_vacant: true,
        current_team_id: null,
        occupied_at: null,
        icon: st.icon || "🎯"
      };
    });

    const totalTeamsCount = parseInt(roomData.total_teams) || 6;
    const teamsObj = roomData.teams || generateDefaultTeams(totalTeamsCount);

    const totalTiles = parseInt(roomData.total_tiles) || 40;
    let snakesLadders = roomData.snakes_ladders;
    if (!snakesLadders || roomData.randomize_snakes_ladders) {
      snakesLadders = generateDynamicSnakesAndLadders(totalTiles);
    }

    const initialData = {
      config: {
        room_pin: roomPin,
        title: roomData.title || `ห้องเรียนเกมบันไดงู (${roomPin})`,
        board_image_url: roomData.board_image_url || SAMPLE_BOARD_PRESETS[0].url,
        total_tiles: totalTiles,
        game_duration_minutes: parseInt(roomData.game_duration_minutes) || 40,
        game_started_at: Date.now(),
        total_teams: totalTeamsCount,
        total_stations: Object.keys(stationsObj).length,
        finish_bonus: parseInt(roomData.finish_bonus) || 500,
        snakes_ladders: snakesLadders,
        game_status: "playing",
        winner_team_id: null,
        created_at: Date.now(),
        updated_at: Date.now()
      },
      stations: stationsObj,
      teams: teamsObj,
      logs: {}
    };

    // บันทึกลง Local Storage เสมอ
    this.saveLocalRoom(roomPin, initialData);

    // บันทึกลง Firebase แบบ Non-blocking
    if (this.db) {
      try {
        const roomRef = this.getRoomRef(roomPin);
        this.withTimeout(roomRef.set(initialData));
        this.addLog(roomPin, {
          team_id: "system",
          type: "system",
          message: `สร้างห้องเล่นเกม ${roomPin} สำเร็จ (${totalTeamsCount} กลุ่ม, ${Object.keys(stationsObj).length} ฐาน)`
        });
      } catch (e) {}
    }

    return initialData;
  }

  // สร้างหรือตรวจสอบห้องจำลองเริ่มต้น (Demo Simulation Room)
  async createDemoRoomIfNotExist(roomPin = '999999') {
    const local = this.getLocalRoom(roomPin);
    if (local) return local;

    return await this.createRoom(roomPin, {
      title: `ห้องทดลอง Active Learning (${roomPin})`,
      total_tiles: 40,
      total_teams: 6,
      total_stations: 10,
      finish_bonus: 500
    });
  }

  // ดึงข้อมูลห้องเกมแบบ Realtime (Listener พร้อม Local Fallback ทันที)
  listenToRoom(roomPin, callback) {
    let localData = this.getLocalRoom(roomPin);
    if (localData) {
      callback(localData);
    }

    if (this.db) {
      try {
        const roomRef = this.getRoomRef(roomPin);
        const listener = roomRef.on("value", (snapshot) => {
          const val = snapshot.val();
          if (val) {
            this.saveLocalRoom(roomPin, val);
            callback(val);
          } else if (!localData) {
            if (roomPin === '999999' || roomPin === '123456') {
              this.createDemoRoomIfNotExist(roomPin).then(d => {
                if (d) callback(d);
              });
            } else {
              callback(null);
            }
          }
        }, (err) => {
          if (localData) callback(localData);
        });
        this.listeners.push({ ref: roomRef, listener });
        return listener;
      } catch(e) {
        if (localData) callback(localData);
      }
    }

    // Local Storage Listener
    const onLocalUpdate = (e) => {
      if (e.detail?.pin === roomPin && e.detail?.data) {
        callback(e.detail.data);
      }
    };
    window.addEventListener('phygital_room_update', onLocalUpdate);

    return null;
  }

  // ยกเลิก Listeners ทั้งหมด
  detachAllListeners() {
    this.listeners.forEach(({ ref, listener }) => {
      try { ref.off("value", listener); } catch(e) {}
    });
    this.listeners = [];
  }

  // เพิ่ม Activity Log
  async addLog(roomPin, logData) {
    if (!this.db) return;
    try {
      const logsRef = this.getLogsRef(roomPin);
      const newLogRef = logsRef.push();
      this.withTimeout(newLogRef.set({
        ...logData,
        timestamp: Date.now()
      }));
    } catch(e) {}
  }

  // อัปเดตสถานะเกม (waiting / playing / finished)
  async updateGameStatus(roomPin, status, winnerTeamId = null) {
    const local = this.getLocalRoom(roomPin) || {};
    if (!local.config) local.config = {};
    local.config.game_status = status;
    local.config.updated_at = Date.now();
    if (winnerTeamId !== undefined) {
      local.config.winner_team_id = winnerTeamId;
    }
    this.saveLocalRoom(roomPin, local);

    if (this.db) {
      try {
        const updateObj = {
          'config/game_status': status,
          'config/updated_at': Date.now()
        };
        if (winnerTeamId !== undefined) {
          updateObj['config/winner_team_id'] = winnerTeamId;
        }
        this.withTimeout(this.getRoomRef(roomPin).update(updateObj));
      } catch(e) {}
    }
  }

  // รีเซ็ตเกมใหม่ (เคลียร์คะแนน, ตำแหน่ง, ประวัติฐาน)
  async resetGame(roomPin) {
    const data = this.getLocalRoom(roomPin);
    if (!data) return;

    // รีเซ็ตทีม
    const resetTeams = {};
    Object.keys(data.teams || DEFAULT_TEAMS).forEach(teamKey => {
      const orig = data.teams[teamKey] || DEFAULT_TEAMS[teamKey];
      resetTeams[teamKey] = {
        ...orig,
        current_tile: 0,
        score: 0,
        current_station_id: null,
        station_start_time: null,
        completed_stations: {},
        is_finished: false,
        finish_time: null,
        dice_history: []
      };
    });

    // รีเซ็ตฐานให้ว่างทั้งหมด
    const resetStations = {};
    Object.keys(data.stations || {}).forEach(stKey => {
      resetStations[stKey] = {
        ...data.stations[stKey],
        is_vacant: true,
        current_team_id: null,
        occupied_at: null
      };
    });

    data.config.game_status = 'playing';
    data.config.winner_team_id = null;
    data.config.updated_at = Date.now();
    data.teams = resetTeams;
    data.stations = resetStations;
    this.saveLocalRoom(roomPin, data);

    if (this.db) {
      try {
        const roomRef = this.getRoomRef(roomPin);
        this.withTimeout(roomRef.update({
          'config/game_status': 'playing',
          'config/winner_team_id': null,
          'config/updated_at': Date.now(),
          teams: resetTeams,
          stations: resetStations
        }));
      } catch(e) {}
    }
  }

  // ปลดล็อกฐานเดี่ยว (Force Vacant / Reset Lock)
  async forceUnlockStation(roomPin, stationId) {
    const data = this.getLocalRoom(roomPin);
    if (data?.stations?.[stationId]) {
      const occupantTeamId = data.stations[stationId].current_team_id;
      data.stations[stationId].is_vacant = true;
      data.stations[stationId].current_team_id = null;
      data.stations[stationId].occupied_at = null;

      if (occupantTeamId && data.teams?.[occupantTeamId]) {
        if (data.teams[occupantTeamId].current_station_id === stationId) {
          data.teams[occupantTeamId].current_station_id = null;
          data.teams[occupantTeamId].station_start_time = null;
        }
      }
      this.saveLocalRoom(roomPin, data);
    }

    if (this.db) {
      try {
        const updates = {};
        updates[`stations/${stationId}/is_vacant`] = true;
        updates[`stations/${stationId}/current_team_id`] = null;
        updates[`stations/${stationId}/occupied_at`] = null;
        this.withTimeout(this.getRoomRef(roomPin).update(updates));
      } catch(e) {}
    }
  }

  // ปลดล็อกทุกฐานในห้องให้ว่างทั้งหมดทันที (Unlock All Stations)
  async unlockAllStations(roomPin) {
    const data = this.getLocalRoom(roomPin);
    if (!data) return;

    const updates = {};
    if (data.stations) {
      Object.keys(data.stations).forEach(stId => {
        data.stations[stId].is_vacant = true;
        data.stations[stId].current_team_id = null;
        data.stations[stId].occupied_at = null;
        updates[`stations/${stId}/is_vacant`] = true;
        updates[`stations/${stId}/current_team_id`] = null;
        updates[`stations/${stId}/occupied_at`] = null;
      });
    }

    if (data.teams) {
      Object.keys(data.teams).forEach(teamId => {
        data.teams[teamId].current_station_id = null;
        data.teams[teamId].station_start_time = null;
        updates[`teams/${teamId}/current_station_id`] = null;
        updates[`teams/${teamId}/station_start_time`] = null;
      });
    }

    this.saveLocalRoom(roomPin, data);

    if (this.db) {
      try {
        await this.withTimeout(this.getRoomRef(roomPin).update(updates));
      } catch(e) {}
    }

    return { success: true };
  }

  // ปรับคะแนนหรือข้อมูลทีม
  async updateTeamData(roomPin, teamId, updateFields) {
    const data = this.getLocalRoom(roomPin);
    if (data?.teams?.[teamId]) {
      Object.keys(updateFields).forEach(k => {
        data.teams[teamId][k] = updateFields[k];
      });
      this.saveLocalRoom(roomPin, data);
    }

    if (this.db) {
      try {
        const updates = {};
        Object.keys(updateFields).forEach(k => {
          updates[`teams/${teamId}/${k}`] = updateFields[k];
        });
        this.withTimeout(this.getRoomRef(roomPin).update(updates));
      } catch(e) {}
    }
    return { success: true };
  }

  // ทอยลูกเต๋าและเดินตัวหมาก
  // ทอยลูกเต๋าและเดินตัวหมาก (ระบบแข่งขันตามเวลา เล่นวนรอบต่อเนื่องได้ไม่สิ้นสุด)
  async rollDiceAndMove(roomPin, teamId, diceValue) {
    let data = this.getLocalRoom(roomPin);
    if (!data) data = await this.createDemoRoomIfNotExist(roomPin);

    const config = data.config || {};
    const team = data.teams?.[teamId];
    if (!team) throw new Error("ไม่พบข้อมูลกลุ่ม");

    const totalTiles = parseInt(config.total_tiles) || 40;
    const oldTile = parseInt(team.current_tile) || 0;
    let rawTile = oldTile + diceValue;
    let reachedFinish = false;
    let finishBonus = 0;

    // ตรวจสอบการเข้าเส้นชัย (ได้โบนัส + วนรอบเล่นต่อทันที)
    if (rawTile >= totalTiles) {
      reachedFinish = true;
      finishBonus = parseInt(config.finish_bonus) || 500;
      team.score = (team.score || 0) + finishBonus;
      team.laps_completed = (team.laps_completed || 0) + 1;
      
      // วนรอบกลับมาเดินต่อที่จุดเริ่มต้น
      if (rawTile === totalTiles) {
        rawTile = totalTiles;
      } else {
        rawTile = ((rawTile - 1) % totalTiles) + 1;
      }

      this.addLog(roomPin, {
        team_id: teamId,
        type: 'finish',
        message: `🏆 ${team.name} เข้าเส้นชัยรอบที่ ${team.laps_completed}! (+${finishBonus} แต้มโบนัส) และกำลังเล่นต่อรอบใหม่`
      });
    }

    let finalTile = rawTile;
    let warpEvent = null;

    // Check Snakes and Ladders warp
    const snakesLadders = config.snakes_ladders || {};
    if (snakesLadders[String(finalTile)]) {
      const warp = snakesLadders[String(finalTile)];
      warpEvent = {
        from: finalTile,
        to: warp.to,
        type: warp.type,
        message: warp.message
      };
      finalTile = warp.to;
    }

    const history = team.dice_history ? [...team.dice_history, diceValue] : [diceValue];

    team.current_tile = finalTile;
    team.dice_history = history;
    team.is_finished = false; // เล่นต่อเนื่องได้ตลอดจนหมดเวลาควบคุมของแอดมิน!

    this.saveLocalRoom(roomPin, data);

    if (this.db) {
      try {
        const updates = {};
        updates[`teams/${teamId}/current_tile`] = finalTile;
        updates[`teams/${teamId}/dice_history`] = history;
        updates[`teams/${teamId}/score`] = team.score;
        updates[`teams/${teamId}/laps_completed`] = team.laps_completed || 0;
        updates[`teams/${teamId}/is_finished`] = false;
        this.withTimeout(this.getRoomRef(roomPin).update(updates));
      } catch(e) {}
    }

    return {
      landedTile: rawTile,
      newTile: finalTile,
      warpEvent,
      reachedFinish,
      finishBonus,
      lapsCompleted: team.laps_completed || 0
    };
  }

  // จัดสรรฐานกิจกรรมว่าง (พร้อมระบบปลดล็อกฐานเดิมอัตโนมัติ: 1 กลุ่ม = 1 ฐานเท่านั้น)
  async assignVacantStation(roomPin, teamId) {
    let data = this.getLocalRoom(roomPin);
    if (!data) data = await this.createDemoRoomIfNotExist(roomPin);

    const team = data.teams?.[teamId];
    if (!team) throw new Error("ไม่พบข้อมูลกลุ่ม");

    const stations = data.stations || {};
    const updates = {};

    // 1. ปลดล็อกฐานเดิมทั้งหมดที่กลุ่มนี้อาจเคยถือครองอยู่ก่อนให้ว่าง 100%
    Object.keys(stations).forEach(stId => {
      if (stations[stId].current_team_id === teamId) {
        stations[stId].is_vacant = true;
        stations[stId].current_team_id = null;
        stations[stId].occupied_at = null;
        updates[`stations/${stId}/is_vacant`] = true;
        updates[`stations/${stId}/current_team_id`] = null;
        updates[`stations/${stId}/occupied_at`] = null;
      }
    });

    const completed = team.completed_stations || {};

    let availableStations = Object.values(stations).filter(st => {
      return st.is_vacant === true && !completed[st.id];
    });

    // If all stations completed by this team, allow replay to keep earning score!
    if (availableStations.length === 0) {
      availableStations = Object.values(stations).filter(st => st.is_vacant === true);
    }
    // If all stations occupied by other teams, allow parallel activity!
    if (availableStations.length === 0) {
      availableStations = Object.values(stations);
    }

    if (availableStations.length === 0) {
      return {
        success: false,
        reason: 'no_stations',
        message: 'ยังไม่มีฐานกิจกรรมในระบบ'
      };
    }

    const chosenStation = availableStations[Math.floor(Math.random() * availableStations.length)];

    chosenStation.is_vacant = false;
    chosenStation.current_team_id = teamId;
    chosenStation.occupied_at = Date.now();

    team.current_station_id = chosenStation.id;
    team.station_start_time = Date.now();

    updates[`stations/${chosenStation.id}/is_vacant`] = false;
    updates[`stations/${chosenStation.id}/current_team_id`] = teamId;
    updates[`stations/${chosenStation.id}/occupied_at`] = Date.now();
    updates[`teams/${teamId}/current_station_id`] = chosenStation.id;
    updates[`teams/${teamId}/station_start_time`] = Date.now();

    this.saveLocalRoom(roomPin, data);

    if (this.db) {
      try {
        this.withTimeout(this.getRoomRef(roomPin).update(updates));
      } catch(e) {}
    }

    return {
      success: true,
      station: chosenStation
    };
  }

  // ส่งคะแนนและปลดล็อกฐานอัตโนมัติ
  async submitStationScore(roomPin, teamId, stationId, score) {
    let data = this.getLocalRoom(roomPin);
    if (!data) data = await this.createDemoRoomIfNotExist(roomPin);

    const team = data.teams?.[teamId];
    const stations = data.stations || {};
    if (!team) throw new Error("ไม่พบข้อมูลกลุ่ม");

    const earnedScore = Math.max(0, parseInt(score) || 0);
    const newTotalScore = (team.score || 0) + earnedScore;

    team.score = newTotalScore;
    if (!team.completed_stations) team.completed_stations = {};
    team.completed_stations[stationId] = {
      score: earnedScore,
      completed_at: Date.now()
    };
    team.current_station_id = null;
    team.station_start_time = null;

    const updates = {};
    updates[`teams/${teamId}/score`] = newTotalScore;
    updates[`teams/${teamId}/completed_stations/${stationId}`] = {
      score: earnedScore,
      completed_at: Date.now()
    };
    updates[`teams/${teamId}/current_station_id`] = null;
    updates[`teams/${teamId}/station_start_time`] = null;

    // ปลดล็อกฐานทั้งหมดที่กลุ่มนี้ถือครองอยู่
    Object.keys(stations).forEach(stId => {
      if (stId === stationId || stations[stId].current_team_id === teamId) {
        stations[stId].is_vacant = true;
        stations[stId].current_team_id = null;
        stations[stId].occupied_at = null;
        updates[`stations/${stId}/is_vacant`] = true;
        updates[`stations/${stId}/current_team_id`] = null;
        updates[`stations/${stId}/occupied_at`] = null;
      }
    });

    this.saveLocalRoom(roomPin, data);

    if (this.db) {
      try {
        this.withTimeout(this.getRoomRef(roomPin).update(updates));
      } catch(e) {}
    }

    return {
      success: true,
      score: earnedScore,
      totalScore: newTotalScore
    };
  }
}

// สร้าง Global Singleton Instance
window.PhygitalDB = new PhygitalFirebaseManager();
