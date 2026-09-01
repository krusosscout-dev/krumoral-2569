/**
 * Active Learning: Phygital Snakes and Ladders
 * Firebase Configuration & Database Manager
 */

const DEFAULT_FIREBASE_CONFIG_KEY = 'PHYGITAL_FIREBASE_CONFIG';
const DEFAULT_SAVED_ROOM_KEY = 'PHYGITAL_CURRENT_ROOM_PIN';

// Default Demo Configuration (ครูสามารถแก้ไขหรือใส่ Config ของตนเองผ่านหน้าเว็บได้)
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
    name: "ฐานที่ 2: ปริศนาวิทยาศาสตร์แสนกล",
    description: "ทำการทดลองสั้นและตอบคำถามปรากฏการณ์วิทยาศาสตร์ให้ถูกต้อง",
    timer_minutes: 4,
    max_score: 100,
    is_vacant: true,
    current_team_id: null,
    occupied_at: null,
    icon: "🔬"
  },
  {
    id: "station_3",
    name: "ฐานที่ 3: ต่อคำศัพท์ภาษาอังกฤษ",
    description: "ต่อบล็อกหรือเขียนคำศัพท์ภาษาอังกฤษตามหมวดหมู่ให้ได้มากที่สุดอย่างน้อย 10 คำ",
    timer_minutes: 3,
    max_score: 100,
    is_vacant: true,
    current_team_id: null,
    occupied_at: null,
    icon: "🔤"
  },
  {
    id: "station_4",
    name: "ฐานที่ 4: นักสืบประวัติศาสตร์และท้องถิ่น",
    description: "เรียงลำดับเหตุการณ์สำคัญทางประวัติศาสตร์และภูมิปัญญาไทยให้ถูกต้อง",
    timer_minutes: 3,
    max_score: 100,
    is_vacant: true,
    current_team_id: null,
    occupied_at: null,
    icon: "📜"
  },
  {
    id: "station_5",
    name: "ฐานที่ 5: ท้าทายโค้ดดิ้ง Unplugged",
    description: "เขียนชุดคำสั่งการ์ดลูกศร พาน้องหุ่นยนต์เดินผ่านอุปสรรคไปยังเป้าหมาย",
    timer_minutes: 4,
    max_score: 100,
    is_vacant: true,
    current_team_id: null,
    occupied_at: null,
    icon: "🤖"
  },
  {
    id: "station_6",
    name: "ฐานที่ 6: ศิลปะสร้างสรรค์และจินตนาการ",
    description: "ร่วมกันวาดภาพต่อเติมตามคีย์เวิร์ดที่ครูกำหนดและอธิบายความหมาย",
    timer_minutes: 3,
    max_score: 100,
    is_vacant: true,
    current_team_id: null,
    occupied_at: null,
    icon: "🎨"
  },
  {
    id: "station_7",
    name: "ฐานที่ 7: ขยับกายฟิตแอนด์เฟิร์ม",
    description: "ทำกิจกรรมเคลื่อนไหวร่างกาย กระโดดเชือกหรือต่อตัวสามัคคีตามโจทย์",
    timer_minutes: 2,
    max_score: 100,
    is_vacant: true,
    current_team_id: null,
    occupied_at: null,
    icon: "🏃"
  },
  {
    id: "station_8",
    name: "ฐานที่ 8: จิตอาสาพิทักษ์สิ่งแวดล้อม",
    description: "แยกขยะและตอบคำถามเกี่ยวกับการอนุรักษ์พลังงานในชีวิตประจำวัน",
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

// รูปภาพกระดานบันไดงูสำเร็จรูป (Curated Free Educational Boards)
const SAMPLE_BOARD_PRESETS = [
  {
    name: "กระดานแฟนตาซีเวทมนตร์ (Fantasy World)",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    tiles: 40
  },
  {
    name: "กระดานผจญภัยอวกาศ (Cosmic Galaxy)",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
    tiles: 40
  },
  {
    name: "กระดานป่ามหาสนุก (Jungle Adventure)",
    url: "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80",
    tiles: 36
  },
  {
    name: "กระดานมินิมอลโมเดิร์น (Clean Geometric)",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80",
    tiles: 50
  }
];

class PhygitalFirebaseManager {
  constructor() {
    this.app = null;
    this.db = null;
    this.connected = false;
    this.listeners = [];
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

  // เริ่มต้นเชื่อมต่อ Firebase
  initFirebase(customConfig = null) {
    const config = customConfig || this.getStoredConfig();
    if (!config) {
      return { success: false, message: "ยังไม่ได้ตั้งค่า Firebase Database URL" };
    }

    try {
      if (firebase.apps.length > 0) {
        // ลบแอปเดิมออกเพื่อ Re-initialize
        firebase.app().delete();
      }

      this.app = firebase.initializeApp(config);
      this.db = firebase.database();
      this.connected = true;

      return { success: true, db: this.db, config };
    } catch (error) {
      this.connected = false;
      console.error("Firebase init error:", error);
      return { success: false, error: error.message };
    }
  }

  // ทดสอบสถานะการเชื่อมต่อ (.info/connected)
  watchConnectionState(callback) {
    if (!this.db) return;
    const connectedRef = this.db.ref(".info/connected");
    connectedRef.on("value", (snap) => {
      this.connected = snap.val() === true;
      if (callback) callback(this.connected);
    });
  }

  // ดึง Reference ของ Room
  getRoomRef(roomPin) {
    if (!this.db) throw new Error("Firebase ยังไม่ได้เชื่อมต่อ");
    return this.db.ref(`rooms/${roomPin}`);
  }

  // ดึง Reference ของ Logs
  getLogsRef(roomPin) {
    return this.getRoomRef(roomPin).child('logs');
  }

  // สร้างห้องใหม่ (กำหนดจำนวนกลุ่ม 2-12 และจำนวนฐาน 2-12 ได้อย่างยืดหยุ่น)
  async createRoom(roomPin, roomData) {
    if (!this.db) throw new Error("Firebase ยังไม่ได้เชื่อมต่อ");
    const roomRef = this.getRoomRef(roomPin);
    
    // แปลง Array ของ Stations ให้เป็น Object Key (ตามจำนวนฐานที่ระบุ)
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

    // กำหนดกลุ่มตามจำนวนที่เลือก (เช่น 2 - 12 กลุ่ม)
    const totalTeamsCount = parseInt(roomData.total_teams) || 6;
    const teamsObj = roomData.teams || generateDefaultTeams(totalTeamsCount);

    const initialData = {
      config: {
        room_pin: roomPin,
        title: roomData.title || `ห้องเรียนเกมบันไดงู (${roomPin})`,
        board_image_url: roomData.board_image_url || SAMPLE_BOARD_PRESETS[0].url,
        total_tiles: parseInt(roomData.total_tiles) || 40,
        total_teams: totalTeamsCount,
        total_stations: Object.keys(stationsObj).length,
        finish_bonus: parseInt(roomData.finish_bonus) || 500,
        game_status: "waiting", // "waiting" | "playing" | "finished"
        winner_team_id: null,
        created_at: firebase.database.ServerValue.TIMESTAMP,
        updated_at: firebase.database.ServerValue.TIMESTAMP
      },
      stations: stationsObj,
      teams: teamsObj,
      logs: {}
    };

    await roomRef.set(initialData);

    // บันทึก Log เริ่มสร้างห้อง
    await this.addLog(roomPin, {
      team_id: "system",
      type: "system",
      message: `สร้างห้องเล่นเกม ${roomPin} สำเร็จ (${totalTeamsCount} กลุ่ม, ${Object.keys(stationsObj).length} ฐาน) พร้อมเริ่มการเรียนรู้!`
    });

    return initialData;
  }

  // สร้างหรือตรวจสอบห้องจำลองเริ่มต้น (Demo Simulation Room)
  async createDemoRoomIfNotExist(roomPin = '999999') {
    if (!this.db) return null;
    const roomRef = this.getRoomRef(roomPin);
    const snap = await roomRef.once('value');
    if (!snap.exists()) {
      return await this.createRoom(roomPin, {
        title: `ห้องทดลอง Active Learning (${roomPin})`,
        total_tiles: 40,
        total_teams: 6,
        total_stations: 10,
        finish_bonus: 500
      });
    }
    return snap.val();
  }

  // ดึงข้อมูลห้องเกมแบบ Realtime (Listener)
  listenToRoom(roomPin, callback) {
    if (!this.db) return null;
    const roomRef = this.getRoomRef(roomPin);
    const listener = roomRef.on("value", (snapshot) => {
      const val = snapshot.val();
      callback(val);
    });
    this.listeners.push({ ref: roomRef, listener });
    return listener;
  }

  // ยกเลิก Listeners ทั้งหมด
  detachAllListeners() {
    this.listeners.forEach(({ ref, listener }) => {
      ref.off("value", listener);
    });
    this.listeners = [];
  }

  // เพิ่ม Activity Log
  async addLog(roomPin, logData) {
    if (!this.db) return;
    const logsRef = this.getLogsRef(roomPin);
    const newLogRef = logsRef.push();
    return newLogRef.set({
      ...logData,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });
  }

  // อัปเดตสถานะเกม (waiting / playing / finished)
  async updateGameStatus(roomPin, status, winnerTeamId = null) {
    const updateObj = {
      'config/game_status': status,
      'config/updated_at': firebase.database.ServerValue.TIMESTAMP
    };
    if (winnerTeamId !== undefined) {
      updateObj['config/winner_team_id'] = winnerTeamId;
    }
    return this.getRoomRef(roomPin).update(updateObj);
  }

  // รีเซ็ตเกมใหม่ (เคลียร์คะแนน, ตำแหน่ง, ประวัติฐาน)
  async resetGame(roomPin) {
    if (!this.db) return;
    const roomRef = this.getRoomRef(roomPin);
    const snapshot = await roomRef.once('value');
    const data = snapshot.val();
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

    await roomRef.update({
      'config/game_status': 'waiting',
      'config/winner_team_id': null,
      'config/updated_at': firebase.database.ServerValue.TIMESTAMP,
      teams: resetTeams,
      stations: resetStations
    });

    await this.addLog(roomPin, {
      team_id: "system",
      type: "system",
      message: "🔄 รีเซ็ตข้อมูลเกมและคะแนนทั้งหมด พร้อมเริ่มรอบใหม่!"
    });
  }

  // ปลดล็อกฐาน (Force Vacant / Reset Lock)
  async forceUnlockStation(roomPin, stationId) {
    const updates = {};
    updates[`stations/${stationId}/is_vacant`] = true;
    updates[`stations/${stationId}/current_team_id`] = null;
    updates[`stations/${stationId}/occupied_at`] = null;
    return this.getRoomRef(roomPin).update(updates);
  }

  // ปรับคะแนนหรือช่องเดินของทีมโดยครูผู้สอน (Manual Override)
  async updateTeamData(roomPin, teamId, updateFields) {
    const updates = {};
    Object.keys(updateFields).forEach(k => {
      updates[`teams/${teamId}/${k}`] = updateFields[k];
    });
    return this.getRoomRef(roomPin).update(updates);
  }

  // ทอยลูกเต๋าและเดินตัวหมาก (สำหรับนักเรียน)
  async rollDiceAndMove(roomPin, teamId, diceValue) {
    if (!this.db) throw new Error("Firebase ยังไม่ได้เชื่อมต่อ");
    const roomRef = this.getRoomRef(roomPin);
    const snap = await roomRef.once('value');
    const data = snap.val();
    if (!data) throw new Error("ไม่พบห้องเกม");

    const config = data.config || {};
    const team = data.teams?.[teamId];
    if (!team) throw new Error("ไม่พบข้อมูลกลุ่ม");

    const totalTiles = parseInt(config.total_tiles) || 40;
    const oldTile = parseInt(team.current_tile) || 0;
    const newTile = Math.min(totalTiles, oldTile + diceValue);
    const history = team.dice_history ? [...team.dice_history, diceValue] : [diceValue];

    const updates = {};
    updates[`teams/${teamId}/current_tile`] = newTile;
    updates[`teams/${teamId}/dice_history`] = history;

    let reachedFinish = false;
    let finishBonus = 0;

    // ตรวจสอบว่าเข้าเส้นชัยหรือไม่
    if (newTile >= totalTiles && !team.is_finished) {
      reachedFinish = true;
      finishBonus = parseInt(config.finish_bonus) || 500;
      const newScore = (team.score || 0) + finishBonus;
      
      updates[`teams/${teamId}/score`] = newScore;
      updates[`teams/${teamId}/is_finished`] = true;
      updates[`teams/${teamId}/finish_time`] = firebase.database.ServerValue.TIMESTAMP;

      // ถ้ายังไม่มีผู้ชนะ ให้ทีมนี้เป็นผู้ชนะและสั่งจบเกม
      if (!config.winner_team_id) {
        updates['config/game_status'] = 'finished';
        updates['config/winner_team_id'] = teamId;
      }
    }

    await roomRef.update(updates);

    // บันทึก Activity Log
    await this.addLog(roomPin, {
      team_id: teamId,
      type: reachedFinish ? 'finish' : 'dice',
      message: reachedFinish
        ? `🏁 ${team.name} ทอยได้ ${diceValue} ก้าวสู่เส้นชัยช่อง ${newTile}! รับโบนัส +${finishBonus} คะแนน!`
        : `🎲 ${team.name} ทอยได้ ${diceValue} แต้ม เดินจากช่อง ${oldTile} ไปยังช่อง ${newTile}`
    });

    return {
      newTile,
      reachedFinish,
      finishBonus
    };
  }

  // ระบบจัดสรรฐานว่างอัจฉริยะ (Dynamic Station Assignment)
  async assignVacantStation(roomPin, teamId) {
    if (!this.db) throw new Error("Firebase ยังไม่ได้เชื่อมต่อ");
    const roomRef = this.getRoomRef(roomPin);
    const snap = await roomRef.once('value');
    const data = snap.val();
    if (!data) throw new Error("ไม่พบห้องเกม");

    const team = data.teams?.[teamId];
    if (!team) throw new Error("ไม่พบข้อมูลกลุ่ม");

    const stations = data.stations || {};
    const completed = team.completed_stations || {};

    // กรองหาฐานที่: 1) ว่างอยู่ (is_vacant === true) และ 2) กลุ่มนี้ยังไม่เคยเล่น (!completed[id])
    const availableStations = Object.values(stations).filter(st => {
      return st.is_vacant === true && !completed[st.id];
    });

    if (availableStations.length === 0) {
      // ตรวจสอบว่าเล่นครบทุกฐานแล้วหรือไม่
      const totalStationsCount = Object.keys(stations).length;
      const completedCount = Object.keys(completed).length;
      
      if (completedCount >= totalStationsCount && totalStationsCount > 0) {
        return {
          success: false,
          reason: 'all_completed',
          message: 'กลุ่มของคุณผ่านการทำกิจกรรมครบทุกฐานแล้ว!'
        };
      } else {
        return {
          success: false,
          reason: 'none_vacant',
          message: 'ขณะนี้ทุกฐานกิจกรรมมีเพื่อนกลุ่มอื่นกำลังเล่นอยู่ กรุณารอสักครู่...'
        };
      }
    }

    // สุ่มเลือก 1 ฐานจากฐานที่ว่าง
    const chosenStation = availableStations[Math.floor(Math.random() * availableStations.length)];

    // Atomic Lock ฐานใน Firebase
    const updates = {};
    updates[`stations/${chosenStation.id}/is_vacant`] = false;
    updates[`stations/${chosenStation.id}/current_team_id`] = teamId;
    updates[`stations/${chosenStation.id}/occupied_at`] = firebase.database.ServerValue.TIMESTAMP;

    updates[`teams/${teamId}/current_station_id`] = chosenStation.id;
    updates[`teams/${teamId}/station_start_time`] = firebase.database.ServerValue.TIMESTAMP;

    await roomRef.update(updates);

    // บันทึก Log การเข้าฐาน
    await this.addLog(roomPin, {
      team_id: teamId,
      type: 'station_enter',
      message: `🎯 ${team.name} เข้าสู่ "${chosenStation.name}"`
    });

    return {
      success: true,
      station: chosenStation
    };
  }

  // ส่งผลคะแนนฐานกิจกรรม ปลดล็อกฐาน และกลับสู่หน้าทอยเต๋า
  async submitStationScore(roomPin, teamId, stationId, score) {
    if (!this.db) throw new Error("Firebase ยังไม่ได้เชื่อมต่อ");
    const roomRef = this.getRoomRef(roomPin);
    const snap = await roomRef.once('value');
    const data = snap.val();
    if (!data) throw new Error("ไม่พบห้องเกม");

    const team = data.teams?.[teamId];
    const station = data.stations?.[stationId];
    if (!team) throw new Error("ไม่พบข้อมูลกลุ่ม");

    const earnedScore = Math.max(0, parseInt(score) || 0);
    const newTotalScore = (team.score || 0) + earnedScore;

    const updates = {};
    // อัปเดตคะแนนและบันทึกฐานที่ทำสำเร็จ
    updates[`teams/${teamId}/score`] = newTotalScore;
    updates[`teams/${teamId}/completed_stations/${stationId}`] = {
      score: earnedScore,
      completed_at: firebase.database.ServerValue.TIMESTAMP
    };
    updates[`teams/${teamId}/current_station_id`] = null;
    updates[`teams/${teamId}/station_start_time`] = null;

    // ปลดล็อกฐานให้ว่าง
    if (station) {
      updates[`stations/${stationId}/is_vacant`] = true;
      updates[`stations/${stationId}/current_team_id`] = null;
      updates[`stations/${stationId}/occupied_at`] = null;
    }

    await roomRef.update(updates);

    // บันทึก Log การบันทึกคะแนน
    await this.addLog(roomPin, {
      team_id: teamId,
      type: 'score',
      message: `⭐ ${team.name} ทำกิจกรรม "${station?.name || stationId}" ได้รับ +${earnedScore} คะแนน (รวม ${newTotalScore} แต้ม)`
    });

    return {
      success: true,
      earnedScore,
      newTotalScore
    };
  }
}

// สร้าง Global Singleton Instance
window.PhygitalDB = new PhygitalFirebaseManager();
