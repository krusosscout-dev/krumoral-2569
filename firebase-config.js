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

// รูปภาพกระดานบันไดงูสำเร็จรูป
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

    return {
      config: {
        room_pin: roomPin,
        title: `ห้องทดลอง Active Learning (${roomPin})`,
        board_image_url: SAMPLE_BOARD_PRESETS[0].url,
        total_tiles: 40,
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

    const initialData = {
      config: {
        room_pin: roomPin,
        title: roomData.title || `ห้องเรียนเกมบันไดงู (${roomPin})`,
        board_image_url: roomData.board_image_url || SAMPLE_BOARD_PRESETS[0].url,
        total_tiles: parseInt(roomData.total_tiles) || 40,
        total_teams: totalTeamsCount,
        total_stations: Object.keys(stationsObj).length,
        finish_bonus: parseInt(roomData.finish_bonus) || 500,
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

  // ปลดล็อกฐาน (Force Vacant / Reset Lock)
  async forceUnlockStation(roomPin, stationId) {
    const data = this.getLocalRoom(roomPin);
    if (data?.stations?.[stationId]) {
      data.stations[stationId].is_vacant = true;
      data.stations[stationId].current_team_id = null;
      data.stations[stationId].occupied_at = null;
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
  async rollDiceAndMove(roomPin, teamId, diceValue) {
    let data = this.getLocalRoom(roomPin);
    if (!data) data = await this.createDemoRoomIfNotExist(roomPin);

    const config = data.config || {};
    const team = data.teams?.[teamId];
    if (!team) throw new Error("ไม่พบข้อมูลกลุ่ม");

    const totalTiles = parseInt(config.total_tiles) || 40;
    const oldTile = parseInt(team.current_tile) || 0;
    const newTile = Math.min(totalTiles, oldTile + diceValue);
    const history = team.dice_history ? [...team.dice_history, diceValue] : [diceValue];

    team.current_tile = newTile;
    team.dice_history = history;

    let reachedFinish = false;
    let finishBonus = 0;

    if (newTile >= totalTiles && !team.is_finished) {
      reachedFinish = true;
      finishBonus = parseInt(config.finish_bonus) || 500;
      team.score = (team.score || 0) + finishBonus;
      team.is_finished = true;
      team.finish_time = Date.now();

      if (!config.winner_team_id) {
        config.game_status = 'finished';
        config.winner_team_id = teamId;
      }
    }

    this.saveLocalRoom(roomPin, data);

    if (this.db) {
      try {
        const updates = {};
        updates[`teams/${teamId}/current_tile`] = newTile;
        updates[`teams/${teamId}/dice_history`] = history;
        if (reachedFinish) {
          updates[`teams/${teamId}/score`] = team.score;
          updates[`teams/${teamId}/is_finished`] = true;
          updates[`teams/${teamId}/finish_time`] = team.finish_time;
          if (config.winner_team_id === teamId) {
            updates['config/game_status'] = 'finished';
            updates['config/winner_team_id'] = teamId;
          }
        }
        this.withTimeout(this.getRoomRef(roomPin).update(updates));
      } catch(e) {}
    }

    return {
      newTile,
      reachedFinish,
      finishBonus
    };
  }

  // จัดสรรฐานกิจกรรมว่าง
  async assignVacantStation(roomPin, teamId) {
    let data = this.getLocalRoom(roomPin);
    if (!data) data = await this.createDemoRoomIfNotExist(roomPin);

    const team = data.teams?.[teamId];
    if (!team) throw new Error("ไม่พบข้อมูลกลุ่ม");

    const stations = data.stations || {};
    const completed = team.completed_stations || {};

    const availableStations = Object.values(stations).filter(st => {
      return st.is_vacant === true && !completed[st.id];
    });

    if (availableStations.length === 0) {
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

    const chosenStation = availableStations[Math.floor(Math.random() * availableStations.length)];

    chosenStation.is_vacant = false;
    chosenStation.current_team_id = teamId;
    chosenStation.occupied_at = Date.now();

    team.current_station_id = chosenStation.id;
    team.station_start_time = Date.now();

    this.saveLocalRoom(roomPin, data);

    if (this.db) {
      try {
        const updates = {};
        updates[`stations/${chosenStation.id}/is_vacant`] = false;
        updates[`stations/${chosenStation.id}/current_team_id`] = teamId;
        updates[`stations/${chosenStation.id}/occupied_at`] = Date.now();
        updates[`teams/${teamId}/current_station_id`] = chosenStation.id;
        updates[`teams/${teamId}/station_start_time`] = Date.now();
        this.withTimeout(this.getRoomRef(roomPin).update(updates));
      } catch(e) {}
    }

    return {
      success: true,
      station: chosenStation
    };
  }

  // ส่งคะแนนและปลดล็อกฐาน
  async submitStationScore(roomPin, teamId, stationId, score) {
    let data = this.getLocalRoom(roomPin);
    if (!data) data = await this.createDemoRoomIfNotExist(roomPin);

    const team = data.teams?.[teamId];
    const station = data.stations?.[stationId];
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

    if (station) {
      station.is_vacant = true;
      station.current_team_id = null;
      station.occupied_at = null;
    }

    this.saveLocalRoom(roomPin, data);

    if (this.db) {
      try {
        const updates = {};
        updates[`teams/${teamId}/score`] = newTotalScore;
        updates[`teams/${teamId}/completed_stations/${stationId}`] = {
          score: earnedScore,
          completed_at: Date.now()
        };
        updates[`teams/${teamId}/current_station_id`] = null;
        updates[`teams/${teamId}/station_start_time`] = null;

        if (station) {
          updates[`stations/${stationId}/is_vacant`] = true;
          updates[`stations/${stationId}/current_team_id`] = null;
          updates[`stations/${stationId}/occupied_at`] = null;
        }

        this.withTimeout(this.getRoomRef(roomPin).update(updates));
      } catch(e) {}
    }

    return {
      success: true,
      earnedScore,
      newTotalScore
    };
  }
}

// สร้าง Global Singleton Instance
window.PhygitalDB = new PhygitalFirebaseManager();
