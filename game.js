const player = {
  level: 1,
  xp: 0,
  gold: 100,
  hp: 100,
  maxHp: 100,
  power: 10,
  defense: 5,
  potions: 3,
  wins: 0
};

let monster = createMonster();

function createMonster() {
  return {
    name: "Лесной гоблин",
    level: player.level,
    hp: 35 + player.level * 10,
    maxHp: 35 + player.level * 10,
    power: 5 + player.level * 2,
    xp: 25 + player.level * 5,
    gold: 10 + Math.floor(Math.random() * 16)
  };
}

function loadGame() {
  try {
    const saved = localStorage.getItem("darkWorldSave");
    if (!saved) return;

    const data = JSON.parse(saved);
    for (const key of [
      "level", "xp", "gold", "hp", "maxHp",
      "power", "defense", "potions", "wins"
    ]) {
      if (Number.isFinite(data[key])) {
        player[key] = data[key];
      }
    }

    player.level = Math.max(1, player.level);
    player.maxHp = Math.max(100, player.maxHp);
    player.hp = Math.max(0, Math.min(player.hp, player.maxHp));
    player.gold = Math.max(0, player.gold);
    player.xp = Math.max(0, player.xp);
    player.potions = Math.max(0, player.potions);
    player.wins = Math.max(0, player.wins);
  } catch {
    console.warn("Не удалось загрузить сохранение");
  }
}

function saveGame() {
  localStorage.setItem("darkWorldSave", JSON.stringify(player));
}

function el(id) {
  return document.getElementById(id);
}

function updateUI() {
  el("gold").textContent = player.gold;
  el("level").textContent = player.level;
  el("hpText").textContent = `${player.hp} / ${player.maxHp}`;

  const xpNeeded = player.level * 100;
  el("xpText").textContent = `${player.xp} / ${xpNeeded}`;

  el("hpBar").style.width =
    `${(player.hp / player.maxHp) * 100}%`;

  el("xpBar").style.width =
    `${Math.min(100, (player.xp / xpNeeded) * 100)}%`;

  el("power").textContent = player.power;
  el("defense").textContent = player.defense;
  el("monsterName").textContent = monster.name;
}

function log(message) {
  el("battleLog").textContent = message;
}

function gainXP(amount) {
  player.xp += amount;

  while (player.xp >= player.level * 100) {
    player.xp -= player.level * 100;
    player.level++;
    player.maxHp += 20;
    player.hp = player.maxHp;
    player.power += 3;
    player.defense += 1;

    log(`🎉 Новый уровень: ${player.level}! Сила увеличена.`);
  }
}

function fight() {
  if (player.hp <= 0) {
    log("💤 Герой без сил. Используй зелье здоровья.");
    return;
  }

  const damage = Math.max(
    1,
    player.power + Math.floor(Math.random() * 6) - 2
  );

  monster.hp -= damage;

  if (monster.hp <= 0) {
    player.gold += monster.gold;
    gainXP(monster.xp);
    player.wins++;

    const reward = `🏆 Победа! +${monster.xp} опыта, +${monster.gold} золота.`;

    monster = createMonster();
    updateUI();
    saveGame();
    log(reward);
    return;
  }

  const incomingDamage = Math.max(
    1,
    monster.power - player.defense
  );

  player.hp = Math.max(0, player.hp - incomingDamage);

  updateUI();
  saveGame();

  if (player.hp <= 0) {
    log("💀 Герой повержен! Используй зелье здоровья.");
  } else {
    log(`⚔️ Ты нанёс ${damage} урона. Враг ответил: ${incomingDamage}.`);
  }
}

function usePotion() {
  if (player.potions <= 0) {
    log("Зелий больше нет.");
    return;
  }

  if (player.hp === player.maxHp) {
    log("Здоровье уже полное.");
    return;
  }

  player.potions--;
  player.hp = Math.min(player.maxHp, player.hp + 50);

  updateUI();
  saveGame();
  log(`🧪 Использовано зелье. Осталось: ${player.potions}.`);
}

function resetGame() {
  if (!confirm("Начать игру заново? Прогресс будет удалён.")) {
    return;
  }

  localStorage.removeItem("darkWorldSave");
  location.reload();
}

function setupNavigation() {
  document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".nav-item")
        .forEach(item => item.classList.remove("active"));

      button.classList.add("active");

      const label = button.textContent.trim();

      if (label.includes("Герой")) {
        log(`🧙 Уровень ${player.level}. Побед: ${player.wins}.`);
      } else if (label.includes("Сумка")) {
        log(`🎒 Зелий здоровья: ${player.potions}.`);
      } else if (label.includes("Задания")) {
        log(`📜 Победи 5 монстров. Твой прогресс: ${player.wins}/5.`);
      } else {
        log("🌑 Ты находишься в Забытом лесу.");
      }
    });
  });
}

loadGame();
updateUI();

el("fightBtn").addEventListener("click", fight);
setupNavigation();
