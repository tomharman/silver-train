// Script to generate menu data for all weekdays from Jan 5 - Jul 31, 2026

const fs = require('fs');
const path = require('path');

// 16 Rotating menu items
const ROTATING_ITEMS = [
  { id: "cosy-beef-chilli-rice", name: "Cosy Beef Chilli with Rice", category: "rotating" },
  { id: "mild-veggie-chilli-rice", name: "Mild Veggie Chilli with Rice", category: "rotating" },
  { id: "margherita-pizza-slaw", name: "Margherita Pizza with Slaw", category: "rotating" },
  { id: "veggie-pizza-sweetcorn", name: "Veggie Pizza with Sweetcorn", category: "rotating" },
  { id: "fish-fingers-chips", name: "Fish Fingers with Chips", category: "rotating" },
  { id: "fish-fingers-mash", name: "Fish Fingers with Mashed Potatoes", category: "rotating" },
  { id: "chicken-nuggets-chips", name: "Chicken Nuggets with Chips", category: "rotating" },
  { id: "chicken-nuggets-rice", name: "Chicken Nuggets with Rice", category: "rotating" },
  { id: "sausage-mash-gravy", name: "Sausage and Mash with Gravy", category: "rotating" },
  { id: "veggie-sausages-mash", name: "Veggie Sausages and Mash", category: "rotating" },
  { id: "spaghetti-bolognese", name: "Spaghetti Bolognese", category: "rotating" },
  { id: "veggie-spaghetti-bolognese", name: "Veggie Spaghetti Bolognese", category: "rotating" },
  { id: "macaroni-cheese", name: "Macaroni Cheese", category: "rotating" },
  { id: "creamy-veggie-pasta", name: "Creamy Veggie Pasta", category: "rotating" },
  { id: "roast-chicken-potatoes", name: "Roast Chicken with Potatoes", category: "rotating" },
  { id: "lentil-veggie-shepherds-pie", name: "Lentil & Veggie Shepherd's Pie", category: "rotating" }
];

// 4 Jacket Potato items (every day)
const JACKET_ITEMS = [
  { id: "jacket-cheese", name: "Jacket Potato with Cheese", category: "jacket-potato" },
  { id: "jacket-beans", name: "Jacket Potato with Beans", category: "jacket-potato" },
  { id: "jacket-tuna", name: "Jacket Potato with Tuna", category: "jacket-potato" },
  { id: "jacket-plain", name: "Jacket Potato (Plain)", category: "jacket-potato" }
];

// Helper functions
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatDateKey(date) {
  return date.toISOString().split('T')[0];
}

function getDayOfWeek(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

// Generate menus
function generateMenus() {
  const menus = {};

  // Shuffled deck approach for variety
  let rotatingDeck = shuffleArray(ROTATING_ITEMS);
  let deckIndex = 0;

  const startDate = new Date('2026-01-05'); // Monday, Jan 5
  const endDate = new Date('2026-07-31'); // Friday, Jul 31

  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // Skip weekends
    if (!isWeekend(currentDate)) {
      const dateKey = formatDateKey(currentDate);

      // Reshuffle if we're running low on items
      if (deckIndex >= rotatingDeck.length - 1) {
        rotatingDeck = shuffleArray(ROTATING_ITEMS);
        deckIndex = 0;
      }

      // Select 2 rotating items
      const selectedRotating = [
        rotatingDeck[deckIndex++],
        rotatingDeck[deckIndex++]
      ];

      // Combine with jacket potatoes
      menus[dateKey] = {
        dayOfWeek: getDayOfWeek(currentDate),
        items: [...selectedRotating, ...JACKET_ITEMS]
      };
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    startDate: '2026-01-05',
    endDate: '2026-07-31',
    menus
  };
}

// Generate and save
const menuData = generateMenus();
const outputPath = path.join(__dirname, '..', 'src', 'app', '(playground)', 'menu-picker', 'data', 'menus.json');

fs.writeFileSync(outputPath, JSON.stringify(menuData, null, 2));

console.log(`✅ Generated ${Object.keys(menuData.menus).length} weekday menus`);
console.log(`📁 Saved to: ${outputPath}`);
