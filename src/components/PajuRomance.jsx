import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Heart, X, MessageCircle, MapPin, Zap, Star, Lock, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

// --- Sub Component: Individual Card ---
const SwipeableCard = ({ profile, onAction, dragConstraints = { left: 0, right: 0 } }) => {
     // Each card gets its OWN independent motion value. 
     // This solves the bug where resetting 'x' affected the exiting card.
     const x = useMotionValue(0);
     const rotate = useTransform(x, [-200, 200], [-25, 25]);
     const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);

     const handleDragEnd = (event, info) => {
          const threshold = 100;
          if (info.offset.x > threshold) {
               onAction('like', 5);
          } else if (info.offset.x < -threshold) {
               onAction('pass', 0);
          }
     };

     return (
          <motion.div
               style={{ x, rotate, opacity }}
               drag="x"
               dragConstraints={dragConstraints}
               dragSnapToOrigin={true}
               dragElastic={0.7}
               onDragEnd={handleDragEnd}
               initial={{ scale: 0.95, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={(custom) => {
                    // Use 'custom' prop to know direction immediately
                    const duration = 0.2;
                    if (custom === 'like' || custom === 'superlike') return { x: 500, rotate: 20, opacity: 0, transition: { duration } };
                    if (custom === 'pass') return { x: -500, rotate: -20, opacity: 0, transition: { duration } };
                    // Default fallback if direction is lost (fade out)
                    return { opacity: 0 };
               }}
               transition={{ type: "spring", stiffness: 400, damping: 20 }}
               className="w-full aspect-[4/5] h-full absolute top-0 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] group border border-white/10 bg-gray-800 ring-1 ring-white/5 cursor-grab active:cursor-grabbing z-10"
          >
               <img src={profile.image} alt={profile.name} className="w-full h-full object-cover pointer-events-none" />
               <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none"></div>
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 pointer-events-none"></div>

               {/* Top Bar */}
               <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20">
                    <div className="flex gap-1.5"><div className="h-1 w-8 bg-white/50 rounded-full"></div><div className="h-1 w-8 bg-white/20 rounded-full"></div><div className="h-1 w-8 bg-white/20 rounded-full"></div></div>
                    <button onClick={(e) => { e.stopPropagation(); onAction('unlock', 30); }} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white hover:text-black transition-all group/btn pointer-events-auto" onPointerDown={(e) => e.stopPropagation()}>
                         <Lock className="w-5 h-5 text-white group-hover/btn:text-black" />
                    </button>
               </div>

               {/* Profile Info */}
               <div className="absolute bottom-28 left-0 w-full px-8 pointer-events-none">
                    <div className="flex items-end gap-3 mb-2">
                         <h3 className="text-4xl font-black text-white drop-shadow-md">{profile.name}</h3>
                         <span className="text-2xl text-white/90 font-medium mb-1 drop-shadow-sm">{profile.age}</span>
                    </div>
                    <div className="flex items-center gap-2 text-base text-gray-200 mb-4 font-medium drop-shadow-sm">
                         <MapPin className="w-4 h-4 text-pink-500 fill-pink-500" />
                         {profile.location} <span className="text-gray-400">|</span> {profile.job}
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                         {profile.tags.map(tag => (
                              <span key={tag} className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-sm font-bold text-white border border-white/10 shadow-sm">{tag}</span>
                         ))}
                    </div>
               </div>

               {/* Interaction Buttons */}
               <div className="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-6 pb-4 pointer-events-auto" onPointerDown={(e) => e.stopPropagation()}>
                    <button onClick={() => onAction('pass', 0)} className="w-14 h-14 rounded-full bg-gray-800/80 backdrop-blur-md border border-gray-600 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white hover:scale-110 hover:border-red-500 transition-all shadow-lg"><X className="w-7 h-7" /></button>
                    <button onClick={() => onAction('superlike', 20)} className="w-12 h-12 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-400 flex items-center justify-center text-blue-400 hover:bg-blue-500 hover:text-white hover:scale-110 transition-all shadow-lg mt-4"><Star className="w-6 h-6 fill-current" /></button>
                    <button onClick={() => onAction('like', 5)} className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:scale-110 transition-all shadow-2xl relative">
                         <Heart className="w-9 h-9 fill-white" />
                         <div className="absolute -top-3 bg-white text-pink-600 px-2 py-0.5 rounded-full text-[10px] font-black border border-pink-100 shadow-sm">-5콩</div>
                    </button>
                    <button onClick={() => onAction('dm', 50)} className="w-12 h-12 rounded-full bg-purple-500/20 backdrop-blur-md border border-purple-400 flex items-center justify-center text-purple-400 hover:bg-purple-500 hover:text-white hover:scale-110 transition-all shadow-lg mt-4"><Send className="w-5 h-5 ml-0.5" /></button>
               </div>
          </motion.div>
     );
};


// --- Main Component ---
const PajuRomance = ({ beanCount, onHeartClick, onOpenRewardCenter, user }) => {
     // State
     const [currentCardIndex, setCurrentCardIndex] = useState(0);
     const [exitDirection, setExitDirection] = useState(null); // 'like', 'pass'
     const [floatingTexts, setFloatingTexts] = useState([]);
     const [showLowBeanModal, setShowLowBeanModal] = useState(false);
     const [isMatch, setIsMatch] = useState(false);
     const [realProfiles, setRealProfiles] = useState([]);

     // Refs for cleanup
     const cleanupRef = React.useRef(null);

     // Mock Profiles
     const mockProfiles = [
          {
               id: 1, name: '운정불주먹', age: 26, gender: 'female', location: '운정 가람마을', mbti: 'ENFP', job: '프리랜서 디자이너', tags: ['#운동하는여자', '#맛집탐방', '#맥주러버'],
               image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600&h=800'
          },
          {
               id: 3, name: '요가파이어', age: 26, gender: 'female', location: '운정 호수공원', mbti: 'INFJ', job: '필라테스 강사', tags: ['#요가', '#건강식', '#아침형인간'],
               image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600&h=800'
          },
          {
               id: 5, name: '꽃을든여자', age: 29, gender: 'female', location: '헤이리 마을', mbti: 'ISFP', job: '플로리스트', tags: ['#꽃꽂이', '#전시회', '#감성카페'],
               image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600&h=800'
          },
          {
               id: 7, name: '그림그리는냥', age: 25, gender: 'female', location: '출판도시', mbti: 'INFP', job: '일러스트레이터', tags: ['#고양이', '#드로잉', '#집순이'],
               image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600&h=800'
          },
          {
               id: 9, name: '여행러버', age: 32, gender: 'female', location: '문산읍', mbti: 'ESFJ', job: '승무원', tags: ['#여행', '#와인', '#소통왕'],
               image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600&h=800'
          },
          {
               id: 11, name: '파주맛집탐험대', age: 27, gender: 'female', location: '금촌동', mbti: 'ESTP', job: '마케터', tags: ['#맛집투어', '#핫플', '#인생샷'],
               image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=600&h=800'
          },
          // Males
          {
               id: 2, name: '금촌사랑꾼', age: 29, gender: 'male', location: '금촌 로터리', mbti: 'ISTJ', job: '공무원', tags: ['#영화감상', '#드라이브', '#조용한카페'],
               image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600&h=800'
          },
          {
               id: 4, name: '파주보안관', age: 31, gender: 'male', location: '교하동', mbti: 'ESTJ', job: '헬스 트레이너', tags: ['#헬스', '#단백질', '#자기관리'],
               image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600&h=800'
          },
          {
               id: 6, name: '책읽는남자', age: 28, gender: 'male', location: '지혜의 숲', mbti: 'INTJ', job: '사서', tags: ['#독서', '#산책', '#클래식'],
               image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600&h=800'
          },
          {
               id: 8, name: '캠핑고수', age: 34, gender: 'male', location: '적성면', mbti: 'ISTP', job: '사업가', tags: ['#캠핑', '#낚시', '#불멍'],
               image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600&h=800'
          },
          {
               id: 10, name: '커피프린스', age: 27, gender: 'male', location: '야당역', mbti: 'ENTP', job: '바리스타', tags: ['#커피', '#라떼아트', '#카페투어'],
               image: 'https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?auto=format&fit=crop&q=80&w=600&h=800'
          },
          {
               id: 12, name: '개발자킴', age: 30, gender: 'male', location: '운정3동', mbti: 'INTP', job: '개발자', tags: ['#코딩', '#얼리어답터', '#게임'],
               image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=600&h=800'
          }
     ];

     const [allProfiles, setAllProfiles] = useState(mockProfiles);

     // Fetch Real Profiles
     useEffect(() => {
          const fetchProfiles = async () => {
               if (!user) return;
               const { data: interactions } = await supabase.from('romance_interactions').select('target_id').eq('actor_id', user.id);
               const interactedIds = interactions?.map(i => i.target_id) || [];
               const { data: candidates } = await supabase.from('profiles').select('*').neq('id', user.id).not('id', 'in', `(${interactedIds.join(',')})`).limit(10);

               if (candidates) {
                    const formattedCandidates = candidates.map(p => ({
                         id: p.id,
                         name: p.full_name || p.username || '알 수 없음',
                         age: p.birth_year ? new Date().getFullYear() - p.birth_year : 25,
                         gender: p.gender || 'unknown',
                         location: p.location || '파주',
                         mbti: p.mbti || 'MBTI',
                         job: p.job || '파주 주민',
                         tags: p.interests || ['#신비주의'],
                         image: p.avatar_url || 'https://via.placeholder.com/600x800'
                    }));
                    setRealProfiles(formattedCandidates);
               }
          };
          fetchProfiles();
     }, [user]);

     // Merge Mocks + Real
     const displayPool = [...realProfiles, ...mockProfiles];
     const myGender = user?.user_metadata?.gender;
     const targetGender = myGender === 'female' ? 'male' : 'female';
     const filteredDisplay = displayPool.filter(p => {
          if (typeof p.id === 'string') return true;
          return p.gender === targetGender;
     });
     const safeDisplayProfiles = filteredDisplay.length > 0 ? filteredDisplay : mockProfiles;

     // Current Logic
     const currentProfile = safeDisplayProfiles[currentCardIndex % safeDisplayProfiles.length];
     const nextProfile = safeDisplayProfiles[(currentCardIndex + 1) % safeDisplayProfiles.length];

     const lightnings = [
          { id: 1, title: '2:2 락볼링장 가실 분! 🎳', location: '야당역', status: '여2 대기중', time: '지금 바로', icon: Zap },
          { id: 2, title: '간단하게 치맥 하실 분 🍗', location: '금촌 로터리', status: '남1 여1', time: '8시', icon: Zap },
          { id: 3, title: '심야 영화 보러가요 🍿', location: '출판도시', status: '누구나', time: '10:30', icon: Star }
     ];

     // Main Action Handler
     const handleAction = async (type, cost) => {
          // Clear any existing cleanup timer to prevent premature dismissal
          if (cleanupRef.current) clearTimeout(cleanupRef.current);

          if (type === 'pass') {
               setExitDirection('pass');
               if (user && typeof currentProfile.id === 'string') {
                    await supabase.from('romance_interactions').insert({ actor_id: user.id, target_id: currentProfile.id, action_type: 'pass' });
               }
               setCurrentCardIndex(prev => prev + 1);
               // Auto dismiss feedback
               cleanupRef.current = setTimeout(() => setExitDirection(null), 500);
               return;
          }

          if (beanCount < cost) {
               setShowLowBeanModal(true);
               return;
          }

          onHeartClick(-cost);
          const id = Date.now();
          setFloatingTexts(prev => [...prev, { id, text: `-${cost} 🫘` }]);
          setTimeout(() => setFloatingTexts(prev => prev.filter(ft => ft.id !== id)), 1000); // Cleanup floating text

          setExitDirection(type); // KEY: this triggers the 'exit' direction in AnimatePresence

          if (type === 'like' || type === 'superlike') {
               if (user && typeof currentProfile.id === 'string') {
                    const { error } = await supabase.from('romance_interactions').insert({ actor_id: user.id, target_id: currentProfile.id, action_type: type });
                    if (!error) {
                         const { data: mutual } = await supabase.from('romance_interactions').select('*').eq('actor_id', currentProfile.id).eq('target_id', user.id).in('action_type', ['like', 'superlike']).single();
                         if (mutual) {
                              setIsMatch(true); // Trigger Match Modal
                              const { data: room } = await supabase.from('chat_rooms').insert({}).select().single();
                              if (room) {
                                   await supabase.from('chat_participants').insert([{ room_id: room.id, user_id: user.id }, { room_id: room.id, user_id: currentProfile.id }]);
                              }
                              return; // Don't slide card yet if matched
                         }
                    }
               }
               setCurrentCardIndex(prev => prev + 1);
               // Auto dismiss feedback
               cleanupRef.current = setTimeout(() => setExitDirection(null), 600);
          }
     };

     return (
          <div className="bg-gray-900 min-h-screen text-white rounded-3xl overflow-hidden shadow-2xl relative font-sans">
               {/* Backgrounds */}
               <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-900/50 to-transparent pointer-events-none"></div>
               <div className="absolute -top-20 -right-20 w-80 h-80 bg-pink-600/30 rounded-full blur-3xl pointer-events-none"></div>

               {/* Impactful Floating Cost Animation */}
               <AnimatePresence>
                    {floatingTexts.map(ft => (
                         <motion.div
                              key={ft.id}
                              initial={{ opacity: 0, y: 100, scale: 0.5 }}
                              animate={{ opacity: [0, 1, 0], y: -50, scale: [0.5, 1.5, 1.2] }}
                              transition={{ duration: 0.8, times: [0, 0.2, 1], ease: "easeOut" }}
                              className="absolute inset-x-0 top-[35%] z-[100] flex justify-center pointer-events-none"
                         >
                              <div className="text-6xl font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" style={{ textShadow: '0 0 5px rgba(0,0,0,0.5)' }}>
                                   {ft.text}
                              </div>
                         </motion.div>
                    ))}
               </AnimatePresence>

               {/* Impactful Feedback Overlay */}
               <AnimatePresence>
                    {exitDirection === 'like' && (
                         <motion.div
                              initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                              animate={{ opacity: 1, scale: 1.1, rotate: 0 }}
                              exit={{ opacity: 0, scale: 1.5, filter: "blur(20px)", transition: { duration: 0.2 } }}
                              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                              className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
                         >
                              <div className="bg-pink-500 text-white px-10 py-6 rounded-3xl text-4xl font-black shadow-2xl backdrop-blur-sm border-4 border-white/20">😍 심쿵!</div>
                         </motion.div>
                    )}
                    {exitDirection === 'superlike' && (
                         <motion.div
                              initial={{ opacity: 0, scale: 0.5, rotate: 20 }}
                              animate={{ opacity: 1, scale: 1.1, rotate: 0 }}
                              exit={{ opacity: 0, scale: 1.5, filter: "blur(20px)", transition: { duration: 0.2 } }}
                              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                              className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
                         >
                              <div className="bg-indigo-600 text-white px-10 py-6 rounded-3xl text-4xl font-black shadow-2xl backdrop-blur-sm border-4 border-yellow-300">⭐ 슈퍼 라이크!</div>
                         </motion.div>
                    )}
                    {exitDirection === 'pass' && (
                         <motion.div
                              initial={{ opacity: 0, x: -100 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                              className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
                         >
                              <div className="bg-gray-700/90 text-gray-300 px-8 py-4 rounded-full text-2xl font-bold shadow-xl backdrop-blur-sm">PASS 👋</div>
                         </motion.div>
                    )}
               </AnimatePresence>


               {/* Low Bean Modal */}
               {showLowBeanModal && (
                    <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
                         <div className="bg-gray-800 rounded-3xl p-6 w-full max-w-sm text-center border border-gray-700 shadow-2xl">
                              <div className="text-4xl mb-4">😭</div>
                              <h3 className="text-xl font-bold text-white mb-2">앗! 콩이 부족해요</h3>
                              <p className="text-gray-400 text-sm mb-6">마음에 드는 이성을 놓치지 않으려면<br />콩을 충전해야 해요!</p>
                              <div className="flex gap-3">
                                   <button onClick={() => setShowLowBeanModal(false)} className="flex-1 py-3 rounded-xl bg-gray-700 text-gray-300 font-bold text-sm">취소</button>
                                   <button onClick={() => { setShowLowBeanModal(false); onOpenRewardCenter(); }} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/20">콩 벌러가기 ⚡</button>
                              </div>
                         </div>
                    </div>
               )}

               {/* Match Modal */}
               {isMatch && (
                    <div className="absolute inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-500">
                         <div className="text-center animate-in zoom-in-50 duration-500">
                              <div className="text-6xl mb-4 relative inline-block">💘<Sparkles className="absolute -top-4 -right-4 w-12 h-12 text-yellow-400 animate-pulse" /></div>
                              <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-4 drop-shadow-sm">It's a Match!</h2>
                              <p className="text-white text-lg md:text-xl mb-8 font-medium"><span className="text-pink-400 font-bold">{currentProfile.name}</span>님도 회원님을 좋아해요!</p>
                              <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                                   <button className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl font-bold text-white shadow-xl shadow-purple-500/30 hover:scale-105 transition-transform flex items-center justify-center gap-2" onClick={() => { setIsMatch(false); setCurrentCardIndex(prev => prev + 1); setExitDirection(null); }}><MessageCircle className="w-5 h-5" /> 채팅 바로 시작하기</button>
                                   <button onClick={() => { setIsMatch(false); setCurrentCardIndex(prev => prev + 1); setExitDirection(null); }} className="w-full py-4 bg-gray-800 rounded-2xl font-bold text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">계속 구경하기</button>
                              </div>
                         </div>
                    </div>
               )}

               <div className="relative z-10 p-4 md:p-8 flex flex-col items-center">
                    <div className="text-center mb-6">
                         <h2 className="text-xl md:text-2xl font-black mb-1 animate-in slide-in-from-top-4 duration-500"><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">오늘 밤, 로맨틱한 만남? 🥂</span></h2>
                         <p className="text-gray-400 text-xs md:text-sm">보유 중인 콩으로 <span className="text-yellow-400 font-bold">{Math.floor(beanCount / 5)}번</span> 더 심쿵할 수 있어요!</p>
                    </div>

                    <div className="w-full max-w-2xl flex flex-col gap-10">
                         <div className="flex flex-col items-center w-full h-[600px] relative">
                              {/* Background Card (Next) */}
                              <div key={nextProfile.id} className="absolute top-0 w-full aspect-[4/5] h-full rounded-[2.5rem] overflow-hidden border border-white/5 bg-gray-800 scale-[0.93] translate-y-4 opacity-60 z-0 select-none pointer-events-none transition-transform duration-300">
                                   <img src={nextProfile.image} alt="Next" className="w-full h-full object-cover grayscale-[0.5]" />
                                   <div className="absolute inset-0 bg-black/50"></div>
                              </div>

                              {/* Active Card (Swipeable) */}
                              <AnimatePresence custom={exitDirection} mode="popLayout">
                                   <SwipeableCard
                                        key={currentProfile.id}
                                        profile={currentProfile}
                                        onAction={handleAction}
                                        dragConstraints={{ left: 0, right: 0 }}
                                   />
                              </AnimatePresence>
                         </div>

                         {/* List */}
                         <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full">
                              <div className="flex items-center justify-between mb-2 px-2">
                                   <h3 className="text-xl font-bold text-white flex items-center gap-2"><Zap className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />지금 바로 만나요</h3>
                                   <span className="text-sm text-gray-400 cursor-pointer hover:text-white">더보기 &gt;</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                   {lightnings.map(item => {
                                        const Icon = item.icon; return (
                                             <div key={item.id} className="bg-gray-800/80 rounded-2xl p-4 hover:bg-gray-700 transition-all cursor-pointer flex items-center justify-between group border border-white/5 hover:border-purple-500/30">
                                                  <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center border border-white/5"><Icon className="w-6 h-6 text-gray-400 group-hover:text-yellow-400 transition-colors" /></div><div><h4 className="font-bold text-gray-100 text-sm mb-0.5">{item.title}</h4><div className="flex gap-2 text-xs text-gray-500"><span className="text-pink-400 font-medium">{item.location}</span><span>|</span><span>{item.status}</span></div></div></div>
                                             </div>
                                        )
                                   })}
                              </div>
                              <div className="mt-4 bg-gradient-to-r from-pink-900/50 to-purple-900/50 rounded-2xl p-6 border border-white/10 relative overflow-hidden flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-transform" onClick={onOpenRewardCenter}>
                                   <div className="relative z-10"><h4 className="font-bold text-white text-lg mb-1">⚡ 콩 충전하고 로맨스 시작!</h4><p className="text-sm text-pink-200">매일 무료 충전 혜택 받기 &gt;</p></div><div className="relative z-10 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">🫘</div>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
};

export default PajuRomance;
