// Начальные характеристики
let player = {
  level: 1,
  hp: 100,
  maxHp: 100,
  xp: 0,
  maxXp: 100,
  power: 10,
  defense: 5,
  gold: 100
};

let monster = {
  name: "Лесной гоблин",
  hp: 30,
  maxHp: 30,
  power: 8,
  defense: 2,
  xpReward: 20,
  goldReward: 15
};

// Получаем элементы страницы
const hpText = document.getElementById('hpText');
const hpBar = document.getElementById('hpBar');
const xpText = document.getElementById('xpText');
const xpBar = document.getElementById('xpBar');
const levelText = document.getElementById('levelText');
const goldText = document.getElementById('goldText');
const powerText = document.getElementById('powerText');
const defenseText = document.getElementById('defenseText');
const battleLog = document.getElementById('battleLog');
const fightBtn = document.getElementById('fightBtn');

// Функция обновления интерфейса
function updateUI() {
  hpText.textContent = `${player.hp} / ${player.maxHp}`;
  hpBar.style.width = `${(player.hp / player.maxHp) * 100}%`;
  
  xpText.textContent = `${player.xp} / ${player.maxXp}`;
  xpBar.style.width = `${(player.xp / player.maxXp) * 100}%`;
  
  levelText.textContent = player.level;
  goldText.textContent = player.gold;
  powerText.textContent = player.power;
  defenseText.textContent = player.defense;
}

// Функция сражения
function fight() {
  if (player.hp <= 0) {
    battleLog.textContent = "Ты мертв. Обнови страницу.";
    return;
  }
  if (monster.hp <= 0) {
    battleLog.textContent = "Враг уже побежден!";
    return;
  }

  // Игрок бьет монстра
  let playerDamage = Math.max(1, player.power - monster.defense);
  monster.hp -= playerDamage;
  
  if (monster.hp <= 0) {
    monster.hp = 0;
    battleLog.textContent = `Ты победил! Получено ${monster.xpReward} опыта и ${monster.goldReward} золота.`;
    player.xp += monster.xpReward;
    player.gold += monster.goldReward;
    checkLevelUp();
    respawnMonster();
  } else {
    // Монстр бьет игрока (если жив)
    let monsterDamage = Math.max(1, monster.power - player.defense);
    player.hp -= monsterDamage;
    battleLog.textContent = `Ты нанес ${playerDamage} урона. Гоблин ударил тебя на ${monsterDamage}.`;
  }

  if (player.hp < 0) player.hp = 0;
  updateUI();
  saveGame();
}

// Проверка повышения уровня
function checkLevelUp() {
  if (player.xp >= player.maxXp) {
    player.level++;
    player.xp -= player.maxXp;
    player.maxXp = Math.floor(player.maxXp * 1.5);
    player.maxHp += 20;
    player.hp = player.maxHp; // Восстановление здоровья
    player.power += 3;
    player.defense += 2;
    battleLog.textContent += " НОВЫЙ УРОВЕНЬ!";
  }
}

// Возрождение монстра
function respawnMonster() {
  setTimeout(() => {
    monster.hp = monster.maxHp;
    battleLog.textContent = "Появился новый Лесной гоблин!";
  }, 2000);
}

// Сохранение и загрузка
function saveGame() {
  localStorage.setItem('darkWorldSave', JSON.stringify(player));
}

function loadGame() {
  const saved = localStorage.getItem('darkWorldSave');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      player = { ...player, ...parsed };
    } catch (e) {
      console.error("Ошибка загрузки сохранения");
    }
  }
}

// Навигация (заглушки)
document.getElementById('characterBtn').addEventListener('click', () => alert('Экран Героя в разработке'));
document.getElementById('inventoryBtn').addEventListener('click', () => alert('Сумка в разработке'));
document.getElementById('questsBtn').addEventListener('click', () => alert('Задания в разработке'));

// Запуск
fightBtn.addEventListener('click', fight);

loadGame();
updateUI();
