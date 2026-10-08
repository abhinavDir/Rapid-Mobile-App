// 100% Unique Avatar Catalog with Zero Duplicates: Boys, Girls & Creatures
const LITTLE_BOY_IMG = require('../assets/little_boy_avatar.jpg');
const MALE_IMG_1 = require('../assets/male_avatar_3d.jpg');
const MALE_IMG_2 = require('../assets/male_avatar_2.jpg');
const MALE_IMG_3 = require('../assets/male_avatar_3.jpg');
const MALE_IMG_4 = require('../assets/male_avatar_4.jpg');
const MALE_IMG_5 = require('../assets/male_avatar_5.jpg');

const LITTLE_GIRL_IMG = require('../assets/little_girl_avatar.jpg');
const FEMALE_IMG_1 = require('../assets/female_avatar_3d.jpg');
const FEMALE_IMG_2 = require('../assets/female_avatar_2.jpg');
const FEMALE_IMG_3 = require('../assets/female_avatar_3.jpg');
const FEMALE_IMG_4 = require('../assets/female_avatar_4.jpg');
const FEMALE_IMG_5 = require('../assets/female_avatar_5.jpg');

export const MEN_AVATARS = [
  { id: 'male_little', name: 'Little Toby', style: 'Cute Boy Kid', tag: 'Cute Kid ⭐', category: 'male', image: LITTLE_BOY_IMG },
  { id: 'male_1', name: 'Alex', style: 'Casual Urban', tag: 'Popular', category: 'male', image: MALE_IMG_1 },
  { id: 'male_2', name: 'Leo', style: 'Smart Techie', tag: 'Pro', category: 'male', image: MALE_IMG_2 },
  { id: 'male_3', name: 'Ryan', style: 'Sporty Athlete', tag: 'Fast', category: 'male', image: MALE_IMG_3 },
  { id: 'male_4', name: 'Kabir', style: 'Classic Gent', tag: 'Elite', category: 'male', image: MALE_IMG_4 },
  { id: 'male_5', name: 'Max', style: 'Happy Explorer', tag: 'VIP', category: 'male', image: MALE_IMG_5 },
];

export const WOMEN_AVATARS = [
  { id: 'female_little', name: 'Little Mia', style: 'Cute Girl Kid', tag: 'Cute Kid ⭐', category: 'female', image: LITTLE_GIRL_IMG },
  { id: 'female_1', name: 'Maya', style: 'Joyful Traveler', tag: 'Popular', category: 'female', image: FEMALE_IMG_1 },
  { id: 'female_2', name: 'Emma', style: 'Smart Techie', tag: 'Pro', category: 'female', image: FEMALE_IMG_2 },
  { id: 'female_3', name: 'Aria', style: 'Music Lover', tag: 'Vibrant', category: 'female', image: FEMALE_IMG_3 },
  { id: 'female_4', name: 'Priya', style: 'Corporate Star', tag: 'VIP', category: 'female', image: FEMALE_IMG_4 },
  { id: 'female_5', name: 'Chloe', style: 'Friendly Companion', tag: 'Elite', category: 'female', image: FEMALE_IMG_5 },
];

export const ALL_AVATARS = [...MEN_AVATARS, ...WOMEN_AVATARS];

export function getAvatarById(id, gender = 'male') {
  if (id) {
    const found = ALL_AVATARS.find((a) => a.id === id);
    if (found) return found;
  }
  return gender === 'female' ? WOMEN_AVATARS[0] : MEN_AVATARS[0];
}

