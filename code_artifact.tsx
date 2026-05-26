import React, { useState, useEffect } from 'react';
import { 
  MapPin, Train, Shield, Car, BedDouble, 
  Users, User, CheckCircle2, XCircle, 
  LayoutDashboard, ExternalLink, Navigation,
  Building, ArrowLeft, Maximize, Compass, Zap,
  Lock, Unlock, Edit3, Save, Image as ImageIcon,
  Plus, Trash2
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// 初始化雲端資料庫環境
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// 圖標映射表
const iconMap = { Car, Train, Users, Shield };

// 初始模擬數據
const initialApartments = [
  {
    id: 'apt-001',
    name: '九龍仔劍橋道3號 學生公寓',
    shortName: '劍橋道3號',
    location: '近城大/浸會/都會，步行兩分鐘可至小巴站',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    tags: ['近城大/浸會', '男女分層', '拎包入住'],
    description: '入住後早上有7人座商務車免費接送上學，周邊學區環繞，安靜舒適。',
    info: {
      transport: [
        { icon: 'Car', text: '入住後早上有 7人座商務車免費接送上學（工作時間提供往返 CityU 和 BU）。' },
        { icon: 'Train', text: '距離九龍塘地鐵站步行約 15 分鐘，乘小巴僅需 5 分鐘。公寓100米左右即是小巴站。' }
      ],
      features: [
        { icon: 'Users', text: '男女分開樓層' },
        { icon: 'Shield', text: '獨立門禁，互不相通' }
      ],
      facilities: ['床連床墊', '辦公台', '座椅', '電視', '衣櫃', '拎包入住'],
      prices: [
        { type: '單人間', price: '9,000', desc: '獨立私密', tag: 'bg-blue-100 text-blue-700' },
        { type: '雙人間', price: '12,000', desc: '性價比高 (人均6k)', tag: 'bg-amber-100 text-amber-700' }
      ],
      mapLinks: [
        { name: '谷歌地圖', url: 'https://maps.app.goo.gl/DNSGEQ96tRHgT4o89?g_st=ic' },
        { name: '高德地圖', url: 'https://surl.amap.com/2bKSLVzD9Ro' }
      ]
    },
    rooms: [
      { id: '101', floor: '1F (男)', type: '單人間', area: '12㎡', orientation: '南', price: 9000, status: 'available', tenant: '' },
      { id: '102', floor: '1F (男)', type: '單人間', area: '10㎡', orientation: '東南', price: 9000, status: 'rented', tenant: '李同學 (CityU)' },
      { id: '103', floor: '1F (男)', type: '雙人間', area: '18㎡', orientation: '南', price: 12000, status: 'available', tenant: '' },
      { id: '104', floor: '1F (男)', type: '雙人間', area: '20㎡', orientation: '東', price: 12000, status: 'rented', tenant: '張同學, 王同學' },
      { id: '105', floor: '1F (男)', type: '單人間', area: '11㎡', orientation: '北', price: 9000, status: 'available', tenant: '' },
      { id: '201', floor: '2F (女)', type: '單人間', area: '12㎡', orientation: '南', price: 9000, status: 'available', tenant: '' },
      { id: '202', floor: '2F (女)', type: '單人間', area: '10㎡', orientation: '東南', price: 9000, status: 'rented', tenant: '陳同學 (BU)' },
      { id: '203', floor: '2F (女)', type: '雙人間', area: '18㎡', orientation: '南', price: 12000, status: 'rented', tenant: '林同學, 趙同學' },
      { id: '204', floor: '2F (女)', type: '雙人間', area: '20㎡', orientation: '東', price: 12000, status: 'available', tenant: '' },
      { id: '205', floor: '2F (女)', type: '雙人間', area: '18㎡', orientation: '西南', price: 12000, status: 'available', tenant: '' },
    ]
  },
  {
    id: 'apt-002',
    name: '海悅豪園 學生公寓',
    shortName: '海悅豪園',
    location: '將軍澳坑口地鐵站B出口，直達科大',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
    tags: ['近科大', '地鐵上蓋', '高檔小區'],
    description: '坑口地鐵站上蓋，小巴10分鐘直達香港科技大學，周邊商場林立，生活極度便利。',
    info: {
      transport: [
        { icon: 'Train', text: '坑口地鐵站B出口步行1分鐘即達。' },
        { icon: 'Car', text: '樓下巴士總站 11M 小巴約 10 分鐘直達香港科技大學。' }
      ],
      features: [
        { icon: 'Shield', text: '24小時高檔小區安保' },
        { icon: 'Users', text: '室友均為科大學生，學習氛圍好' }
      ],
      facilities: ['豪華會所', '健身房', '室外泳池', '全套家電', '極速寬帶'],
      prices: [
        { type: '單人間', price: '8,500', desc: '海景次臥', tag: 'bg-blue-100 text-blue-700' },
        { type: '雙人間', price: '11,000', desc: '超大主臥連獨衛', tag: 'bg-amber-100 text-amber-700' }
      ],
      mapLinks: []
    },
    rooms: [
      { id: 'A室(主)', floor: '15F (女)', type: '雙人間', area: '22㎡', orientation: '東南(海景)', price: 11000, status: 'rented', tenant: '劉同學, 黃同學' },
      { id: 'B室(次)', floor: '15F (女)', type: '單人間', area: '9㎡', orientation: '東', price: 8500, status: 'available', tenant: '' },
      { id: 'C室(次)', floor: '15F (女)', type: '單人間', area: '8㎡', orientation: '東', price: 8200, status: 'available', tenant: '' },
      { id: 'D室(廳)', floor: '15F (女)', type: '單人間', area: '12㎡', orientation: '南', price: 6500, status: 'rented', tenant: '吳同學' },
    ]
  },
  {
    id: 'apt-003',
    name: '都會軒 學生公寓',
    shortName: '都會軒',
    location: '紅磡都會道8號，紅磡地鐵站上蓋',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    tags: ['近理大', '維港海景', '交通樞紐'],
    description: '紅磡站上蓋物業，步行天橋直達香港理工大學，交通四通八達。',
    info: {
      transport: [
        { icon: 'Train', text: '紅磡站上蓋，東鐵線、屯馬線交匯處。' },
      ],
      features: [
        { icon: 'Shield', text: '刷卡入戶，嚴格安保' },
      ],
      facilities: ['商場上蓋', '海景落地窗', '酒店式管理'],
      prices: [
        { type: '單人間', price: '10,500', desc: '海景次臥', tag: 'bg-blue-100 text-blue-700' },
      ],
      mapLinks: []
    },
    rooms: [
      { id: 'Room A', floor: '28F (男)', type: '單人間', area: '15㎡', orientation: '南(維港)', price: 12000, status: 'available', tenant: '' },
      { id: 'Room B', floor: '28F (男)', type: '單人間', area: '10㎡', orientation: '西', price: 9500, status: 'available', tenant: '' },
    ]
  }
];

export default function App() {
  const [apartments, setApartments] = useState(initialApartments);
  const [user, setUser] = useState(null);
  
  // 角色與權限狀態
  const [role, setRole] = useState('viewer'); // 'viewer' | 'admin'
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pwdInput, setPwdInput] = useState('');
  const [pwdError, setPwdError] = useState('');

  // 視圖狀態
  const [currentView, setCurrentView] = useState('home');
  const [activeAptId, setActiveAptId] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // 房間編輯模態框狀態
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomEditForm, setRoomEditForm] = useState({});
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // 房源大資料編輯狀態
  const [showAptEditModal, setShowAptEditModal] = useState(false);
  const [aptEditForm, setAptEditForm] = useState({});

  const currentApt = apartments.find(a => a.id === activeAptId);

  // 初始化賬號
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth Error:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 實時監聽雲端數據
  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'rentals', 'mainState');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setApartments(docSnap.data().apartments);
      } else {
        setDoc(docRef, { apartments: initialApartments }).catch(console.error);
      }
    }, (error) => console.error("Firestore Error:", error));
    return () => unsubscribe();
  }, [user]);

  // 通用存儲函數
  const saveToCloud = async (newApts) => {
    setApartments(newApts); // 先在本地更新 UI
    if (user) {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'rentals', 'mainState');
      try {
        await setDoc(docRef, { apartments: newApts }, { merge: true });
      } catch (error) {
        console.error("Cloud update error:", error);
      }
    }
  };

  const getStats = (rooms) => {
    const totalRooms = rooms.length;
    const rentedRooms = rooms.filter(r => r.status === 'rented').length;
    const availableRooms = totalRooms - rentedRooms;
    const occupancyRate = totalRooms === 0 ? 0 : Math.round((rentedRooms / totalRooms) * 100);
    return { totalRooms, rentedRooms, availableRooms, occupancyRate };
  };

  const goToApartment = (id) => {
    setActiveAptId(id);
    setActiveTab('dashboard');
    setCurrentView('apartment');
  };

  const handleRoleToggleClick = () => {
    if (role === 'admin') {
      setRole('viewer'); 
    } else {
      setPwdInput('');
      setPwdError('');
      setShowAuthModal(true); 
    }
  };

  const handleAuthSubmit = () => {
    if (pwdInput === '2717') { 
      setRole('admin');
      setShowAuthModal(false);
    } else {
      setPwdError('密碼錯誤，請重試');
    }
  };

  // 打開房間管理面板 (編輯現有房間)
  const handleRoomClick = (room) => {
    setIsAddingRoom(false);
    setConfirmDelete(false);
    setSelectedRoom(room);
    setRoomEditForm({
      id: room.id || '',
      floor: room.floor || '',
      tenant: room.tenant || '',
      type: room.type || '',
      area: room.area || '',
      orientation: room.orientation || '',
      price: room.price || ''
    });
  };

  // 打開新增房間面板
  const handleOpenAddRoom = () => {
    setIsAddingRoom(true);
    setConfirmDelete(false);
    setSelectedRoom({ status: 'available' }); // 虛擬房間對象
    setRoomEditForm({
      id: '',
      floor: '新分區',
      tenant: '',
      type: '單人間',
      area: '',
      orientation: '',
      price: 0
    });
  };

  // 儲存房間參數 (包含新增與編輯)
  const handleSaveRoomDetails = () => {
    if (!roomEditForm.id) {
      alert("請填寫房號");
      return;
    }

    const newApts = apartments.map(apt => {
      if (apt.id !== activeAptId) return apt;
      
      let updatedRooms;
      if (isAddingRoom) {
        // 新增房間
        const newRoom = {
          ...roomEditForm,
          status: 'available'
        };
        updatedRooms = [...apt.rooms, newRoom];
      } else {
        // 更新現有房間
        updatedRooms = apt.rooms.map(r => 
          r.id === selectedRoom.id 
            ? { ...r, ...roomEditForm } 
            : r
        );
      }
      
      return { ...apt, rooms: updatedRooms };
    });

    saveToCloud(newApts);
    setSelectedRoom(null);
    setIsAddingRoom(false);
  };

  // 刪除房間
  const handleDeleteRoom = () => {
    const newApts = apartments.map(apt => {
      if (apt.id !== activeAptId) return apt;
      return {
        ...apt,
        rooms: apt.rooms.filter(r => r.id !== selectedRoom.id)
      };
    });
    saveToCloud(newApts);
    setSelectedRoom(null);
  };

  // 管理員修改房間租務狀態（租出/退租）
  const handleStatusChange = async () => {
    const newStatus = selectedRoom.status === 'available' ? 'rented' : 'available';
    const newTenant = newStatus === 'rented' ? roomEditForm.tenant : '';

    const newApts = apartments.map(apt => {
      if (apt.id !== activeAptId) return apt;
      return {
        ...apt,
        rooms: apt.rooms.map(r => 
          r.id === selectedRoom.id 
            ? { ...r, status: newStatus, tenant: newTenant, ...roomEditForm } 
            : r
        )
      };
    });
    saveToCloud(newApts);
    setSelectedRoom(null);
  };

  // 打開房源資訊編輯面板
  const handleOpenAptEdit = () => {
    setAptEditForm({
      name: currentApt.name,
      shortName: currentApt.shortName,
      location: currentApt.location,
      description: currentApt.description,
      image: currentApt.image
    });
    setShowAptEditModal(true);
  };

  // 儲存房源資訊
  const handleSaveAptInfo = () => {
    const newApts = apartments.map(apt => {
      if (apt.id !== activeAptId) return apt;
      return {
        ...apt,
        ...aptEditForm
      };
    });
    saveToCloud(newApts);
    setShowAptEditModal(false);
  };

  const getGroupedRooms = (rooms) => {
    const groups = {};
    rooms.forEach(room => {
      if (!groups[room.floor]) groups[room.floor] = [];
      groups[room.floor].push(room);
    });
    return groups;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-10">
      
      {/* 頂部導航欄 */}
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            <div className="flex items-center space-x-3">
              {currentView === 'apartment' && (
                <button 
                  onClick={() => {setCurrentView('home'); setActiveAptId(null);}}
                  className="mr-2 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Building size={24} />
              </div>
              <h1 className="text-xl font-bold text-slate-900 hidden sm:block">
                {currentView === 'home' ? '小鳥租務管理系統' : currentApt?.name}
              </h1>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <button 
                onClick={handleRoleToggleClick}
                className={`flex items-center px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors border ${
                  role === 'admin' 
                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {role === 'admin' ? <Unlock size={14} className="mr-1.5" /> : <Lock size={14} className="mr-1.5" />}
                {role === 'admin' ? '管理員' : '訪客'}
              </button>

              {currentView === 'apartment' && (
                <div className="flex space-x-1 sm:space-x-2 bg-slate-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-3 sm:px-4 py-1.5 rounded-md text-sm sm:text-base font-medium transition-colors ${
                      activeTab === 'dashboard' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    租務看板
                  </button>
                  <button 
                    onClick={() => setActiveTab('info')}
                    className={`px-3 sm:px-4 py-1.5 rounded-md text-sm sm:text-base font-medium transition-colors ${
                      activeTab === 'info' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    房源資訊
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* ================= 視圖 1：首頁房源列表 ================= */}
        {currentView === 'home' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-800">全部房源項目概覽</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                共 {apartments.length} 個項目
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apartments.map(apt => {
                const stats = getStats(apt.rooms);
                return (
                  <div 
                    key={apt.id} 
                    onClick={() => goToApartment(apt.id)}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 cursor-pointer group flex flex-col"
                  >
                    <div className="h-48 relative overflow-hidden">
                      <img src={apt.image} alt={apt.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {apt.tags.slice(0,2).map((tag, idx) => (
                          <span key={idx} className="bg-black/60 text-white backdrop-blur-md px-2 py-1 rounded text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {apt.name}
                      </h3>
                      <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-grow">
                        {apt.description}
                      </p>
                      
                      <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-3 gap-2 text-center mt-auto">
                        <div>
                          <p className="text-xs text-slate-400 mb-1">總房間</p>
                          <p className="font-bold text-slate-700">{stats.totalRooms}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1">已出租</p>
                          <p className="font-bold text-red-500">{stats.rentedRooms}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1">出租率</p>
                          <p className="font-bold text-blue-600">{stats.occupancyRate}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= 視圖 2：公寓詳情頁 ================= */}
        {currentView === 'apartment' && currentApt && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {activeTab === 'dashboard' ? (
              /* --- 租務看板 --- */
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(() => {
                    const stats = getStats(currentApt.rooms);
                    return (
                      <>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                          <p className="text-sm text-slate-500 mb-1">總房間數</p>
                          <p className="text-3xl font-bold text-slate-800">{stats.totalRooms}</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-red-100">
                          <p className="text-sm text-slate-500 mb-1">已出租</p>
                          <p className="text-3xl font-bold text-red-500">{stats.rentedRooms}</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-100">
                          <p className="text-sm text-slate-500 mb-1">空置中</p>
                          <p className="text-3xl font-bold text-emerald-500">{stats.availableRooms}</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                          <p className="text-sm text-slate-500 mb-1">出租率</p>
                          <p className="text-3xl font-bold text-blue-600">{stats.occupancyRate}%</p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-slate-50/50 gap-4">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                      房間狀態分佈圖
                    </h2>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex space-x-4 text-sm bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                        <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-50 border border-emerald-500 mr-2"></span> 空置</span>
                        <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span> 已租出</span>
                      </div>
                      
                      {/* 管理員專屬：新增房間按鈕 */}
                      {role === 'admin' && (
                        <button 
                          onClick={handleOpenAddRoom}
                          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                          <Plus size={16} className="mr-1" />
                          新增房間
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-8 bg-slate-50/30">
                    {currentApt.rooms.length === 0 ? (
                      <div className="text-center py-10 text-slate-400">
                        目前尚無房間，請點擊右上角新增。
                      </div>
                    ) : (
                      Object.entries(getGroupedRooms(currentApt.rooms)).map(([floor, roomsInFloor], index, array) => (
                        <div key={floor}>
                          <h3 className="text-md font-bold text-slate-700 mb-4 flex items-center border-l-4 border-indigo-500 pl-3">
                            {floor}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {roomsInFloor.map(room => (
                              <RoomCard key={room.id} room={room} onClick={() => handleRoomClick(room)} />
                            ))}
                          </div>
                          {index < array.length - 1 && <div className="border-t border-dashed border-slate-200 mt-8"></div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* --- 房源資訊 --- */
              <div className="space-y-6">
                
                {/* 管理員專屬：編輯房源大資料按鈕 */}
                {role === 'admin' && (
                  <div className="flex justify-end">
                    <button 
                      onClick={handleOpenAptEdit}
                      className="flex items-center bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-amber-200 transition-all"
                    >
                      <Edit3 size={18} className="mr-2" />
                      編輯房源基本資訊
                    </button>
                  </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="h-64 bg-slate-200 relative w-full overflow-hidden">
                    <img src={currentApt.image} alt={currentApt.name} className="w-full h-full object-cover opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {currentApt.tags.map((tag, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-600/90 text-xs font-bold rounded-full backdrop-blur-sm">{tag}</span>
                        ))}
                      </div>
                      <h1 className="text-3xl font-bold mb-2">{currentApt.name}</h1>
                      <p className="text-white/90 flex items-center text-sm">
                        <MapPin size={16} className="mr-1" /> {currentApt.location}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 lg:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* 左側主要資訊 */}
                      <div className="lg:col-span-2 space-y-8">
                        {/* 介紹 */}
                        <section>
                          <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center">
                            <Building className="mr-2 text-indigo-500" size={24} /> 簡介
                          </h2>
                          <p className="text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-xl border border-slate-100">
                            {currentApt.description}
                          </p>
                        </section>

                        <section>
                          <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center">
                            <Navigation className="mr-2 text-blue-600" size={24} /> 位置與交通
                          </h2>
                          <div className="bg-slate-50 rounded-xl p-5 space-y-4 border border-slate-100">
                            {currentApt.info.transport.map((item, idx) => {
                              const Icon = iconMap[item.icon];
                              return (
                                <div key={idx} className="flex items-start">
                                  {Icon && <Icon className="text-slate-400 mt-1 mr-3 flex-shrink-0" size={20} />}
                                  <p className="text-slate-600 leading-relaxed">{item.text}</p>
                                </div>
                              )
                            })}
                          </div>
                        </section>

                        <section>
                          <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center">
                            <Shield className="mr-2 text-emerald-500" size={24} /> 居住環境
                          </h2>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentApt.info.features.map((feature, idx) => {
                              const Icon = iconMap[feature.icon];
                              return (
                                <li key={idx} className="flex items-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 mr-3">
                                    {Icon && <Icon size={20} />}
                                  </div>
                                  <span className="text-slate-700 font-medium">{feature.text}</span>
                                </li>
                              )
                            })}
                          </ul>
                        </section>
                      </div>

                      {/* 右側側邊欄：租金資訊 */}
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Zap size={120} />
                          </div>
                          <h2 className="text-xl font-bold text-blue-900 mb-4 relative z-10">租金參考</h2>
                          
                          <div className="space-y-4">
                            {currentApt.info.prices.map((priceObj, idx) => (
                              <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-blue-100/50">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-slate-800">{priceObj.type}</span>
                                  <span className={`text-[10px] px-2 py-1 rounded-md font-bold ${priceObj.tag}`}>
                                    {priceObj.desc}
                                  </span>
                                </div>
                                <div className="text-2xl font-black text-blue-600 mt-2">
                                  {priceObj.price} <span className="text-sm font-normal text-slate-500">元/月起</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= 模態框：房間詳細資訊與管理 ================= */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-5 text-white flex justify-between items-center ${
              selectedRoom.status === 'rented' ? 'bg-red-500' : (isAddingRoom ? 'bg-blue-600' : 'bg-emerald-500')
            }`}>
              <h3 className="text-xl font-bold flex items-center tracking-wide">
                <LayoutDashboard size={20} className="mr-2 opacity-80" />
                {isAddingRoom ? '新增房間' : `${selectedRoom.id} 房間管理`}
              </h3>
              <button onClick={() => setSelectedRoom(null)} className="text-white/70 hover:text-white transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6">
              
              {role === 'admin' ? (
                /* 管理員：可編輯房間屬性與刪除 */
                <div className={`space-y-4 ${!isAddingRoom ? 'mb-6 pb-6 border-b border-slate-100' : ''}`}>
                  <h4 className="font-bold text-slate-700 text-sm flex items-center mb-3">
                    <Edit3 size={16} className="mr-1.5 text-amber-500" /> {isAddingRoom ? '配置新房間參數' : '編輯房間基礎參數'}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block font-bold">房號</label>
                      <input type="text" placeholder="例如: 101" value={roomEditForm.id} onChange={e => setRoomEditForm({...roomEditForm, id: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:border-amber-400 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block font-bold">分區 (樓層)</label>
                      <input type="text" placeholder="例如: 1F" value={roomEditForm.floor} onChange={e => setRoomEditForm({...roomEditForm, floor: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:border-amber-400 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">房型</label>
                      <input type="text" placeholder="單人間/雙人間" value={roomEditForm.type} onChange={e => setRoomEditForm({...roomEditForm, type: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:border-amber-400 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">租金 (元/月)</label>
                      <input type="number" value={roomEditForm.price} onChange={e => setRoomEditForm({...roomEditForm, price: Number(e.target.value)})} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:border-amber-400 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">面積</label>
                      <input type="text" placeholder="例如: 12㎡" value={roomEditForm.area} onChange={e => setRoomEditForm({...roomEditForm, area: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:border-amber-400 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">朝向</label>
                      <input type="text" placeholder="例如: 南" value={roomEditForm.orientation} onChange={e => setRoomEditForm({...roomEditForm, orientation: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:border-amber-400 outline-none" />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4 pt-2">
                    <button onClick={handleSaveRoomDetails} className="flex-1 text-sm bg-amber-50 text-amber-700 font-bold py-2.5 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors flex items-center justify-center">
                      <Save size={16} className="mr-1" /> {isAddingRoom ? '確認新增並創建房間' : '單獨儲存上方參數'}
                    </button>
                    {!isAddingRoom && (
                      confirmDelete ? (
                        <button onClick={handleDeleteRoom} className="text-sm bg-red-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center">
                          確認刪除!
                        </button>
                      ) : (
                        <button onClick={() => setConfirmDelete(true)} className="text-sm bg-red-50 text-red-600 font-bold py-2.5 px-3 rounded-lg border border-red-200 hover:bg-red-100 transition-colors flex items-center justify-center" title="刪除此房間">
                          <Trash2 size={18} />
                        </button>
                      )
                    )}
                  </div>
                </div>
              ) : (
                /* 訪客：僅查看房間屬性 */
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-5">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                    <div>
                      <p className="text-slate-400 text-xs mb-1 flex items-center"><BedDouble size={12} className="mr-1"/>房型</p>
                      <p className="font-semibold text-slate-800">{selectedRoom.type}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-1 flex items-center"><Maximize size={12} className="mr-1"/>面積</p>
                      <p className="font-semibold text-slate-800">{selectedRoom.area}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-1 flex items-center"><Compass size={12} className="mr-1"/>朝向</p>
                      <p className="font-semibold text-slate-800">{selectedRoom.orientation}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-1 flex items-center"><Zap size={12} className="mr-1"/>租金</p>
                      <p className="font-semibold text-blue-600">{selectedRoom.price} 元/月</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 租務狀態操作區 (只有在編輯現有房間時才顯示) */}
              {!isAddingRoom && (
                role === 'viewer' ? (
                  <div className="p-5 bg-slate-50 rounded-xl text-center border border-slate-200">
                    <Lock className="mx-auto mb-2 text-slate-400" size={28} />
                    <p className="text-sm font-medium text-slate-600 mb-1">當前為訪客模式，僅供瀏覽</p>
                    <p className="text-xs text-slate-500">如需辦理租務或修改參數，請在右上角切換至管理員。</p>
                  </div>
                ) : selectedRoom.status === 'available' ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">錄入租客信息以出租（選填）</label>
                    <input 
                      type="text" 
                      value={roomEditForm.tenant}
                      onChange={(e) => setRoomEditForm({...roomEditForm, tenant: e.target.value})}
                      placeholder="例如：張三 (CityU)" 
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
                    />
                    <button 
                      onClick={handleStatusChange}
                      className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-red-200"
                    >
                      確認租出 (並儲存所有修改)
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start">
                      <User className="text-red-400 mt-0.5 mr-3 flex-shrink-0" size={18} />
                      <div>
                        <p className="text-xs text-red-400 font-medium mb-1">當前承租人</p>
                        <p className="font-bold text-red-900 text-lg">{selectedRoom.tenant || '未知承租人'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleStatusChange}
                      className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-emerald-200"
                    >
                      辦理退租 (並恢復為空置狀態)
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= 模態框：編輯房源大資料 (管理員專屬) ================= */}
      {showAptEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <Edit3 className="mr-2 text-amber-500" size={20} />
                編輯房源基本資訊
              </h3>
              <button onClick={() => setShowAptEditModal(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">房源完整名稱</label>
                <input 
                  type="text" value={aptEditForm.name} 
                  onChange={e => setAptEditForm({...aptEditForm, name: e.target.value})}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">簡短名稱 (顯示於首頁卡片)</label>
                <input 
                  type="text" value={aptEditForm.shortName} 
                  onChange={e => setAptEditForm({...aptEditForm, shortName: e.target.value})}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center">
                  <MapPin size={16} className="mr-1" /> 地理位置簡介
                </label>
                <input 
                  type="text" value={aptEditForm.location} 
                  onChange={e => setAptEditForm({...aptEditForm, location: e.target.value})}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center">
                  <ImageIcon size={16} className="mr-1" /> 封面圖片連結 (URL)
                </label>
                <input 
                  type="text" value={aptEditForm.image} 
                  onChange={e => setAptEditForm({...aptEditForm, image: e.target.value})}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center">
                  <Building size={16} className="mr-1" /> 房源詳細介紹 (支援長文本)
                </label>
                <textarea 
                  rows="4"
                  value={aptEditForm.description} 
                  onChange={e => setAptEditForm({...aptEditForm, description: e.target.value})}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                ></textarea>
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 bg-slate-50 flex space-x-3">
              <button 
                onClick={() => setShowAptEditModal(false)}
                className="flex-1 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleSaveAptInfo}
                className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-md shadow-amber-200 flex items-center justify-center"
              >
                <Save size={18} className="mr-2" /> 儲存至雲端
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 密碼驗證模態框 ================= */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center">
              <Lock className="mr-2 text-amber-500" size={20} />
              管理員驗證
            </h3>
            <p className="text-sm text-slate-500 mb-4">請輸入管理員密碼以解鎖編輯權限。</p>
            
            <input 
              type="password" 
              value={pwdInput}
              onChange={(e) => { setPwdInput(e.target.value); setPwdError(''); }}
              placeholder="請輸入密碼"
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 outline-none transition-all mb-2 ${
                pwdError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-amber-500 focus:border-amber-500'
              }`}
              onKeyDown={(e) => e.key === 'Enter' && handleAuthSubmit()}
            />
            {pwdError && <p className="text-red-500 text-xs mb-2">{pwdError}</p>}
            
            <div className="flex space-x-3 mt-4">
              <button 
                onClick={() => setShowAuthModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleAuthSubmit}
                className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors shadow-md shadow-amber-200"
              >
                驗證
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= 獨立的房間卡片組件 =================
function RoomCard({ room, onClick }) {
  const isRented = room.status === 'rented';
  const isSingle = room.type === '單人間';

  return (
    <div 
      onClick={onClick}
      className={`
        relative cursor-pointer group rounded-xl p-4 transition-all duration-300 border-2 flex flex-col h-full
        ${isRented 
          ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-200/50 hover:bg-red-600 hover:-translate-y-1' 
          : 'bg-white border-emerald-400 text-slate-800 shadow-sm hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-100 hover:-translate-y-1'
        }
      `}
    >
      {/* 頭部：房號與圖標 */}
      <div className="flex justify-between items-start mb-4">
        <span className={`text-2xl font-black ${isRented ? 'text-white' : 'text-slate-800'}`}>
          {room.id}
        </span>
        <div className={`p-1.5 rounded-lg ${isRented ? 'bg-red-400/50 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
          {isSingle ? <User size={18} /> : <Users size={18} />}
        </div>
      </div>
      
      {/* 核心數據網格：包含面積、朝向、房型 */}
      <div className="grid grid-cols-2 gap-2 mb-4 flex-grow">
        <div className="flex flex-col">
          <span className={`text-[10px] uppercase font-semibold ${isRented ? 'text-red-200' : 'text-slate-400'}`}>類型</span>
          <span className={`text-sm font-medium ${isRented ? 'text-white' : 'text-slate-700'}`}>{room.type}</span>
        </div>
        <div className="flex flex-col">
          <span className={`text-[10px] uppercase font-semibold ${isRented ? 'text-red-200' : 'text-slate-400'}`}>面積/朝向</span>
          <span className={`text-sm font-medium ${isRented ? 'text-white' : 'text-slate-700'}`}>{room.area} · {room.orientation}</span>
        </div>
      </div>

      {/* 底部區：租金與租客 */}
      <div className={`pt-3 border-t ${isRented ? 'border-red-400/50' : 'border-slate-100'} mt-auto`}>
        {isRented ? (
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-2 flex-shrink-0">
              <User size={12} className="text-white" />
            </div>
            <p className="text-sm font-medium truncate" title={room.tenant}>
              {room.tenant || '已租出'}
            </p>
          </div>
        ) : (
          <div className="flex justify-between items-end">
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">空置可租</span>
            <span className="text-lg font-bold text-slate-800">¥{room.price}</span>
          </div>
        )}
      </div>
      
      {/* 懸浮小點綴 */}
      <div className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isRented ? 'text-white/50' : 'text-emerald-500/50'}`}>
        <LayoutDashboard size={14} />
      </div>
    </div>
  );
}