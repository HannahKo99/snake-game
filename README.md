# snake-game
---

# 戰術型貪吃蛇 (Tactical Snake) - TDD 測試計畫

本專案遵循「紅燈(測試失敗) → 綠燈(測試通過) → 重構」的 **TDD 開發循環**，每個核心功能都有對應的測試案例。

---

## 1. 核心邏輯測試 (Core Logic Tests)

### 1.1 蛇 (Snake)

| 測試案例 ID        | 描述         | 預期結果                         |
| -------------- | ---------- | ---------------------------- |
| Snake_Init     | 初始化蛇       | 長度為 3，位置在螢幕中央，初始方向向右         |
| Snake_Move     | 蛇移動一步      | 頭部座標更新為 (x+1, y)，尾部移除最後一節    |
| Snake_Turn     | 蛇改變方向      | 輸入 'Up' 後，下一步移動 y-1          |
| Snake_Turn_180 | 防止 180 度掉頭 | 當前向右時，輸入 'Left' 應被忽略         |
| Snake_Eat      | 蛇吃到食物      | 長度 +1，尾部不移除（該幀），分數增加         |
| Snake_Die_Wall | 撞牆判定       | 頭部座標超出邊界 → isDead = true     |
| Snake_Die_Self | 撞身體判定      | 頭部座標與身體任一節重疊 → isDead = true |

---

### 1.2 能量系統 (Energy System)

| 測試案例 ID        | 描述     | 預期結果                |
| -------------- | ------ | ------------------- |
| Energy_Init    | 初始化能量  | 初始值為 0 或 100（視設計而定） |
| Energy_Consume | 使用技能消耗 | 每幀減少 X 點能量          |
| Energy_Regen   | 吃食物恢復  | 吃到食物 → 能量 +Y        |
| Energy_Empty   | 能量耗盡   | 能量 ≤ 0 時，強制停止技能狀態   |

---

### 1.3 子彈時間 (Bullet Time)

| 測試案例 ID     | 描述     | 預期結果                       |
| ----------- | ------ | -------------------------- |
| Time_Slow   | 啟動子彈時間 | 遊戲更新頻率 (DeltaTime) 變為 0.3x |
| Time_Normal | 關閉子彈時間 | 遊戲更新頻率恢復 1.0x              |

---

## 2. 測試實作方式 (Test Implementation)

專案為純前端，將建立一個簡單的測試腳本 `tests.js`，可在瀏覽器控制台運行。

```javascript
function assert(condition, message) {
    if (!condition) {
        console.error(`❌ FAIL: ${message}`);
    } else {
        console.log(`✅ PASS: ${message}`);
    }
}

function testSnakeMove() {
    const snake = new Snake();
    const startX = snake.head.x;
    snake.update();
    assert(snake.head.x === startX + 1, "Snake should move right by default");
}
```

---

## 3. 開發順序 (Development Cycle)

1. **編寫測試**：先寫 `testSnakeMove()`。
2. **運行測試**：此時會報錯（因為尚未實作 Snake 類別）。
3. **實作代碼**：編寫 `Snake` 類別與 `update` 方法。
4. **測試通過**：確認控制台顯示 PASS。
5. **重構**：優化代碼結構。
6. **重複循環**：接著寫 `testSnakeEat()`，依序完成其他測試。

---

